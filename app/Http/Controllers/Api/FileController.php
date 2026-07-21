<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\StoreFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Models\Team;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $fileService,
    ) {
        //
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        $team = $request->user();
        $file = $this->fileService->register(
            $request->validated(),
            $team instanceof Team ? $team->id : null,
        );

        return response()->json([
            'status' => 'success',
            'message' => 'File uploaded successfully.',
            'data' => new FileResource($file),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function show(Request $request, File $file): RedirectResponse
    {
        $user = $request->user();

        if ($user instanceof Team && $file->uploaded_by !== null && $file->uploaded_by !== $user->id) {
            abort(403, 'Akses file ditolak.');
        }

        return redirect()->away($file->url);
    }
}
