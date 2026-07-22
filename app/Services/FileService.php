<?php

namespace App\Services;

use App\Models\File;
use App\Repositories\Contracts\FileRepositoryInterface;

class FileService
{
    public function __construct(
        private readonly FileRepositoryInterface $fileRepository,
    ) {
        //
    }

    /**
     * @param  array{fileId: string, url: string}  $data
     */
    public function register(array $data, ?string $teamId = null): File
    {
        return $this->fileRepository->create([
            'file_id' => $data['file_id'],
            'url' => $data['url'],
            'purpose' => $data['purpose'],
            'uploaded_by' => $teamId,
        ]);
    }
}
