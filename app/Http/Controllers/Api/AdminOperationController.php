<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RunAdminOperationRequest;
use App\Http\Resources\AdminOperationResource;
use App\Models\Admin;
use App\Models\AdminOperation;
use App\Services\AdminOperationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminOperationController extends Controller
{
    public function __construct(private readonly AdminOperationService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize($request, 'viewAny', AdminOperation::class);

        return $this->success('Riwayat operasi admin berhasil diambil.', AdminOperationResource::collection(
            $this->service->paginate($request->integer('per_page', 15)),
        )->response()->getData(true));
    }

    public function show(Request $request, AdminOperation $operation): JsonResponse
    {
        $this->authorize($request, 'view', $operation);

        return $this->success('Detail operasi admin berhasil diambil.', new AdminOperationResource(
            $this->service->detail($operation),
        ));
    }

    public function store(RunAdminOperationRequest $request): JsonResponse
    {
        $admin = $this->admin($request);
        Gate::forUser($admin)->authorize('run', [AdminOperation::class, $request->validated('action')]);

        $data = $request->validated();
        $data['request_id'] = $request->header('X-Request-ID');
        $operation = $this->service->create($admin, $data, $request->header('Idempotency-Key'));
        $this->service->queue($operation);

        return response()->json([
            'status' => 'success',
            'message' => 'Operasi admin diterima dan diproses di background.',
            'data' => new AdminOperationResource($operation),
            'metadata' => (object) [],
            'error' => null,
        ], 202);
    }

    public function retrySpreadsheet(Request $request, AdminOperation $operation): JsonResponse
    {
        $this->authorize($request, 'retry', $operation);
        $count = $this->service->retrySpreadsheet($operation);

        return $this->success('Sinkronisasi Spreadsheet dijadwalkan ulang.', ['queued' => $count]);
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
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'metadata' => (object) [],
            'error' => null,
        ]);
    }
}
