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
use Twilio\Rest\Client as TwilioClient;

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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
            'email'         => Str::of($request->email)->stripTags()->trim(),
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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
            'email'         => Str::of($request->email)->stripTags()->trim(),
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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
        $email = Str::of($request->email)->stripTags()->trim();
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        if(0 != \strcmp($phone_number, $user->phone_number) &&
                user::Where('phone_number', $phone_number)->exists()){
            return response()->json(['message' => "Le numéro de téléphone a déjà été prise"], 422);
        }
        if(0 != \strcmp($email, $user->email) && user::Where('email', $email)->exists()){
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
        if(0 != \strcmp($email, $user->email)){
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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
        $email = Str::of($request->email)->stripTags()->trim();
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        if(0 != \strcmp($phone_number, $user->phone_number) &&
                user::Where('phone_number', $phone_number)->exists()){
            return response()->json(['message' => "Le numéro de téléphone a déjà été prise"], 422);
        }
        if(0 != \strcmp($email, $user->email) && user::Where('email', $email)->exists()){
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
        if(0 != \strcmp($email, $user->email)){
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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
        $admin = User::with('role')->where('phone_number', $admin_phone_number)->first();

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
        $admin = User::where('phone_number', $admin_phone_number)->first();

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
        $admin = User::where('phone_number', $admin_phone_number)->first();

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

        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $request->phone_number)->first();

        if(isset($user) &&
            ((0 == \strcmp($app_key, $profood_app_key) && $user->role->code != Role::CUSTOMER) ||
                (0 == \strcmp($app_key, $profood_app_manager_key) && $user->role->code != Role::ADMIN &&
                    $user->role->code != Role::MANAGER && $user->role->code != Role::SUPER_ADMIN))){

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

        if(0 == \strcmp($app_key, $profood_app_manager_key) || 0 == \strcmp($app_key, $profood_app_key)){

            $response = $this->phoneNumberExists($request);

            if(isset($response)){
                return $response;
            }
            if(0 == \strcmp($app_key, $profood_app_manager_key)){
                return response()->json(['message' => 'success'], 200);
            }
            try{
                $v = VerificationCodesLog::where([
                    'for'           => 'PASSWORD_RESET',
                    'phone_number'  => $request->phone_number
                ])->first();

                if(!isset($v)){
                    $v = VerificationCodesLog::create([
                        'phone_number'  => Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', ''),
                        'for'           => 'PASSWORD_RESET',
                        'sent'          => 1
                    ]);
                }
                else{
                    $last_update = Carbon::createFromFormat('Y-m-d H:i:s', $v->updated_at);

                    if($last_update->diffInMinutes(Carbon::now(), false) >= 30){
                        $v->sent = 0;
                    }
                    $s = (int)$v->sent;

                    if($s == 3){
                        // Log rate limit exceeded
                        Log::warning('SMS verification rate limit exceeded for password reset', [
                            'phone_number' => $request->phone_number,
                            'sent_count' => $s,
                            'action' => 'userPhoneNumberExists'
                        ]);
                        return response()->json(['message' => "Vous venez de faire plus de 3 demandes, merci de réessayer plus tard ou de contacter le service client", 'error' => 429], 429);
                    }
                    $v->sent = ($s + 1);
                    $v->save();
                }
                /**
                 * Account SID and Auth Token from twilio.com/console
                 * To set up environmental variables, see http://twil.io/secure
                 */
                $auth_token = env('TWILIO_AUTH_TOKEN');
                $account_sid = env('TWILIO_ACCOUNT_SID');
                /**
                 *  A Twilio number "Profood" is used instead
                 */
                // $twilio_number = env('TWILIO_PHONE_NUMBER');

                $code = $this->generateVerificationCode();
                $client = new TwilioClient($account_sid, $auth_token);
                $client->messages->create(
                    "+221{$request->phone_number}", // Where to send a text message
                    array(
                        'from' => "Profood",  // "Profood" is used instead of the phone number
                        'body' => "{$code} est votre code de vérification Profood"
                    )
                );

                // Log successful SMS verification code sent
                Log::info('SMS verification code sent for password reset', [
                    'phone_number' => $request->phone_number,
                    'sent_count' => $v->sent,
                    'action' => 'userPhoneNumberExists'
                ]);

                return response()->json(['message' => 'success', 'code' => $code], 200);
            }
            catch (\Exception $e) {
                // Log Twilio SMS failure
                Log::error('Failed to send SMS verification code for password reset', [
                    'phone_number' => $request->phone_number,
                    'error' => $e->getMessage(),
                    'action' => 'userPhoneNumberExists'
                ]);
                return response()->json(['message' => $e->getMessage()], 500);
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
        $validator = Validator::make($request->all(), [
            'first_name'            => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'last_name'             => ['required', 'regex:#^[\p{L}]+[\p{L} ]*$|^[\p{L} ]+[\p{L}]+[\p{L} ]*$#u', 'max:255'],
            'email'                 => ['nullable', 'regex:#^[^\s@]+@[^\s@]+\.[^\s@]+$#', 'unique:users'],
            'phone_number'          => ['required', 'regex:#(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$#'],
            'avatar'                => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:1024', 'dimensions:min_width=200,min_height=200'],
            'avatar_input_action'   => ['required', 'regex:#(none|change|remove){1}#']
        ]);
        if($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }
        $request['phone_number'] = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        $validator = Validator::make($request->all(), [
            'phone_number' => ['unique:users']
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
                    'phone_number' => $request->phone_number,
                    'code' => $code
                ]);
                return response()->json(['message' => 'success', 'code' => $code], 200);
            }

            try{
                $v = VerificationCodesLog::where([
                    'for'           => 'REGISTRATION',
                    'phone_number'  => $request->phone_number
                ])->first();

                if(!isset($v)){
                    $v = VerificationCodesLog::create([
                        'phone_number'  => Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', ''),
                        'for'           => 'REGISTRATION',
                        'sent'          => 1
                    ]);
                }
                else{
                    $last_update = Carbon::createFromFormat('Y-m-d H:i:s', $v->updated_at);

                    if($last_update->diffInMinutes(Carbon::now(), false) >= 30){
                        $v->sent = 0;
                    }
                    $s = (int)$v->sent;

                    if($s == 3){
                        return response()->json(['message' => "Vous venez de faire plus de 3 demandes, merci de réessayer plus tard ou de contacter le service client", 'error' => 429], 429);
                    }
                    $v->sent = ($s + 1);
                    $v->save();
                }
                /**
                 * Account SID and Auth Token from twilio.com/console
                 * To set up environmental variables, see http://twil.io/secure
                 */
                $auth_token = env('TWILIO_AUTH_TOKEN');
                $account_sid = env('TWILIO_ACCOUNT_SID');
                /**
                 *  A Twilio number "Profood" is used instead
                 */
                // $twilio_number = env('TWILIO_PHONE_NUMBER');

                $code = $this->generateVerificationCode();
                $client = new TwilioClient($account_sid, $auth_token);
                $client->messages->create(
                    "+221{$request->phone_number}", // Where to send a text message
                    array(
                        'from' => "Profood",  // "Profood" is used instead of the phone number
                        'body' => "{$code} est votre code de vérification Profood"
                    )
                );
                return response()->json(['message' => 'success', 'code' => $code], 200);
            }
            catch (\Exception $e) {
                return response()->json(['message' => $e->getMessage()], 500);
            }
        }
        return response()->json(['message' => 'Demande rejetée ! Accès non autorisé'], 401);
    }

    /**
     * @return string
     */
    protected function generateVerificationCode(): string
    {
        $alpha = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $alphaLen = strlen($alpha) - 1;
        $code = '';

        for($i = 0; $i < 6; $i++){
            $code .= $alpha[\rand(0, $alphaLen)];
        }
        return $code;
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

            if((0 == \strcmp($app_key, $profood_app_key) && $user->role->code == Role::CUSTOMER) ||
                (0 == \strcmp($app_key, $profood_app_manager_key) && ($user->role->code == Role::ADMIN ||
                    $user->role->code == Role::MANAGER || $user->role->code == Role::SUPER_ADMIN))){

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

                    if((int)$user->session_count > 0){
                        // User has an existing session - reuse token but extend expiration
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

        if((0 == \strcmp($app_key, $profood_app_key) && $user->role->code == Role::CUSTOMER) ||
            (0 == \strcmp($app_key, $profood_app_manager_key) && ($user->role->code == Role::ADMIN ||
                $user->role->code == Role::MANAGER || $user->role->code == Role::SUPER_ADMIN))){

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
            $user->password = Hash::make(Str::of($request->password)->stripTags()->trim());
            $user->save();

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

        $email = Str::of($request->email)->stripTags()->trim();
        $phone_number = Str::of($request->phone_number)->stripTags()->trim()->replaceMatches('/\s+/', '');

        // Eager load role relationship to avoid N+1 query when accessing role->code
        $user = User::with('role')->where('phone_number', $phone_number)->first();

        if(!isset($user)) {
            return response()->json(['message' => 'Utilisateur inexistant'], 404);
        }

        // Check if email is already taken by another user
        if(0 != \strcmp($email, $user->email) && User::Where('email', $email)->exists()){
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
        if(0 != \strcmp($email, $user->email)){
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
