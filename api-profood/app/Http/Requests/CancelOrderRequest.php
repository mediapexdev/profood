<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for cancelling an order.
 *
 * Validates order cancellation data including customer ID and order ID.
 * Used by cancelOrder() method in OrderController.
 */
class CancelOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated users can cancel orders.
     * Additional authorization (ownership) is checked in the controller.
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
     * - Customer ID is required and valid
     * - Order ID is required and valid
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'customer_id'   => ['required', 'numeric', 'min:1'],
            'order_id'      => ['required', 'numeric', 'min:1']
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
            'order_id.required'     => 'L\'identifiant de la commande est obligatoire',
            'order_id.numeric'      => 'L\'identifiant de la commande doit être un nombre',
            'order_id.min'          => 'L\'identifiant de la commande n\'est pas valide'
        ];
    }
}
