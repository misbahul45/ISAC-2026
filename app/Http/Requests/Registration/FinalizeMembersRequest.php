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
            'members.*.phone' => ['required', 'string', 'max:20'],
            'members.*.major' => ['nullable', 'string', 'max:255'],
            'members.*.faculty' => ['nullable', 'string', 'max:255'],
            'members.*.student_id' => ['required', 'string', 'max:50', 'distinct'],
            'members.*.birth_date' => ['required', 'date', 'before:today'],
            'members.*.education_level' => ['required', 'string', 'max:50'],
            'members.*.photo_file_id' => ['nullable', 'uuid', 'exists:files,id'],
            'members.*.sort_order' => ['nullable', 'integer', 'min:1', 'max:3'],
        ];
    }
}
