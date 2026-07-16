<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'min:2', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'school_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'school_address' => ['sometimes', 'nullable', 'string'],
            'document_file_id' => ['sometimes', 'nullable', 'uuid', 'exists:files,id'],
            'twibbon_file_id' => ['sometimes', 'nullable', 'uuid', 'exists:files,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama team wajib diisi.',
            'name.min' => 'Nama team minimal 2 karakter.',
            'name.max' => 'Nama team maksimal 255 karakter.',
            'phone.max' => 'Nomor HP maksimal 20 karakter.',
            'school_name.max' => 'Nama sekolah maksimal 255 karakter.',
            'document_file_id.uuid' => 'ID dokumen tidak valid.',
            'document_file_id.exists' => 'File dokumen tidak ditemukan.',
            'twibbon_file_id.uuid' => 'ID twibbon tidak valid.',
            'twibbon_file_id.exists' => 'File twibbon tidak ditemukan.',
        ];
    }
}
