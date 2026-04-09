<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for updating a box type.
 *
 * Validates box type update data including wording, capacity, price, and optional illustration image.
 * Used by updateBoxType() method in BoxTypeController.
 */
class UpdateBoxTypeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can update box types.
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
     * - ID is required to identify the box type
     * - Wording (letters and numbers, spaces allowed) - uniqueness checked in controller
     * - Capacity must be at least 1
     * - Price with up to 2 decimal places
     * - Optional illustration image update (min 256x256, max 1MB)
     * - Illustration action indicator (none or change)
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'id'                        => ['required', 'numeric', 'min:1'],
            'wording'                   => ['required', 'regex:#^[\p{L}]+[\p{L}\p{N} ]*$|^[\p{L} ]+[\p{L}\p{N}]+[\p{L}\p{N} ]*$#u', 'max:255'],
            'capacity'                  => ['required', 'numeric', 'min:1'],
            'price'                     => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'illustration'              => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=256,min_height=256'],
            'illustration_input_action' => ['required', 'regex:#(none|change){1}#'],
            // Promotional price fields
            'promotional_price'         => ['nullable', 'numeric', 'decimal:0,2', 'min:0', 'lt:price'],
            'promotion_starts_at'       => ['nullable', 'date'],
            'promotion_ends_at'         => ['nullable', 'date', 'after:promotion_starts_at'],
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
            'id.required'                        => 'L\'identifiant du box est obligatoire',
            'id.numeric'                         => 'L\'identifiant du box doit être un nombre',
            'id.min'                             => 'L\'identifiant du box n\'est pas valide',
            'wording.required'                   => 'Le libellé est obligatoire',
            'wording.regex'                      => 'Le libellé ne doit contenir que des lettres et des chiffres',
            'wording.max'                        => 'Le libellé ne doit pas dépasser 255 caractères',
            'capacity.required'                  => 'La capacité est obligatoire',
            'capacity.numeric'                   => 'La capacité doit être un nombre',
            'capacity.min'                       => 'La capacité doit être au moins 1',
            'price.required'                     => 'Le prix est obligatoire',
            'price.numeric'                      => 'Le prix doit être un nombre',
            'price.decimal'                      => 'Le prix doit avoir au maximum 2 décimales',
            'price.min'                          => 'Le prix doit être positif',
            'illustration.image'                 => 'Le fichier doit être une image',
            'illustration.mimes'                 => 'L\'image doit être au format jpeg, jpg, png ou webp',
            'illustration.max'                   => 'L\'image ne doit pas dépasser 1 Mo',
            'illustration.dimensions'            => 'L\'image doit avoir une taille minimale de 256x256 pixels',
            'illustration_input_action.required' => 'L\'action sur l\'illustration est obligatoire',
            'illustration_input_action.regex'    => 'L\'action sur l\'illustration n\'est pas valide',
            // Promotional price messages
            'promotional_price.numeric'          => 'Le prix promotionnel doit être un nombre',
            'promotional_price.decimal'          => 'Le prix promotionnel doit avoir au maximum 2 décimales',
            'promotional_price.min'              => 'Le prix promotionnel doit être positif',
            'promotional_price.lt'               => 'Le prix promotionnel doit être inférieur au prix normal',
            'promotion_starts_at.date'           => 'La date de début de promotion n\'est pas valide',
            'promotion_ends_at.date'             => 'La date de fin de promotion n\'est pas valide',
            'promotion_ends_at.after'            => 'La date de fin doit être postérieure à la date de début',
        ];
    }
}
