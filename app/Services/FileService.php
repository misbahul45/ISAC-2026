<?php

namespace App\Services;

use App\Models\File;
use App\Repositories\Contracts\FileRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class FileService
{
    private const DISK = 'local';

    public function __construct(
        private readonly FileRepositoryInterface $fileRepository,
    ) {
        //
    }

    public function upload(UploadedFile $file, ?string $collection): File
    {
        $storedName = Str::uuid().'.'.$file->getClientOriginalExtension();
        $folder = $collection ?: 'uploads';

        $path = $file->storeAs($folder, $storedName, self::DISK);

        return $this->fileRepository->create([
            'original_name' => $file->getClientOriginalName(),
            'stored_name' => $storedName,
            'path' => $path,
            'disk' => self::DISK,
            'mime_type' => $file->getClientMimeType(),
            'size' => $file->getSize(),
            'collection' => $collection,
        ]);
    }
}
