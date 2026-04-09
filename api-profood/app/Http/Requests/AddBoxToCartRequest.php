<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for adding a box to the cart.
 *
 * Validates box cart addition data including box type ID and slices array.
 * Used by addBoxToCart() method in CartController.
 */
class AddBoxToCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated users (customers) can add items to their cart.
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
     * - Valid box type ID (must exist in box_types table)
     * - Slices array is optional (validated in controller)
     *
     * Note: The slices parameter is an array of objects with id and quantity.
     * Individual slice validation is handled in the controller due to complexity.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'box_type_id' => ['required', 'numeric', 'exists:box_types,id']
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
            'box_type_id.required'  => 'Le type de box est obligatoire',
            'box_type_id.numeric'   => 'L\'identifiant du type de box doit être un nombre',
            'box_type_id.exists'    => 'Le type de box sélectionné n\'existe pas'
        ];
    }
}
