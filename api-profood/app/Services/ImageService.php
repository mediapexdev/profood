<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageService
{
    /**
     * Sub-path (under the public disk) where product illustrations are stored.
     */
    const ILLUSTRATIONS_DIR = 'illustrations';

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

    /**
     * Process an uploaded image and store it as a JPEG file on the public disk
     * (storage/app/public/illustrations/{subdir}), returning an absolute URL to
     * the PHP serving route.
     *
     * Frontends render the illustration directly with <img src>, which works
     * for both this URL and legacy base64 data URIs — so no frontend change is
     * needed during the transition.
     *
     * @param  \Illuminate\Http\UploadedFile  $file
     * @param  string  $subdir   e.g. 'slices', 'box_types', 'categories'
     * @param  int     $width
     * @param  int     $height
     *
     * @return string  absolute URL, e.g. https://api.../image/illustrations/slices/uuid.jpg
     */
    public function processToDisk(UploadedFile $file, string $subdir, int $width = 256, int $height = 256): string
    {
        $image = $this->manager->read($file->getPathname());
        $image->cover($width, $height);
        $binary = (string) $image->toJpeg();

        $relative = self::ILLUSTRATIONS_DIR . '/' . trim($subdir, '/') . '/' . Str::uuid()->toString() . '.jpg';
        Storage::disk('public')->put($relative, $binary);

        // The serving route lives in routes/api.php, so it is under the /api
        // prefix (api/image/{path}).
        return url('api/image/' . $relative);
    }

    /**
     * Store a raw JPEG binary (used by the base64 backfill) and return its URL.
     *
     * @param  string  $binary  JPEG bytes
     * @param  string  $subdir
     *
     * @return string  absolute URL to the serving route
     */
    public function storeBinary(string $binary, string $subdir): string
    {
        $relative = self::ILLUSTRATIONS_DIR . '/' . trim($subdir, '/') . '/' . Str::uuid()->toString() . '.jpg';
        Storage::disk('public')->put($relative, $binary);

        // The serving route lives in routes/api.php, so it is under the /api
        // prefix (api/image/{path}).
        return url('api/image/' . $relative);
    }
}
