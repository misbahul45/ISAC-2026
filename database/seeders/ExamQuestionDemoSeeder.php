<?php

namespace Database\Seeders;

use App\Models\Competition;
use App\Models\Exam;
use App\Models\ExamQuestion;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Development-only sample questions for the admin question-authoring screen.
 * This class is intentionally excluded from DatabaseSeeder so the official
 * ISAC 2026 timeline never contains fake production exam content.
 */
class ExamQuestionDemoSeeder extends Seeder
{
    private const CATEGORY = 'DEMO_ISAC_2026';

    public function run(): void
    {
        $this->call(Isac2026TimelineSeeder::class);

        DB::transaction(function (): void {
            $competition = Competition::query()->where('slug', 'isac-olympiad')->firstOrFail();
            $exams = Exam::query()
                ->whereHas('stage', fn ($query) => $query->where('competition_id', $competition->id))
                ->get()
                ->keyBy('title');

            foreach ($this->questions() as $examTitle => $questions) {
                /** @var Exam $exam */
                $exam = $exams->get($examTitle) ?? throw new \LogicException("Ujian demo {$examTitle} tidak ditemukan.");

                foreach ($questions as $order => $data) {
                    $question = ExamQuestion::withTrashed()->firstOrNew([
                        'exam_id' => $exam->id,
                        'category' => self::CATEGORY,
                        'order' => $order,
                    ]);

                    if ($question->trashed()) {
                        $question->restore();
                    }

                    $question->fill([
                        ...$data,
                        'exam_id' => $exam->id,
                        'category' => self::CATEGORY,
                        'tags' => ['demo', 'isac-2026'],
                        'order' => $order,
                        'correct_score' => 1,
                        'wrong_score' => 0,
                        'empty_score' => 0,
                        'is_active' => true,
                    ])->save();
                }
            }
        });
    }

    /** @return array<string, array<int, array<string, mixed>>> */
    private function questions(): array
    {
        return [
            'Tryout Olimpiade' => [
                1 => [
                    'question' => '<p>Manakah yang merupakan contoh <strong>basis data relasional</strong>?</p>',
                    'explanation' => '<p>MySQL adalah sistem manajemen basis data relasional.</p>',
                    'type' => 'multiple_choice',
                    'options' => [['id' => 'a', 'content' => '<p>Figma</p>'], ['id' => 'b', 'content' => '<p>MySQL</p>'], ['id' => 'c', 'content' => '<p>Canva</p>'], ['id' => 'd', 'content' => '<p>Postman</p>']],
                    'correct_answer' => 'b',
                    'difficulty' => 'easy',
                ],
                2 => [
                    'question' => '<p><strong>Benar atau salah:</strong> primary key pada sebuah tabel harus unik untuk setiap baris data.</p>',
                    'explanation' => '<p>Primary key mengidentifikasi satu record secara unik.</p>',
                    'type' => 'true_false',
                    'options' => [['id' => 'true', 'content' => '<p>Benar</p>'], ['id' => 'false', 'content' => '<p>Salah</p>']],
                    'correct_answer' => 'true',
                    'difficulty' => 'easy',
                ],
                3 => [
                    'question' => '<p>Jelaskan singkat perbedaan antara <em>frontend</em> dan <em>backend</em> pada aplikasi web.</p>',
                    'explanation' => '<p>Jawaban ideal membedakan antarmuka pengguna dari proses, data, dan layanan server.</p>',
                    'type' => 'essay',
                    'options' => null,
                    'correct_answer' => '<p>Frontend menangani antarmuka pengguna. Backend menjalankan logika aplikasi, mengelola data, dan menyediakan API.</p>',
                    'difficulty' => 'medium',
                ],
            ],
            'Ujian Eliminasi' => [
                1 => [
                    'question' => '<p>Dalam diagram alir, simbol berbentuk belah ketupat biasanya digunakan untuk apa?</p>',
                    'explanation' => '<p>Belah ketupat merepresentasikan percabangan atau keputusan berdasarkan kondisi.</p>',
                    'type' => 'multiple_choice',
                    'options' => [['id' => 'a', 'content' => '<p>Memulai proses</p>'], ['id' => 'b', 'content' => '<p>Menampilkan output</p>'], ['id' => 'c', 'content' => '<p>Mengambil keputusan</p>'], ['id' => 'd', 'content' => '<p>Menyimpan basis data</p>']],
                    'correct_answer' => 'c',
                    'difficulty' => 'medium',
                ],
                2 => [
                    'question' => '<p><strong>Benar atau salah:</strong> HTTP status <code>404</code> menandakan resource tidak ditemukan.</p>',
                    'explanation' => '<p>Status 404 berarti server tidak menemukan resource yang diminta.</p>',
                    'type' => 'true_false',
                    'options' => [['id' => 'true', 'content' => '<p>Benar</p>'], ['id' => 'false', 'content' => '<p>Salah</p>']],
                    'correct_answer' => 'true',
                    'difficulty' => 'easy',
                ],
            ],
            'Ujian Semifinal' => [
                1 => [
                    'question' => '<p>Prinsip keamanan informasi yang memastikan data tidak diubah tanpa otorisasi adalah?</p>',
                    'explanation' => '<p>Integrity memastikan keutuhan dan konsistensi data.</p>',
                    'type' => 'multiple_choice',
                    'options' => [['id' => 'a', 'content' => '<p>Availability</p>'], ['id' => 'b', 'content' => '<p>Integrity</p>'], ['id' => 'c', 'content' => '<p>Scalability</p>'], ['id' => 'd', 'content' => '<p>Portability</p>']],
                    'correct_answer' => 'b',
                    'difficulty' => 'medium',
                ],
                2 => [
                    'question' => '<p>Uraikan satu risiko ketika aplikasi tidak melakukan validasi input pengguna.</p>',
                    'explanation' => '<p>Jawaban dapat membahas SQL injection, XSS, atau data tidak valid.</p>',
                    'type' => 'essay',
                    'options' => null,
                    'correct_answer' => '<p>Contoh: SQL injection dapat terjadi apabila input langsung digabungkan ke query tanpa validasi atau parameterisasi.</p>',
                    'difficulty' => 'hard',
                ],
            ],
            'Ujian Final' => [
                1 => [
                    'question' => '<p>Pengumpulan kebutuhan pengguna terutama dilakukan pada tahap apa dalam pengembangan sistem?</p>',
                    'explanation' => '<p>Analisis kebutuhan dilakukan sebelum rancangan dan implementasi.</p>',
                    'type' => 'multiple_choice',
                    'options' => [['id' => 'a', 'content' => '<p>Analisis kebutuhan</p>'], ['id' => 'b', 'content' => '<p>Deployment</p>'], ['id' => 'c', 'content' => '<p>Maintenance</p>'], ['id' => 'd', 'content' => '<p>Retrospective</p>']],
                    'correct_answer' => 'a',
                    'difficulty' => 'medium',
                ],
            ],
        ];
    }
}
