<?php

namespace App\Http\Controllers;

use App\Services\ImageService;
use Illuminate\Support\Facades\Storage;

/**
 * Serves product illustrations stored on the public disk. Using a PHP route
 * (rather than a storage symlink) keeps serving working on hosts where the
 * symlink is unavailable.
 */
class ImageController extends Controller
{
    /**
     * Stream an illustration file. The path is constrained to the illustrations
     * directory and rejected if it tries to traverse out of it.
     *
     * @param  string  $path  e.g. "illustrations/slices/uuid.jpg"
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function show(string $path)
    {
        // Reject path traversal and confine to the illustrations directory.
        if (str_contains($path, '..') || !str_starts_with($path, ImageService::ILLUSTRATIONS_DIR . '/')) {
            abort(404);
        }

        $disk = Storage::disk('public');
        if (!$disk->exists($path)) {
            abort(404);
        }

        return response($disk->get($path), 200)
            ->header('Content-Type', $disk->mimeType($path) ?: 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=31536000, immutable');
    }
}
