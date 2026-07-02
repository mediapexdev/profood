<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddBoxToCartRequest;
use App\Models\Box;
use App\Models\BoxSlice;
use App\Models\Cart;
use App\Models\CartSlice;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * 
 */
class CartController extends Controller
{
   /**
     * Add box to cart.
     *
     * @param  \App\Http\Requests\AddBoxToCartRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addBoxToCart(AddBoxToCartRequest $request)
    {
        // Validation is automatically handled by AddBoxToCartRequest

        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            if(!isset($cart)){
                $cart = Cart::create([
                    'is_current'    => true,
                    'customer_id'   => $customer->id
                ]);
            }
            $box = Box::create([
                'box_type_id'   => $request->box_type_id,
                'cart_id'       => $cart->id
            ]);
            foreach($request->slices as $slice){
                BoxSlice::create([
                    'slice_id'  => $slice['id'],
                    'box_id'    => $box->id,
                    'quantity'  => $slice['quantity']
                ]);
            }

            // Log successful box addition to cart
            Log::info('Box added to cart successfully', [
                'customer_id' => $customer->id,
                'user_id' => Auth::id(),
                'cart_id' => $cart->id,
                'box_id' => $box->id,
                'box_type_id' => $request->box_type_id,
                'slices_count' => count($request->slices),
                'action' => 'addBoxToCart'
            ]);

            return response()->json(['message' => 'Votre panier a été mis à jour'], 200);
        }
        return $response;
    }

    /**
     * Add products to cart.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addSlicesToCart(Request $request)
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            if(!isset($cart)){
                $cart = Cart::create([
                    'is_current'    => true,
                    'customer_id'   => $customer->id
                ]);
            }
            foreach($request->slices as $slice){
                CartSlice::create([
                    'slice_id'  => $slice['id'],
                    'cart_id'   => $cart->id,
                    'quantity'  => $slice['quantity']
                ]);
            }
            return response()->json(['message' => 'Votre panier a été mis à jour'], 200);
        }
        return $response;
    }

    /**
     * Get cart.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCart()
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            if(isset($cart)){
                $boxes = Box::where('cart_id', $cart->id)
                ->with('box_slices', 'type')->orderByDesc('created_at')->get();

                $slices = CartSlice::where('cart_id', $cart->id)
                ->with('slice')->orderByDesc('created_at')->get();

                return response()->json(['boxes' => $boxes, 'slices' => $slices], 200);
            }
            return response()->json(["message" => "Vous n'avez pas de panier en cours"], 204);
        }
        return $response;
    }

    /**
     * Get boxes from cart.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCartBoxes()
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            if(isset($cart)){
                $boxes = Box::where('cart_id', $cart->id)
                ->with('box_slices', 'type')->orderByDesc('created_at')->get();

                return response()->json($boxes, 200);
            }
            return response()->json(["message" => "Aucun box pour le moment"], 204);
        }
        return $response;
    }

    /**
     * Get products from cart.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCartSlices()
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            if(isset($cart)){
                $slices = CartSlice::where('cart_id', $cart->id)
                ->with('slice')->orderByDesc('created_at')->get();

                return response()->json($slices, 200);
            }
            return response()->json(["message" => "Aucun produit pour le moment"], 204);
        }
        return $response;
    }

    /**
     * Delete boxes from cart.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteBoxFromCart(Request $request)
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            // Eager load cart relationship to avoid N+1 query when accessing box->cart->customer_id
            $box = Box::with('cart')->find($request->id);

            if(!isset($box)){
                return response()->json(['message' => 'Box inexistant !'], 404);
            }
            if($box->cart->customer_id != $customer->id){
                return response()->json(['message' => 'Interdite !'], 403);
            }
            $box_slices = BoxSlice::where('box_id', $box->id)->get();

            foreach ($box_slices as $box_slice) {
                $box_slice->delete();
            }
            $box->delete();
            return response()->json(['message' => 'Box supprimé du panier'], 200);
        }
        return $response;
    }

    /**
     * Delete products from cart.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteSliceFromCart(Request $request)
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            // Scope the lookup to the customer's CURRENT cart — a bare
            // where('slice_id') would match the first row across ALL carts
            // (other customers' or old ones) and delete the wrong record.
            $cart = Cart::where([
                'is_current'    => true,
                'customer_id'   => $customer->id
            ])->first();

            $deleted = isset($cart)
                ? CartSlice::where([
                    'cart_id'   => $cart->id,
                    'slice_id'  => $request->slice_id
                ])->delete()
                : 0;

            if($deleted === 0){
                return response()->json(['message' => 'Produit inexistant !'], 404);
            }
            return response()->json(['message' => 'Produit supprimée du panier'], 200);
        }
        return $response;
    }

    public function incrementCartSlice(Request $request)
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart_slice = CartSlice::with('cart')->find($request->cart_slice_id);

            if(!isset($cart_slice)){
                return response()->json(['message' => 'Produit inexistant !'], 404);
            }
            if($cart_slice->cart->customer_id != $customer->id){
                return response()->json(['message' => 'Interdite !'], 403);
            }
            $cart_slice->quantity = $cart_slice->quantity + 1;
            $cart_slice->save();
            return response()->json(['message' => 'Quantité augmentée', 'quantity' => $cart_slice->quantity], 200);
        }
        return $response;
    }

    public function decrementCartSlice(Request $request)
    {
        $customer = $this->getCustomer();
        $response = $this->CheckCustomer($customer);

        if(!isset($response)){
            $cart_slice = CartSlice::with('cart')->find($request->cart_slice_id);

            if(!isset($cart_slice)){
                return response()->json(['message' => 'Produit inexistant !'], 404);
            }
            if($cart_slice->cart->customer_id != $customer->id){
                return response()->json(['message' => 'Interdite !'], 403);
            }
            if($cart_slice->quantity <= 1){
                return response()->json(['message' => 'Quantité minimale atteinte'], 422);
            }
            $cart_slice->quantity = $cart_slice->quantity - 1;
            $cart_slice->save();
            return response()->json(['message' => 'Quantité diminuée', 'quantity' => $cart_slice->quantity], 200);
        }
        return $response;
    }

    /**
     * Check if the variable is an object of the Customer class.
     *
     * @return \Illuminate\Http\JsonResponse | void
     */
    protected function CheckCustomer($customer)
    {
        if(!isset($customer)){
            // Log forbidden cart access attempt
            Log::warning('Forbidden cart access - customer not found', [
                'user_id' => Auth::id(),
                'ip' => request()->ip(),
                'action' => 'CartController'
            ]);
            return response()->json(['message' => 'Interdite !'], 403);
        }
    }

    /**
     * Get the customer who owns the current cart.
     *
     * @return \App\Models\Customer | \Illuminate\Http\JsonResponse
     */
    protected function getCustomer()
    {
        return Customer::where('user_id', Auth::user()->id)->first();
    }
}
