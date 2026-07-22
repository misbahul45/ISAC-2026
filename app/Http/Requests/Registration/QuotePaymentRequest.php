<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class QuotePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
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
