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
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
