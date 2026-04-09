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
class Customer extends Model
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
     * Get the customer's avatar.
     *
     * Note : This method must be called as a method with the () because it is different from the methods of Eloquent.
     *
     * @return string|NULL
     */

     public function avatar() : ?string
     {
         return (($this->hasAvatar()) ? $this->user->avatar : null);
     }

    /**
     * Get the carts associated with the customer.
     *
     * @return \App\Models\Cart
     */
    public function cart()
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Returns The customer's email address.
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
     * Returns The customer's first name.
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
     * Returns the customer's formatted phone number.
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
     * Returns The customer's full name.
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
     * Checks if this customer has an avatar.
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
     * Returns The customer's last name.
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
     * Returns The customer's phone number.
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
     * Get the user associated with the customer.
     *
     * @return \App\Models\User
     */
    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id')->with('role');
    }
}
