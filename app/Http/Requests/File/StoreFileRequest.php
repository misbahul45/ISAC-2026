<?php

namespace App\Http\Requests\File;

use App\Models\Admin;
use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $purpose = $this->input('purpose');

        if ($user instanceof Team) {
            return in_array($purpose, ['PAYMENT_PROOF', 'MEMBER_PHOTO', 'SUBMISSION'], true);
        }

        return $user instanceof Admin
            && in_array($user->role, ['super_admin', 'admin_registration'], true)
            && $purpose === 'BATCH_MODULE';
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'file_id' => ['required', 'string', 'max:255', 'unique:files,file_id'],
            'url' => [
                'required',
                'url:https',
                'max:2048',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    $host = strtolower((string) parse_url((string) $value, PHP_URL_HOST));
                    $configuredHost = strtolower((string) parse_url((string) config('services.imagekit.url_endpoint'), PHP_URL_HOST));
                    $valid = $configuredHost !== ''
                        ? hash_equals($configuredHost, $host)
                        : ($host === 'imagekit.io' || Str::endsWith($host, '.imagekit.io'));

                    if (! $valid) {
                        $fail('URL file harus berasal dari host ImageKit yang dikonfigurasi.');
                    }
                },
            ],
            'purpose' => ['required', Rule::in(['PAYMENT_PROOF', 'MEMBER_PHOTO', 'BATCH_MODULE', 'SUBMISSION'])],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'file_id.unique' => 'File sudah tercatat.',
        ];
    }
}
