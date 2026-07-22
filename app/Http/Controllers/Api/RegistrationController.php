<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\FinalizeMembersRequest;
use App\Http\Requests\Registration\QuotePaymentRequest;
use App\Http\Requests\Registration\SelectCompetitionRequest;
use App\Http\Requests\Registration\SubmitPaymentRequest;
use App\Http\Requests\Registration\UpdateDocumentsRequest;
use App\Http\Requests\Registration\UpdateTeamRequest;
use App\Http\Resources\DocumentsFormResource;
use App\Http\Resources\MembersFormResource;
use App\Http\Resources\PaymentFormResource;
use App\Http\Resources\RegistrationContextResource;
use App\Http\Resources\RegistrationSummaryResource;
use App\Http\Resources\TeamFormResource;
use App\Models\Competition;
use App\Models\Team;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function __construct(private readonly RegistrationService $registrationService) {}

    public function context(Request $request): JsonResponse
    {
        return $this->success('Data registrasi berhasil diambil.', new RegistrationContextResource($request->user()));
    }

    public function selection(SelectCompetitionRequest $request): JsonResponse
    {
        $team = $request->user();
        $this->registrationService->selectCompetition($team, $request->validated());

        return $this->mutation('Competition dan Batch berhasil dipilih.', $team->fresh(), $request);
    }

    public function getTeam(Request $request): JsonResponse
    {
        $team = $request->user()->load('registration.competition');

        return $this->success('Data tim berhasil diambil.', new TeamFormResource($team));
    }

    public function updateTeam(UpdateTeamRequest $request): JsonResponse
    {
        $team = $this->registrationService->updateTeamData($request->user(), $request->validated());

        return $this->mutation('Data tim berhasil diperbarui.', $team, $request);
    }

    public function getMembers(Request $request): JsonResponse
    {
        $team = $this->registrationService->getMembers($request->user());
        $type = $team->registration->competition->type;
        [$minimum, $maximum] = $type === Competition::TYPE_OLIMPIADE ? [1, 1] : [3, 3];

        return $this->success('Data anggota berhasil diambil.', [
            'competitionType' => $type,
            'participantCategory' => $type === Competition::TYPE_BUSINESS_IT_CASE
                ? 'UNIVERSITY_STUDENT'
                : 'HIGH_SCHOOL_STUDENT',
            'identityLabel' => $type === Competition::TYPE_BUSINESS_IT_CASE ? 'NIM' : 'NISN',
            'showsLeaderRole' => $type !== Competition::TYPE_OLIMPIADE,
            'minMembers' => $minimum,
            'maxMembers' => $maximum,
            'members' => MembersFormResource::collection($team->members),
            'revisionNote' => $team->revision_step === 'MEMBERS' ? $team->verification_note : null,
        ]);
    }

    public function updateMembers(FinalizeMembersRequest $request): JsonResponse
    {
        $team = $this->registrationService->finalizeMembers($request->user(), $request->validated());

        return $this->mutation('Data anggota berhasil diperbarui.', $team, $request);
    }

    public function getDocuments(Request $request): JsonResponse
    {
        return $this->success('Data dokumen berhasil diambil.', new DocumentsFormResource($request->user()));
    }

    public function updateDocuments(UpdateDocumentsRequest $request): JsonResponse
    {
        $team = $this->registrationService->updateDocuments($request->user(), $request->validated());

        return $this->mutation('Data dokumen berhasil diperbarui.', $team, $request);
    }

    public function getPayment(Request $request): JsonResponse
    {
        $team = $this->registrationService->getPaymentData($request->user());

        return $this->success('Data pembayaran berhasil diambil.', new PaymentFormResource($team));
    }

    public function submitPayment(SubmitPaymentRequest $request): JsonResponse
    {
        $team = $this->registrationService->submitPayment($request->user(), $request->validated());

        return $this->mutation('Pembayaran berhasil dikirim.', $team, $request);
    }

    public function quotePayment(QuotePaymentRequest $request): JsonResponse
    {
        $quote = $this->registrationService->quotePayment(
            $request->user(),
            $request->validated('promo_code'),
        );

        return $this->success('Perhitungan pembayaran berhasil diperbarui.', $quote);
    }

    public function summary(Request $request): JsonResponse
    {
        return $this->success('Ringkasan pendaftaran berhasil diambil.', new RegistrationSummaryResource($request->user()));
    }

    public function submitVerification(Request $request): JsonResponse
    {
        $team = $this->registrationService->submitForVerification($request->user());

        return $this->mutation('Pendaftaran berhasil dikirim untuk verifikasi.', $team, $request);
    }

    private function mutation(string $message, Team $team, Request $request): JsonResponse
    {
        $context = new RegistrationContextResource($team->fresh());
        $resolved = $context->resolve($request);

        return $this->success($message, [
            'context' => $context,
            'redirectTo' => $resolved['redirectTo'],
        ]);
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
