<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:60000'],
            'explanation' => ['nullable', 'string', 'max:60000'],
            'type' => ['required', Rule::in(['multiple_choice', 'true_false', 'essay'])],
            'options' => ['nullable', 'array', 'max:8'],
            'options.*.id' => ['required_with:options', 'string', 'max:80', 'distinct'],
            'options.*.content' => ['required_with:options', 'string', 'max:60000'],
            'correct_answer' => ['nullable', 'string', 'max:60000'],
            'correct_score' => ['required', 'integer', 'min:0', 'max:1000'],
            'wrong_score' => ['required', 'integer', 'min:-1000', 'max:1000'],
            'empty_score' => ['required', 'integer', 'min:-1000', 'max:1000'],
            'difficulty' => ['required', Rule::in(['easy', 'medium', 'hard'])],
            'category' => ['nullable', 'string', 'max:100'],
            'tags' => ['nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:50'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
