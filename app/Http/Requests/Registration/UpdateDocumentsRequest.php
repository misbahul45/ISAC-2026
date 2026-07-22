<?php

namespace App\Http\Requests\Registration;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        $googleDrive = function (string $attribute, mixed $value, Closure $fail): void {
            $host = strtolower((string) parse_url((string) $value, PHP_URL_HOST));
            if (! in_array($host, ['drive.google.com', 'docs.google.com'], true)) {
                $fail('URL harus berasal dari Google Drive.');
            }
        };

        return [
            'document_url' => ['required', 'url:https', 'max:2048', $googleDrive],
            'twibbon_url' => ['required', 'url:https', 'max:2048', $googleDrive],
        ];
    }
}
