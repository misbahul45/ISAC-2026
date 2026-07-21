<?php

namespace App\Http\Requests\Batch;

use App\Models\BatchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'competition_id' => ['required', 'uuid', 'exists:competitions,id'],
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('batches', 'slug')
                    ->where(fn ($query) => $query->where('competition_id', $this->input('competition_id'))),
            ],
            'description' => ['sometimes', 'nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'price' => ['required', 'numeric', 'min:0'],
            'module_file_id' => ['sometimes', 'nullable', 'uuid', 'exists:files,id'],
            'quota' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'status' => ['sometimes', new Enum(BatchStatus::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'competition_id.required' => 'Competition wajib dipilih.',
            'competition_id.exists' => 'Competition tidak ditemukan.',
            'name.required' => 'Nama batch wajib diisi.',
            'name.min' => 'Nama batch minimal 2 karakter.',
            'slug.required' => 'Slug batch wajib diisi.',
            'slug.unique' => 'Slug sudah digunakan pada competition ini.',
            'end_date.after' => 'Tanggal selesai harus setelah tanggal mulai.',
            'price.min' => 'Harga tidak boleh negatif.',
            'quota.min' => 'Kuota minimal 1 jika diisi.',
            'module_file_id.exists' => 'File modul tidak ditemukan.',
        ];
    }
}
