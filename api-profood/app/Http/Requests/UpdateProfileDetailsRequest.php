<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for updating user profile details.
 *
 * Validates profile update data including first name, last name, email, and avatar.
 * Used by updateProfileDetails() method in UserController.
 */
class UpdateProfileDetailsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated users can update their profile.
     *
     * @return bool
     */
    public function authorize()
    {
        return Auth::check();
    }

    /**
     * Normalize the optional e-mail : a blank field must reach the validator
     * as null, otherwise 'nullable' does not apply and the regex rule rejects
     * the empty string.
     *
     * @return void
     */
    protected function prepareForValidation()
    {
        if ($this->has('email') && trim((string) $this->email) === '') {
            $this->merge(['email' => null]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * Rules enforce:
     * - Valid names (Unicode letters and spaces)
     * - Valid email format (uniqueness checked in controller)
     * - Optional avatar image (min 200x200, max 1MB)
     * - Avatar action indicator
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'first_name'            => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'email'                 => ['nullable', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#'],
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
            'first_name.required'           => 'Le prénom est obligatoire',
            'first_name.regex'              => 'Le prénom ne doit contenir que des lettres',
            'first_name.max'                => 'Le prénom ne doit pas dépasser 255 caractères',
            'last_name.required'            => 'Le nom est obligatoire',
            'last_name.regex'               => 'Le nom ne doit contenir que des lettres',
            'last_name.max'                 => 'Le nom ne doit pas dépasser 255 caractères',
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
