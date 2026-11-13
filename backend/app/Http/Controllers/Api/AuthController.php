<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Handle user & business profile registration.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
            ]);

            $businessProfile = $user->businessProfile()->create([
                'business_name' => $validated['business_name'],
                'business_type' => $validated['business_type'],
                'opening_balance' => $validated['opening_balance'],
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'business_profile' => [
                    'id' => $businessProfile->id,
                    'business_name' => $businessProfile->business_name,
                    'business_type' => $businessProfile->business_type,
                    'opening_balance' => (int) $businessProfile->opening_balance,
                ],
                'token' => $token,
            ];
        });

        return $this->success(
            $result,
            'Registrasi akun dan profil usaha berhasil.',
            Response::HTTP_CREATED
        );
    }

    /**
     * Handle user login.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::with('businessProfile')->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return $this->error(
                'Validasi input gagal.',
                ['email' => ['Kredensial yang diberikan tidak cocok dengan data kami.']],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $businessProfileData = null;
        if ($user->businessProfile) {
            $businessProfileData = [
                'id' => $user->businessProfile->id,
                'business_name' => $user->businessProfile->business_name,
                'business_type' => $user->businessProfile->business_type,
                'opening_balance' => (int) $user->businessProfile->opening_balance,
            ];
        }

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'business_profile' => $businessProfileData,
            'token' => $token,
        ], 'Login berhasil.');
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Berhasil logout.');
    }

    /**
     * Get authenticated user profile with active business profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('businessProfile');

        $businessProfileData = null;
        if ($user->businessProfile) {
            $businessProfileData = [
                'id' => $user->businessProfile->id,
                'business_name' => $user->businessProfile->business_name,
                'business_type' => $user->businessProfile->business_type,
                'opening_balance' => (int) $user->businessProfile->opening_balance,
            ];
        }

        return $this->success([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'business_profile' => $businessProfileData,
        ], 'Data profil pengguna berhasil dimuat.');
    }
}

