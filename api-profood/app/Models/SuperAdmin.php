<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

/**
 * 
 */
class SuperAdmin extends Model
{
    /**
     * 
     */
    use HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = ['user_id'];

    /**
     * Returns The super admin's email address.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function email() : string
    {
        return $this->user->email;
    }

    /**
     * Returns The super admin's first name.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function firstName() : string
    {
        return $this->user->first_name;
    }

    /**
     * Returns the super admin's formatted phone number.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function formattedPhoneNumber() : string
    {
        return $this->user->formattedPhoneNumber();
    }

    /**
     * Returns The admin's full name.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function fullName() : string
    {
        return $this->user->fullName();
    }

    /**
     * Checks if this super admin has an avatar.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return boolean
     */
    public function hasAvatar() : bool
    {
        return $this->user->hasAvatar();
    }

    /**
     * Returns The super admin's last name.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function lastName() : string
    {
        return $this->user->last_name;
    }

    /**
     * Returns The super admin's phone number.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string
     */
    public function phoneNumber() : string
    {
        return $this->user->phone_number;
    }

    /**
     * Get the user associated with the super admin.
     *
     * @return \App\Models\User
     */
    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id')->with('role');
    }
}
