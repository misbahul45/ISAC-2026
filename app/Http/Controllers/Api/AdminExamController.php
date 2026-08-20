<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreExamQuestionRequest;
use App\Models\Admin;
use App\Models\Competition;
use App\Models\Exam;
use App\Models\ExamQuestion;
use App\Models\Stage;
use App\Services\RichTextSanitizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class AdminExamController extends Controller
{
    public function stages(Request $request): JsonResponse
    {
        $this->authorize($request);

        $stages = Stage::query()
            ->has('exams')
            ->when($request->filled('competition_id'), fn ($query) => $query->where('competition_id', $request->string('competition_id')))
            ->orderBy('competition_id')
            ->orderBy('order')
            ->get(['id', 'competition_id', 'name', 'order']);

        return $this->success('Tahap ujian berhasil diambil.', $stages);
    }

    public function exams(Request $request): JsonResponse
    {
        $this->authorize($request);
        $data = $request->validate(['stage_id' => ['required', 'uuid', 'exists:stages,id']]);

        $exams = Exam::query()
            ->where('stage_id', $data['stage_id'])
            ->withCount('questions')
            ->orderBy('start_date')
            ->get()
            ->map(fn (Exam $exam) => $this->examData($exam));

        return $this->success('Daftar ujian berhasil diambil.', $exams);
    }

    public function show(Request $request, Exam $exam): JsonResponse
    {
        $this->authorize($request);
        $exam->loadCount('questions');

        return $this->success('Detail bank soal berhasil diambil.', [
            ...$this->examData($exam),
            'questions' => $exam->questions()->orderBy('order')->get()->map(fn (ExamQuestion $question) => $this->questionData($question)),
        ]);
    }

    public function storeQuestion(StoreExamQuestionRequest $request, Exam $exam, RichTextSanitizer $sanitizer): JsonResponse
    {
        $this->authorize($request);
        $data = $request->validated();
        $question = $sanitizer->clean($data['question']);

        if (! $sanitizer->hasContent($question)) {
            throw ValidationException::withMessages(['question' => ['Isi soal tidak boleh kosong.']]);
        }

        $options = collect($data['options'] ?? [])
            ->map(fn (array $option) => ['id' => $option['id'], 'content' => $sanitizer->clean($option['content'])])
            ->values()
            ->all();

        if (in_array($data['type'], ['multiple_choice', 'true_false'], true)) {
            if (count($options) < 2) {
                throw ValidationException::withMessages(['options' => ['Pilihan jawaban minimal dua.']]);
            }
            if (! in_array($data['correct_answer'] ?? null, array_column($options, 'id'), true)) {
                throw ValidationException::withMessages(['correct_answer' => ['Jawaban benar harus menunjuk salah satu pilihan.']]);
            }
        } else {
            $data['correct_answer'] = $sanitizer->clean($data['correct_answer'] ?? null);
        }

        $order = ((int) $exam->questions()->max('order')) + 1;
        $created = $exam->questions()->create([
            ...$data,
            'question' => $question,
            'explanation' => $sanitizer->clean($data['explanation'] ?? null),
            'options' => $options ?: null,
            'order' => $order,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->success('Soal berhasil dibuat.', $this->questionData($created));
    }

    private function authorize(Request $request): void
    {
        /** @var Admin $admin */
        $admin = $request->user();
        Gate::forUser($admin)->authorize('author', [Exam::class]);
    }

    /** @return array<string, mixed> */
    private function examData(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'stageId' => $exam->stage_id,
            'title' => $exam->title,
            'description' => $exam->description,
            'startDate' => $exam->start_date?->toISOString(),
            'endDate' => $exam->end_date?->toISOString(),
            'questionCount' => $exam->questions_count,
        ];
    }

    /** @return array<string, mixed> */
    private function questionData(ExamQuestion $question): array
    {
        return [
            'id' => $question->id,
            'question' => $question->question,
            'explanation' => $question->explanation,
            'type' => $question->type,
            'options' => $question->options,
            'correctAnswer' => $question->correct_answer,
            'order' => $question->order,
            'correctScore' => $question->correct_score,
            'wrongScore' => $question->wrong_score,
            'emptyScore' => $question->empty_score,
            'difficulty' => $question->difficulty,
            'category' => $question->category,
            'tags' => $question->tags,
            'isActive' => $question->is_active,
        ];
    }

    private function success(string $message, mixed $data): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
