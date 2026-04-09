<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

/**
 * Form Request for changing user password.
 *
 * Validates password change data including current password and new password with confirmation.
 * Used by changePassword() method in UserController.
 */
class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated users can change their password.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules enforce:
     * - Current password required for verification
     * - New password minimum 8 characters with confirmation
     * - Password difference checked in controller
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'current_password'  => ['required', 'string'],
            'new_password'      => ['required', 'string', 'confirmed', Password::min(8)]
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
            'current_password.required'     => 'Le mot de passe actuel est obligatoire',
            'new_password.required'         => 'Le nouveau mot de passe est obligatoire',
            'new_password.min'              => 'Le nouveau mot de passe doit contenir au moins 8 caractères',
            'new_password.confirmed'        => 'La confirmation du nouveau mot de passe ne correspond pas'
        ];
    }
}
