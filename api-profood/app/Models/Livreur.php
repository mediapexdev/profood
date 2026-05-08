<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class Livreur extends Model
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = ['user_id'];

    public function email() : ?string
    {
        return $this->user->email;
    }

    public function firstName() : string
    {
        return $this->user->first_name;
    }

    public function formattedPhoneNumber() : string
    {
        return $this->user->formattedPhoneNumber();
    }

    public function fullName() : string
    {
        return $this->user->fullName();
    }

    public function hasAvatar() : bool
    {
        return $this->user->hasAvatar();
    }

    public function lastName() : string
    {
        return $this->user->last_name;
    }

    public function phoneNumber() : string
    {
        return $this->user->phone_number;
    }

    public function user()
    {
        return $this->hasOne(User::class, 'id', 'user_id')->with('role');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
