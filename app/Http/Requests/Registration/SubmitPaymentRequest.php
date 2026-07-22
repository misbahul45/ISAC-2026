<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'payment_proof_file_id' => ['required', 'uuid', 'exists:files,id'],
            'payment_method' => ['required', Rule::in(['BANK_TRANSFER', 'QRIS'])],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $promoCode = strtoupper(trim((string) $this->input('promo_code', '')));
        $this->merge(['promo_code' => $promoCode === '' ? null : $promoCode]);
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'promo_code.max' => 'Kode promo maksimal 50 karakter.',
        ];
    }
}
