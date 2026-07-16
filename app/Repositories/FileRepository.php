<?php

namespace App\Repositories;

use App\Models\File;
use App\Repositories\Contracts\FileRepositoryInterface;

class FileRepository implements FileRepositoryInterface
{
    /**
     * @param array{original_name: string, stored_name: string, path: string, disk: string, mime_type: string, size: int, collection?: string|null} $data
     */
    public function create(array $data): File
    {
        return File::query()->create($data);
    }
}
