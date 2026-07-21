<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\StoreFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $fileService,
    ) {
        //
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        $file = $this->fileService->register($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'File uploaded successfully.',
            'data' => new FileResource($file),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function show(File $file): RedirectResponse
    {
        return redirect()->away($file->url);
    }
}
