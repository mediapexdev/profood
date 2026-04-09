<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for updating a category.
 *
 * Validates category update data including wording and optional illustration image.
 * Used by updateCategory() method in CategoryController.
 */
class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can update categories.
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
     * - ID is required to identify the category
     * - Wording (letters and numbers, spaces allowed) - uniqueness checked in controller
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
            'illustration'              => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=256,min_height=256'],
            'illustration_input_action' => ['required', 'regex:#(none|change){1}#']
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
            'id.required'                       => 'L\'identifiant de la catégorie est obligatoire',
            'id.numeric'                        => 'L\'identifiant de la catégorie doit être un nombre',
            'id.min'                            => 'L\'identifiant de la catégorie n\'est pas valide',
            'wording.required'                  => 'Le libellé est obligatoire',
            'wording.regex'                     => 'Le libellé ne doit contenir que des lettres et des chiffres',
            'wording.max'                       => 'Le libellé ne doit pas dépasser 255 caractères',
            'illustration.image'                => 'Le fichier doit être une image',
            'illustration.mimes'                => 'L\'image doit être au format jpeg, jpg, png ou webp',
            'illustration.max'                  => 'L\'image ne doit pas dépasser 1 Mo',
            'illustration.dimensions'           => 'L\'image doit avoir une taille minimale de 256x256 pixels',
            'illustration_input_action.required' => 'L\'action sur l\'illustration est obligatoire',
            'illustration_input_action.regex'   => 'L\'action sur l\'illustration n\'est pas valide'
        ];
    }
}
