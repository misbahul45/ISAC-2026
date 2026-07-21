<?php

namespace App\Http\Requests\Batch;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBatchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Akses dibuka
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Tangkap ID dari URL untuk pengecualian slug
        $batchId = $this->route('batch');

        return [
            'competition_id'        => 'required|uuid|exists:competitions,id',
            'name'                  => 'required|string|max:255',
            'slug'                  => 'required|string|max:255|unique:batches,slug,' . $batchId,
            'description'           => 'nullable|string',
            'start_date'            => 'required|date',
            'end_date'              => 'required|date|after_or_equal:start_date',
            'price'                 => 'required|numeric|min:0',
            'module_file_id'        => 'nullable|uuid|exists:files,id',
            'quota'                 => 'nullable|integer|min:1',
            'current_registrations' => 'nullable|integer|min:0',
            'status'                => 'required|in:draft,open,closed,full',
        ];
    }
}