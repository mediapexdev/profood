<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for creating an order.
 *
 * Validates order creation data including customer ID, delivery address, and order ID.
 * Used by addOrder() method in OrderController.
 */
class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated users can create orders.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules enforce:
     * - Customer ID is required and valid (existence checked in controller)
     * - Delivery address is required
     * - Order ID (hash) is required for payment tracking
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'customer_id'   => ['required', 'numeric', 'min:1'],
            'address'       => ['required', 'string', 'max:255'],
            'order_id'      => ['required', 'string', 'max:255']
        ];
    }

    /**
     * Get custom validation error messages in French.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'customer_id.required'  => 'L\'identifiant du client est obligatoire',
            'customer_id.numeric'   => 'L\'identifiant du client doit être un nombre',
            'customer_id.min'       => 'L\'identifiant du client n\'est pas valide',
            'address.required'      => 'L\'adresse de livraison est obligatoire',
            'address.max'           => 'L\'adresse ne doit pas dépasser 255 caractères',
            'order_id.required'     => 'L\'identifiant de commande est obligatoire',
            'order_id.max'          => 'L\'identifiant de commande ne doit pas dépasser 255 caractères'
        ];
    }
}
