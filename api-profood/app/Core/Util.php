<?php

namespace App\Core;

use Illuminate\Support\Facades\URL;

/**
 * 
 */
final class Util
{
    /**
     * Returns the color class names.
     *
     * @return array
     */
    public static function colorClassNames() : array
    {
        return ['danger', 'dark', 'info', 'primary', 'success', 'warning'];
    }

    /**
     * Formats a given phone number and returns it.
     *
     * @param string $phone_number  the phone number to format
     *
     * @return string
     */
    public static function formatPhoneNumber(string $phone_number) : string
    {
        return \preg_replace('#(\d{2})(\d{3})(\d{2})(\d{2})#', '$1 $2 $3 $4', $phone_number);
    }

    /**
     * Returns the default user avatar.
     *
     * @return string
     */
    public static function getDefaultUserAvatar() : string
    {
        return URL::asset('assets/media/svg/avatars/blank.svg');
    }
}
