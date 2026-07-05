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
            'localite_id'       => ['nullable', 'integer', 'exists:localites,id'],
            'cart_items'        => ['required', 'array', 'min:1', 'max:50'],
            'cart_items.*.type'              => ['required', 'in:box,slice'],
            // ",deleted_at,NULL" excludes soft-deleted products, which plain exists: accepts
            'cart_items.*.box_type_id'       => ['required_if:cart_items.*.type,box', 'integer', 'exists:box_types,id,deleted_at,NULL'],
            'cart_items.*.slice_id'          => ['required_if:cart_items.*.type,slice', 'integer', 'exists:slices,id,deleted_at,NULL'],
            'cart_items.*.quantity'          => ['sometimes', 'integer', 'min:1', 'max:200'],
            'cart_items.*.slices'            => ['sometimes', 'array', 'max:30'],
            'cart_items.*.slices.*.slice_id' => ['required', 'integer', 'exists:slices,id,deleted_at,NULL'],
            'cart_items.*.slices.*.quantity' => ['required', 'integer', 'min:1', 'max:200'],
        ];
    }

    /**
     * Extra rule that depends on the item type: box quantities are capped at
     * 20 so the total charged and the persisted cart snapshot (one Box row
     * per unit) can never diverge on this public endpoint.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     *
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $totalBoxUnits = 0;
            $totalBoxSliceRows = 0;

            foreach ((array) $this->input('cart_items', []) as $index => $item) {
                if (!is_array($item) || ($item['type'] ?? null) !== 'box') {
                    continue;
                }

                $quantity = (int) ($item['quantity'] ?? 1);

                if ($quantity > 20) {
                    $validator->errors()->add(
                        "cart_items.{$index}.quantity",
                        'La quantité de coffrets est trop élevée (maximum 20)'
                    );
                }

                $totalBoxUnits += max(1, $quantity);
                $totalBoxSliceRows += max(1, $quantity) * count((array) ($item['slices'] ?? []));
            }

            // Global caps: this endpoint is public and each box unit persists
            // its own Box + BoxSlice rows, so bound the total write volume.
            if ($totalBoxUnits > 30) {
                $validator->errors()->add('cart_items', 'Le panier contient trop de coffrets (maximum 30)');
            }
            if ($totalBoxSliceRows > 400) {
                $validator->errors()->add('cart_items', 'La composition totale des coffrets est trop volumineuse');
            }
        });
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
            'cart_items.min'                => 'Le panier doit contenir au moins un article',
            'cart_items.max'                => 'Le panier contient trop d\'articles (maximum 50)',
            'cart_items.*.slices.max'       => 'La composition du coffret contient trop de découpes',
            'cart_items.*.type.required'    => 'Chaque article du panier doit avoir un type (box ou slice)',
            'cart_items.*.type.in'          => "Type d'article invalide. Utilisez 'box' ou 'slice'",
            'cart_items.*.box_type_id.required_if' => 'Les coffrets doivent avoir un box_type_id',
            'cart_items.*.box_type_id.exists'      => 'Type de coffret inexistant',
            'cart_items.*.slice_id.required_if'    => 'Les tranches doivent avoir un slice_id',
            'cart_items.*.slice_id.exists'         => 'Tranche inexistante',
            'cart_items.*.quantity.integer' => 'La quantité doit être un nombre entier',
            'cart_items.*.quantity.min'     => 'La quantité doit être au moins 1',
            'cart_items.*.quantity.max'     => 'La quantité est trop élevée',
            'cart_items.*.slices.*.slice_id.exists'  => 'Tranche inexistante dans la composition du coffret',
            'cart_items.*.slices.*.quantity.integer' => 'La quantité doit être un nombre entier',
            'cart_items.*.slices.*.quantity.min'     => 'La quantité doit être au moins 1',
            'cart_items.*.slices.*.quantity.max'     => 'La quantité est trop élevée',
        ];
    }
}
