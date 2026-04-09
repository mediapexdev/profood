<?php

namespace App\Http\Requests;

use App\Models\Promotion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Form Request for creating a new promotion.
 *
 * Validates all required fields and business rules for promotion creation.
 */
class StorePromotionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        // Authorization is handled by middleware and controller
        // This request is only used by admin/manager users
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
            // Basic promotion information
            'code' => [
                'required',
                'string',
                'max:50',
                'regex:/^[A-Z0-9_-]+$/', // Only uppercase letters, numbers, underscores and hyphens
                'unique:promotions,code'
            ],
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',

            // Discount configuration
            'discount_type' => [
                'required',
                Rule::in([
                    Promotion::TYPE_PERCENTAGE,
                    Promotion::TYPE_FIXED_AMOUNT,
                    Promotion::TYPE_FREE_DELIVERY
                ])
            ],
            'discount_value' => [
                'required',
                'numeric',
                'min:0',
                // Percentage must be between 0 and 100
                Rule::when(
                    $this->discount_type === Promotion::TYPE_PERCENTAGE,
                    'max:100'
                )
            ],

            // Constraints
            'minimum_order_amount' => 'nullable|numeric|min:0',
            'maximum_discount' => 'nullable|numeric|min:0',

            // Usage limits
            'usage_limit_total' => 'nullable|integer|min:1',
            'usage_limit_per_user' => 'nullable|integer|min:1',

            // Validity period
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after:starts_at',

            // Status and restrictions
            'is_active' => 'nullable|boolean',
            'first_order_only' => 'nullable|boolean',

            // Product-specific targeting
            'applicable_to' => 'nullable|array',
            'applicable_to.type' => 'nullable|in:all,specific',
            'applicable_to.box_type_ids' => 'nullable|array',
            'applicable_to.box_type_ids.*' => 'integer|exists:box_types,id',
            'applicable_to.category_ids' => 'nullable|array',
            'applicable_to.category_ids.*' => 'integer|exists:categories,id',
            'applicable_to.slice_ids' => 'nullable|array',
            'applicable_to.slice_ids.*' => 'integer|exists:slices,id',
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
            'code.unique' => 'Ce code promotionnel existe déjà.',
            'code.regex' => 'Le code doit contenir uniquement des lettres majuscules, chiffres, tirets et underscores.',
            'name.required' => 'Le nom de la promotion est requis.',
            'discount_type.required' => 'Le type de réduction est requis.',
            'discount_type.in' => 'Le type de réduction doit être percentage, fixed_amount ou free_delivery.',
            'discount_value.required' => 'La valeur de réduction est requise.',
            'discount_value.numeric' => 'La valeur de réduction doit être un nombre.',
            'discount_value.min' => 'La valeur de réduction doit être positive.',
            'discount_value.max' => 'Le pourcentage de réduction ne peut pas dépasser 100%.',
            'expires_at.after' => 'La date d\'expiration doit être après la date de début.',
            'usage_limit_total.min' => 'La limite d\'utilisation totale doit être au moins 1.',
            'usage_limit_per_user.min' => 'La limite d\'utilisation par utilisateur doit être au moins 1.',
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        // Convert code to uppercase
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper($this->code)
            ]);
        }

        // Set default values if not provided
        if (!$this->has('is_active')) {
            $this->merge(['is_active' => true]);
        }

        if (!$this->has('first_order_only')) {
            $this->merge(['first_order_only' => false]);
        }

        if (!$this->has('usage_limit_per_user')) {
            $this->merge(['usage_limit_per_user' => 1]);
        }

        if (!$this->has('minimum_order_amount')) {
            $this->merge(['minimum_order_amount' => 0]);
        }
    }
}
