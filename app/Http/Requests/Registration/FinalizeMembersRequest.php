<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeMembersRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'members' => ['required', 'array', 'min:1', 'max:3'],
            'members.*.name' => ['required', 'string', 'max:255'],
            'members.*.role' => ['required', 'string', 'in:LEADER,MEMBER'],
            'members.*.email' => ['required', 'email', 'max:255'],
            'members.*.phone' => ['required', 'string', 'max:20'],
            'members.*.major' => ['required', 'string', 'max:255'],
            'members.*.faculty' => ['required', 'string', 'max:255'],
            'members.*.studentId' => ['required', 'string', 'max:50'],
            'members.*.birthDate' => ['required', 'date'],
            'members.*.educationLevel' => ['nullable', 'string', 'max:50'],
            'members.*.photoFileId' => ['nullable', 'uuid', 'exists:files,id'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function bodyParameters(): array
    {
        return [
            'members' => [
                'description' => 'Daftar anggota tim.',
            ],
            'members.*.name' => [
                'description' => 'Nama lengkap anggota.',
            ],
            'members.*.role' => [
                'description' => 'Peran anggota (LEADER atau MEMBER).',
            ],
        ];
    }
}
