<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class TeamRevisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'revision_step' => ['required', 'string', 'in:TEAM,MEMBERS,DOCUMENTS'],
            'verification_note' => ['required', 'string', 'max:2000'],
        ];
    }
}
