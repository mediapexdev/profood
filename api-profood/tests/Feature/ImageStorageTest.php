<?php

namespace Tests\Feature;

use App\Services\ImageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Product illustrations are stored as files on the public disk and served by a
 * PHP route, instead of being inlined as base64 in the database.
 */
class ImageStorageTest extends TestCase
{
    public function test_process_to_disk_stores_a_file_and_returns_a_url()
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('meat.jpg', 400, 400);
        $url = (new ImageService())->processToDisk($file, 'slices', 256, 256);

        // Must include the /api prefix so the URL resolves to the serving route.
        $this->assertStringContainsString('/api/image/illustrations/slices/', $url);

        $relative = 'illustrations/slices/' . basename(parse_url($url, PHP_URL_PATH));
        Storage::disk('public')->assertExists($relative);

        // The stored URL must resolve to the actual route (regression: missing /api).
        $path = parse_url($url, PHP_URL_PATH);
        Storage::disk('public')->put($relative, 'JPEGBYTES');
        $this->get($path)->assertStatus(200);
    }

    public function test_image_route_serves_an_existing_illustration()
    {
        Storage::fake('public');
        Storage::disk('public')->put('illustrations/slices/sample.jpg', 'JPEGBYTES');

        $this->get('/api/image/illustrations/slices/sample.jpg')
            ->assertStatus(200);
    }

    public function test_image_route_rejects_paths_outside_the_illustrations_directory()
    {
        Storage::fake('public');
        Storage::disk('public')->put('secret.txt', 'top secret');

        $this->get('/api/image/secret.txt')->assertStatus(404);
    }

    public function test_image_route_returns_404_for_a_missing_file()
    {
        Storage::fake('public');

        $this->get('/api/image/illustrations/slices/nope.jpg')->assertStatus(404);
    }
}
