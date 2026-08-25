<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\SigninRequest;
use App\Http\Requests\SignupRequest;
use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerProfileRequest;
use App\Http\Requests\UpdateProfileDetailsRequest;
use App\Models\Admin;
use App\Models\Customer;
use App\Models\Livreur;
use App\Models\Manager;
use App\Models\Role;
use App\Models\User;
use App\Models\VerificationCodesLog;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use App\Services\ImageService;
use Throwable;
use App\Core\Sms;

/**
 * 
 */
class UserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCustomer(Request $request)
    {
        $response1 = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response1)){
            return $response1;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // Log unauthorized access attempt with phone number context
            Log::warning('Unauthorized customer addition attempt - user not found', [
                'phone_number' => $admin_phone_number,
                'action' => 'addCustomer',
                'ip' => request()->ip()
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN &&
            $admin->role->code != Role::MANAGER &&
                $admin->role->code != Role::SUPER_ADMIN){
            // Log forbidden access attempt with user context
            Log::warning('Forbidden customer addition attempt - insufficient privileges', [
                'user_id' => $admin->id,
                'user_role' => $admin->role->code,
                'required_roles' => [Role::ADMIN, Role::MANAGER, Role::SUPER_ADMIN],
                'action' => 'addCustomer',
                'ip' => request()->ip()
            ]);
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.
        
        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        // Vérification des données de l'utilisateur à ajouter.

        $response2 = $this->checkRegistrationRequestData($request);

        if(isset($response2)){
            return $response2;
        }
        $validator = Validator::make($request->all(), [
            // 'password' => ['required', 'string', Rules\Password::min(8)->mixedCase()->numbers()->symbols()]
            'password' => ['required', 'string', Rules\Password::min(8)]
        ]);
        if($validator->fails()) {
            // Log validation failure for password requirements
            Log::info('Customer creation validation failed - password requirements', [
                'admin_id' => $admin->id,
                'errors' => $validator->errors()->toArray(),
                'action' => 'addCustomer'
            ]);
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $validator = Validator::make($request->all(), [
            'password' => ['confirmed']
        ]);
        if($validator->fails()) {
            // Log validation failure for password confirmation
            Log::info('Customer creation validation failed - password confirmation', [
                'admin_id' => $admin->id,
                'action' => 'addCustomer'
            ]);
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $role = Role::Where('code', Role::CUSTOMER)->first();

        if(!isset($role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $user = User::create([
            'first_name'    => Str::of($request->first_name)->stripTags()->trim(),
            'last_name'     => Str::of($request->last_name)->stripTags()->trim(),
            'phone_number'  => Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', ''),
            'email'         => $this->normalizeEmail($request->email),
            'password'      => Hash::make(Str::of($request->password)->stripTags()->trim()),
            'role_id'       => (int)$role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0
        ]);
        if($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $imageService = new ImageService();
            $user->avatar = $imageService->processToBase64($avatar, 300, 300);
            $user->save();
        }
        $customer = Customer::create([
            'user_id' => $user->id,
        ]);

        // Log successful customer creation
        Log::info('Customer created successfully', [
            'admin_id' => $admin->id,
            'customer_id' => $customer->id,
            'user_id' => $user->id,
            'customer_phone' => $user->phone_number,
            'action' => 'addCustomer'
        ]);

        return response()->json(['message' => 'Client ajouté', 'customer' => $customer], 200); 
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function addUser(Request $request)
    {
        $response1 = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response1)){
            return $response1;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant !'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        $user_role = Role::find((int)$request->role_id);

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
        }
        if($user_role->code == Role::SUPER_ADMIN ||
            ($user_role->code == Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN)){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        // Vérification du mot de passe de l'admin.
        
        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        // Vérification des données de l'utilisateur à ajouter.

        $response2 = $this->checkRegistrationRequestData($request);

        if(isset($response2)){
            return $response2;
        }
        $validator = Validator::make($request->all(), [
            // 'password' => ['required', 'string', Rules\Password::min(10)->mixedCase()->numbers()->symbols()]
            'password' => ['required', 'string', Rules\Password::min(8)]
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $validator = Validator::make($request->all(), [
            'password' => ['confirmed']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $user = User::create([
            'first_name'    => Str::of($request->first_name)->stripTags()->trim(),
            'last_name'     => Str::of($request->last_name)->stripTags()->trim(),
            'phone_number'  => Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', ''),
            'email'         => $this->normalizeEmail($request->email),
            'password'      => Hash::make(Str::of($request->password)->stripTags()->trim()),
            'role_id'       => $user_role->id,
            'active'        => true,
            'logged'        => false,
            'session_count' => 0
        ]);
        if($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $imageService = new ImageService();
            $user->avatar = $imageService->processToBase64($avatar, 300, 300);
            $user->save();
        }
        switch($user->role->code) {
            case Role::ADMIN:
                Admin::create([
                    'user_id' => $user->id
                ]);
                break;
            case Role::MANAGER:
                Manager::create([
                    'user_id' => $user->id,
                ]);
                break;
            case Role::CUSTOMER:
                Customer::create([
                    'user_id' => $user->id
                ]);
                break;
            case Role::LIVREUR:
                Livreur::create([
                    'user_id' => $user->id
                ]);
                break;
            default:
                break;
        }
        return response()->json(['message' => 'Utilisateur ajouté', 'user' => $user], 200); 
    }

    /**
     * Update a customer's profile details.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCustomerProfileDetails(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN &&
            $admin->role->code != Role::MANAGER &&
                $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.

        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        $validator = Validator::make($request->all(), [
            'customer_id'           => ['required', 'numeric', 'exists:customers,id'],
            'first_name'            => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'phone_number'          => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'email'                 => ['required', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#'],
            'avatar'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=200,min_height=200'],
            'avatar_input_action'   => ['required', 'regex:#(none|change|remove){1}#'],
            // 'password_confirmation' => ['required', Rules\Password::defaults()]
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $customer = Customer::where('id', $request->customer_id)->first();

        if(!isset($customer)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        $user = User::where('id', $customer->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        $email = $this->normalizeEmail($request->email);
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        if(0 != \strcmp($phone_number, $user->phone_number) &&
                user::Where('phone_number', $phone_number)->exists()){
            return response()->json(['message' => "Le numéro de téléphone a déjà été prise"], 422);
        }
        if($email !== $user->email && isset($email) && user::Where('email', $email)->exists()){
            return response()->json(['message' => "L'adresse e-mail a déjà été prise"], 422);
        }
        $changes_made = false;
        $first_name = Str::of($request->first_name)->stripTags()->trim();
        $last_name = Str::of($request->last_name)->stripTags()->trim();

        if(0 != \strcmp($first_name, $user->first_name)){
            $user->first_name = $first_name;
            $changes_made = true;
        }
        if(0 != \strcmp($last_name, $user->last_name)){
            $user->last_name = $last_name;
            $changes_made = true;
        }
        if(0 != \strcmp($phone_number, $user->phone_number)){
            $user->phone_number = $phone_number;
            $changes_made = true;
        }
        if($email !== $user->email){
            $user->email = $email;
            $changes_made = true;
        }
        if($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $imageService = new ImageService();
            $user->avatar = $imageService->processToBase64($avatar, 300, 300);
            $changes_made = true;
        }
        else if(0 == \strcmp('remove', $request->avatar_input_action)) {
            $user->avatar = null;
            $changes_made = true;
        }
        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée'], 204);
        }
        // Mis à jour des données du client.
        $user->save();

        return response()->json(['message' => 'Données mises à jour'], 200);
    }

    /**
     * Update a user's profile details.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserProfileDetails(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant !'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.

        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        $validator = Validator::make($request->all(), [
            'user_id'               => ['required', 'numeric', 'exists:users,id'],
            'first_name'            => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'role_id'               => ['required', 'numeric', 'exists:roles,id'],
            'phone_number'          => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'email'                 => ['required', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#'],
            'avatar'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=200,min_height=200'],
            'avatar_input_action'   => ['required', 'regex:#(none|change|remove){1}#'],
            // 'password_confirmation' => ['required', Rules\Password::defaults()]
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $user = User::where('id', $request->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $user_role = Role::find((int)$request->role_id);

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur."], 500);
        }
        if($user_role->code == Role::SUPER_ADMIN ||
            ($user_role->code == Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN)){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $email = $this->normalizeEmail($request->email);
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        if(0 != \strcmp($phone_number, $user->phone_number) &&
                user::Where('phone_number', $phone_number)->exists()){
            return response()->json(['message' => "Le numéro de téléphone a déjà été prise"], 422);
        }
        if($email !== $user->email && isset($email) && user::Where('email', $email)->exists()){
            return response()->json(['message' => "L'adresse e-mail a déjà été prise"], 422);
        }
        $changes_made = false;
        $first_name = Str::of($request->first_name)->stripTags()->trim();
        $last_name = Str::of($request->last_name)->stripTags()->trim();

        if(0 != \strcmp($first_name, $user->first_name)){
            $user->first_name = $first_name;
            $changes_made = true;
        }
        if(0 != \strcmp($last_name, $user->last_name)){
            $user->last_name = $last_name;
            $changes_made = true;
        }
        if($request->gender_id != $user->gender_id){
            $user->gender_id = $request->gender_id;
            $changes_made = true;
        }
        if($user_role->id != $user->role_id){
            $user->role_id = $user_role->id;
            $changes_made = true;
        }
        if(0 != \strcmp($phone_number, $user->phone_number)){
            $user->phone_number = $phone_number;
            $changes_made = true;
        }
        if($email !== $user->email){
            $user->email = $email;
            $changes_made = true;
        }
        if($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $imageService = new ImageService();
            $user->avatar = $imageService->processToBase64($avatar, 300, 300);
            $changes_made = true;
        }
        else if(0 == \strcmp('remove', $request->avatar_input_action)) {
            $user->avatar = null;
            $changes_made = true;
        }
        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée'], 204);
        }
        // Mis à jour des données de l'utilisateur.
        $user->save();

        return response()->json(['message' => 'Données mises à jour'], 200);
    }

    /**
     * Update a customer's password.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateCustomerPassword(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN &&
            $admin->role->code != Role::MANAGER &&
                $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.

        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        $validator = Validator::make($request->all(), [
            'customer_id'   => ['required', 'numeric', 'exists:customers,id'],
            // 'password'      => ['required', 'string', Rules\Password::min(8)->mixedCase()->numbers()->symbols()]
            'password'      => ['required', 'string', Rules\Password::min(8)]
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $validator = Validator::make($request->all(), [
            'password' => ['confirmed']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $customer = Customer::where('id', $request->customer_id)->first();

        if(!isset($customer)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        $user = User::where('id', $customer->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        // Vérification de la ressemblance du mot de passe actuel avec le nouveau mot de passe.

        if(Hash::check($request->password, $user->password)){
            return response()->json(['message' => 'Le nouveau mot de passe doit être différent du mot de passe actuel'], 422);
        }
        // Mis à jour du mot de passe.

        $user->password = Hash::make(Str::of($request->password)->stripTags()->trim());
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour'], 200);
    }

    /**
     * Update a user's password.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateUserPassword(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if($response){
            return $response;
        }
        // $admin_validator = Validator::make($request->all(), [
        //     'admin_password' => ['required', 'string']
        // ]);
        // if($admin_validator->fails()) {
        //     return response()->json(['message' => $admin_validator->errors()->first()], 422);
        // }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant !'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.

        // if(!Hash::check($request['admin_password'], $admin->password)){
        //     return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        // }
        $validator = Validator::make($request->all(), [
            'user_id'   => ['required', 'numeric', 'exists:users,id'],
            // 'password'  => ['required', 'string', Rules\Password::min(10)->mixedCase()->numbers()->symbols()]
            'password'  => ['required', 'string', Rules\Password::min(8)]
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $validator = Validator::make($request->all(), [
            'password' => ['confirmed']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $user = User::where('id', $request->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $user_role = Role::find((int)$user->role_id);

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        if($user_role->code == Role::SUPER_ADMIN ||
            ($user_role->code == Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN)){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification de la ressemblance du mot de passe actuel avec le nouveau mot de passe.

        if(Hash::check($request->password, $user->password)){
            return response()->json(['message' => 'Le nouveau mot de passe doit être différent du mot de passe actuel'], 422);
        }
        // Mis à jour du mot de passe.

        $user->password = Hash::make(Str::of($request->password)->stripTags()->trim());
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour'], 200);
    }

    /**
     * Delete a customer.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteCustomer(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if($response){
            return $response;
        }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN &&
            $admin->role->code != Role::MANAGER &&
                $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        $validator = Validator::make($request->all(), [
            'customer_id'       => ['required', 'numeric', 'exists:customers,id'],
            'admin_password'    => ['required', 'string']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        // Vérification du mot de passe de l'admin.

        if(!Hash::check($request->admin_password, $admin->password)){
            return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        }
        $customer = Customer::where('id', $request->customer_id)->first();

        if(!isset($customer)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        $user = User::where('id', $customer->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Client inexistant'], 404);
        }
        $user->delete();
        $customer->delete();

        return response()->json(['message' => 'Client supprimé'], 200);
    }

    /**
     * Delete a user.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteUser(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant !'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée !'], 403);
        }
        $validator = Validator::make($request->all(), [
            'user_id'           => ['required', 'numeric', 'exists:users,id'],
            'admin_password'    => ['required', 'string']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $user = User::where('id', $request->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $user_role = Role::find((int)$user->role_id);

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        if($user_role->code == Role::SUPER_ADMIN ||
            ($user_role->code == Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN)){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        // Vérification du mot de passe de l'admin.

        if(!Hash::check($request->admin_password, $admin->password)){
            return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        }
        $user = User::where('id', $request->user_id)->first();
        
        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $user->active = false;
        $user->save();
        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé'], 200);
    }

    /**
     * Activate or deactivate a user account.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleUserAccountActivation(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->admin_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        $admin_phone_number = Str::of($request->admin_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Authorize by the AUTHENTICATED caller, never the client-supplied
        // admin_phone_number (any token holder could name a real admin).
        $admin = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($admin)) {
            // return response()->json(['message' => 'Utilisateur inexistant'], 404);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        if($admin->role->code != Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        $validator = Validator::make($request->all(), [
            'user_id'           => ['required', 'numeric', 'exists:users,id'],
            'toggle'            => ['required', 'boolean'],
            'admin_password'    => ['required', 'string']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        // Vérification du mot de passe de l'admin.

        if(!Hash::check($request->admin_password, $admin->password)){
            return response()->json(['message' => 'Le mot de passe saisi est incorrect'], 403);
        }
        $user = User::where('id', $request->user_id)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $user_role = Role::find((int)$user->role_id);

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        if($user_role->code == Role::SUPER_ADMIN ||
            ($user_role->code == Role::ADMIN && $admin->role->code != Role::SUPER_ADMIN)){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        $user->active = (bool)$request->toggle;
        $user->save();

        return response()->json(['message' => ((bool)$request->toggle) ? 'Compte activé' : 'Compte désactivé'], 200);
    }

    /**
     * Get user role by a id.
     *
     * @param  integer  $id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRole($id)
    {
        $role = Role::find($id);

        if(!isset($role)){
            return response()->json(['message' => "Role inexistant"], 404);
        }
        if($role->code === Role::SUPER_ADMIN){
            return response()->json(['message' => 'Demande rejetée'], 403);
        }
        return response()->json($role, 200);
    }

    /**
     * Get all user roles.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getRoles()
    {
        $roles = Role::whereNot('code', Role::SUPER_ADMIN)->get();

        return response()->json($roles, 200);
    }

    /**
     * Get all users.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getUsers(Request $request)
    {
        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->find(Auth::user()->getAuthIdentifier());

        if(!isset($user)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        // Only staff may list users — otherwise any authenticated caller
        // (including a mobile-app customer) could enumerate staff phones/emails.
        if(!isset($user->role) || !in_array($user->role->code, [Role::MANAGER, Role::ADMIN, Role::SUPER_ADMIN], true)){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 403);
        }
        $super_admin_role = Role::where('code', Role::SUPER_ADMIN)->first();

        if(!isset($super_admin_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }

        // Calculate per_page with a default of 20 and maximum of 100
        // Prevents slow queries when user base grows to thousands of records
        $perPage = min($request->input('per_page', 20), 100);

        $users = User::where([
            ['id', '<>' , $user->id],
            ['role_id', '<>', $super_admin_role->id]
        ])
        ->with('role')->orderBy('first_name')->paginate($perPage);

        return response()->json($users, 200);
    }

    /**
     * Get users without customers.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    function getUsersWithoutCustomers(Request $request)
    {
        $user = User::find(Auth::user()->getAuthIdentifier());

        if(!isset($user)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $customer_role = Role::where('code', Role::CUSTOMER)->first();
        $super_admin_role = Role::where('code', Role::SUPER_ADMIN)->first();

        if(!isset($customer_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        if(!isset($super_admin_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }

        // Calculate per_page with a default of 20 and maximum of 100
        // Optimizes performance when filtering non-customer users
        $perPage = min($request->input('per_page', 20), 100);

        $users = [];

        if($user->role->code === Role::ADMIN || $user->role->code === Role::SUPER_ADMIN){
            $users = User::where('id', '<>' , $user->id)
            ->whereNot('role_id', $customer_role->id)
            ->whereNot('role_id', $super_admin_role->id)
            ->with('role')->orderBy('first_name')->paginate($perPage);
        }
        return response()->json($users, 200);
    }

    /**
     * Check if a phone number exists.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse | void
     */
    public function phoneNumberExists(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone_number' => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['phone_number'] = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $app_key = $request['app_key'];
        $profood_app_key = env('PROFOOD_APP_KEY');
        $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');
        $profood_app_livreur_key = env('PROFOOD_APP_LIVREUR_KEY');

        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $request->phone_number)->first();

        // The role-vs-app-key guard only applies to requests that actually
        // carry an app_key (signin, signup, password reset). Internal admin
        // flows (add-user, update-user-profile-details, delete-user-by-admin)
        // do not send one — they rely on Sanctum auth + the admin role check
        // in the calling controller instead. Without this empty()-guard,
        // strcmp(null, null) returns 0 and falsely triggers the 400.
        if(isset($user) && !empty($app_key) &&
            ((!empty($profood_app_key) && 0 == \strcmp($app_key, $profood_app_key) && $user->role->code != Role::CUSTOMER) ||
                (!empty($profood_app_manager_key) && 0 == \strcmp($app_key, $profood_app_manager_key) && $user->role->code != Role::ADMIN &&
                    $user->role->code != Role::MANAGER && $user->role->code != Role::SUPER_ADMIN) ||
                (!empty($profood_app_livreur_key) && 0 == \strcmp($app_key, $profood_app_livreur_key) && $user->role->code != Role::LIVREUR))){

            return response()->json(['message' => 'Numéro de téléphone incorrect'], 400);
        }
        $validator = Validator::make($request->all(), [
            'phone_number' => ['exists:users']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
    }

    /**
     * Check if a user's phone number exists.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function userPhoneNumberExists(Request $request)
    {
        $app_key = Str::of($request['app_key'])->stripTags()->trim();
        $profood_app_key = env('PROFOOD_APP_KEY');
        $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');
        $profood_app_livreur_key = env('PROFOOD_APP_LIVREUR_KEY');

        if(0 == \strcmp($app_key, $profood_app_manager_key) ||
            0 == \strcmp($app_key, $profood_app_key) ||
            0 == \strcmp($app_key, $profood_app_livreur_key)){

            $response = $this->phoneNumberExists($request);

            if(isset($response)){
                return $response;
            }
            // L'application manager ne recevait aucun code du serveur : elle
            // s'appuyait sur un OTP Firebase vérifié côté navigateur, que le
            // serveur ne pouvait pas contrôler. Elle passe désormais par le
            // même code serveur que les autres applications.

            // In development/local mode, use a fixed OTP code to avoid Twilio costs
            if (App::environment('local')) {
                $code = '123456'; // Fixed OTP for development
                Log::info('Dev mode: Using fixed OTP code for password reset', [
                    'phone_number' => $request->phone_number
                ]);
                // Le code n'est renvoyé au client QUE en environnement local.
                $this->issueVerificationCode('PASSWORD_RESET', $request->phone_number, $code);

                return response()->json(['message' => 'success', 'code' => $code], 200);
            }

            try{
                $throttled = $this->throttleVerificationCode('PASSWORD_RESET', $request->phone_number, 'userPhoneNumberExists');

                if(isset($throttled)){
                    return $throttled;
                }
                $code = $this->generateVerificationCode();
                Sms::send((string) $request->phone_number, "{$code} est votre code de vérification Profood");

                // Le code n'est connu que du serveur et du destinataire du SMS.
                $this->issueVerificationCode('PASSWORD_RESET', $request->phone_number, $code);

                // Log successful SMS verification code sent
                Log::info('SMS verification code sent for password reset', [
                    'phone_number' => $request->phone_number,
                    'action' => 'userPhoneNumberExists'
                ]);

                return response()->json(['message' => 'success'], 200);
            }
            catch (\Exception $e) {
                // L'envoi a échoué : la tentative ne doit pas consommer le quota SMS.
                $this->refundVerificationCodeThrottle('PASSWORD_RESET', $request->phone_number);

                // Log Twilio SMS failure
                Log::error('Failed to send SMS verification code for password reset', [
                    'phone_number' => $request->phone_number,
                    'error' => $e->getMessage(),
                    'action' => 'userPhoneNumberExists'
                ]);
                // Le détail technique (ex. « username is required ») reste dans
                // les logs : l'utilisateur reçoit un message actionnable.
                return response()->json(['message' => self::SMS_SEND_ERROR_MESSAGE], 500);
            }
        }
        return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
    }

    /**
     * Check a phone number change request data.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse | void
     */
    public function checkPhoneNumberChangeRequestData(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#', 'exists:users,phone_number'],
            'password'              => ['required', 'string'],
            'new_phone_number'      => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['current_phone_number'] = Str::of($request->current_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $user = User::where('phone_number', $request->current_phone_number)->first();

        if(!isset($user)){
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        // Vérification du mot de passe.

        if(!Hash::check($request['password'], $user->password)){
            return response()->json(['message' => 'Le mot de passe est incorrect'], 403);
        }
        $request['new_phone_number'] = Str::of($request->new_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $validator = Validator::make($request->all(), [
            'new_phone_number' => ['unique:users,phone_number']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
    }

    /**
     * Check the data of the user requesting change of phone number.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkUserDataRequestingChangeOfPhoneNumber(Request $request)
    {
        $response = $this->checkPhoneNumberChangeRequestData($request);

        return (isset($response)) ? $response : response()->json(['message' => 'success'], 200);
    }

    /**
     * Check an incoming registration request data.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse | void
     */
    public function checkRegistrationRequestData(Request $request)
    {
        // The e-mail is optional : a blank field must be treated as absent,
        // otherwise 'nullable' does not apply and the regex rule rejects ''.
        $request['email'] = $this->normalizeEmail($request->email);

        $validator = Validator::make($request->all(), [
            // Allow letters, spaces, apostrophes (straight and typographic) and
            // hyphens so common Senegalese/French names (N'Diaye, M'Baye,
            // Anne-Marie) are accepted. Must start with a letter.
            'first_name'            => ['required', 'regex:#^\p{L}[\p{L} \'\x{2019}\-]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^\p{L}[\p{L} \'\x{2019}\-]*$#u', 'max:255'],
            'email'                 => ['nullable', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#', 'unique:users'],
            'phone_number'          => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'avatar'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=200,min_height=200'],
            'avatar_input_action'   => ['required', 'regex:#(none|change|remove){1}#']
        ], [
            'first_name.required'   => 'Le prénom est obligatoire',
            'first_name.regex'      => 'Le prénom contient des caractères non autorisés',
            'first_name.max'        => 'Le prénom ne doit pas dépasser 255 caractères',
            'last_name.required'    => 'Le nom est obligatoire',
            'last_name.regex'       => 'Le nom contient des caractères non autorisés',
            'last_name.max'         => 'Le nom ne doit pas dépasser 255 caractères',
            'email.regex'           => "L'adresse e-mail n'est pas valide",
            'email.unique'          => "L'adresse e-mail a déjà été prise",
            'phone_number.required' => 'Le numéro de téléphone est obligatoire',
            'phone_number.regex'    => "Le numéro de téléphone n'est pas valide",
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['phone_number'] = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $validator = Validator::make($request->all(), [
            'phone_number' => ['unique:users']
        ], [
            'phone_number.unique' => 'Le numéro de téléphone a déjà été pris',
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
    }

    /**
     * Check the data of the user requesting registration.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkUserDataRequestingRegistration(Request $request)
    {
        $app_key = Str::of($request['app_key'])->stripTags()->trim();
        $profood_app_key = env('PROFOOD_APP_KEY');
        $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');

        if(0 == \strcmp($app_key, $profood_app_manager_key) || 0 == \strcmp($app_key, $profood_app_key)){

            $response = $this->checkRegistrationRequestData($request);

            if(isset($response)){
                return $response;
            }
            if(0 == \strcmp($app_key, $profood_app_manager_key)){
                return response()->json(['message' => 'success'], 200);
            }

            // In development/local mode, use a fixed OTP code to avoid Twilio costs
            if (App::environment('local')) {
                $code = '123456'; // Fixed OTP for development
                Log::info('Dev mode: Using fixed OTP code', [
                    'phone_number' => $request->phone_number
                ]);
                // Le code n'est renvoyé au client QUE en environnement local.
                $this->issueVerificationCode('REGISTRATION', $request->phone_number, $code);

                return response()->json(['message' => 'success', 'code' => $code], 200);
            }

            try{
                $throttled = $this->throttleVerificationCode('REGISTRATION', $request->phone_number, 'checkUserDataRequestingRegistration');

                if(isset($throttled)){
                    return $throttled;
                }
                $code = $this->generateVerificationCode();
                Sms::send((string) $request->phone_number, "{$code} est votre code de vérification Profood");

                // Le code n'est connu que du serveur et du destinataire du SMS.
                $this->issueVerificationCode('REGISTRATION', $request->phone_number, $code);

                return response()->json(['message' => 'success'], 200);
            }
            catch (\Exception $e) {
                // L'envoi a échoué : la tentative ne doit pas consommer le quota SMS.
                $this->refundVerificationCodeThrottle('REGISTRATION', $request->phone_number);

                Log::error('Failed to send SMS verification code for registration', [
                    'phone_number' => $request->phone_number,
                    'error' => $e->getMessage(),
                    'action' => 'checkUserDataRequestingRegistration'
                ]);
                // Le détail technique (ex. « username is required ») reste dans
                // les logs : l'utilisateur reçoit un message actionnable.
                return response()->json(['message' => self::SMS_SEND_ERROR_MESSAGE], 500);
            }
        }
        return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
    }

    /**
     * Vérifie un code de vérification sans le consommer.
     *
     * Sert uniquement à donner un retour immédiat à l'utilisateur entre
     * l'étape « saisie du code » et l'étape suivante du formulaire. La
     * décision qui compte reste celle prise au moment de l'action finale
     * (signup / password-reset), où le code est revérifié puis consommé.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkVerificationCode(Request $request)
    {
        $app_key = Str::of($request['app_key'])->stripTags()->trim();
        $profood_app_key = env('PROFOOD_APP_KEY');
        $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');
        $profood_app_livreur_key = env('PROFOOD_APP_LIVREUR_KEY');

        $authorized = (!empty($profood_app_key) && 0 == \strcmp($app_key, $profood_app_key)) ||
            (!empty($profood_app_manager_key) && 0 == \strcmp($app_key, $profood_app_manager_key)) ||
            (!empty($profood_app_livreur_key) && 0 == \strcmp($app_key, $profood_app_livreur_key));

        if(!$authorized){
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }
        $validator = Validator::make($request->all(), [
            'phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'for'           => ['required', 'in:REGISTRATION,PASSWORD_RESET'],
            'code'          => ['required', 'string']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => self::VERIFICATION_CODE_ERROR_MESSAGE], 422);
        }
        // Vérification sans consommation : le code doit encore servir à
        // l'appel final.
        if(!$this->verifyVerificationCode($request->for, $request->phone_number, $request->code, false)){
            return response()->json(['message' => self::VERIFICATION_CODE_ERROR_MESSAGE], 422);
        }
        return response()->json(['message' => 'success'], 200);
    }

    /**
     * Normalize an incoming e-mail address.
     *
     * The e-mail is optional everywhere : forms send an empty string when the
     * field is left blank, and an empty string is NOT interchangeable with
     * null here (the users.email column is unique, so two blank e-mails stored
     * as '' would collide, and `where('email', '')` would wrongly report the
     * address as already taken).
     *
     * @param  mixed  $value
     *
     * @return string|null
     */
    protected function normalizeEmail($value): ?string
    {
        if(!isset($value)){
            return null;
        }
        $email = (string) Str::of($value)->stripTags()->trim();

        return $email === '' ? null : $email;
    }

    /**
     * Number of verification SMS allowed per phone number and per window.
     */
    protected const VERIFICATION_CODE_MAX_SENT = 3;

    /**
     * User-facing message when the verification SMS could not be sent.
     */
    protected const SMS_SEND_ERROR_MESSAGE = "L'envoi du SMS de vérification a échoué. Merci de réessayer dans quelques instants ou de contacter le service client.";

    /**
     * Length of the throttling window, in minutes.
     */
    protected const VERIFICATION_CODE_WINDOW_MINUTES = 30;

    /**
     * Throttle the sending of a verification SMS.
     *
     * Returns a 429 response when the quota is exhausted, null otherwise.
     *
     * @param  string  $for            REGISTRATION | PASSWORD_RESET
     * @param  string  $phone_number
     * @param  string  $action         Context used for logging
     *
     * @return \Illuminate\Http\JsonResponse|null
     */
    protected function throttleVerificationCode(string $for, string $phone_number, string $action)
    {
        $phone_number = (string) Str::of($phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $v = VerificationCodesLog::where([
            'for'           => $for,
            'phone_number'  => $phone_number
        ])->first();

        if(!isset($v)){
            VerificationCodesLog::create([
                'phone_number'  => $phone_number,
                'for'           => $for,
                'sent'          => 1
            ]);
            return null;
        }
        $last_update = Carbon::parse($v->updated_at);
        $elapsed = $last_update->diffInMinutes(Carbon::now(), false);

        // The window has expired : the quota starts over.
        if($elapsed >= self::VERIFICATION_CODE_WINDOW_MINUTES){
            $v->sent = 0;
        }
        $s = (int)$v->sent;

        if($s >= self::VERIFICATION_CODE_MAX_SENT){
            $remaining = max(1, self::VERIFICATION_CODE_WINDOW_MINUTES - (int)$elapsed);

            Log::warning('SMS verification rate limit exceeded', [
                'phone_number'      => $phone_number,
                'for'               => $for,
                'sent_count'        => $s,
                'remaining_minutes' => $remaining,
                'action'            => $action
            ]);
            return response()->json([
                'message' => "Vous avez atteint la limite de " . self::VERIFICATION_CODE_MAX_SENT . " demandes. Merci de réessayer dans {$remaining} minute" . ($remaining > 1 ? 's' : '') . " ou de contacter le service client",
                'error'   => 429
            ], 429);
        }
        $v->sent = ($s + 1);
        $v->save();

        return null;
    }

    /**
     * Clear the verification SMS quota of a phone number.
     *
     * Called once the flow it protects has succeeded, so that a legitimate
     * user is never locked out by their own past (successful) attempts.
     *
     * @param  string  $for
     * @param  string  $phone_number
     *
     * @return void
     */
    protected function clearVerificationCodeThrottle(string $for, string $phone_number): void
    {
        $phone_number = (string) Str::of($phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        VerificationCodesLog::where([
            'for'           => $for,
            'phone_number'  => $phone_number
        ])->delete();
    }

    /**
     * Refund one unit of the verification SMS quota.
     *
     * Called when the SMS could not be sent (Twilio failure) : no SMS ever
     * reached the user, so the attempt must not count against their quota —
     * otherwise three delivery failures lock a legitimate user out for the
     * whole window without them having received a single code.
     *
     * @param  string  $for
     * @param  string  $phone_number
     *
     * @return void
     */
    protected function refundVerificationCodeThrottle(string $for, string $phone_number): void
    {
        $phone_number = (string) Str::of($phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $v = VerificationCodesLog::where([
            'for'           => $for,
            'phone_number'  => $phone_number
        ])->first();

        if(isset($v) && (int)$v->sent > 0){
            $v->sent = (int)$v->sent - 1;
            $v->save();
        }
    }

    /**
     * Durée de validité d'un code de vérification, en minutes.
     */
    protected const VERIFICATION_CODE_TTL_MINUTES = 10;

    /**
     * Nombre de saisies erronées tolérées pour un même code.
     */
    protected const VERIFICATION_CODE_MAX_ATTEMPTS = 5;

    /**
     * Message renvoyé à chaque échec de vérification.
     *
     * Volontairement neutre : il ne dit jamais si c'est le numéro ou le code
     * qui est en cause, ni si le code est expiré, consommé ou simplement faux.
     */
    protected const VERIFICATION_CODE_ERROR_MESSAGE = 'Code de vérification invalide ou expiré';

    /**
     * Enregistre le code de vérification qui vient d'être envoyé.
     *
     * Le code est stocké **haché** : le serveur est le seul à pouvoir dire
     * si une saisie est correcte, et une fuite de la base ne révèle rien.
     *
     * @param  string  $for            REGISTRATION | PASSWORD_RESET
     * @param  string  $phone_number
     * @param  string  $code
     *
     * @return void
     */
    protected function issueVerificationCode(string $for, string $phone_number, string $code): void
    {
        $phone_number = (string) Str::of($phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $log = VerificationCodesLog::where([
            'for'           => $for,
            'phone_number'  => $phone_number
        ])->first();

        if(!isset($log)){
            $log = new VerificationCodesLog([
                'phone_number'  => $phone_number,
                'for'           => $for,
                'sent'          => 1
            ]);
        }
        $log->code_hash   = Hash::make($code);
        $log->expires_at  = Carbon::now()->addMinutes(self::VERIFICATION_CODE_TTL_MINUTES);
        $log->attempts    = 0;
        $log->consumed_at = null;
        $log->save();
    }

    /**
     * Vérifie côté serveur un code de vérification saisi par l'utilisateur.
     *
     * Le code doit exister, ne pas être expiré, ne pas avoir déjà été
     * consommé, et n'avoir pas épuisé son quota de tentatives. Chaque échec
     * incrémente le compteur de tentatives.
     *
     * @param  string  $for
     * @param  string  $phone_number
     * @param  mixed   $code
     * @param  bool    $consume   Marque le code comme consommé en cas de succès
     *
     * @return bool
     */
    protected function verifyVerificationCode(string $for, string $phone_number, $code, bool $consume = true): bool
    {
        $phone_number = (string) Str::of($phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $code = (string) Str::of((string) $code)->stripTags()->trim()->replaceMatches('/\s+/', '');

        if($code === ''){
            return false;
        }
        $log = VerificationCodesLog::where([
            'for'           => $for,
            'phone_number'  => $phone_number
        ])->first();

        if(!isset($log) || empty($log->code_hash)){
            return false;
        }
        if(isset($log->consumed_at)){
            return false;
        }
        if(!isset($log->expires_at) || Carbon::parse($log->expires_at)->isPast()){
            return false;
        }
        if((int) $log->attempts >= self::VERIFICATION_CODE_MAX_ATTEMPTS){
            return false;
        }
        if(!Hash::check($code, $log->code_hash)){
            // Les tentatives ne doivent pas rafraîchir updated_at : cette
            // colonne pilote la fenêtre du throttle d'envoi de SMS.
            $log->attempts = ((int) $log->attempts) + 1;
            $log->timestamps = false;
            $log->save();
            $log->timestamps = true;

            Log::warning('Invalid verification code submitted', [
                'phone_number' => $phone_number,
                'for'          => $for,
                'attempts'     => $log->attempts
            ]);
            return false;
        }
        if($consume){
            $log->consumed_at = Carbon::now();
            $log->timestamps = false;
            $log->save();
            $log->timestamps = true;
        }
        return true;
    }

    /**
     * @return string
     */
    protected function generateVerificationCode(): string
    {
        // 6 chiffres : les champs OTP des apps (inputMode numeric) rejettent les lettres.
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Handle an incoming registration request.
     *
     * @param  \App\Http\Requests\SignupRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function signup(SignupRequest $request)
    {
        // App key validation is handled separately for security
        $app_key = Str::of($request['app_key'])->stripTags()->trim();
        $profood_app_key = env('PROFOOD_APP_KEY');

        if(0 != \strcmp($app_key, $profood_app_key)){
            // Log unauthorized signup attempt with wrong app key
            Log::warning('Unauthorized signup attempt - invalid app key', [
                'ip' => request()->ip(),
                'action' => 'signup'
            ]);
            return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
        }

        // Validation is automatically handled by SignupRequest
        // No need for manual validation anymore

        $signup_phone_number = (string) Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        // Vérification serveur du code envoyé par SMS lors de l'étape
        // check-user-data-requesting-registration : sans elle, n'importe qui
        // peut créer un compte sur un numéro qui ne lui appartient pas.
        if(!$this->verifyVerificationCode('REGISTRATION', $signup_phone_number, $request->code)){
            return response()->json(['message' => self::VERIFICATION_CODE_ERROR_MESSAGE], 422);
        }
        $user_role = Role::where('code', Role::CUSTOMER)->first();

        if(!isset($user_role)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter Profood"], 500);
        }

        // Create user with sanitized input data
        $user = User::create([
            'first_name'        => Str::of($request->first_name)->stripTags()->trim(),
            'last_name'         => Str::of($request->last_name)->stripTags()->trim(),
            'phone_number'      => Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', ''),
            'email'             => $request->email ? Str::of($request->email)->stripTags()->trim() : null,
            'password'          => Hash::make(Str::of($request->password)->stripTags()->trim()),
            'role_id'           => $user_role->id,
            'active'            => true,
            'logged'            => false,
            'session_count'     => 0
        ]);

        Customer::create([
            'user_id' => $user->id,
        ]);

        // The registration succeeded : the SMS quota must not penalise the user afterwards.
        $this->clearVerificationCodeThrottle('REGISTRATION', $user->phone_number);

        // Log successful user signup
        Log::info('New customer account created via signup', [
            'user_id' => $user->id,
            'phone_number' => $user->phone_number,
            'email' => $user->email,
            'ip' => request()->ip(),
            'action' => 'signup'
        ]);

        return response()->json(['message' => 'Compte créé', 'user' => $user], 200);
    }

    /**
     * Handle an incoming authentication request.
     *
     * @param  \App\Http\Requests\SigninRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function signin(SigninRequest $request)
    {
        // Validation is automatically handled by SigninRequest

        $request['phone_number'] = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $request['phone_number'])->first();

        if(isset($user) && Hash::check($request['password'], $user->password)){

            if(!$user->active){
                $contact = $user->role->code == Role::CUSTOMER ? 'Profood' : "l'administrateur";
                // Log attempt to sign in with disabled account
                Log::warning('Sign-in attempt with disabled account', [
                    'user_id' => $user->id,
                    'phone_number' => $request['phone_number'],
                    'user_role' => $user->role->code,
                    'ip' => request()->ip()
                ]);
                return response()->json(['message' => "Votre compte a été désactivé ! Veuillez contacter {$contact}"], 403);
            }
            $app_key = $request['app_key'];
            $profood_app_key = env('PROFOOD_APP_KEY');
            $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');
            $profood_app_livreur_key = env('PROFOOD_APP_LIVREUR_KEY');

            if((0 == \strcmp($app_key, $profood_app_key) && $user->role->code == Role::CUSTOMER) ||
                (0 == \strcmp($app_key, $profood_app_manager_key) && ($user->role->code == Role::ADMIN ||
                    $user->role->code == Role::MANAGER || $user->role->code == Role::SUPER_ADMIN)) ||
                (0 == \strcmp($app_key, $profood_app_livreur_key) && $user->role->code == Role::LIVREUR)){

                // if($user->logged){
                //     return response()->json(['message' => 'Vous êtes déjà connecté à votre compte sur un appareil.'], 403);
                // }
                $credentials = $request->only('phone_number', 'password');

                if(Auth::attempt($credentials)) {
                    $user = User::find(Auth::user()->getAuthIdentifier());
                    $token = null;

                    // Get token expiration duration from environment (in minutes)
                    // Default to 43200 minutes (30 days) if not set
                    $expirationMinutes = (int) env('API_TOKEN_EXPIRATION_MINUTES', 43200);

                    if((int)$user->session_count > 0 && !empty($user->api_token)){
                        // User has an existing, still-valid session - reuse token but extend expiration.
                        // (If the token was cleared by expiry while session_count stayed > 0,
                        // fall through to the else branch and mint a fresh one.)
                        $token = $user->api_token;

                        // Extend token expiration for existing sessions
                        // This allows users to stay logged in as long as they're active
                        if ($expirationMinutes > 0) {
                            $user->api_token_expires_at = Carbon::now('UTC')->addMinutes($expirationMinutes);
                        } else {
                            // If expiration is set to 0 or negative, tokens don't expire (backward compatibility)
                            $user->api_token_expires_at = null;
                        }
                    }
                    else{
                        // Create new token for first session
                        $current_date_time = Carbon::now('UTC');
                        $token = Hash::make("{$user->id}{$user->first_name}{$user->last_name}{$user->phone_number}{$user->created_at}{$current_date_time}");
                        $user->api_token = $token;

                        // Set token expiration timestamp
                        // If expiration is 0 or negative, tokens don't expire (backward compatibility)
                        if ($expirationMinutes > 0) {
                            $user->api_token_expires_at = Carbon::now('UTC')->addMinutes($expirationMinutes);
                        } else {
                            $user->api_token_expires_at = null;
                        }
                    }
                    $user->session_count = (int)$user->session_count + 1;
                    $user->logged = true;
                    $user->save();

                    // Log successful sign-in
                    Log::info('User signed in successfully', [
                        'user_id' => $user->id,
                        'user_role' => $user->role->code,
                        'session_count' => $user->session_count,
                        'ip' => request()->ip(),
                        'user_agent' => request()->userAgent()
                    ]);

                    return response()->json(['message' => 'Vous êtes maintenant connecté', 'token' => $token], 200);
                }
                // Log failed authentication attempt
                Log::warning('Failed authentication attempt - invalid credentials', [
                    'phone_number' => $request['phone_number'],
                    'ip' => request()->ip()
                ]);
                return response()->json(['message' => 'Numéro de téléphone ou mot de passe incorrect'], 401);
            }
            else{
                // Log unauthorized app access attempt
                Log::warning('Unauthorized app access attempt - wrong app key or role mismatch', [
                    'user_id' => $user->id,
                    'user_role' => $user->role->code,
                    'ip' => request()->ip()
                ]);
                return response()->json(['message' => 'Numéro de téléphone ou mot de passe incorrect'], 401);
            }
        }
        // Log failed sign-in attempt - user not found or wrong password
        Log::warning('Failed sign-in attempt - user not found or invalid password', [
            'phone_number' => $request['phone_number'],
            'ip' => request()->ip()
        ]);
        return response()->json(['message' => 'Numéro de téléphone ou mot de passe incorrect'], 401);
    }

    /**
     * Log the user out of the application.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function signout()
    {
        $user = User::find(Auth::user()->getAuthIdentifier());

        if(!isset($user)){
            return response()->json(['message' => "Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"], 500);
        }
        $user->session_count = (int)$user->session_count - 1;
        $user->save();

        if((int)$user->session_count > 0){
            return response()->json(['message' => 'Vous êtes maintenant déconnecté'], 200);
        }

        // Clear token and expiration when last session ends
        $user->logged = false;
        $user->api_token = null;
        $user->api_token_expires_at = null;
        $user->save();

        $this->logout();
    }

    /**
     * Handle an incoming password reset request.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function resetPassword(Request $request)
    {
        $response = $this->phoneNumberExists($request);

        if(isset($response)){
            return $response;
        }
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $phone_number)->first();

        if(!isset($user)){
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        $app_key = $request['app_key'];
        $profood_app_key = env('PROFOOD_APP_KEY');
        $profood_app_manager_key = env('PROFOOD_APP_MANAGER_KEY');
        $profood_app_livreur_key = env('PROFOOD_APP_LIVREUR_KEY');

        if((0 == \strcmp($app_key, $profood_app_key) && $user->role->code == Role::CUSTOMER) ||
            (0 == \strcmp($app_key, $profood_app_manager_key) && ($user->role->code == Role::ADMIN ||
                $user->role->code == Role::MANAGER || $user->role->code == Role::SUPER_ADMIN)) ||
            (0 == \strcmp($app_key, $profood_app_livreur_key) && $user->role->code == Role::LIVREUR)){

            $validator = Validator::make($request->all(), [
                // 'phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
                // 'password'      => ['required', 'string', Rules\Password::defaults()]
                // 'password'      => ['required', 'string', 'confirmed', Rules\Password::min(8)->mixedCase()->numbers()->symbols()->uncompromised()]
                'password' => ['required', 'string', Rules\Password::min(8)]
            ]);
            if($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }
            $validator = Validator::make($request->all(), [
                'password' => ['confirmed']
            ]);
            if($validator->fails()) {
                return response()->json(['message' => $validator->errors()->first()], 422);
            }
            // Vérification serveur du code reçu par SMS. Sans elle, connaître
            // un numéro de téléphone suffisait à reprendre n'importe quel
            // compte : le code n'était comparé que côté client.
            if(!$this->verifyVerificationCode('PASSWORD_RESET', $phone_number, $request->code)){
                return response()->json(['message' => self::VERIFICATION_CODE_ERROR_MESSAGE], 422);
            }
            $user->password = Hash::make(Str::of($request->password)->stripTags()->trim());
            $user->save();

            // The reset succeeded : the SMS quota must not penalise the user afterwards.
            $this->clearVerificationCodeThrottle('PASSWORD_RESET', $phone_number);

            return response()->json(['message' => 'Mot de passe mis à jour'], 200);
        }
        return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
    }

    /**
     * Change a user's password.
     *
     * @param  \App\Http\Requests\ChangePasswordRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        // Validation is automatically handled by ChangePasswordRequest
        // Phone number validation handled separately
        $response = $this->phoneNumberExists($request);

        if(isset($response)){
            return $response;
        }

        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $phone_number)->first();

        if(!isset($user)){
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }

        // Verify current password
        if(!Hash::check($request['current_password'], $user->password)){
            return response()->json(['message' => 'Le mot de passe actuel saisi est incorrect'], 403);
        }

        // Ensure new password is different from current password
        if(0 == \strcmp($request->new_password, $request->current_password)) {
            return response()->json(['message' => 'Le nouveau mot de passe doit être différent du mot de passe actuel'], 422);
        }

        // Update password with secure hash
        $user->password = Hash::make(Str::of($request->new_password)->stripTags()->trim());
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour'], 200);
    }

    /**
     * Update a user's profile details.
     *
     * @param  \App\Http\Requests\UpdateProfileDetailsRequest  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfileDetails(UpdateProfileDetailsRequest $request)
    {
        // Validation is automatically handled by UpdateProfileDetailsRequest
        // Phone number validation handled separately
        $response = $this->phoneNumberExists($request);

        if(isset($response)){
            return $response;
        }

        $email = $this->normalizeEmail($request->email);
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $phone_number)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }

        // Check if email is already taken by another user
        if($email !== $user->email && isset($email) && User::Where('email', $email)->exists()){
            return response()->json(['message' => "L'adresse e-mail a déjà été prise"], 422);
        }

        $changes_made = false;
        $first_name = Str::of($request->first_name)->stripTags()->trim();
        $last_name = Str::of($request->last_name)->stripTags()->trim();

        if(0 != \strcmp($first_name, $user->first_name)){
            $user->first_name = $first_name;
            $changes_made = true;
        }
        if(0 != \strcmp($last_name, $user->last_name)){
            $user->last_name = $last_name;
            $changes_made = true;
        }
        if($email !== $user->email){
            $user->email = $email;
            $changes_made = true;
        }

        // Handle avatar upload
        if($request->hasFile('avatar')) {
            $avatar = $request->file('avatar');
            $imageService = new ImageService();
            $user->avatar = $imageService->processToBase64($avatar, 300, 300);
            $changes_made = true;
        }
        else if(0 === \strcmp('remove', $request->avatar_input_action)) {
            $user->avatar = null;
            $changes_made = true;
        }

        if(!$changes_made){
            return response()->json(['message' => 'Aucune modification apportée'], 204);
        }

        // Update user data
        $user->save();

        return response()->json(['message' => 'Profil mis à jour'], 200);
    }

    /**
     * Update a user's phone number.
     *
     * @param  \Illuminate\Http\Request  $request
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePhoneNumber(Request $request)
    {
        $response = $this->phoneNumberExists(new Request([
            'phone_number' => $request->current_phone_number
        ]));
        if(isset($response)){
            return $response;
        }
        $validator = Validator::make($request->all(), [
            'password'          => ['required', 'string'],
            'new_phone_number'  => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['new_phone_number'] = Str::of($request->new_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $validator = Validator::make((new Request([
            'phone_number' => $request->new_phone_number
        ]))->all(), [
            'phone_number' => ['unique:users']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $current_phone_number = Str::of($request->current_phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');
        $user = User::where('phone_number', $current_phone_number)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }
        // Vérification du mot de passe.

        if(!Hash::check($request['password'], $user->password)){
            return response()->json(['message' => 'Le mot de passe est incorrect'], 403);
        }
        // Mis à jour du numéro de téléphone de l'utilisateur.

        $user->phone_number = $request->new_phone_number;
        $user->save();

        return response()->json(['message' => 'Numéro de téléphone mis à jour'], 200);
    }

    /**
     * Log the user out of the application.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function logout()
    {
        try{
            Auth::logout();
            return response()->json(['message' => 'Vous êtes maintenant déconnecté'], 200);
        }
        catch(Throwable $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
