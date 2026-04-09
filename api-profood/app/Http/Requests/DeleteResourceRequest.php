<?php

namespace App\Http\Requests;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

/**
 * Form Request for deleting a resource (box type, category, slice).
 *
 * Generic request for resource deletion that requires password confirmation.
 * Used by deleteBoxType(), deleteCategory(), and deleteSlice() methods.
 */
class DeleteResourceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Only authenticated managers, admins, and super admins can delete resources.
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
     * - ID is required to identify the resource
     * - Password confirmation required for security
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'id'        => ['required', 'numeric', 'min:1'],
            'password'  => ['required', 'string']
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
            'id.required'       => 'L\'identifiant est obligatoire',
            'id.numeric'        => 'L\'identifiant doit être un nombre',
            'id.min'            => 'L\'identifiant n\'est pas valide',
            'password.required' => 'Le mot de passe est obligatoire'
        ];
    }
}
