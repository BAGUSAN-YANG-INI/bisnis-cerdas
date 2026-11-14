<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBusinessProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessProfileController extends Controller
{
    /**
     * Get active business profile.
     */
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->businessProfile;

        if (! $profile) {
            return $this->error('Profil usaha belum dibuat.', null, 404);
        }

        return $this->success([
            'id' => $profile->id,
            'business_name' => $profile->business_name,
            'business_type' => $profile->business_type,
            'opening_balance' => (int) $profile->opening_balance,
        ], 'Profil usaha berhasil dimuat.');
    }

    /**
     * Update active business profile.
     */
    public function update(UpdateBusinessProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $profile = $user->businessProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return $this->success([
            'id' => $profile->id,
            'business_name' => $profile->business_name,
            'business_type' => $profile->business_type,
            'opening_balance' => (int) $profile->opening_balance,
        ], 'Profil usaha berhasil diperbarui.');
    }
}

