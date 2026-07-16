<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\File\StoreFileRequest;
use App\Http\Resources\FileResource;
use App\Models\File;
use App\Services\FileService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function __construct(
        private readonly FileService $fileService,
    ) {
        //
    }

    public function store(StoreFileRequest $request): JsonResponse
    {
        $file = $this->fileService->upload(
            $request->file('file'),
            $request->input('collection'),
        );

        return response()->json([
            'status' => 'success',
            'message' => 'File uploaded successfully.',
            'data' => new FileResource($file),
            'metadata' => (object) [],
            'error' => null,
        ], 201);
    }

    public function show(File $file): StreamedResponse
    {
        // ponytail: any authed team can fetch any file id — scope by uploader when ownership matters
        return Storage::disk($file->disk)->download($file->path, $file->original_name);
    }
}
