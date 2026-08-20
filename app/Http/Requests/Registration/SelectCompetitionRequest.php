<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class SelectCompetitionRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'competition_id' => ['required', 'uuid', 'exists:competitions,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'competition_id.required' => 'Kompetisi wajib dipilih.',
            'competition_id.uuid' => 'ID kompetisi tidak valid.',
            'competition_id.exists' => 'Kompetisi tidak ditemukan.',
        ];
    }
}
