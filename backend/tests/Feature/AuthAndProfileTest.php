<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_business_profile_and_receive_token(): void
    {
        $payload = [
            'name' => 'Budi Santoso',
            'email' => 'budi@warungberkah.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'business_name' => 'Warung Makan Berkah',
            'business_type' => 'Kuliner / F&B',
            'opening_balance' => 2000000,
        ];

        $response = $this->postJson('/api/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registrasi akun dan profil usaha berhasil.',
                'data' => [
                    'user' => [
                        'name' => 'Budi Santoso',
                        'email' => 'budi@warungberkah.test',
                    ],
                    'business_profile' => [
                        'business_name' => 'Warung Makan Berkah',
                        'business_type' => 'Kuliner / F&B',
                        'opening_balance' => 2000000,
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
        $this->assertDatabaseHas('users', ['email' => 'budi@warungberkah.test']);
        $this->assertDatabaseHas('business_profiles', ['business_name' => 'Warung Makan Berkah']);
    }

    public function test_registration_fails_with_invalid_data(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi input gagal.',
            ])
            ->assertJsonStructure([
                'success',
                'message',
                'errors' => [
                    'name',
                    'email',
                    'password',
                    'business_name',
                    'business_type',
                    'opening_balance',
                ],
            ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@warungberkah.test',
            'password' => 'password123',
        ]);

        $user->businessProfile()->create([
            'business_name' => 'Warung Makan Berkah',
            'business_type' => 'Kuliner / F&B',
            'opening_balance' => 2000000,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'budi@warungberkah.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil.',
                'data' => [
                    'user' => [
                        'email' => 'budi@warungberkah.test',
                    ],
                    'business_profile' => [
                        'business_name' => 'Warung Makan Berkah',
                    ],
                ],
            ]);

        $this->assertNotEmpty($response->json('data.token'));
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'wrong@test.com',
            'password' => 'invalidpassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi input gagal.',
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Sesi tidak valid atau token belum disertakan.',
                'errors' => null,
            ]);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();
        $user->businessProfile()->create([
            'business_name' => 'Warung Berkah',
            'business_type' => 'Kuliner',
            'opening_balance' => 1500000,
        ]);

        $response = $this->actingAs($user)->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Data profil pengguna berhasil dimuat.',
                'data' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'business_profile' => [
                        'business_name' => 'Warung Berkah',
                        'opening_balance' => 1500000,
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_update_business_profile(): void
    {
        $user = User::factory()->create();
        $user->businessProfile()->create([
            'business_name' => 'Warung Lama',
            'business_type' => 'Kuliner',
            'opening_balance' => 1000000,
        ]);

        $payload = [
            'business_name' => 'Warung Berkah Jaya',
            'business_type' => 'Kuliner & Katering',
            'opening_balance' => 2500000,
        ];

        $response = $this->actingAs($user)->putJson('/api/business-profile', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profil usaha berhasil diperbarui.',
                'data' => [
                    'business_name' => 'Warung Berkah Jaya',
                    'business_type' => 'Kuliner & Katering',
                    'opening_balance' => 2500000,
                ],
            ]);

        $this->assertDatabaseHas('business_profiles', [
            'user_id' => $user->id,
            'business_name' => 'Warung Berkah Jaya',
            'opening_balance' => 2500000,
        ]);
    }

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Berhasil logout.',
                'data' => null,
            ]);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}

