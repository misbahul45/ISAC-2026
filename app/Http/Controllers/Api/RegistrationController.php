<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\FinalizeMembersRequest;
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
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function __construct(
        private readonly RegistrationService $registrationService,
    ) {}

    public function context(Request $request): JsonResponse
    {
        $team = $request->user();

        $team->load('registration.competition', 'registration.batch');

        return response()->json([
            'status' => 'success',
            'message' => 'Data registrasi berhasil diambil.',
            'data' => new RegistrationContextResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function selection(SelectCompetitionRequest $request): JsonResponse
    {
        $team = $request->user();

        $this->registrationService->selectCompetition($team, $request->validated());

        $team->load('registration.competition', 'registration.batch');

        return response()->json([
            'status' => 'success',
            'message' => 'Kompetisi berhasil dipilih.',
            'data' => new RegistrationContextResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function getTeam(Request $request): JsonResponse
    {
        $team = $request->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Data tim berhasil diambil.',
            'data' => new TeamFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function updateTeam(UpdateTeamRequest $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->updateTeamData($team, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data tim berhasil diperbarui.',
            'data' => new TeamFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function getMembers(Request $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->getMembers($team);

        return response()->json([
            'status' => 'success',
            'message' => 'Data anggota berhasil diambil.',
            'data' => MembersFormResource::collection($team->members),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function updateMembers(FinalizeMembersRequest $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->finalizeMembers($team, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data anggota berhasil diperbarui.',
            'data' => MembersFormResource::collection($team->members),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function getDocuments(Request $request): JsonResponse
    {
        $team = $request->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Data dokumen berhasil diambil.',
            'data' => new DocumentsFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function updateDocuments(UpdateDocumentsRequest $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->updateDocuments($team, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Data dokumen berhasil diperbarui.',
            'data' => new DocumentsFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function getPayment(Request $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->getPaymentData($team);

        return response()->json([
            'status' => 'success',
            'message' => 'Data pembayaran berhasil diambil.',
            'data' => new PaymentFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function submitPayment(SubmitPaymentRequest $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->submitPayment($team, $request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Pembayaran berhasil dikirim.',
            'data' => new PaymentFormResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $team = $request->user();

        return response()->json([
            'status' => 'success',
            'message' => 'Ringkasan pendaftaran berhasil diambil.',
            'data' => new RegistrationSummaryResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }

    public function submitVerification(Request $request): JsonResponse
    {
        $team = $request->user();

        $team = $this->registrationService->submitForVerification($team);

        return response()->json([
            'status' => 'success',
            'message' => 'Pendaftaran berhasil dikirim untuk verifikasi.',
            'data' => new RegistrationSummaryResource($team),
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
