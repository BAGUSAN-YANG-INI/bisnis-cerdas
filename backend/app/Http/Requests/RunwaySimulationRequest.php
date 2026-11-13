<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class RunwaySimulationRequest extends FormRequest
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
            'daily_income_assumption'  => 'required|integer|min:0',
            'daily_expense_assumption' => 'required|integer|min:0',
            'simulation_days'          => 'required|integer|min:1|max:365',
        ];
    }

    /**
     * Custom messages in Bahasa Indonesia.
     */
    public function messages(): array
    {
        return [
            'daily_income_assumption.required'  => 'Asumsi pemasukan harian wajib diisi.',
            'daily_income_assumption.integer'   => 'Asumsi pemasukan harian harus berupa bilangan bulat.',
            'daily_income_assumption.min'       => 'Asumsi pemasukan harian tidak boleh negatif.',
            'daily_expense_assumption.required' => 'Asumsi pengeluaran harian wajib diisi.',
            'daily_expense_assumption.integer'  => 'Asumsi pengeluaran harian harus berupa bilangan bulat.',
            'daily_expense_assumption.min'      => 'Asumsi pengeluaran harian tidak boleh negatif.',
            'simulation_days.required'          => 'Jumlah hari simulasi wajib diisi.',
            'simulation_days.integer'           => 'Jumlah hari simulasi harus berupa bilangan bulat.',
            'simulation_days.min'               => 'Jumlah hari simulasi minimal 1 hari.',
            'simulation_days.max'               => 'Jumlah hari simulasi maksimal 365 hari.',
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

