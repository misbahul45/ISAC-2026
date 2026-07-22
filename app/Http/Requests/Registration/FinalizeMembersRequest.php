<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeMembersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'members' => ['required', 'array', 'min:1', 'max:3'],
            'members.*.id' => ['nullable', 'uuid'],
            'members.*.name' => ['required', 'string', 'max:255'],
            'members.*.role' => ['required', 'string', 'in:LEADER,MEMBER'],
            'members.*.email' => ['required', 'email', 'max:255', 'distinct:ignore_case'],
            'members.*.major' => ['nullable', 'string', 'max:255'],
            'members.*.faculty' => ['nullable', 'string', 'max:255'],
            'members.*.student_id' => ['required', 'string', 'max:50', 'distinct'],
            'members.*.photo_file_id' => ['nullable', 'uuid', 'exists:files,id'],
            'members.*.sort_order' => ['nullable', 'integer', 'min:1', 'max:3'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'members.*.name.required' => 'Nama lengkap peserta wajib diisi.',
            'members.*.email.required' => 'Email peserta wajib diisi.',
            'members.*.email.email' => 'Format email peserta tidak valid.',
            'members.*.email.distinct' => 'Email setiap peserta harus berbeda.',
            'members.*.student_id.required' => 'NISN atau NIM wajib diisi.',
            'members.*.student_id.distinct' => 'NISN atau NIM setiap peserta harus berbeda.',
            'members.*.photo_file_id.exists' => 'Foto peserta tidak valid.',
        ];
    }
}
