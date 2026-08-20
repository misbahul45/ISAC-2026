<?php

namespace App\Http\Requests\Admin;

use App\Models\Admin;
use App\Models\Team;
use App\Rules\InstitutionAddress;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateTeamRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $admin = $this->user();
        $team = $this->route('team');

        return $admin instanceof Admin
            && $team instanceof Team
            && Gate::forUser($admin)->allows('updateData', $team);
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
            'team' => ['required', 'array'],
            'team.name' => ['required', 'string', 'min:3', 'max:255'],
            'team.phone' => ['required', 'string', 'min:10', 'max:20'],
            'team.institution_name' => ['required', 'string', 'min:3', 'max:255'],
            'team.institution_address' => ['required', 'string', 'max:2000', new InstitutionAddress],
            'documents' => ['sometimes', 'array'],
            'documents.document_url' => ['sometimes', 'nullable', 'url:https', 'max:2048', $googleDrive],
            'documents.twibbon_url' => ['sometimes', 'nullable', 'url:https', 'max:2048', $googleDrive],
            'members' => ['required', 'array', 'min:1', 'max:3'],
            'members.*.id' => ['sometimes', 'nullable', 'uuid', Rule::exists('members', 'id')->whereNull('deleted_at')],
            'members.*.name' => ['required', 'string', 'min:2', 'max:255'],
            'members.*.role' => ['required', Rule::in(['LEADER', 'MEMBER'])],
            'members.*.email' => ['required', 'email', 'max:255', 'distinct:ignore_case'],
            'members.*.major' => ['sometimes', 'nullable', 'string', 'max:255'],
            'members.*.faculty' => ['sometimes', 'nullable', 'string', 'max:255'],
            'members.*.student_id' => ['required', 'string', 'min:3', 'max:50', 'distinct:ignore_case'],
            'members.*.photo_file_id' => ['sometimes', 'nullable', 'uuid', 'exists:files,id'],
            'members.*.sort_order' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:3'],
            'reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'team.name.required' => 'Nama team wajib diisi.',
            'team.phone.required' => 'Nomor telepon team wajib diisi.',
            'team.institution_name.required' => 'Nama institusi wajib diisi.',
            'team.institution_address.required' => 'Alamat institusi wajib diisi.',
            'documents.document_url.url' => 'Link dokumen tidak valid.',
            'documents.twibbon_url.url' => 'Link twibbon tidak valid.',
            'members.required' => 'Data member wajib diisi.',
            'members.min' => 'Minimal ada satu member.',
            'members.max' => 'Maksimal ada tiga member.',
            'members.*.email.distinct' => 'Email member tidak boleh sama.',
            'members.*.student_id.distinct' => 'Nomor identitas member tidak boleh sama.',
        ];
    }
}
