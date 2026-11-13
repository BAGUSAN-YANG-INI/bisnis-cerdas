<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class DashboardRequest extends FormRequest
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
            'from' => 'nullable|date_format:Y-m-d',
            'to'   => 'nullable|date_format:Y-m-d|after_or_equal:from',
        ];
    }

    /**
     * Custom messages.
     */
    public function messages(): array
    {
        return [
            'from.date_format'       => 'Format parameter from harus YYYY-MM-DD.',
            'to.date_format'         => 'Format parameter to harus YYYY-MM-DD.',
            'to.after_or_equal'      => 'Tanggal akhir tidak boleh sebelum tanggal awal.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi parameter gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}

