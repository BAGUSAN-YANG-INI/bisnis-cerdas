<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateBusinessProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'business_type' => 'required|string|max:100',
            'opening_balance' => 'required|integer|min:0',
        ];
    }

    /**
     * Custom message for validation
     */
    public function messages(): array
    {
        return [
            'business_name.required' => 'Nama usaha wajib diisi.',
            'business_type.required' => 'Jenis usaha wajib diisi.',
            'opening_balance.required' => 'Saldo awal wajib diisi.',
            'opening_balance.integer' => 'Saldo awal harus berupa bilangan bulat.',
            'opening_balance.min' => 'Saldo awal tidak boleh kurang dari 0.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi input gagal.',
            'errors' => $validator->errors(),
        ], 422));
    }
}

