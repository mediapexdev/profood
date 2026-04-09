<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for validating a promotion code.
 *
 * This is used by the public API endpoint that allows customers
 * to check if a promo code is valid before placing an order.
 */
class ValidatePromoCodeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // This is a public endpoint, anyone can validate a promo code
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'code' => 'required|string|max:50',
            'order_amount' => 'required|numeric|min:0',
            'delivery_fee' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'code.required' => 'Le code promotionnel est requis.',
            'order_amount.required' => 'Le montant de la commande est requis.',
            'order_amount.numeric' => 'Le montant de la commande doit être un nombre.',
            'order_amount.min' => 'Le montant de la commande doit être positif.',
            'delivery_fee.numeric' => 'Les frais de livraison doivent être un nombre.',
            'delivery_fee.min' => 'Les frais de livraison doivent être positifs.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Convert code to uppercase for case-insensitive matching
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper(trim($this->code))
            ]);
        }

        // Set default delivery fee if not provided
        if (!$this->has('delivery_fee')) {
            $this->merge(['delivery_fee' => 0]);
        }
    }
}
