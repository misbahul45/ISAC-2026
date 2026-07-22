<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewReasonRequest;
use App\Http\Requests\Admin\TeamRevisionRequest;
use App\Http\Resources\RegistrationSummaryResource;
use App\Models\Admin;
use App\Models\Registration;
use App\Models\Stage;
use App\Models\Team;
use App\Services\AdminRegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminRegistrationController extends Controller
{
    public function __construct(private readonly AdminRegistrationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize($request, 'viewAny', Team::class);
        $teams = $this->service->teams($request->only(['status', 'competition_id', 'batch_id']), $request->integer('per_page', 15));

        return $this->success('Daftar team berhasil diambil.', RegistrationSummaryResource::collection($teams)->response()->getData(true));
    }

    public function show(Request $request, Team $team): JsonResponse
    {
        $this->authorize($request, 'view', $team);

        return $this->success('Detail team berhasil diambil.', new RegistrationSummaryResource($this->service->detail($team)));
    }

    public function verifyTeam(Request $request, Team $team): JsonResponse
    {
        $this->authorize($request, 'verifyData', $team);

        return $this->success('Data team berhasil diverifikasi.', new RegistrationSummaryResource(
            $this->service->verifyTeam($this->admin($request), $team, $request->header('X-Request-ID')),
        ));
    }

    public function reviseTeam(TeamRevisionRequest $request, Team $team): JsonResponse
    {
        $this->authorize($request, 'requestRevision', $team);
        $data = $request->validated();

        return $this->success('Revisi data team berhasil diminta.', new RegistrationSummaryResource(
            $this->service->reviseTeam($this->admin($request), $team, $data['revision_step'], $data['verification_note'], $request->header('X-Request-ID')),
        ));
    }

    public function rejectTeam(ReviewReasonRequest $request, Team $team): JsonResponse
    {
        $this->authorize($request, 'reject', $team);

        return $this->success('Data team ditolak.', new RegistrationSummaryResource(
            $this->service->rejectTeam($this->admin($request), $team, $request->validated('reason'), $request->header('X-Request-ID')),
        ));
    }

    public function verifyPayment(Request $request, Registration $registration): JsonResponse
    {
        $this->authorize($request, 'verifyPayment', $registration);

        return $this->success('Pembayaran berhasil diverifikasi.', $this->service->verifyPayment($this->admin($request), $registration, $request->header('X-Request-ID')));
    }

    public function revisePayment(ReviewReasonRequest $request, Registration $registration): JsonResponse
    {
        $this->authorize($request, 'requestPaymentRevision', $registration);

        return $this->success('Revisi pembayaran berhasil diminta.', $this->service->revisePayment($this->admin($request), $registration, $request->validated('reason'), $request->header('X-Request-ID')));
    }

    public function rejectPayment(ReviewReasonRequest $request, Registration $registration): JsonResponse
    {
        $this->authorize($request, 'rejectPayment', $registration);

        return $this->success('Pembayaran ditolak.', $this->service->rejectPayment($this->admin($request), $registration, $request->validated('reason'), $request->header('X-Request-ID')));
    }

    public function advanceStage(Request $request, Team $team, Stage $stage): JsonResponse
    {
        $this->authorize($request, 'advanceTeam', $stage);

        return $this->success('Tahap team berhasil diproses.', new RegistrationSummaryResource(
            $this->service->advanceStage($this->admin($request), $team, $stage, $request->header('X-Request-ID')),
        ));
    }

    private function authorize(Request $request, string $ability, mixed $subject): void
    {
        Gate::forUser($this->admin($request))->authorize($ability, $subject);
    }

    private function admin(Request $request): Admin
    {
        /** @var Admin $admin */
        $admin = $request->user();

        return $admin;
    }

    private function success(string $message, mixed $data): JsonResponse
    {
        return response()->json([
            'status' => 'success', 'message' => $message, 'data' => $data,
            'metadata' => (object) [], 'error' => null,
        ]);
    }
}
