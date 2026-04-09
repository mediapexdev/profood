<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for creating a category.
 *
 * Validates category creation data including wording and illustration image.
 * Used by addCategory() method in CategoryController.
 */
class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can create categories.
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
     * - Required illustration image (min 256x256, max 1MB)
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'wording'       => ['required', 'regex:#^[\p{L}]+[\p{L}\p{N} ]*$|^[\p{L} ]+[\p{L}\p{N}]+[\p{L}\p{N} ]*$#u', 'max:255', 'unique:categories'],
            'illustration'  => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=256,min_height=256']
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
            'wording.required'          => 'Le libellé est obligatoire',
            'wording.regex'             => 'Le libellé ne doit contenir que des lettres et des chiffres',
            'wording.max'               => 'Le libellé ne doit pas dépasser 255 caractères',
            'wording.unique'            => 'Ce libellé existe déjà',
            'illustration.required'     => 'L\'image d\'illustration est obligatoire',
            'illustration.image'        => 'Le fichier doit être une image',
            'illustration.mimes'        => 'L\'image doit être au format jpeg, jpg, png ou webp',
            'illustration.max'          => 'L\'image ne doit pas dépasser 1 Mo',
            'illustration.dimensions'   => 'L\'image doit avoir une taille minimale de 256x256 pixels'
        ];
    }
}
