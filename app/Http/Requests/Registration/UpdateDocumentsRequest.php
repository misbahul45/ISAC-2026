<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentsRequest extends FormRequest
{
    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'documentUrl' => ['required', 'url', 'max:2048'],
            'twibbonUrl' => ['required', 'url', 'max:2048'],
        ];
    }
}
