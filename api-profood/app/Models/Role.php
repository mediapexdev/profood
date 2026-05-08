<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Role extends Model
{
    /**
     * 
     */
    use HasFactory;

    /**
     * The different roles according to the user.
     */
    const ADMIN         = 32;
    const CUSTOMER      = 8;
    const LIVREUR       = 4;
    const MANAGER       = 16;
    const SUPER_ADMIN   = 64;

    /**
     * 
     */
    protected $fillable = ['wording', 'code'];

    /**
     * Get the Users associated with the Role.
     * 
     * @return Illuminate\Database\Eloquent\Collection<User>
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }
}
