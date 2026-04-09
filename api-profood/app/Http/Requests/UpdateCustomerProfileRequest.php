<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for updating a customer profile by admin/manager.
 *
 * Validates customer profile update data by admin including user fields without password.
 * Used by updateCustomerProfileDetails() method in UserController.
 */
class UpdateCustomerProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can update customer profiles.
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
     * - Customer ID is required
     * - Valid names (Unicode letters and spaces)
     * - Valid email and phone formats (uniqueness checked in controller)
     * - Optional avatar image (min 200x200, max 1MB)
     * - Admin phone number for authorization
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'admin_phone_number'    => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#', 'exists:users,phone_number'],
            'customer_id'           => ['required', 'numeric', 'exists:customers,id'],
            'first_name'            => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'phone_number'          => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'email'                 => ['required', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#'],
            'avatar'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=200,min_height=200'],
            'avatar_input_action'   => ['required', 'regex:#(none|change|remove){1}#']
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
            'admin_phone_number.required'   => 'Le numéro de téléphone de l\'administrateur est obligatoire',
            'admin_phone_number.regex'      => 'Le numéro de téléphone de l\'administrateur n\'est pas valide',
            'admin_phone_number.exists'     => 'Le numéro de téléphone de l\'administrateur n\'existe pas',
            'customer_id.required'          => 'L\'identifiant du client est obligatoire',
            'customer_id.numeric'           => 'L\'identifiant du client doit être un nombre',
            'customer_id.exists'            => 'Le client sélectionné n\'existe pas',
            'first_name.required'           => 'Le prénom est obligatoire',
            'first_name.regex'              => 'Le prénom ne doit contenir que des lettres',
            'first_name.max'                => 'Le prénom ne doit pas dépasser 255 caractères',
            'last_name.required'            => 'Le nom est obligatoire',
            'last_name.regex'               => 'Le nom ne doit contenir que des lettres',
            'last_name.max'                 => 'Le nom ne doit pas dépasser 255 caractères',
            'phone_number.required'         => 'Le numéro de téléphone est obligatoire',
            'phone_number.regex'            => 'Le numéro de téléphone n\'est pas valide',
            'email.required'                => "L'adresse e-mail est obligatoire",
            'email.regex'                   => "L'adresse e-mail n'est pas valide",
            'avatar.image'                  => 'Le fichier doit être une image',
            'avatar.mimes'                  => 'L\'image doit être au format jpeg, jpg, png ou webp',
            'avatar.max'                    => 'L\'image ne doit pas dépasser 1 Mo',
            'avatar.dimensions'             => 'L\'image doit avoir une taille minimale de 200x200 pixels',
            'avatar_input_action.required'  => 'L\'action sur l\'avatar est obligatoire',
            'avatar_input_action.regex'     => 'L\'action sur l\'avatar n\'est pas valide'
        ];
    }
}
