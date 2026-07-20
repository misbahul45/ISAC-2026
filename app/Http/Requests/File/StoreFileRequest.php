<?php

namespace App\Http\Requests\File;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileRequest extends FormRequest
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
            'fileId' => ['required', 'string', 'max:255', 'unique:files,file_id'],
            'url' => ['required', 'url', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'fileId.required' => 'File ID wajib diisi.',
            'fileId.max' => 'File ID maksimal 255 karakter.',
            'fileId.unique' => 'File sudah tercatat.',
            'url.required' => 'URL file wajib diisi.',
            'url.url' => 'URL file tidak valid.',
            'url.max' => 'URL file maksimal 2048 karakter.',
        ];
    }
}
