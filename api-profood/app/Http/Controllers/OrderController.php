<?php

namespace App\Http\Controllers;

use App\Core\PayTech;
use App\Http\Requests\CancelOrderRequest;
use App\Http\Requests\StoreGuestOrderRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Mail\CustomerOrderStatusNotificationEmail;
use App\Mail\OrderAcknowledgmentEmail;
use App\Mail\OrderNotificationEmail;
use App\Models\Box;
use App\Models\BoxType;
use App\Models\Cart;
use App\Models\CartSlice;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderPaymentStatus;
use App\Models\OrderStatus;
use App\Models\Promotion;
use App\Models\PromotionUsage;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Twilio\Rest\Client as TwilioClient;

/**
 * 
 */
class OrderController extends Controller
{
    /**
     * Add an order.
     *
     * @param  \App\Http\Requests\StoreOrderRequest  $request
     * @param  boolean  $with_payment
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addOrder(StoreOrderRequest $request, bool $with_payment)
    {
        // Validation is automatically handled by StoreOrderRequest

        $user = User::where('id', Auth::user()->id)->first();

        if(!isset($user)){
            // Log unauthorized order attempt
            Log::warning('Unauthorized order creation attempt - user not found', [
                'auth_id' => Auth::id(),
                'ip' => request()->ip(),
                'action' => 'addOrder'
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        $contact = $user->role->code == Role::CUSTOMER ? 'Profood' : "l'administrateur";
        // $customer = Customer::where('user_id', Auth::user()->id)->first();
        $customer = Customer::find((int)$request->customer_id);

        if(!isset($customer)){
            // Log order attempt with non-existent customer
            Log::warning('Order creation attempt with non-existent customer', [
                'user_id' => $user->id,
                'customer_id' => $request->customer_id,
                'action' => 'addOrder'
            ]);
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        if($customer->user->id !== $user->id){
            // Log unauthorized order attempt - customer ID mismatch
            Log::warning('Unauthorized order creation attempt - customer ID mismatch', [
                'user_id' => $user->id,
                'customer_id' => $customer->id,
                'customer_user_id' => $customer->user->id,
                'ip' => request()->ip(),
                'action' => 'addOrder'
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        $cart       = Cart::where(['customer_id' => $customer->id, 'is_current' => true])->first();
        $montant    = 0;
        $order      = Order::where('cart_id', $cart->id)->first();

        if(!isset($order)){
            $boxes      = Box::with('type')->where('cart_id', $cart->id)->get();
            $cartSlices = CartSlice::with('slice')->where('cart_id', $cart->id)->get();

            foreach ($boxes as $box) {
                $montant += $box->type->price;
            }
            foreach ($cartSlices as $cartSlice) {
                $montant += $cartSlice->slice->price * $cartSlice->quantity;
            }

            // Handle promotion code if provided
            $promotion = null;
            $discountAmount = 0;
            $promotionCode = null;

            if ($request->has('promotion_code') && !empty($request->promotion_code)) {
                $promotionCode = strtoupper(trim($request->promotion_code));

                // Find and validate the promotion
                $promotion = Promotion::where('code', $promotionCode)->first();

                if ($promotion) {
                    // Check if promotion is valid
                    if ($promotion->isValid() && $promotion->canBeUsedBy($user)) {
                        // Calculate discount (delivery fee would be passed separately if available)
                        $deliveryFee = $request->input('delivery_fee', 0);
                        $discountAmount = $promotion->calculateDiscount($montant, $deliveryFee);

                        // Check minimum order amount
                        if ($discountAmount == 0 && $montant < $promotion->minimum_order_amount) {
                            Log::warning('Promotion minimum order amount not met', [
                                'promotion_code' => $promotionCode,
                                'order_amount' => $montant,
                                'minimum_required' => $promotion->minimum_order_amount,
                                'user_id' => $user->id
                            ]);
                            return response()->json([
                                'message' => 'Montant minimum de commande non atteint pour ce code promotionnel. Minimum requis: ' .
                                           number_format($promotion->minimum_order_amount, 0, ',', ' ') . ' CFA.'
                            ], 422);
                        }

                        Log::info('Promotion applied to order', [
                            'promotion_id' => $promotion->id,
                            'promotion_code' => $promotionCode,
                            'order_amount' => $montant,
                            'discount_amount' => $discountAmount,
                            'user_id' => $user->id
                        ]);
                    } else {
                        Log::warning('Invalid or unusable promotion code', [
                            'promotion_code' => $promotionCode,
                            'user_id' => $user->id,
                            'is_valid' => $promotion->isValid(),
                            'can_be_used' => $promotion->canBeUsedBy($user)
                        ]);
                        return response()->json([
                            'message' => 'Ce code promotionnel n\'est pas valide ou ne peut pas être utilisé.'
                        ], 422);
                    }
                } else {
                    Log::warning('Promotion code not found', [
                        'promotion_code' => $promotionCode,
                        'user_id' => $user->id
                    ]);
                    return response()->json([
                        'message' => 'Code promotionnel invalide.'
                    ], 422);
                }
            }

            $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
            $payment_status = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();
            // $payment_status_text = (!$with_payment) ? 'non payée' : 'en attente de paiement';

            if(!isset($order_status)){
                return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter {$contact}"], 500);
            }
            if(!isset($payment_status)){
                return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter {$contact}"], 500);
            }
            // Apply discount to montant
            $finalMontant = $montant - $discountAmount;

            $order = Order::create([
                'cart_id'                   => $cart->id,
                'customer_id'               => $customer->id,
                'address'                   => Str::of($request->address)->stripTags()->trim(),
                'montant'                   => $finalMontant,
                'order_status_id'           => $order_status->id,
                'order_payment_status_id'   => $payment_status->id,
                'promotion_id'              => $promotion ? $promotion->id : null,
                'discount_amount'           => $discountAmount,
                'promotion_code'            => $promotionCode,
            ]);
            $code = $this->generateReferenceNumber($order);
            $order->string_id = $code;
            $order->save();

            // Create promotion usage record and increment usage count
            if ($promotion && $discountAmount > 0) {
                PromotionUsage::create([
                    'promotion_id' => $promotion->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'discount_applied' => $discountAmount,
                ]);

                // Increment the promotion's usage count
                $promotion->incrementUsageCount();

                Log::info('Promotion usage recorded', [
                    'promotion_id' => $promotion->id,
                    'order_id' => $order->id,
                    'user_id' => $user->id,
                    'discount_amount' => $discountAmount
                ]);
            }

            $cond = [
                'order_id'          => $order->id,
                'order_status_id'   => $order_status->id
            ];
            if(!OrderHistory::where($cond)->exists()){
                OrderHistory::create($cond);
            }

            // Log successful order creation
            Log::info('Order created successfully', [
                'order_id' => $order->id,
                'order_ref' => $code,
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'montant' => $finalMontant,
                'with_payment' => $with_payment,
                'cart_id' => $cart->id,
                'action' => 'addOrder'
            ]);
            // Envoi de la notification aux managers

            try{
                $admin_role = Role::Where('code', Role::ADMIN)->first();
                $manager_role = Role::Where('code', Role::MANAGER)->first();

                if(!isset($admin_role)){
                    return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
                }
                if(!isset($manager_role)){
                    return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
                }
                $manager_list = User::Where('role_id', $admin_role->id)->orWhere('role_id', $manager_role->id)->get();

                foreach($manager_list as $manager){
                    Mail::to((string)Str::of($manager->email)->stripTags()->trim())
                    ->bcc('commercial@profood-app.com')->locale('fr')->queue(new OrderNotificationEmail($order));
                }

                // Log successful email notification queued
                Log::info('Order notification emails queued for managers', [
                    'order_id' => $order->id,
                    'order_ref' => $code,
                    'recipient_count' => $manager_list->count(),
                    'action' => 'addOrder'
                ]);
            }
            catch(\Exception $exception) {
                // Log email notification failure
                Log::error('Failed to queue order notification emails for managers', [
                    'order_id' => $order->id,
                    'order_ref' => $code,
                    'error' => $exception->getMessage(),
                    'action' => 'addOrder'
                ]);
                return response()->json(['message' => $exception->getMessage()], 500);
            }
            // Envoi de l'accusé de réception au client

            // try{
            //     $customer_email = Str::of($order->customer->email())->stripTags()->trim();
            //     Mail::to((string)$customer_email)->bcc('commercial@profood-app.com')->locale('fr')->queue(new OrderAcknowledgmentEmail($order));
            // }
            // catch(\Exception $exception) {
            //     return response()->json(['message' => $exception->getMessage()], 422);
            // }
            try{
                /**
                 * Account SID and Auth Token from twilio.com/console
                 * To set up environmental variables, see http://twil.io/secure
                 */
                $auth_token = env('TWILIO_AUTH_TOKEN');
                $account_sid = env('TWILIO_ACCOUNT_SID');
                /**
                 *  A Twilio number "Profood" is used instead
                 */
                // $twilio_number = env('TWILIO_PHONE_NUMBER');
                $order_date = (new \IntlDateFormatter(
                    'fr_SN',
                    \IntlDateFormatter::FULL,
                    \IntlDateFormatter::SHORT,
                    'Africa/Dakar',
                    \IntlDateFormatter::GREGORIAN
                ))->format(new \DateTime($order->created_at));

                $customer_phone_number = Str::of($order->customer->phoneNumber())->stripTags()->trim();
                $client = new TwilioClient($account_sid, $auth_token);
                $client->messages->create(
                    "+221{$customer_phone_number}", // Where to send a text message
                    array(
                        'from' => "Profood",  // "Profood" is used instead of the phone number
                        'body' => "{$order->string_id} est votre numéro de commande Profood du {$order_date}. Nous vous remercions pour votre commande. Nous vous remercions et vous informerons dès que la commande sera traitée et prête à être livrée.",
                    )
                );

                // Log successful SMS confirmation sent to customer
                Log::info('Order confirmation SMS sent to customer', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'customer_phone' => $customer_phone_number,
                    'action' => 'addOrder'
                ]);
            }
            catch(\Exception $exception) {
                // Log SMS sending failure
                Log::error('Failed to send order confirmation SMS to customer', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'customer_phone' => $customer_phone_number ?? 'unknown',
                    'error' => $exception->getMessage(),
                    'action' => 'addOrder'
                ]);
                return response()->json(['message' => $exception->getMessage()], 500);
            }
        }
        else {
            $boxes      = Box::with('type')->where('cart_id', $cart->id)->get();
            $cartSlices = CartSlice::with('slice')->where('cart_id', $cart->id)->get();

            foreach ($boxes as $box) {
                $montant += $box->type->price;
            }
            foreach ($cartSlices as $cartSlice) {
                $montant += $cartSlice->slice->price * $cartSlice->quantity;
            }

            // Apply existing discount if order had a promotion
            $existingDiscount = $order->discount_amount ?? 0;
            $finalMontant = $montant - $existingDiscount;

            $code = $order->string_id;
            $order->montant = $finalMontant;
            $order->address = Str::of($request->address)->stripTags()->trim();
            $order->save();
        }
        if(!$with_payment){
            $order->payment_method = 'À la livraison';
            $order->save();
            $cart->is_current = false;
            $cart->save();
        }
        else{
            return $this->processOrderPaymentRequest($order, $order->montant, $code, Str::of($request->order_id)->stripTags()->trim());
        }
        return response()->json(['message' => 'Commande passée'], 200);
    }

    /**
     * Add an order without payment.
     *
     * @param  \App\Http\Requests\StoreOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addOrderWithoutPayment(StoreOrderRequest $request)
    {
        return $this->addOrder($request, false);
    }

    /**
     * Add an order with payment.
     *
     * @param  \App\Http\Requests\StoreOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addOrderWithPayment(StoreOrderRequest $request)
    {
        return $this->addOrder($request, true);
    }

    /**
     * Add a guest order (unauthenticated customer).
     *
     * This endpoint allows customers to place orders without creating an account.
     * Guest information is stored directly on the order record instead of creating
     * a customer/user record. Cart items are validated and the total amount is calculated.
     *
     * @param  \App\Http\Requests\StoreGuestOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addGuestOrder(StoreGuestOrderRequest $request)
    {
        // Validation is automatically handled by StoreGuestOrderRequest

        // Sanitize guest information
        $guest_first_name = Str::of($request->guest_first_name)->stripTags()->trim();
        $guest_last_name = Str::of($request->guest_last_name)->stripTags()->trim();
        $guest_phone_number = Str::of($request->guest_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $guest_email = $request->guest_email ? Str::of($request->guest_email)->stripTags()->trim() : null;
        $address = Str::of($request->address)->stripTags()->trim();

        // Calculate order total from cart items
        // Cart items structure: [{type: 'box', box_type_id: X, quantity: Y}, {type: 'slice', slice_id: X, quantity: Y}]
        $montant = 0;
        $cart_items = $request->cart_items;

        foreach ($cart_items as $item) {
            if (!isset($item['type'])) {
                return response()->json(['message' => 'Chaque article du panier doit avoir un type (box ou slice)'], 422);
            }

            if ($item['type'] === 'box') {
                if (!isset($item['box_type_id'])) {
                    return response()->json(['message' => 'Les coffrets doivent avoir un box_type_id'], 422);
                }
                $boxType = BoxType::find($item['box_type_id']);
                if (!isset($boxType)) {
                    return response()->json(['message' => "Type de coffret inexistant (ID: {$item['box_type_id']})"], 404);
                }
                // For boxes, we count each one (default quantity is 1 if not specified)
                $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
                $montant += $boxType->price * $quantity;
            } else if ($item['type'] === 'slice') {
                if (!isset($item['slice_id']) || !isset($item['quantity'])) {
                    return response()->json(['message' => 'Les tranches doivent avoir un slice_id et une quantité'], 422);
                }
                $slice = \App\Models\Slice::find($item['slice_id']);
                if (!isset($slice)) {
                    return response()->json(['message' => "Tranche inexistante (ID: {$item['slice_id']})"], 404);
                }
                $montant += $slice->price * (int)$item['quantity'];
            } else {
                return response()->json(['message' => "Type d'article invalide: {$item['type']}. Utilisez 'box' ou 'slice'"], 422);
            }
        }

        if ($montant <= 0) {
            return response()->json(['message' => 'Le montant de la commande doit être supérieur à zéro'], 422);
        }

        // Handle promotion code if provided
        $promotion = null;
        $discountAmount = 0;
        $promotionCode = null;

        if ($request->has('promotion_code') && !empty($request->promotion_code)) {
            $promotionCode = strtoupper(trim($request->promotion_code));

            // Find and validate the promotion
            $promotion = Promotion::where('code', $promotionCode)->first();

            if ($promotion) {
                // Check if promotion is valid (null user for guest orders)
                if ($promotion->isValid() && $promotion->canBeUsedBy(null)) {
                    // Calculate discount
                    $deliveryFee = $request->input('delivery_fee', 0);
                    $discountAmount = $promotion->calculateDiscount($montant, $deliveryFee);

                    // Check minimum order amount
                    if ($discountAmount == 0 && $montant < $promotion->minimum_order_amount) {
                        Log::warning('Promotion minimum order amount not met (guest order)', [
                            'promotion_code' => $promotionCode,
                            'order_amount' => $montant,
                            'minimum_required' => $promotion->minimum_order_amount,
                            'guest_phone' => $guest_phone_number
                        ]);
                        return response()->json([
                            'message' => 'Montant minimum de commande non atteint pour ce code promotionnel. Minimum requis: ' .
                                       number_format($promotion->minimum_order_amount, 0, ',', ' ') . ' CFA.'
                        ], 422);
                    }

                    Log::info('Promotion applied to guest order', [
                        'promotion_id' => $promotion->id,
                        'promotion_code' => $promotionCode,
                        'order_amount' => $montant,
                        'discount_amount' => $discountAmount,
                        'guest_phone' => $guest_phone_number
                    ]);
                } else {
                    Log::warning('Invalid or unusable promotion code (guest order)', [
                        'promotion_code' => $promotionCode,
                        'guest_phone' => $guest_phone_number,
                        'is_valid' => $promotion->isValid(),
                        'can_be_used' => $promotion->canBeUsedBy(null)
                    ]);
                    return response()->json([
                        'message' => 'Ce code promotionnel n\'est pas valide ou ne peut pas être utilisé.'
                    ], 422);
                }
            } else {
                Log::warning('Promotion code not found (guest order)', [
                    'promotion_code' => $promotionCode,
                    'guest_phone' => $guest_phone_number
                ]);
                return response()->json([
                    'message' => 'Code promotionnel invalide.'
                ], 422);
            }
        }

        // Get initial order status
        $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $payment_status = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();

        if (!isset($order_status)) {
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }
        if (!isset($payment_status)) {
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }

        // Apply discount to montant
        $finalMontant = $montant - $discountAmount;

        // Create the guest order
        $order = Order::create([
            'customer_id'               => null,
            'is_guest_order'            => true,
            'guest_first_name'          => (string)$guest_first_name,
            'guest_last_name'           => (string)$guest_last_name,
            'guest_phone_number'        => (string)$guest_phone_number,
            'guest_email'               => $guest_email ? (string)$guest_email : null,
            'address'                   => (string)$address,
            'montant'                   => $finalMontant,
            'order_status_id'           => $order_status->id,
            'order_payment_status_id'   => $payment_status->id,
            'payment_method'            => 'À la livraison', // Guest orders default to cash on delivery
            'cart_id'                   => null, // Guest orders don't have a cart_id since they don't have an account
            'promotion_id'              => $promotion ? $promotion->id : null,
            'discount_amount'           => $discountAmount,
            'promotion_code'            => $promotionCode,
        ]);

        // Generate reference number
        $code = $this->generateReferenceNumber($order);
        $order->string_id = $code;
        $order->save();

        // Create promotion usage record and increment usage count (for guest orders, user_id is null)
        if ($promotion && $discountAmount > 0) {
            PromotionUsage::create([
                'promotion_id' => $promotion->id,
                'user_id' => null, // Guest orders have no user_id
                'order_id' => $order->id,
                'discount_applied' => $discountAmount,
            ]);

            // Increment the promotion's usage count
            $promotion->incrementUsageCount();

            Log::info('Promotion usage recorded for guest order', [
                'promotion_id' => $promotion->id,
                'order_id' => $order->id,
                'guest_phone' => $guest_phone_number,
                'discount_amount' => $discountAmount
            ]);
        }

        // Create order history entry
        $cond = [
            'order_id'          => $order->id,
            'order_status_id'   => $order_status->id
        ];
        if (!OrderHistory::where($cond)->exists()) {
            OrderHistory::create($cond);
        }

        // Log successful guest order creation
        Log::info('Guest order created successfully', [
            'order_id' => $order->id,
            'order_ref' => $code,
            'guest_name' => $guest_first_name . ' ' . $guest_last_name,
            'guest_phone' => $guest_phone_number,
            'montant' => $finalMontant,
            'cart_items_count' => count($cart_items),
            'action' => 'addGuestOrder'
        ]);

        // Send notification to managers/admins
        try {
            $admin_role = Role::Where('code', Role::ADMIN)->first();
            $manager_role = Role::Where('code', Role::MANAGER)->first();

            if (!isset($admin_role)) {
                return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
            }
            if (!isset($manager_role)) {
                return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
            }
            $manager_list = User::Where('role_id', $admin_role->id)->orWhere('role_id', $manager_role->id)->get();

            foreach ($manager_list as $manager) {
                Mail::to((string)Str::of($manager->email)->stripTags()->trim())
                    ->bcc('commercial@profood-app.com')->locale('fr')->queue(new OrderNotificationEmail($order));
            }

            // Log successful email notification queued
            Log::info('Guest order notification emails queued for managers', [
                'order_id' => $order->id,
                'order_ref' => $code,
                'recipient_count' => $manager_list->count(),
                'action' => 'addGuestOrder'
            ]);
        } catch (\Exception $exception) {
            // Log email notification failure (non-critical, don't fail the order)
            Log::error('Failed to queue guest order notification emails for managers', [
                'order_id' => $order->id,
                'order_ref' => $code,
                'error' => $exception->getMessage(),
                'action' => 'addGuestOrder'
            ]);
            // Continue processing - email failure shouldn't prevent order creation
        }

        // Send SMS confirmation to guest
        try {
            $auth_token = env('TWILIO_AUTH_TOKEN');
            $account_sid = env('TWILIO_ACCOUNT_SID');

            $order_date = (new \IntlDateFormatter(
                'fr_SN',
                \IntlDateFormatter::FULL,
                \IntlDateFormatter::SHORT,
                'Africa/Dakar',
                \IntlDateFormatter::GREGORIAN
            ))->format(new \DateTime($order->created_at));

            $client = new TwilioClient($account_sid, $auth_token);
            $client->messages->create(
                "+221{$guest_phone_number}", // Where to send a text message
                array(
                    'from' => "Profood",
                    'body' => "{$order->string_id} est votre numéro de commande Profood du {$order_date}. Nous vous remercions pour votre commande. Nous vous informerons dès que la commande sera traitée et prête à être livrée.",
                )
            );

            // Log successful SMS confirmation sent to guest
            Log::info('Guest order confirmation SMS sent', [
                'order_id' => $order->id,
                'order_ref' => $order->string_id,
                'guest_phone' => $guest_phone_number,
                'action' => 'addGuestOrder'
            ]);
        } catch (\Exception $exception) {
            // Log SMS sending failure (non-critical, don't fail the order)
            Log::error('Failed to send guest order confirmation SMS', [
                'order_id' => $order->id,
                'order_ref' => $order->string_id,
                'guest_phone' => $guest_phone_number,
                'error' => $exception->getMessage(),
                'action' => 'addGuestOrder'
            ]);
            // Continue - SMS failure shouldn't prevent order creation
        }

        return response()->json([
            'message' => 'Commande passée avec succès',
            'order' => [
                'id' => $order->id,
                'string_id' => $order->string_id,
                'montant' => $order->montant,
                'status' => $order_status->code
            ]
        ], 201);
    }

    /**
     * Add a guest order with PayTech payment (unauthenticated customer).
     *
     * This endpoint allows customers to place orders without creating an account
     * and pay via PayTech (mobile money, credit card, etc.).
     *
     * @param  \App\Http\Requests\StoreGuestOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addGuestOrderWithPayment(StoreGuestOrderRequest $request)
    {
        // Sanitize guest information
        $guest_first_name = Str::of($request->guest_first_name)->stripTags()->trim();
        $guest_last_name = Str::of($request->guest_last_name)->stripTags()->trim();
        $guest_phone_number = Str::of($request->guest_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $guest_email = $request->guest_email ? Str::of($request->guest_email)->stripTags()->trim() : null;
        $address = Str::of($request->address)->stripTags()->trim();
        $hash_id = Str::of($request->order_id)->stripTags()->trim();

        // Calculate order total from cart items
        $montant = 0;
        $cart_items = $request->cart_items;

        foreach ($cart_items as $item) {
            if (!isset($item['type'])) {
                return response()->json(['message' => 'Chaque article du panier doit avoir un type (box ou slice)'], 422);
            }

            if ($item['type'] === 'box') {
                if (!isset($item['box_type_id'])) {
                    return response()->json(['message' => 'Les coffrets doivent avoir un box_type_id'], 422);
                }
                $boxType = BoxType::find($item['box_type_id']);
                if (!isset($boxType)) {
                    return response()->json(['message' => "Type de coffret inexistant (ID: {$item['box_type_id']})"], 404);
                }
                $quantity = isset($item['quantity']) ? (int)$item['quantity'] : 1;
                $montant += $boxType->price * $quantity;
            } else if ($item['type'] === 'slice') {
                if (!isset($item['slice_id']) || !isset($item['quantity'])) {
                    return response()->json(['message' => 'Les tranches doivent avoir un slice_id et une quantité'], 422);
                }
                $slice = \App\Models\Slice::find($item['slice_id']);
                if (!isset($slice)) {
                    return response()->json(['message' => "Tranche inexistante (ID: {$item['slice_id']})"], 404);
                }
                $montant += $slice->price * (int)$item['quantity'];
            } else {
                return response()->json(['message' => "Type d'article invalide: {$item['type']}. Utilisez 'box' ou 'slice'"], 422);
            }
        }

        if ($montant <= 0) {
            return response()->json(['message' => 'Le montant de la commande doit être supérieur à zéro'], 422);
        }

        // Handle promotion code if provided
        $promotion = null;
        $discountAmount = 0;
        $promotionCode = null;

        if ($request->has('promotion_code') && !empty($request->promotion_code)) {
            $promotionCode = strtoupper(trim($request->promotion_code));
            $promotion = Promotion::where('code', $promotionCode)->first();

            if ($promotion) {
                if ($promotion->isValid() && $promotion->canBeUsedBy(null)) {
                    $deliveryFee = $request->input('delivery_fee', 0);
                    $discountAmount = $promotion->calculateDiscount($montant, $deliveryFee);

                    if ($discountAmount == 0 && $montant < $promotion->minimum_order_amount) {
                        return response()->json([
                            'message' => 'Montant minimum de commande non atteint pour ce code promotionnel.'
                        ], 422);
                    }
                } else {
                    return response()->json([
                        'message' => 'Ce code promotionnel n\'est pas valide ou ne peut pas être utilisé.'
                    ], 422);
                }
            } else {
                return response()->json([
                    'message' => 'Code promotionnel invalide.'
                ], 422);
            }
        }

        // Apply discount to montant
        $finalMontant = $montant - $discountAmount;

        // Get initial order status
        $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $payment_status = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();

        if (!isset($order_status) || !isset($payment_status)) {
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }

        // Create the guest order
        $order = Order::create([
            'customer_id'               => null,
            'is_guest_order'            => true,
            'guest_first_name'          => (string)$guest_first_name,
            'guest_last_name'           => (string)$guest_last_name,
            'guest_phone_number'        => (string)$guest_phone_number,
            'guest_email'               => $guest_email ? (string)$guest_email : null,
            'address'                   => (string)$address,
            'montant'                   => $finalMontant,
            'order_status_id'           => $order_status->id,
            'order_payment_status_id'   => $payment_status->id,
            'cart_id'                   => null,
            'promotion_id'              => $promotion ? $promotion->id : null,
            'discount_amount'           => $discountAmount,
            'promotion_code'            => $promotionCode,
        ]);

        // Generate reference number
        $code = $this->generateReferenceNumber($order);
        $order->string_id = $code;
        $order->save();

        // Create promotion usage record
        if ($promotion && $discountAmount > 0) {
            PromotionUsage::create([
                'promotion_id' => $promotion->id,
                'user_id' => null,
                'order_id' => $order->id,
                'discount_applied' => $discountAmount,
            ]);
            $promotion->incrementUsageCount();
        }

        // Create order history entry
        $cond = [
            'order_id'          => $order->id,
            'order_status_id'   => $order_status->id
        ];
        if (!OrderHistory::where($cond)->exists()) {
            OrderHistory::create($cond);
        }

        // Log guest order with payment creation
        Log::info('Guest order with payment created', [
            'order_id' => $order->id,
            'order_ref' => $code,
            'guest_name' => $guest_first_name . ' ' . $guest_last_name,
            'guest_phone' => $guest_phone_number,
            'montant' => $finalMontant,
            'action' => 'addGuestOrderWithPayment'
        ]);

        // Send notification to managers/admins
        try {
            $admin_role = Role::Where('code', Role::ADMIN)->first();
            $manager_role = Role::Where('code', Role::MANAGER)->first();

            if (isset($admin_role) && isset($manager_role)) {
                $manager_list = User::Where('role_id', $admin_role->id)->orWhere('role_id', $manager_role->id)->get();
                foreach ($manager_list as $manager) {
                    Mail::to((string)Str::of($manager->email)->stripTags()->trim())
                        ->bcc('commercial@profood-app.com')->locale('fr')->queue(new OrderNotificationEmail($order));
                }
            }
        } catch (\Exception $exception) {
            Log::error('Failed to queue guest order notification emails', [
                'order_id' => $order->id,
                'error' => $exception->getMessage()
            ]);
        }

        // Process PayTech payment
        return $this->processOrderPaymentRequest($order, $finalMontant, $code, $hash_id);
    }

    /**
     * Approve an order.
     * 
     * @param  integer  $order_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function approveOrder($order_id)
    {
        $order = Order::find($order_id);

        if(!isset($order)){
            return response()->json(['message' => 'Commande inexistante'], 404);
        }
        if($order->status->code != OrderStatus::AWAITING_PROCESSING){
            return response()->json(['message' => "Cette commande n'est pas en attente de traitement"], 422);
        }
        $order_status = OrderStatus::where('code', OrderStatus::BEING_PROCESSED)->first();

        if(!isset($order_status)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $order->order_status_id = $order_status->id;
        $order->save();

        return response()->json($order, 200);
    }

    /**
     * @param  \App\Http\Requests\CancelOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelOrder(CancelOrderRequest $request)
    {
        // Validation is automatically handled by CancelOrderRequest

        $user = User::where('id', Auth::user()->id)->first();

        if(!isset($user)){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        // $customer = Customer::where('user_id', Auth::user()->id)->first();
        $customer = Customer::find((int)$request->customer_id);

        if(!isset($customer)){
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        if($customer->user->id !== $user->id){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        $order = Order::find((int)$request->order_id);
        $status = OrderStatus::where('code', OrderStatus::CANCELLED)->first();

        if(!isset($order)){
            return response()->json(['message' => 'Commande inexistante'], 404);
        }
        if(!isset($status)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $cond = [
            'order_id'          => $order->id,
            'order_status_id'   => $status->id
        ];
        if(!OrderHistory::where($cond)->exists()){
            OrderHistory::create($cond);
        }
        $order->order_status_id = $status->id;
        $order->save();

        // Envoi de la notification au client

        try{
            // $customer_email = Str::of($order->customer->email())->stripTags()->trim();
            // Mail::to($customer_email)->bcc('commercial@profood-app.com')->locale('fr')
            // ->queue(new CustomerOrderStatusNotificationEmail($order, "Votre commande n°{$order->string_id} a été annulée"));
            /**
             * Account SID and Auth Token from twilio.com/console
             * To set up environmental variables, see http://twil.io/secure
             */
            $auth_token = env('TWILIO_AUTH_TOKEN');
            $account_sid = env('TWILIO_ACCOUNT_SID');
            /**
             *  A Twilio number "Profood" is used instead
             */
            // $twilio_number = env('TWILIO_PHONE_NUMBER');
            $order_date = (new \IntlDateFormatter(
                'fr_SN',
                \IntlDateFormatter::FULL,
                \IntlDateFormatter::SHORT,
                'Africa/Dakar',
                \IntlDateFormatter::GREGORIAN
            ))->format(new \DateTime($order->created_at));

            $customer_phone_number = Str::of($order->customer->phoneNumber())->stripTags()->trim();
            $client = new TwilioClient($account_sid, $auth_token);
            $client->messages->create(
                "+221{$customer_phone_number}", // Where to send a text message
                array(
                    'from' => "Profood",  // "Profood" is used instead of the phone number
                    'body' => "Votre commande n°{$order->string_id} du {$order_date} a été annulée.",
                )
            );
        }
        catch(\Exception $exception) {
            return response()->json(['message' => $exception->getMessage()], 500);
        }
        return response()->json(['message' => 'Commande annulée']);
    }

    /**
     * Generate a code for the specified order and returns it.
     *
     * @param  App\Models\Order  $order     the specified order
     *
     * @return string
     */
    protected function generateReferenceNumber(Order $order) : string
    {
        $id = (int)$order->id;

        if($id < 10){
            $id = "0{$id}";
        }
        $date = \explode('-', \explode(' ', $order->created_at)[0]);
        $ref_num = Str::substr($date[0], 2) . "{$date[1]}{$date[2]}{$id}";

        return $ref_num;
    }

    /**
     * Get the orders associated with a customer.
     * Also includes guest orders that match the customer's phone number.
     *
     * @param  integer  $customer_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerOrders($customer_id)
    {
        $customer = Customer::find($customer_id);

        if(!isset($customer)){
            return response()->json(['message' => 'Client inexistant'], 404);
        }

        // Get the customer's phone number (normalized - without spaces)
        $phoneNumber = str_replace(' ', '', $customer->phoneNumber());

        // Fetch orders that either:
        // 1. Belong to this customer (customer_id match)
        // 2. Are guest orders with the same phone number
        $orders = Order::with('cart', 'status', 'paymentStatus')
            ->where(function ($query) use ($customer, $phoneNumber) {
                $query->where('customer_id', $customer->id)
                    ->orWhere(function ($q) use ($phoneNumber) {
                        $q->where('is_guest_order', true)
                          ->whereRaw("REPLACE(guest_phone_number, ' ', '') = ?", [$phoneNumber]);
                    });
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders, 200);
    }

    /**
     * Get the orders associated with a customer according its user id.
     * Also includes guest orders that match the customer's phone number.
     *
     * @param  integer  $user_id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerOrdersByUser($user_id)
    {
        $customer = Customer::where('user_id', $user_id)->first();

        if(!isset($customer)){
            return response()->json(['message' => 'Client inexistant'], 404);
        }

        // Get the customer's phone number (normalized - without spaces)
        $phoneNumber = str_replace(' ', '', $customer->phoneNumber());

        // Fetch orders that either:
        // 1. Belong to this customer (customer_id match)
        // 2. Are guest orders with the same phone number
        $orders = Order::with('cart', 'status', 'paymentStatus')
            ->where(function ($query) use ($customer, $phoneNumber) {
                $query->where('customer_id', $customer->id)
                    ->orWhere(function ($q) use ($phoneNumber) {
                        $q->where('is_guest_order', true)
                          ->whereRaw("REPLACE(guest_phone_number, ' ', '') = ?", [$phoneNumber]);
                    });
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json($orders, 200);
    }

    /**
     * Get recent orders.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentOrders()
    {
        $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();

        if(!isset($order_status)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
        }
        $orders = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status', 'livreur')
        ->where('order_status_id', $order_status->id)->orderByDesc('created_at')->get();

        return response()->json($orders, 200);
    }

    /**
     * Get all orders.
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrders()
    {
        $orders = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status', 'livreur')->orderBy('created_at', 'desc')->get();

        return response()->json($orders, 200);
    }

    /**
     * Public endpoint to get order receipt data by string_id.
     * Returns limited order information for receipt display.
     *
     * @param string $string_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPublicReceipt($string_id)
    {
        $order = Order::where('string_id', $string_id)
            ->with('cart', 'customer', 'paymentStatus', 'status')
            ->first();

        if (!$order) {
            return response()->json(['message' => 'Commande introuvable.'], 404);
        }

        return response()->json($order, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrderPaymentStatuses()
    {
        $payment_statuses = OrderPaymentStatus::all();

        return response()->json($payment_statuses, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrderStatuses()
    {
        $order_statuses = OrderStatus::all();

        return response()->json($order_statuses, 200);
    }

    /**
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrderStatusesDetails()
    {
        $order_status_details = [];
        $order_status = OrderStatus::all();

        foreach($order_status as $status){
            if($status->code != OrderStatus::DELIVERED && $status->code != OrderStatus::CANCELLED){
                $box_count = 0;
                $slices_count = 0;
                $orders = Order::where('order_status_id', $status->id)->get();

                foreach($orders as $order){
                    $box_count += Box::where('cart_id', $order->cart_id)->count();
                    $slices_count += CartSlice::where('cart_id', $order->cart_id)->count();
                }
                $order_status_details[] = [
                    'status'        => $status,
                    'number'        => $orders->count(),
                    'box_count'     => $box_count,
                    'slice_count'   => $slices_count
                ];
            }
        }
        return response()->json($order_status_details, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOrdersStatisticsDetails(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date'    => ['nullable', 'date', 'date_format:Y-m-d', 'before:tomorrow'],
            'end_date'      => ['nullable', 'date', 'date_format:Y-m-d', 'after:start_date', 'before:tomorrow']
        ]);
        if($validator->fails()) {
            return response()->json(['message' =>  $validator->errors()->first()], 422);
        }
        $start_date = (!isset($request->start_date)) ? $request->start_date :
            Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay();
        $end_date = (!isset($request->end_date)) ? $request->end_date :
            Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay();

        $order_statistics_details = [
            'all'                       => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
            'awaitingProcessing'        => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
            'beingProcessed'            => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
            'inTheProcessOfDelivery'    => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
            'delivered'                 => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
            'cancelled'                 => [
                'number'            => 0,
                'box_count'         => 0,
                'slice_count'       => 0,
                'box_types_count'   => [
                    'Noflaye'   => 0,
                    'Téranga'   => 0,
                    'Woyofal'   => 0,
                    'Xéweul'    => 0,
                ]
            ],
        ];
        $keys_list = [
            OrderStatus::AWAITING_PROCESSING        => 'awaitingProcessing',
            OrderStatus::BEING_PROCESSED            => 'beingProcessed',
            OrderStatus::CANCELLED                  => 'cancelled',
            OrderStatus::DELIVERED                  => 'delivered',
            OrderStatus::IN_THE_PROCESS_OF_DELIVERY => 'inTheProcessOfDelivery',
        ];
        $orders = [];

        if(!isset($start_date) && !isset($end_date)){
            $orders = Order::with('status')->get();
        }
        else if(isset($start_date) && !isset($end_date)){
            $orders = Order::where('created_at', '>=', $start_date)->with('status')->get();
        }
        else if(!isset($start_date) && isset($end_date)) {
            $orders = Order::where(['created_at', '<=', $end_date])->with('status')->get();
        }
        else {
            $orders = Order::whereBetween('created_at', [$start_date, $end_date])->with('status')->get();
        }
        $box_types = BoxType::all();

        foreach($orders as $order){
            $box_count = Box::where('cart_id', $order->cart_id)->count();
            $slices_count = CartSlice::where('cart_id', $order->cart_id)->count();
            $key = $keys_list[$order->status->code];

            $order_statistics_details['all']['number'] += 1;
            $order_statistics_details['all']['box_count'] += $box_count;
            $order_statistics_details['all']['slice_count'] += $slices_count;

            $order_statistics_details[$key]['number'] += 1;
            $order_statistics_details[$key]['box_count'] += $box_count;
            $order_statistics_details[$key]['slice_count'] += $slices_count;

            foreach($box_types as $type){
                $count = Box::where([
                    'box_type_id'   => $type->id,
                    'cart_id'       => $order->cart_id
                ])->count();
                $order_statistics_details['all']['box_types_count'][$type->wording] += $count;
                $order_statistics_details[$key]['box_types_count'][$type->wording] += $count;
            }
        }
        return response()->json($order_statistics_details, 200);
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOrderPaymentStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'manager_phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'order_id'              => ['required', 'numeric', 'min:1'],
            'status_id'             => ['required', 'numeric', 'min:1']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['manager_phone_number'] = Str::of($request->manager_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $validator = Validator::make($request->all(), [
            'manager_phone_number' => ['exists:users,phone_number']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $manager_phone_number = Str::of($request->manager_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $manager = User::where('phone_number', $manager_phone_number)->first();

        if(!isset($manager)) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($manager->role->code != Role::ADMIN &&
            $manager->role->code != Role::MANAGER &&
                $manager->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $order = Order::find((int)$request->order_id);
        $status = OrderPaymentStatus::find((int)$request->status_id);

        if(!isset($order)){
            return response()->json(['message' => 'Commande inexistante'], 404);
        }
        if(!isset($status)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        // OrderHistory::create([
        //     'order_id'          => $request->order_id,
        //     'order_status_id'   => $request->status_id
        // ]);
        $order->order_payment_status_id = $status->id;
        $order->save();

        return response()->json(['message' => 'Statut de paiement de la commande mis à jour']);
    }

    /**
     * @param  \App\Http\Requests\UpdateOrderStatusRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOrderStatus(UpdateOrderStatusRequest $request)
    {
        // Validation and authorization are automatically handled by UpdateOrderStatusRequest

        $manager_phone_number = Str::of($request->manager_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $manager = User::where('phone_number', $manager_phone_number)->first();

        if(!isset($manager)) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($manager->role->code != Role::ADMIN &&
            $manager->role->code != Role::SUPER_ADMIN &&
                $manager->role->code != Role::MANAGER){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $order = Order::find((int)$request->order_id);
        $status = OrderStatus::find((int)$request->status_id);

        if(!isset($order)){
            return response()->json(['message' => 'Commande inexistante'], 404);
        }
        if(!isset($status)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $cond = [
            'order_id'          => $order->id,
            'order_status_id'   => $status->id
        ];
        if(!OrderHistory::where($cond)->exists()){
            OrderHistory::create($cond);
        }
        $order->order_status_id = $status->id;
        $order->save();

        // Log order status update
        Log::info('Order status updated', [
            'order_id' => $order->id,
            'order_ref' => $order->string_id,
            'new_status' => $status->code,
            'manager_id' => $manager->id,
            'action' => 'updateOrderStatus'
        ]);

        // Envoi de la notification au client

        if($status->code == OrderStatus::CANCELLED ||
                $status->code == OrderStatus::BEING_PROCESSED ||
                    $status->code == OrderStatus::IN_THE_PROCESS_OF_DELIVERY){
            try{
                $text = '';
                $order_date = (new \IntlDateFormatter(
                    'fr_SN',
                    \IntlDateFormatter::LONG,
                    \IntlDateFormatter::SHORT,
                    'Africa/Dakar',
                    \IntlDateFormatter::GREGORIAN
                ))->format(new \DateTime($order->created_at));

                switch($status->code){
                    case OrderStatus::CANCELLED:
                        $text = "Votre commande n°{$order->string_id} du {$order_date} est à été annulée.";
                        break;
                    case OrderStatus::BEING_PROCESSED:
                        $text = "Votre commande n°{$order->string_id} du {$order_date} est en cours de traitement.";
                        break;
                    case OrderStatus::IN_THE_PROCESS_OF_DELIVERY:
                        $text = "Votre commande n°{$order->string_id} du {$order_date} est en cours de livraison.";
                        break;
                        default:
                        break;
                }
                // $customer_email = Str::of($order->customer->email())->stripTags()->trim();
                // Mail::to($customer_email)->bcc('commercial@profood-app.com')->locale('fr')
                // ->queue(new CustomerOrderStatusNotificationEmail($order, $text));
                /**
                 * Account SID and Auth Token from twilio.com/console
                 * To set up environmental variables, see http://twil.io/secure
                 */
                $auth_token = env('TWILIO_AUTH_TOKEN');
                $account_sid = env('TWILIO_ACCOUNT_SID');
                /**
                 *  A Twilio number "Profood" is used instead
                 */
                // $twilio_number = env('TWILIO_PHONE_NUMBER');
                $customer_phone_number = Str::of($order->customer->phoneNumber())->stripTags()->trim();
                $client = new TwilioClient($account_sid, $auth_token);
                $client->messages->create(
                    "+221{$customer_phone_number}", // Where to send a text message
                    array(
                        'from' => "Profood",  // "Profood" is used instead of the phone number
                        'body' => $text,
                    )
                );

                // Log successful status notification SMS
                Log::info('Order status notification SMS sent to customer', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'status' => $status->code,
                    'customer_phone' => $customer_phone_number,
                    'action' => 'updateOrderStatus'
                ]);
            }
            catch(\Exception $exception) {
                // Log SMS notification failure — non-blocking since the status
                // update already succeeded above.
                Log::error('Failed to send order status notification SMS', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'status' => $status->code,
                    'customer_phone' => $customer_phone_number ?? 'unknown',
                    'error' => $exception->getMessage(),
                    'action' => 'updateOrderStatus'
                ]);
            }
        }
        return response()->json(['message' => ($status->code == OrderStatus::CANCELLED) ? 'Commande annulée' : 'Statut de la commande mis à jour']);
    }

    /**
     * Processes the payment request for an order.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    private function processOrderPaymentRequest(Order $order, $montant, $code, $hash_id)
    {
        // $base_url   = (App::environment('local')) ? 'http://127.0.0.1:3000' : 'https://profood-app.com';
        // $base_url   = 'https://profood-app-five.vercel.app';
        $base_url   = 'https://profood-app.com';
        // $base_url   = 'http://localhost:3000';

        $jsonResponse = (new PayTech(env('PAY_TECH_API_KEY'), env('PAY_TECH_API_SECRET')))
            ->setQuery([
                'item_name'    => $code,
                'item_price'   => $montant,
                'command_name' => "Paiement de la commande {$code} via PayTech",
            ])
            ->setCustomeField([
                'item_id'      => $order->id,
                'time_command' => time(),
                'ip_user'      => $_SERVER['REMOTE_ADDR'],
                'lang'         => $_SERVER['HTTP_ACCEPT_LANGUAGE']
            ])
            ->setTestMode(true)
            ->setRefCommand(uniqid())
            ->setNotificationUrl([
                // 'ipn_url'     => $base_url . '/redirect-payment', //only https
                'ipn_url'       => 'https://api.profood-app.com/api/redirect-payment', //only https
                'success_url'   => $base_url . '/orders/successful-order/' . $hash_id,
                'cancel_url'    => $base_url . '/orders/cancelled-order/' . $hash_id,
                // 'cancel_url'    => 'http://localhost:3000/orders/cancelled-order/' . $request->order_id
            ])
            ->send();

        return $jsonResponse;
    }

    /**
     * @param  \Illuminate\Http\Request  $request
     */
    public function redirectPayment(Request $request)
    {
        $type_event = $request->type_event;
        // $custom_field = json_decode($request->custom_field, true);
        // $ref_command = $request->ref_command;
        $item_name = $request->item_name;
        // $item_price = $request->item_price;
        // $devise = $request->devise;
        // $command_name = $request->command_name;
        // $env = $request->env;
        // $token = $request->token;
        $payment_method = $request->payment_method;

        $api_key_sha256 = $request->api_key_sha256;
        $api_secret_sha256 = $request->api_secret_sha256;

        $my_api_key = env('API_KEY');
        $my_api_secret = env('API_SECRET');

        // Log incoming payment webhook
        Log::info('PayTech payment webhook received', [
            'type_event' => $type_event,
            'item_name' => $item_name,
            'payment_method' => $payment_method,
            'ip' => request()->ip(),
            'action' => 'redirectPayment'
        ]);

        if(hash('sha256', $my_api_secret) === $api_secret_sha256 && hash('sha256', $my_api_key) === $api_key_sha256) {

            if($type_event === 'sale_complete'){
                // Find the order first - no Auth::user() needed since this is a server-to-server webhook
                $order = Order::where('string_id', $item_name)->first();

                if(!isset($order)){
                    Log::error('PayTech webhook: Order not found', ['order_ref' => $item_name]);
                    return response()->json(['message' => "Une erreur est survenue ! Commande introuvable."], 404);
                }

                // Set contact message based on order type (guest or authenticated)
                $contact = 'Profood';

                $payment_status = OrderPaymentStatus::where('code', OrderPaymentStatus::PAID)->first();

                if(!isset($payment_status)){
                    return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter {$contact}"], 500);
                }

                // Update order payment status
                $order->order_payment_status_id = $payment_status->id;
                $order->payment_method = $payment_method;
                $order->save();

                $cond = [
                    'order_id'          => $order->id,
                    'order_status_id'   => $order->order_status_id
                ];
                if(!OrderHistory::where($cond)->exists()){
                    OrderHistory::create($cond);
                }
                // $customer   = Auth::user();
                // $cart       = Cart::where(['customer_id' => $customer->id, 'is_current' => true])->first();
                $cart = Cart::find($order->cart_id);
                $cart->is_current = false;
                $cart->save();

                // Log successful payment completion
                Log::info('Payment completed successfully via PayTech webhook', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'payment_method' => $payment_method,
                    'cart_id' => $cart->id,
                    'is_guest_order' => $order->isGuestOrder(),
                    'customer_name' => $order->getCustomerName(),
                    'action' => 'redirectPayment'
                ]);
            }
            else if($type_event === 'sale_canceled'){
                // Log payment cancellation
                Log::warning('Payment canceled via PayTech webhook', [
                    'order_ref' => $item_name,
                    'action' => 'redirectPayment'
                ]);
            }
            // return response()->json(['fields' => $custom_field]);
        }
        else{
            // Log invalid webhook authentication attempt
            Log::error('Invalid PayTech webhook authentication - API key/secret mismatch', [
                'item_name' => $item_name,
                'type_event' => $type_event,
                'ip' => request()->ip(),
                'action' => 'redirectPayment'
            ]);
        }
    }
}
