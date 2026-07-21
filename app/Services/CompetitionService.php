<?php

namespace App\Services;

use App\Models\Competition;
use App\Repositories\Contracts\CompetitionRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CompetitionService
{
    public function __construct(
        private readonly CompetitionRepositoryInterface $competitionRepo,
    ) {
        //
    }

    public function getCompetitions(?string $search, ?string $type, ?string $status, int $perPage): LengthAwarePaginator
    {
        return $this->competitionRepo->search($search, $type, $status, $perPage);
    }

    public function getCompetition(string $id): ?Competition
    {
        return $this->competitionRepo->findWithBatches($id);
    }

    public function getOpenCompetitions(): Collection
    {
        return $this->competitionRepo->findOpenWithBatches();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createCompetition(array $data): Competition
    {
        $this->validateTypePaymentFlow($data);

        if (! isset($data['slug']) || $data['slug'] === null) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $this->competitionRepo->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateCompetition(Competition $competition, array $data): Competition
    {
        $merged = array_merge($competition->toArray(), $data);

        $this->validateTypePaymentFlow($merged);

        if (isset($data['status'])) {
            $this->validateStatusTransition($competition->status, $data['status']);
        }

        if ((isset($data['type']) || isset($data['payment_flow'])) && $competition->registrations()->exists()) {
            throw ValidationException::withMessages([
                'type' => 'Tidak dapat mengubah tipe competition yang sudah memiliki registrasi.',
            ]);
        }

        if (! isset($data['slug']) && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $this->competitionRepo->update($competition, $data);
    }

    public function deleteCompetition(Competition $competition): void
    {
        if ($competition->batches()->whereIn('status', ['OPEN', 'FULL'])->exists()) {
            throw ValidationException::withMessages([
                'competition' => 'Competition tidak dapat dihapus karena masih memiliki batch aktif.',
            ]);
        }

        $this->competitionRepo->delete($competition);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function validateTypePaymentFlow(array $data): void
    {
        if (! isset($data['type']) || ! isset($data['payment_flow'])) {
            return;
        }

        $type = $data['type'];
        $paymentFlow = $data['payment_flow'];

        if ($type === Competition::TYPE_OLIMPIADE && $paymentFlow !== Competition::PAYMENT_UPFRONT) {
            throw ValidationException::withMessages([
                'payment_flow' => 'OLIMPIADE harus menggunakan payment flow UPFRONT.',
            ]);
        }

        if (in_array($type, ['BUSINESS_PLAN', 'BUSINESS_IT_CASE'], true) && $paymentFlow !== 'SEMIFINAL') {
            throw ValidationException::withMessages([
                'payment_flow' => 'BUSINESS_PLAN dan BUSINESS_IT_CASE harus menggunakan payment flow SEMIFINAL.',
            ]);
        }
    }

    private function validateStatusTransition(?string $current, string $new): void
    {
        $allowed = [
            'DRAFT' => ['REGISTRATION_OPEN'],
            'REGISTRATION_OPEN' => ['REGISTRATION_CLOSED'],
            'REGISTRATION_CLOSED' => ['ONGOING'],
            'ONGOING' => ['COMPLETED'],
        ];

        if ($current === null || $current === $new) {
            return;
        }

        if (! isset($allowed[$current]) || ! in_array($new, $allowed[$current], true)) {
            throw ValidationException::withMessages([
                'status' => "Tidak dapat mengubah status dari {$current} ke {$new} secara langsung.",
            ]);
        }
    }
}
