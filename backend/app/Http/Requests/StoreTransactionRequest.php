<?php

namespace App\Http\Requests;

use App\Services\CategoryService;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
        $type = $this->input('type');

        // Dynamically restrict category to valid values for the given type
        $validCategories = match ($type) {
            'income'  => CategoryService::incomeCategories(),
            'expense' => CategoryService::expenseCategories(),
            default   => CategoryService::allCategories(),
        };

        return [
            'type'             => ['required', Rule::in(['income', 'expense'])],
            'category'         => ['required', 'string', 'max:50', Rule::in($validCategories)],
            'amount'           => 'required|integer|min:1',
            'description'      => 'nullable|string|max:500',
            'transaction_date' => 'required|date_format:Y-m-d',
        ];
    }

    /**
     * Custom messages in Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'type.required'             => 'Jenis transaksi wajib diisi.',
            'type.in'                   => 'Jenis transaksi harus berupa income atau expense.',
            'category.required'         => 'Kategori wajib diisi.',
            'category.in'               => 'Kategori tidak valid untuk jenis transaksi yang dipilih.',
            'amount.required'           => 'Nominal wajib diisi.',
            'amount.integer'            => 'Nominal harus berupa bilangan bulat.',
            'amount.min'                => 'Nominal harus lebih besar dari 0.',
            'transaction_date.required' => 'Tanggal transaksi wajib diisi.',
            'transaction_date.date_format' => 'Format tanggal harus YYYY-MM-DD (contoh: 2026-11-13).',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validasi input gagal.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}

