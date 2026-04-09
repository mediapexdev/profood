<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Core\Util;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * 
 */
class User extends Authenticatable
{
    /**
     * 
     */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'password',
        'avatar',
        'role_id',
        'active',
        'logged',
        'session_count',
        'api_token_expires_at'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'api_token',
        'api_token_expires_at',
        'remember_token',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'api_token_expires_at' => 'datetime',
        'email_verified_at' => 'datetime',
    ];

    /**
     * Returns the user's formatted phone number.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function formattedPhoneNumber() : string
    {
        return Util::formatPhoneNumber($this->phone_number);
    }

    /**
     * Returns The user's full name.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function fullName() : string
    {
        return (string)($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Checks if this user has an avatar.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return boolean
     */
    public function hasAvatar() : bool
    {
        return (isset($this->avatar) && !empty($this->avatar));
    }

    /**
     * Checks if this user is a customer.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return boolean
     */
    public function isAdmin() : bool
    {
        return (Role::ADMIN == $this->role->code);
    }

    /**
     * Checks if this user is a customer.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return boolean
     */
    public function isCustomer() : bool
    {
        return (Role::CUSTOMER == $this->role->code);
    }

    /**
     * Checks if this user is a manager.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     * 
     * @return boolean
     */
    public function isManager() : bool
    {
        return (Role::MANAGER == $this->role->code);
    }

    /**
     * Get the Role associated with the User.
     * 
     * @return \App\Models\Role
     */
    public function role()
    {
        return $this->belongsTo(Role::class);
    }
}
