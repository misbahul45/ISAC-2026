<?php

namespace App\Http\Requests\Admin;

use App\Models\PaymentMethod;
use App\Models\RegistrationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListPaymentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'nullable', Rule::enum(RegistrationStatus::class)],
            'competition_id' => ['sometimes', 'nullable', 'uuid', Rule::exists('competitions', 'id')->whereNull('deleted_at')],
            'batch_id' => ['sometimes', 'nullable', 'uuid', Rule::exists('batches', 'id')->whereNull('deleted_at')],
            'payment_method' => ['sometimes', 'nullable', Rule::enum(PaymentMethod::class)],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'search' => $this->filled('search') ? trim((string) $this->input('search')) : null,
            'status' => $this->filled('status') ? strtoupper((string) $this->input('status')) : null,
            'payment_method' => $this->filled('payment_method') ? strtoupper((string) $this->input('payment_method')) : null,
        ]);
    }
}
