<?php

namespace App\Http\Requests\Admin;

use App\Models\AdminOperation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RunAdminOperationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sync_spreadsheet' => $this->boolean('sync_spreadsheet', true),
            'announcement' => is_array($this->input('announcement')) ? $this->input('announcement') : [],
        ]);
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'action' => ['required', 'string', Rule::in(AdminOperation::ACTIONS)],
            'team_ids' => ['required', 'array', 'min:1', 'max:100'],
            'team_ids.*' => ['required', 'uuid', 'distinct', Rule::exists('teams', 'id')],
            'target_stage_id' => ['nullable', 'uuid', Rule::exists('stages', 'id')],
            'sync_spreadsheet' => ['required', 'boolean'],
            'announcement' => ['array'],
            'announcement.title' => ['nullable', 'string', 'max:160'],
            'announcement.template' => ['nullable', 'string', 'max:80'],
            'announcement.message' => ['nullable', 'string', 'max:5000'],
            'announcement.send_notification' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if (
                $this->input('action') === AdminOperation::ACTION_ADVANCE_STAGE
                && ! $this->input('target_stage_id')
            ) {
                $validator->errors()->add('target_stage_id', 'Target Stage wajib dipilih untuk advance stage.');
            }
        });
    }
}
