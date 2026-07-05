<?php

namespace App\Http\Controllers;

use App\Core\PayTech;
use App\Http\Requests\CancelOrderRequest;
use App\Http\Requests\StoreGuestOrderRequest;
use App\Http\Requests\StoreManualOrderRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Mail\CustomerOrderStatusNotificationEmail;
use App\Mail\OrderAcknowledgmentEmail;
use App\Mail\OrderNotificationEmail;
use App\Models\Box;
use App\Models\BoxSlice;
use App\Models\BoxType;
use App\Models\Cart;
use App\Models\CartSlice;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderHistory;
use App\Models\OrderPaymentStatus;
use App\Models\OrderStatus;
use App\Models\DeliverySettings;
use App\Models\Promotion;
use App\Models\Refund;
use App\Models\PromotionUsage;
use App\Models\Role;
use App\Models\Slice;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Twilio\Rest\Client as TwilioClient;

/**
 * 
 */
class OrderController extends Controller
{
    /**
     * Pull optional delivery coordinates from the request, validate the
     * ranges, and return them in a shape ready to spread into Order::create.
     * Returns nulls when either value is missing or out of range — we never
     * want to reject a whole order for a bad geoloc payload.
     */
    private function extractDeliveryCoordinates(Request $request): array
    {
        $lat = $request->input('delivery_latitude');
        $lng = $request->input('delivery_longitude');

        if(!is_numeric($lat) || !is_numeric($lng)){
            return ['delivery_latitude' => null, 'delivery_longitude' => null];
        }
        $lat = (float)$lat;
        $lng = (float)$lng;
        if($lat < -90.0 || $lat > 90.0 || $lng < -180.0 || $lng > 180.0){
            return ['delivery_latitude' => null, 'delivery_longitude' => null];
        }
        return ['delivery_latitude' => $lat, 'delivery_longitude' => $lng];
    }

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

        if(!isset($cart)){
            return response()->json(['message' => 'Votre panier est vide'], 422);
        }

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

            // Server-authoritative delivery fee, resolved from the delivery zone
            // (commune) and the subtotal. Never trust a client-supplied fee.
            $localiteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
            $deliveryFee = DeliverySettings::resolveFee($localiteId, $montant);

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
                        // Use the server-resolved delivery fee above. A free_delivery
                        // code returns that fee as the discount; since the fee is
                        // server-derived (not client-supplied) the montant stays sound.
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
            // Total = subtotal + delivery - discount, floored at 0.
            $finalMontant = max(0, $montant + $deliveryFee - $discountAmount);

            $order = Order::create(array_merge([
                'cart_id'                   => $cart->id,
                'customer_id'               => $customer->id,
                'address'                   => Str::of($request->address)->stripTags()->trim(),
                'montant'                   => $finalMontant,
                'delivery_fee'              => $deliveryFee,
                'localite_id'               => $localiteId,
                'order_status_id'           => $order_status->id,
                'order_payment_status_id'   => $payment_status->id,
                'promotion_id'              => $promotion ? $promotion->id : null,
                'discount_amount'           => $discountAmount,
                'promotion_code'            => $promotionCode,
            ], $this->extractDeliveryCoordinates($request)));
            $code = $this->generateReferenceNumber($order);
            $order->string_id = $code;
            $order->save();

            // Reserve inventory: stock leaves the shelf as soon as the order is
            // placed (this is a cash-on-delivery business, so we cannot wait for
            // a payment webhook). It is restored if the order is cancelled.
            $this->applyStockDelta($cart->id, -1);

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
                // Log email notification failure — the order is already persisted,
                // so a notification failure must NOT fail the whole request.
                Log::error('Failed to queue order notification emails for managers', [
                    'order_id' => $order->id,
                    'order_ref' => $code,
                    'error' => $exception->getMessage(),
                    'action' => 'addOrder'
                ]);
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
                // Log SMS sending failure — the order is already persisted, so a
                // notification failure must NOT fail the whole request.
                Log::error('Failed to send order confirmation SMS to customer', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'customer_phone' => $customer_phone_number ?? 'unknown',
                    'error' => $exception->getMessage(),
                    'action' => 'addOrder'
                ]);
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

            // Preserve the discount and delivery fee already stored on the order.
            $existingDiscount = $order->discount_amount ?? 0;
            $existingDeliveryFee = $order->delivery_fee ?? 0;
            $finalMontant = max(0, $montant + $existingDeliveryFee - $existingDiscount);

            $code = $order->string_id;
            $order->montant = $finalMontant;
            $order->address = Str::of($request->address)->stripTags()->trim();
            $coords = $this->extractDeliveryCoordinates($request);
            $order->delivery_latitude = $coords['delivery_latitude'];
            $order->delivery_longitude = $coords['delivery_longitude'];
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
     * Persist the content of a guest order as a cart snapshot.
     *
     * Guest orders have no shopping cart on the server, so the order content
     * arrives as a cart_items payload. This stores it with the exact same
     * structure as an authenticated order (Cart -> Box/BoxSlice + CartSlice),
     * so the manager app renders guest orders without any change and the
     * PayTech webhook finds a real cart on order->cart_id.
     *
     * The snapshot cart belongs to no customer (customer_id null) and is
     * never a current cart.
     *
     * @param  array  $cart_items  Validated items: [{type:'box', box_type_id, quantity?, slices?:[{slice_id, quantity}]}, {type:'slice', slice_id, quantity}]
     *
     * @return \App\Models\Cart
     */
    private function createGuestCartSnapshot(array $cart_items): Cart
    {
        return DB::transaction(function () use ($cart_items) {
            $cart = Cart::create([
                'customer_id' => null,
                'is_current'  => false,
            ]);

            foreach ($cart_items as $item) {
                if ($item['type'] === 'box') {
                    // Boxes are stored one row per unit, like the authenticated flow.
                    // Capped defensively: this endpoint is public.
                    $quantity = isset($item['quantity']) ? min(20, max(1, (int)$item['quantity'])) : 1;

                    for ($i = 0; $i < $quantity; $i++) {
                        $box = Box::create([
                            'box_type_id' => $item['box_type_id'],
                            'cart_id'     => $cart->id,
                        ]);

                        foreach ($item['slices'] ?? [] as $box_slice) {
                            BoxSlice::create([
                                'box_id'   => $box->id,
                                'slice_id' => $box_slice['slice_id'],
                                'quantity' => (int)$box_slice['quantity'],
                            ]);
                        }
                    }
                } else if ($item['type'] === 'slice') {
                    CartSlice::create([
                        'cart_id'  => $cart->id,
                        'slice_id' => $item['slice_id'],
                        'quantity' => (int)$item['quantity'],
                    ]);
                }
            }

            return $cart;
        });
    }

    /**
     * Total ordered quantity per slice for a cart snapshot, folding together
     * standalone retail slices and slices contained in boxes.
     *
     * @param  int|null  $cartId
     * @return array<int,int>  slice_id => quantity
     */
    private function computeSliceQuantities($cartId): array
    {
        $quantities = [];

        if ($cartId === null) {
            return $quantities;
        }

        foreach (CartSlice::where('cart_id', $cartId)->get(['slice_id', 'quantity']) as $cartSlice) {
            if ($cartSlice->slice_id === null) {
                continue;
            }
            $quantities[$cartSlice->slice_id] = ($quantities[$cartSlice->slice_id] ?? 0) + (int) $cartSlice->quantity;
        }

        $boxIds = Box::where('cart_id', $cartId)->pluck('id');
        if ($boxIds->isNotEmpty()) {
            foreach (BoxSlice::whereIn('box_id', $boxIds)->get(['slice_id', 'quantity']) as $boxSlice) {
                if ($boxSlice->slice_id === null) {
                    continue;
                }
                $quantities[$boxSlice->slice_id] = ($quantities[$boxSlice->slice_id] ?? 0) + (int) $boxSlice->quantity;
            }
        }

        return $quantities;
    }

    /**
     * Apply a stock movement for every tracked slice in a cart snapshot.
     *
     * $sign < 0 reserves stock (order placed), $sign > 0 restores it (order
     * cancelled). Only products with stock tracking on (non-null stock_quantity)
     * are touched, and each update is atomic to avoid lost updates under
     * concurrent orders. Stock is allowed to go negative — the "allow + alert"
     * policy warns the manager rather than blocking the sale.
     *
     * @param  int|null  $cartId
     * @param  int  $sign  negative to decrement, positive to increment
     * @return void
     */
    private function applyStockDelta($cartId, int $sign): void
    {
        if ($cartId === null || $sign === 0) {
            return;
        }

        foreach ($this->computeSliceQuantities($cartId) as $sliceId => $quantity) {
            if ($quantity <= 0) {
                continue;
            }

            $query = Slice::where('id', $sliceId)->whereNotNull('stock_quantity');

            if ($sign < 0) {
                $query->decrement('stock_quantity', $quantity);
            } else {
                $query->increment('stock_quantity', $quantity);
            }
        }
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

        // Server-authoritative delivery fee (never trust the client).
        $localiteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
        $deliveryFee = DeliverySettings::resolveFee($localiteId, $montant);

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
                    // free_delivery returns the server-resolved fee as the discount.
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

        // Total = subtotal + delivery - discount, floored at 0.
        $finalMontant = max(0, $montant + $deliveryFee - $discountAmount);

        // Persist the order content so managers can see what was ordered
        $guest_cart = $this->createGuestCartSnapshot($cart_items);

        // Create the guest order
        $order = Order::create(array_merge([
            'customer_id'               => null,
            'is_guest_order'            => true,
            'guest_first_name'          => (string)$guest_first_name,
            'guest_last_name'           => (string)$guest_last_name,
            'guest_phone_number'        => (string)$guest_phone_number,
            'guest_email'               => $guest_email ? (string)$guest_email : null,
            'address'                   => (string)$address,
            'montant'                   => $finalMontant,
            'delivery_fee'              => $deliveryFee,
            'localite_id'               => $localiteId,
            'order_status_id'           => $order_status->id,
            'order_payment_status_id'   => $payment_status->id,
            'payment_method'            => 'À la livraison', // Guest orders default to cash on delivery
            'cart_id'                   => $guest_cart->id,
            'promotion_id'              => $promotion ? $promotion->id : null,
            'discount_amount'           => $discountAmount,
            'promotion_code'            => $promotionCode,
        ], $this->extractDeliveryCoordinates($request)));

        // Generate reference number
        $code = $this->generateReferenceNumber($order);
        $order->string_id = $code;
        $order->save();

        // Reserve inventory for the ordered products (restored on cancellation).
        $this->applyStockDelta($guest_cart->id, -1);

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

        // Server-authoritative delivery fee (never trust the client).
        $localiteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
        $deliveryFee = DeliverySettings::resolveFee($localiteId, $montant);

        // Handle promotion code if provided
        $promotion = null;
        $discountAmount = 0;
        $promotionCode = null;

        if ($request->has('promotion_code') && !empty($request->promotion_code)) {
            $promotionCode = strtoupper(trim($request->promotion_code));
            $promotion = Promotion::where('code', $promotionCode)->first();

            if ($promotion) {
                if ($promotion->isValid() && $promotion->canBeUsedBy(null)) {
                    // free_delivery returns the server-resolved fee as the discount.
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

        // Total = subtotal + delivery - discount, floored at 0.
        $finalMontant = max(0, $montant + $deliveryFee - $discountAmount);

        // Get initial order status
        $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $payment_status = OrderPaymentStatus::where('code', OrderPaymentStatus::UNPAID)->first();

        if (!isset($order_status) || !isset($payment_status)) {
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }

        // Persist the order content so managers can see what was ordered
        $guest_cart = $this->createGuestCartSnapshot($cart_items);

        // Create the guest order
        $order = Order::create(array_merge([
            'customer_id'               => null,
            'is_guest_order'            => true,
            'guest_first_name'          => (string)$guest_first_name,
            'guest_last_name'           => (string)$guest_last_name,
            'guest_phone_number'        => (string)$guest_phone_number,
            'guest_email'               => $guest_email ? (string)$guest_email : null,
            'address'                   => (string)$address,
            'montant'                   => $finalMontant,
            'delivery_fee'              => $deliveryFee,
            'localite_id'               => $localiteId,
            'order_status_id'           => $order_status->id,
            'order_payment_status_id'   => $payment_status->id,
            'cart_id'                   => $guest_cart->id,
            'promotion_id'              => $promotion ? $promotion->id : null,
            'discount_amount'           => $discountAmount,
            'promotion_code'            => $promotionCode,
        ], $this->extractDeliveryCoordinates($request)));

        // Generate reference number
        $code = $this->generateReferenceNumber($order);
        $order->string_id = $code;
        $order->save();

        // Reserve inventory for the ordered products (restored on cancellation).
        $this->applyStockDelta($guest_cart->id, -1);

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
        // Only staff may approve orders.
        $manager = User::with('role')->find(Auth::user()->getAuthIdentifier());
        if(!isset($manager->role) || !in_array($manager->role->code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true)){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }

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
        // Whether the order was already cancelled before this call — used to
        // avoid restoring the reserved inventory twice.
        $alreadyCancelled = ((int) $order->order_status_id === (int) $status->id);

        $order->order_status_id = $status->id;
        $order->save();

        // Return the reserved inventory to stock on the transition into cancelled.
        if (!$alreadyCancelled) {
            $this->applyStockDelta($order->cart_id, 1);
        }

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

        // Authorization: a customer may only read their OWN order history.
        // Elevated roles (manager/admin/super-admin) may read anyone's.
        // Without this, the {id} in the URL let any authenticated caller
        // enumerate other customers' full order history (IDOR).
        $authUser = Auth::user();
        $elevatedRoles = [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN];
        $isElevated = isset($authUser->role) && in_array($authUser->role->code, $elevatedRoles, true);

        if(!$isElevated && (int)optional($authUser)->id !== (int)$user_id){
            Log::warning('Unauthorized order history access attempt', [
                'auth_user_id' => optional($authUser)->id,
                'requested_user_id' => $user_id,
                'ip' => request()->ip(),
                'action' => 'getCustomerOrdersByUser'
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
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
        $orders = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status', 'livreur', 'refunds')
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
        $orders = Order::with('cart', 'customer', 'histories', 'paymentStatus', 'status', 'livreur', 'refunds')->orderBy('created_at', 'desc')->get();

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

        // This receipt exposes customer PII (name, phone, address) and the
        // string_id is guessable, so it must NOT be readable by an enumerating
        // caller. Restrict to staff or the order's own customer.
        $authUser = Auth::user();
        $isStaff = isset($authUser->role) && in_array($authUser->role->code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true);
        $isOwner = $order->customer && (int)$order->customer->user_id === (int)optional($authUser)->id;

        if (!$isStaff && !$isOwner) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
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
     * Create an order manually on behalf of a caller / walk-in customer.
     *
     * Authenticated + staff-gated. Reuses the guest-order machinery: the total
     * is computed SERVER-SIDE from cart_items, the content is persisted as a
     * cart snapshot, and the order enters the normal AWAITING_PROCESSING
     * pipeline. It never touches PayTech / the payment webhook — it defaults to
     * cash on delivery (UNPAID), or PAID if the cash was collected in person.
     *
     * @param  \App\Http\Requests\StoreManualOrderRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addManualOrder(StoreManualOrderRequest $request)
    {
        // Defense in depth: re-assert the staff role against the authenticated
        // caller (FormRequest::authorize already gates, this guards regressions).
        $staff = User::with('role')->find(Auth::user()->getAuthIdentifier());
        if (!isset($staff->role) || !in_array($staff->role->code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true)) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }

        $cart_items = $request->cart_items;

        // Server-authoritative total — never trust a client-displayed amount.
        $montant = 0;
        foreach ($cart_items as $item) {
            if (($item['type'] ?? null) === 'box') {
                $boxType = BoxType::find($item['box_type_id']);
                if (!isset($boxType)) {
                    return response()->json(['message' => "Type de coffret inexistant (ID: {$item['box_type_id']})"], 404);
                }
                $montant += $boxType->price * (isset($item['quantity']) ? (int) $item['quantity'] : 1);
            } elseif (($item['type'] ?? null) === 'slice') {
                $slice = Slice::find($item['slice_id']);
                if (!isset($slice)) {
                    return response()->json(['message' => "Tranche inexistante (ID: {$item['slice_id']})"], 404);
                }
                $montant += $slice->price * (int) $item['quantity'];
            }
        }

        $order_status = OrderStatus::where('code', OrderStatus::AWAITING_PROCESSING)->first();
        $paid = filter_var($request->input('mark_paid', false), FILTER_VALIDATE_BOOLEAN);
        $payment_status = OrderPaymentStatus::where('code', $paid ? OrderPaymentStatus::PAID : OrderPaymentStatus::UNPAID)->first();
        if (!isset($order_status) || !isset($payment_status)) {
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }

        // Resolve the customer link (known customer) vs walk-in guest details.
        $customer = null;
        if ($request->filled('customer_id')) {
            $customer = Customer::find($request->customer_id);
            if (!isset($customer)) {
                return response()->json(['message' => 'Client inexistant'], 404);
            }
        }

        $notifyCustomer = filter_var($request->input('notify_customer', false), FILTER_VALIDATE_BOOLEAN);
        $payment_method = $request->payment_method ? Str::of($request->payment_method)->stripTags()->trim() : 'À la livraison';
        $address = Str::of($request->address)->stripTags()->trim();

        // Server-authoritative delivery fee for the (optional) delivery locality.
        $localiteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
        $deliveryFee = DeliverySettings::resolveFee($localiteId, $montant);

        try {
            $order = DB::transaction(function () use (
                $cart_items, $customer, $order_status, $payment_status, $payment_method, $address, $montant, $deliveryFee, $localiteId, $request
            ) {
                $cart = $this->createGuestCartSnapshot($cart_items);

                $attributes = [
                    'address'                 => (string) $address,
                    'montant'                 => $montant + $deliveryFee,
                    'delivery_fee'            => $deliveryFee,
                    'localite_id'             => $localiteId,
                    'order_status_id'         => $order_status->id,
                    'order_payment_status_id' => $payment_status->id,
                    'payment_method'          => (string) $payment_method,
                    'cart_id'                 => $cart->id,
                ];

                if ($customer) {
                    $attributes['customer_id'] = $customer->id;
                    $attributes['is_guest_order'] = false;
                } else {
                    $attributes['customer_id'] = null;
                    $attributes['is_guest_order'] = true;
                    $attributes['guest_first_name'] = (string) Str::of($request->guest_first_name)->stripTags()->trim();
                    $attributes['guest_last_name'] = (string) Str::of($request->guest_last_name)->stripTags()->trim();
                    $attributes['guest_phone_number'] = (string) Str::of($request->guest_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
                    $attributes['guest_email'] = $request->guest_email ? (string) Str::of($request->guest_email)->stripTags()->trim() : null;
                }

                $order = Order::create($attributes);
                $order->string_id = $this->generateReferenceNumber($order);
                $order->save();

                // Reserve inventory for the ordered products (restored on cancellation).
                $this->applyStockDelta($cart->id, -1);

                OrderHistory::create([
                    'order_id'        => $order->id,
                    'order_status_id' => $order_status->id,
                ]);

                return $order;
            });
        } catch (\Throwable $exception) {
            Log::error('Manual order creation failed', [
                'error'  => $exception->getMessage(),
                'staff'  => $staff->id,
                'action' => 'addManualOrder',
            ]);

            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }

        // Optional: notify a walk-in guest by SMS (non-blocking, opt-in).
        if ($notifyCustomer && !$customer && !empty($order->guest_phone_number)) {
            try {
                $order_date = (new \IntlDateFormatter(
                    'fr_SN',
                    \IntlDateFormatter::FULL,
                    \IntlDateFormatter::SHORT,
                    'Africa/Dakar',
                    \IntlDateFormatter::GREGORIAN
                ))->format(new \DateTime($order->created_at));

                $client = new TwilioClient(env('TWILIO_ACCOUNT_SID'), env('TWILIO_AUTH_TOKEN'));
                $client->messages->create(
                    "+221{$order->guest_phone_number}",
                    [
                        'from' => 'Profood',
                        'body' => "{$order->string_id} est votre numéro de commande Profood du {$order_date}. Merci pour votre commande.",
                    ]
                );
            } catch (\Throwable $exception) {
                Log::error('Failed to send manual order SMS', [
                    'order_id' => $order->id,
                    'error'    => $exception->getMessage(),
                    'action'   => 'addManualOrder',
                ]);
            }
        }

        return response()->json([
            'message' => 'Commande créée',
            'order'   => $order->fresh(['cart', 'status', 'paymentStatus', 'customer']),
        ], 201);
    }

    /**
     * Whether the authenticated caller is staff (manager/admin/super admin).
     *
     * @return \App\Models\User|null  the staff user, or null when not staff
     */
    private function resolveStaffUser()
    {
        $user = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if ($user === null || !in_array((int) optional($user->role)->code, [
            Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN,
        ], true)) {
            return null;
        }

        return $user;
    }

    /**
     * Record a refund on an order (staff). The app never moves funds — it only
     * stores the refund for traceability; the actual money return is performed
     * by staff in the payment provider. The recorded amount cannot exceed what
     * is still refundable (order total minus already-recorded refunds).
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addRefund(Request $request)
    {
        $staff = $this->resolveStaffUser();
        if ($staff === null) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'amount'   => ['required', 'integer', 'min:1'],
            'reason'   => ['nullable', 'string', 'max:255'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $order = Order::find((int) $request->order_id);
        $alreadyRefunded = (int) $order->refunds()->sum('amount');
        $remaining = max(0, (int) $order->montant - $alreadyRefunded);

        if ((int) $request->amount > $remaining) {
            return response()->json([
                'message' => 'Le montant du remboursement dépasse le montant remboursable (' .
                    number_format($remaining, 0, ',', ' ') . ' Fcfa).',
            ], 422);
        }

        $refund = Refund::create([
            'order_id'    => $order->id,
            'amount'      => (int) $request->amount,
            'reason'      => $request->reason ? (string) Str::of($request->reason)->stripTags()->trim() : null,
            'refunded_by' => $staff->id,
        ]);

        Log::info('Refund recorded', [
            'order_id'  => $order->id,
            'order_ref' => $order->string_id,
            'amount'    => $refund->amount,
            'staff_id'  => $staff->id,
            'action'    => 'addRefund',
        ]);

        return response()->json([
            'message' => 'Remboursement enregistré',
            'refund'  => $refund,
            'order'   => $order->fresh(['cart', 'status', 'paymentStatus', 'customer', 'refunds']),
        ], 201);
    }

    /**
     * Edit an order's delivery/contact details (staff). Item editing is out of
     * scope; this covers the common corrections (wrong address, locality,
     * guest contact, payment method). Changing the locality re-resolves the
     * delivery zone fee and recomputes the total, keeping the discount intact.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateOrderDetails(Request $request)
    {
        $staff = $this->resolveStaffUser();
        if ($staff === null) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'order_id'           => ['required', 'integer', 'exists:orders,id'],
            'address'            => ['required', 'string', 'max:255'],
            'localite_id'        => ['nullable', 'integer', 'exists:localites,id'],
            'payment_method'     => ['nullable', 'string', 'max:255'],
            'guest_first_name'   => ['nullable', 'string', 'max:255'],
            'guest_last_name'    => ['nullable', 'string', 'max:255'],
            'guest_phone_number' => ['nullable', 'regex:#^(3[3]|7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'guest_email'        => ['nullable', 'email', 'max:255'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $order = Order::find((int) $request->order_id);

        $order->address = (string) Str::of($request->address)->stripTags()->trim();
        if ($request->filled('payment_method')) {
            $order->payment_method = (string) Str::of($request->payment_method)->stripTags()->trim();
        }

        // Guest contact is only editable on guest orders (customer orders derive
        // their contact from the linked customer).
        if ($order->is_guest_order) {
            if ($request->filled('guest_first_name')) {
                $order->guest_first_name = (string) Str::of($request->guest_first_name)->stripTags()->trim();
            }
            if ($request->filled('guest_last_name')) {
                $order->guest_last_name = (string) Str::of($request->guest_last_name)->stripTags()->trim();
            }
            if ($request->filled('guest_phone_number')) {
                $order->guest_phone_number = (string) Str::of($request->guest_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
            }
            if ($request->filled('guest_email')) {
                $order->guest_email = (string) Str::of($request->guest_email)->stripTags()->trim();
            }
        }

        // Locality change re-resolves the delivery fee and recomputes the total.
        // The subtotal is derived from the stored fields so the cart snapshot is
        // never re-read: montant = subtotal + delivery - discount.
        $newLocaliteId = $request->filled('localite_id') ? (int) $request->localite_id : null;
        if ($newLocaliteId !== $order->localite_id) {
            $discount = (int) ($order->discount_amount ?? 0);
            $subtotal = max(0, (int) $order->montant - (int) $order->delivery_fee + $discount);
            $newFee = DeliverySettings::resolveFee($newLocaliteId, $subtotal);

            $order->localite_id = $newLocaliteId;
            $order->delivery_fee = $newFee;
            $order->montant = max(0, $subtotal + $newFee - $discount);
        }

        $order->save();

        Log::info('Order details updated', [
            'order_id'  => $order->id,
            'order_ref' => $order->string_id,
            'staff_id'  => $staff->id,
            'action'    => 'updateOrderDetails',
        ]);

        return response()->json([
            'message' => 'Commande mise à jour',
            'order'   => $order->fresh(['cart', 'status', 'paymentStatus', 'customer', 'refunds']),
        ], 200);
    }

    /**
     * Best-selling products (box types + slices) over a date range.
     *
     * Read-only aggregation over the immutable cart snapshots of the orders in
     * range. CANCELLED orders are excluded unless include_cancelled is set.
     * Staff-only (MANAGER / ADMIN / SUPER_ADMIN).
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getBestSellers(Request $request)
    {
        $manager = User::with('role')->find(Auth::user()->getAuthIdentifier());
        if (!isset($manager->role) || !in_array($manager->role->code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true)) {
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }

        $validator = Validator::make($request->all(), [
            'start_date'        => ['nullable', 'date', 'date_format:Y-m-d', 'before:tomorrow'],
            'end_date'          => ['nullable', 'date', 'date_format:Y-m-d', 'after:start_date', 'before:tomorrow'],
            'limit'             => ['nullable', 'integer', 'min:1', 'max:100'],
            'include_cancelled' => ['nullable', 'boolean'],
        ]);
        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $limit = (int) $request->input('limit', 10);
        $includeCancelled = filter_var($request->input('include_cancelled', false), FILTER_VALIDATE_BOOLEAN);

        $start_date = (!isset($request->start_date)) ? null :
            Carbon::createFromFormat('Y-m-d', $request->start_date)->startOfDay();
        $end_date = (!isset($request->end_date)) ? null :
            Carbon::createFromFormat('Y-m-d', $request->end_date)->endOfDay();

        // Orders in range (optionally excluding cancelled), reduced to cart ids.
        $ordersQuery = Order::query();
        if ($start_date) {
            $ordersQuery->where('created_at', '>=', $start_date);
        }
        if ($end_date) {
            $ordersQuery->where('created_at', '<=', $end_date);
        }
        if (!$includeCancelled) {
            $cancelled = OrderStatus::where('code', OrderStatus::CANCELLED)->first();
            if ($cancelled) {
                $ordersQuery->where('order_status_id', '!=', $cancelled->id);
            }
        }
        $cart_ids = $ordersQuery->pluck('cart_id')->filter()->unique()->values();

        // Box-type units: each Box row is one sold box.
        $box_type_rows = Box::whereIn('cart_id', $cart_ids)
            ->select('box_type_id', DB::raw('count(*) as units'))
            ->groupBy('box_type_id')
            ->get();

        // Standalone (retail) slice units.
        $standalone_rows = CartSlice::whereIn('cart_id', $cart_ids)
            ->select('slice_id', DB::raw('SUM(quantity) as qty'))
            ->groupBy('slice_id')
            ->get();

        // Slice units sold inside boxes.
        $in_box_rows = BoxSlice::whereIn('box_id', function ($q) use ($cart_ids) {
            $q->select('id')->from('boxes')->whereIn('cart_id', $cart_ids);
        })
            ->select('slice_id', DB::raw('SUM(quantity) as qty'))
            ->groupBy('slice_id')
            ->get();

        // Resolve names/prices in PHP (keeps GROUP BY ONLY_FULL_GROUP_BY-safe);
        // withTrashed so a since-deleted product still shows a label.
        $type_ids = $box_type_rows->pluck('box_type_id')->filter()->unique();
        $box_types = BoxType::withTrashed()->whereIn('id', $type_ids)->get()->keyBy('id');

        $slice_ids = $standalone_rows->pluck('slice_id')
            ->merge($in_box_rows->pluck('slice_id'))
            ->filter()->unique()->values();
        $slices = Slice::withTrashed()->whereIn('id', $slice_ids)->get()->keyBy('id');

        $box_types_result = $box_type_rows->map(function ($row) use ($box_types) {
            $type = $box_types->get($row->box_type_id);
            $units = (int) $row->units;
            $price = $type ? (float) $type->price : 0;
            return [
                'box_type_id' => (int) $row->box_type_id,
                'wording'     => $type ? $type->wording : 'Produit supprimé',
                'units'       => $units,
                'revenue'     => $units * $price,
            ];
        })->sortByDesc('units')->take($limit)->values();

        $standalone_by_id = $standalone_rows->keyBy('slice_id');
        $in_box_by_id = $in_box_rows->keyBy('slice_id');
        $slices_result = $slice_ids->map(function ($id) use ($standalone_by_id, $in_box_by_id, $slices) {
            $standalone = (int) (optional($standalone_by_id->get($id))->qty ?? 0);
            $in_box = (int) (optional($in_box_by_id->get($id))->qty ?? 0);
            $slice = $slices->get($id);
            $price = $slice ? (float) $slice->price : 0;
            return [
                'slice_id'         => (int) $id,
                'wording'          => $slice ? $slice->wording : 'Produit supprimé',
                'standalone_units' => $standalone,
                'in_box_units'     => $in_box,
                'units'            => $standalone + $in_box,
                // Revenue only on standalone units — box-contained slices are
                // paid via the box, so they are reported as units only.
                'revenue'          => $standalone * $price,
            ];
        })->sortByDesc('units')->take($limit)->values();

        return response()->json([
            'range' => [
                'start_date' => $start_date ? $start_date->format('Y-m-d') : null,
                'end_date'   => $end_date ? $end_date->format('Y-m-d') : null,
            ],
            'box_types' => $box_types_result,
            'slices'    => $slices_result,
        ], 200);
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
            $orders = Order::where('created_at', '<=', $end_date)->with('status')->get();
        }
        else {
            $orders = Order::whereBetween('created_at', [$start_date, $end_date])->with('status')->get();
        }
        // Pre-aggregate box/slice counts per cart in two queries instead of
        // running (orders x box_types) COUNT queries inside the loop (N+1).
        $cart_ids = $orders->pluck('cart_id')->filter()->unique()->values();

        $box_rows_by_cart = Box::whereIn('cart_id', $cart_ids)
            ->select('cart_id', 'box_type_id', DB::raw('count(*) as total'))
            ->groupBy('cart_id', 'box_type_id')
            ->get()
            ->groupBy('cart_id');

        $slice_count_by_cart = CartSlice::whereIn('cart_id', $cart_ids)
            ->select('cart_id', DB::raw('count(*) as total'))
            ->groupBy('cart_id')
            ->pluck('total', 'cart_id');

        // box_type_id -> wording, guarded below so an added / renamed / deleted
        // box type can never break the aggregation (was hardcoded to 4 names).
        $type_wording = BoxType::pluck('wording', 'id');

        foreach($orders as $order){
            if(!isset($order->status) || !isset($keys_list[$order->status->code])){
                continue;
            }
            $key = $keys_list[$order->status->code];
            $cartBoxRows = $box_rows_by_cart->get($order->cart_id, collect());
            $box_count = (int)$cartBoxRows->sum('total');
            $slices_count = (int)($slice_count_by_cart[$order->cart_id] ?? 0);

            $order_statistics_details['all']['number'] += 1;
            $order_statistics_details['all']['box_count'] += $box_count;
            $order_statistics_details['all']['slice_count'] += $slices_count;

            $order_statistics_details[$key]['number'] += 1;
            $order_statistics_details[$key]['box_count'] += $box_count;
            $order_statistics_details[$key]['slice_count'] += $slices_count;

            foreach($cartBoxRows as $row){
                $wording = $type_wording[$row->box_type_id] ?? null;
                if($wording === null){
                    continue;
                }
                $count = (int)$row->total;
                $order_statistics_details['all']['box_types_count'][$wording] = ($order_statistics_details['all']['box_types_count'][$wording] ?? 0) + $count;
                $order_statistics_details[$key]['box_types_count'][$wording] = ($order_statistics_details[$key]['box_types_count'][$wording] ?? 0) + $count;
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
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // manager_phone_number (any token holder could name a real manager).
        $manager = User::with('role')->find(Auth::user()->getAuthIdentifier());

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
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // manager_phone_number (any token holder could name a real manager).
        $manager = User::with('role')->find(Auth::user()->getAuthIdentifier());

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

        // Capture the previous status so inventory is only restored or re-reserved
        // on an actual transition in or out of the cancelled state.
        $previousStatusCode = optional(OrderStatus::find($order->order_status_id))->code;
        $newIsCancelled = ((int) $status->code === OrderStatus::CANCELLED);
        $wasCancelled = ($previousStatusCode !== null && (int) $previousStatusCode === OrderStatus::CANCELLED);

        $order->order_status_id = $status->id;
        $order->save();

        // Keep the stock reservation in sync with the cancelled state.
        if ($newIsCancelled && !$wasCancelled) {
            $this->applyStockDelta($order->cart_id, 1);
        } elseif (!$newIsCancelled && $wasCancelled) {
            $this->applyStockDelta($order->cart_id, -1);
        }

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
                // Guest orders have no customer relation; notify the guest phone.
                $customer_phone_number = $order->customer
                    ? Str::of($order->customer->phoneNumber())->stripTags()->trim()
                    : Str::of($order->guest_phone_number)->stripTags()->trim();
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
            catch(\Throwable $exception) {
                // Log SMS notification failure — non-blocking since the status
                // update already succeeded above. Catch Throwable (not just
                // Exception) so a null-customer TypeError can't 500 the request.
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
        $base_url = config('services.paytech.client_app_url');

        // Guests land on the guest success page (order reference passed as
        // ?ref= so account conversion works) and go back to their still-intact
        // cart on cancel; customers keep the historical order pages.
        if ($order->is_guest_order) {
            $success_url = $base_url . '/guest-order-success/' . $hash_id . '?ref=' . $code;
            $cancel_url  = $base_url . '/views/cart';
        } else {
            $success_url = $base_url . '/orders/successful-order/' . $hash_id;
            $cancel_url  = $base_url . '/orders/cancelled-order/' . $hash_id;
        }

        $jsonResponse = (new PayTech(config('services.paytech.api_key'), config('services.paytech.api_secret')))
            ->setQuery([
                'item_name'    => $code,
                'item_price'   => $montant,
                'command_name' => "Paiement de la commande {$code} via PayTech",
            ])
            ->setCustomeField([
                'item_id'      => $order->id,
                'time_command' => time(),
                'ip_user'      => request()->ip(),
                'lang'         => request()->header('Accept-Language', 'fr')
            ])
            // Sandbox unless production explicitly sets PAYTECH_TEST_MODE=false
            ->setTestMode((bool) config('services.paytech.test_mode'))
            ->setRefCommand(uniqid())
            ->setNotificationUrl([
                'ipn_url'       => 'https://api.profood-app.com/api/redirect-payment', //only https
                'success_url'   => $success_url,
                'cancel_url'    => $cancel_url,
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

        // PayTech hashes the account credentials in every IPN — validate
        // against the SAME pair used to request the payment. (Previously this
        // read env('API_KEY')/env('API_SECRET'), names that exist nowhere in
        // .env.example and that return null under config:cache, so no IPN
        // could ever be accepted.)
        $my_api_key = config('services.paytech.api_key');
        $my_api_secret = config('services.paytech.api_secret');

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
                // Guest orders created before cart snapshots have no cart_id
                $cart = Cart::find($order->cart_id);
                if (isset($cart)) {
                    $cart->is_current = false;
                    $cart->save();
                }

                // Log successful payment completion
                Log::info('Payment completed successfully via PayTech webhook', [
                    'order_id' => $order->id,
                    'order_ref' => $order->string_id,
                    'payment_method' => $payment_method,
                    'cart_id' => $order->cart_id,
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

    /**
     * Convert a guest order into a registered customer account.
     *
     * Public endpoint (no auth) — the user is creating their first account
     * from a successful guest order. The phone number is taken from the
     * order's guest_phone_number field rather than the request body so a
     * caller cannot claim someone else's order with a different phone.
     *
     * Side effects: creates User + Customer rows, links the guest order to
     * the new customer, and back-fills any other guest orders that share
     * the same phone so the new account starts with the full history.
     */
    public function convertGuestOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_string_id'       => ['required', 'string', 'exists:orders,string_id'],
            'first_name'            => ['nullable', 'string', 'max:255'],
            'last_name'             => ['nullable', 'string', 'max:255'],
            'email'                 => ['nullable', 'string', 'email'],
            'password'              => ['required', 'string', 'confirmed', Password::min(8)],
            'app_key'               => ['required', 'string']
        ]);
        if($validator->fails()){
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $app_key = Str::of($request['app_key'])->stripTags()->trim();
        $profood_app_key = env('PROFOOD_APP_KEY');

        if(0 != \strcmp($app_key, $profood_app_key)){
            Log::warning('Unauthorized convertGuestOrder attempt - invalid app key', [
                'ip' => request()->ip(),
                'action' => 'convertGuestOrder'
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        $order = Order::where('string_id', $request->order_string_id)->first();

        if(!$order || !$order->isGuestOrder()){
            return response()->json(['message' => 'Cette commande ne peut pas être convertie'], 422);
        }
        $phone = $order->guest_phone_number;

        if(empty($phone)){
            return response()->json(['message' => 'Numéro de téléphone manquant sur la commande'], 422);
        }
        if(User::where('phone_number', $phone)->exists()){
            return response()->json([
                'message' => 'Un compte existe déjà avec ce numéro. Veuillez vous connecter.'
            ], 409);
        }
        $customer_role = Role::where('code', Role::CUSTOMER)->first();

        if(!isset($customer_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }
        $first_name = Str::of($request->first_name ?: $order->guest_first_name)->stripTags()->trim();
        $last_name  = Str::of($request->last_name  ?: $order->guest_last_name)->stripTags()->trim();
        $email      = $request->email
            ? Str::of($request->email)->stripTags()->trim()
            : ($order->guest_email ?: null);

        $user = User::create([
            'first_name'    => $first_name,
            'last_name'     => $last_name,
            'phone_number'  => $phone,
            'email'         => $email,
            'password'      => Hash::make(Str::of($request->password)->stripTags()->trim()),
            'role_id'       => $customer_role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0
        ]);
        $customer = Customer::create(['user_id' => $user->id]);

        // Link this order plus every other guest order with the same phone
        // so the new account starts with the full purchase history.
        $linkedCount = Order::where('is_guest_order', true)
            ->where('guest_phone_number', $phone)
            ->update([
                'customer_id'    => $customer->id,
                'is_guest_order' => false
            ]);

        // Issue a Sanctum-style token so the client can finish signed-in
        // without forcing the customer through the signin form right after.
        $now = Carbon::now('UTC');
        $token = Hash::make("{$user->id}{$user->first_name}{$user->last_name}{$user->phone_number}{$user->created_at}{$now}");
        $user->api_token = $token;
        $expirationMinutes = (int) env('API_TOKEN_EXPIRATION_MINUTES', 43200);
        $user->api_token_expires_at = $expirationMinutes > 0 ? $now->copy()->addMinutes($expirationMinutes) : null;
        $user->session_count = 1;
        $user->logged = true;
        $user->save();

        Log::info('Guest order converted to registered account', [
            'user_id'       => $user->id,
            'customer_id'   => $customer->id,
            'order_id'      => $order->id,
            'linked_orders' => $linkedCount,
            'action'        => 'convertGuestOrder'
        ]);

        return response()->json([
            'message'       => 'Compte créé et commande liée à votre profil',
            'user'          => $user,
            'token'         => $token,
            'linked_orders' => $linkedCount
        ], 200);
    }
}
