<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for creating a slice (product).
 *
 * Validates slice creation data including wording, category, price, weight, availability, and illustration.
 * Used by addSlice() method in SliceController.
 */
class StoreSliceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can create slices.
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
     * - Unique wording (letters and numbers, spaces allowed)
     * - Valid category ID (must exist in categories table)
     * - Price with up to 2 decimal places
     * - Weight with up to 2 decimal places
     * - Boolean availability flag for box inclusion
     * - Required illustration image (min 256x256, max 1MB)
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'wording'              => ['required', 'regex:#^[\p{L}]+[\p{L}\p{N} ]*$|^[\p{L} ]+[\p{L}\p{N}]+[\p{L}\p{N} ]*$#u', 'max:255', 'unique:slices'],
            'category_id'          => ['required', 'numeric', 'min:1', 'exists:categories,id'],
            'price'                => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'weight'               => ['required', 'numeric', 'decimal:0,2'],
            'available_in_box'     => ['required', 'boolean'],
            'illustration'         => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=256,min_height=256'],
            // Promotional price fields
            'promotional_price'    => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'lt:price'],
            'promotion_starts_at'  => ['nullable', 'date'],
            'promotion_ends_at'    => ['nullable', 'date', 'after:promotion_starts_at'],
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
            'wording.required'              => 'Le libellé est obligatoire',
            'wording.regex'                 => 'Le libellé ne doit contenir que des lettres et des chiffres',
            'wording.max'                   => 'Le libellé ne doit pas dépasser 255 caractères',
            'wording.unique'                => 'Ce libellé existe déjà',
            'category_id.required'          => 'La catégorie est obligatoire',
            'category_id.numeric'           => 'L\'identifiant de la catégorie doit être un nombre',
            'category_id.min'               => 'L\'identifiant de la catégorie n\'est pas valide',
            'category_id.exists'            => 'La catégorie sélectionnée n\'existe pas',
            'price.required'                => 'Le prix est obligatoire',
            'price.numeric'                 => 'Le prix doit être un nombre',
            'price.decimal'                 => 'Le prix doit avoir au maximum 2 décimales',
            'price.min'                     => 'Le prix doit être positif',
            'weight.required'               => 'Le poids est obligatoire',
            'weight.numeric'                => 'Le poids doit être un nombre',
            'weight.decimal'                => 'Le poids doit avoir au maximum 2 décimales',
            'available_in_box.required'     => 'La disponibilité en box est obligatoire',
            'available_in_box.boolean'      => 'La disponibilité en box doit être vrai ou faux',
            'illustration.required'         => 'L\'image d\'illustration est obligatoire',
            'illustration.image'            => 'Le fichier doit être une image',
            'illustration.mimes'            => 'L\'image doit être au format jpeg, jpg, png ou webp',
            'illustration.max'              => 'L\'image ne doit pas dépasser 1 Mo',
            'illustration.dimensions'       => 'L\'image doit avoir une taille minimale de 256x256 pixels',
            // Promotional price messages
            'promotional_price.numeric'     => 'Le prix promotionnel doit être un nombre',
            'promotional_price.decimal'     => 'Le prix promotionnel doit avoir au maximum 2 décimales',
            'promotional_price.min'         => 'Le prix promotionnel doit être positif',
            'promotional_price.lt'          => 'Le prix promotionnel doit être inférieur au prix normal',
            'promotion_starts_at.date'      => 'La date de début de promotion n\'est pas valide',
            'promotion_ends_at.date'        => 'La date de fin de promotion n\'est pas valide',
            'promotion_ends_at.after'       => 'La date de fin doit être postérieure à la date de début',
        ];
    }
}
