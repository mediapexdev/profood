<?php

namespace Tests\Feature;

use Tests\TestCase;

class SmokeTest extends TestCase
{
    public function test_get_box_types_returns_200(): void
    {
        $response = $this->getJson('/api/get-box-types');
        $response->assertStatus(200);
    }

    public function test_get_categories_returns_200(): void
    {
        $response = $this->getJson('/api/get-categories');
        $response->assertStatus(200);
    }

    public function test_get_slices_returns_200(): void
    {
        $response = $this->getJson('/api/get-slices');
        $response->assertStatus(200);
    }

    public function test_protected_route_returns_401_without_auth(): void
    {
        $response = $this->getJson('/api/get-orders');
        $response->assertStatus(401);
    }

    public function test_csp_headers_present(): void
    {
        $response = $this->getJson('/api/get-box-types');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_api_404_returns_json(): void
    {
        $response = $this->getJson('/api/nonexistent-endpoint');
        $response->assertStatus(404);
        $response->assertJson(['message' => 'Ressource introuvable']);
    }
}
