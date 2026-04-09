<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for updating order status.
 *
 * Validates order status update data including manager phone, order ID, and new status ID.
 * Used by updateOrderStatus() method in OrderController.
 */
class UpdateOrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can update order status.
     *
     * @return bool
     */
    public function authorize()
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();

        // Eager load role to avoid N+1 query
        if (!$user->relationLoaded('role')) {
            $user->load('role');
        }

        return in_array($user->role->code, [Role::ADMIN, Role::MANAGER, Role::SUPER_ADMIN]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules enforce:
     * - Manager phone number with Senegalese format (must exist in users table)
     * - Order ID is required and valid
     * - Status ID is required and valid
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'manager_phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#', 'exists:users,phone_number'],
            'order_id'              => ['required', 'numeric', 'min:1'],
            'status_id'             => ['required', 'numeric', 'min:1']
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
            'manager_phone_number.required' => 'Le numéro de téléphone du manager est obligatoire',
            'manager_phone_number.regex'    => 'Le numéro de téléphone du manager n\'est pas valide',
            'manager_phone_number.exists'   => 'Le numéro de téléphone n\'existe pas',
            'order_id.required'             => 'L\'identifiant de la commande est obligatoire',
            'order_id.numeric'              => 'L\'identifiant de la commande doit être un nombre',
            'order_id.min'                  => 'L\'identifiant de la commande n\'est pas valide',
            'status_id.required'            => 'L\'identifiant du statut est obligatoire',
            'status_id.numeric'             => 'L\'identifiant du statut doit être un nombre',
            'status_id.min'                 => 'L\'identifiant du statut n\'est pas valide'
        ];
    }
}
