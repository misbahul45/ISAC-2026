<?php

namespace App\Repositories;

use App\Models\File;
use App\Repositories\Contracts\FileRepositoryInterface;

class FileRepository implements FileRepositoryInterface
{
    /**
     * @param  array{file_id: string, url: string}  $data
     */
    public function create(array $data): File
    {
        return File::query()->create($data);
    }
}
