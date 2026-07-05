<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for a staff-created (phone / walk-in) order.
 *
 * Reuses the guest-order cart-item rules but is AUTHENTICATED and staff-gated,
 * and lets staff either attach the order to an existing customer (customer_id)
 * or capture walk-in contact details (guest_* fields). Used by
 * addManualOrder() in OrderController.
 */
class StoreManualOrderRequest extends FormRequest
{
    /**
     * Only authenticated staff (manager / admin / super admin) may place a
     * manual order. A non-staff token is rejected before the controller runs.
     *
     * @return bool
     */
    public function authorize()
    {
        if (!Auth::check()) {
            return false;
        }
        $user = Auth::user();
        $code = optional(optional($user)->role)->code;

        return in_array($code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            // Either an existing customer, or walk-in guest contact details.
            'customer_id'        => ['nullable', 'integer', 'exists:customers,id'],
            'guest_first_name'   => ['required_without:customer_id', 'nullable', 'string', 'max:255'],
            'guest_last_name'    => ['required_without:customer_id', 'nullable', 'string', 'max:255'],
            'guest_phone_number' => ['required_without:customer_id', 'nullable', 'regex:#^(3[3]|7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'guest_email'        => ['nullable', 'email', 'max:255'],
            'address'            => ['required', 'string', 'max:255'],
            'localite_id'        => ['nullable', 'integer', 'exists:localites,id'],
            'payment_method'     => ['nullable', 'string', 'max:255'],
            'mark_paid'          => ['sometimes', 'boolean'],
            'notify_customer'    => ['sometimes', 'boolean'],
            'cart_items'                      => ['required', 'array', 'min:1', 'max:50'],
            'cart_items.*.type'              => ['required', 'in:box,slice'],
            'cart_items.*.box_type_id'       => ['required_if:cart_items.*.type,box', 'integer', 'exists:box_types,id,deleted_at,NULL'],
            'cart_items.*.slice_id'          => ['required_if:cart_items.*.type,slice', 'integer', 'exists:slices,id,deleted_at,NULL'],
            'cart_items.*.quantity'          => ['sometimes', 'integer', 'min:1', 'max:200'],
            'cart_items.*.slices'            => ['sometimes', 'array', 'max:30'],
            'cart_items.*.slices.*.slice_id' => ['required', 'integer', 'exists:slices,id,deleted_at,NULL'],
            'cart_items.*.slices.*.quantity' => ['required', 'integer', 'min:1', 'max:200'],
        ];
    }

    /**
     * Same box-volume caps as the guest endpoint so the charged total and the
     * persisted cart snapshot can never diverge.
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

            if ($totalBoxUnits > 30) {
                $validator->errors()->add('cart_items', 'Le panier contient trop de coffrets (maximum 30)');
            }
            if ($totalBoxSliceRows > 400) {
                $validator->errors()->add('cart_items', 'La composition totale des coffrets est trop volumineuse');
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'guest_first_name.required_without'   => 'Le prénom est obligatoire pour une commande au comptoir',
            'guest_last_name.required_without'    => 'Le nom de famille est obligatoire pour une commande au comptoir',
            'guest_phone_number.required_without' => 'Le numéro de téléphone est obligatoire pour une commande au comptoir',
            'guest_phone_number.regex'            => 'Le numéro de téléphone n\'est pas valide (format attendu: 33/75/76/77/78/70)',
            'guest_email.email'                   => 'L\'adresse e-mail n\'est pas valide',
            'address.required'                    => 'L\'adresse de livraison est obligatoire',
            'customer_id.exists'                  => 'Client inexistant',
            'cart_items.required'                 => 'Le panier ne peut pas être vide',
            'cart_items.min'                      => 'Le panier doit contenir au moins un article',
            'cart_items.max'                      => 'Le panier contient trop d\'articles (maximum 50)',
        ];
    }
}
