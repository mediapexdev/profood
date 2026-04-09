<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Form Request for user signin/authentication.
 *
 * Validates login credentials including phone number and password.
 * Used by signin() method in UserController.
 */
class SigninRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Signin is public, so always returns true.
     * App key validation is handled in the controller for security.
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
     * - Valid Senegalese phone number format (33 or 75-80 prefix)
     * - Password is required (no minimum length for login)
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'password'      => ['required', 'string']
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
            'phone_number.required' => 'Le numéro de téléphone est obligatoire',
            'phone_number.regex'    => 'Le numéro de téléphone n\'est pas valide',
            'password.required'     => 'Le mot de passe est obligatoire'
        ];
    }
}
