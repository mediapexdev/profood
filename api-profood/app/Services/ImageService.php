<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    protected ImageManager $manager;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
    }

    /**
     * Process an uploaded image: resize/crop and return as base64 data URL.
     *
     * Uses `cover()` (the v3 equivalent of v2's `fit()`) to crop and resize
     * the image to the exact target dimensions, centred, without upscaling
     * beyond the original file size.
     *
     * @param  \Illuminate\Http\UploadedFile  $file    The uploaded image file.
     * @param  int                            $width   Target width in pixels.
     * @param  int                            $height  Target height in pixels.
     *
     * @return string  A data URI string (e.g. "data:image/jpeg;base64,...").
     */
    public function processToBase64(UploadedFile $file, int $width = 256, int $height = 256): string
    {
        $image = $this->manager->read($file->getPathname());
        $image->cover($width, $height);

        return $image->toJpeg()->toDataUri();
    }
}
