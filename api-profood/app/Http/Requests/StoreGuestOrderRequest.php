<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for creating a guest order (unauthenticated customer).
 *
 * Validates guest order data including guest contact information,
 * delivery address, and cart items. This endpoint is public and doesn't
 * require authentication, allowing users to place orders without creating an account.
 *
 * Used by addGuestOrder() method in OrderController.
 */
class StoreGuestOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Guest orders are public - no authentication required.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules enforce:
     * - Guest first name and last name are required
     * - Phone number must match Senegalese format (starts with 33 or 75-80)
     * - Email is optional but must be valid if provided
     * - Delivery address is required
     * - Cart items array is required (structure validated in controller)
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'guest_first_name'  => ['required', 'string', 'max:255'],
            'guest_last_name'   => ['required', 'string', 'max:255'],
            'guest_phone_number' => ['required', 'regex:#^(3[3]|7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'guest_email'       => ['nullable', 'email', 'max:255'],
            'address'           => ['required', 'string', 'max:255'],
            'cart_items'        => ['required', 'array', 'min:1']
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
            'guest_first_name.required'     => 'Le prénom est obligatoire',
            'guest_first_name.max'          => 'Le prénom ne doit pas dépasser 255 caractères',
            'guest_last_name.required'      => 'Le nom de famille est obligatoire',
            'guest_last_name.max'           => 'Le nom de famille ne doit pas dépasser 255 caractères',
            'guest_phone_number.required'   => 'Le numéro de téléphone est obligatoire',
            'guest_phone_number.regex'      => 'Le numéro de téléphone n\'est pas valide (format attendu: 33/75/76/77/78/70)',
            'guest_email.email'             => 'L\'adresse e-mail n\'est pas valide',
            'guest_email.max'               => 'L\'adresse e-mail ne doit pas dépasser 255 caractères',
            'address.required'              => 'L\'adresse de livraison est obligatoire',
            'address.max'                   => 'L\'adresse ne doit pas dépasser 255 caractères',
            'cart_items.required'           => 'Le panier ne peut pas être vide',
            'cart_items.array'              => 'Les articles du panier doivent être un tableau',
            'cart_items.min'                => 'Le panier doit contenir au moins un article'
        ];
    }
}
