# Backend API Workflow Standard

Dokumentasi ini menjelaskan standar workflow backend Laravel untuk membuat fitur API baru.

Pola utama yang digunakan:

```txt
Route
-> Controller
-> Request
-> Service
-> Repository Contract
-> Repository
-> Model
-> Resource
-> Response
```

Tujuan workflow ini:

* Backend lebih rapi.
* Controller tidak terlalu penuh.
* Validasi request terpisah.
* Logic utama ada di service.
* Query database ada di repository.
* Bentuk response API dijaga oleh resource.
* Response frontend lebih konsisten.
* Fitur lebih mudah dites dan dikembangkan.

---

## 1. Generate File Backend

Misal ingin membuat fitur baru bernama `Team`.

### Perintah Artisan Biasa

```bash
php artisan make:controller Api/TeamController
php artisan make:request Team/StoreTeamRequest
php artisan make:request Team/UpdateTeamRequest
php artisan make:resource TeamResource
php artisan make:model Team -m
php artisan make:class Services/TeamService
php artisan make:class Repositories/TeamRepository
php artisan make:class Repositories/Contracts/TeamRepositoryInterface
```

### Perintah Versi Docker

```bash
docker compose exec app php artisan make:controller Api/TeamController
docker compose exec app php artisan make:request Team/StoreTeamRequest
docker compose exec app php artisan make:request Team/UpdateTeamRequest
docker compose exec app php artisan make:resource TeamResource
docker compose exec app php artisan make:model Team -m
docker compose exec app php artisan make:class Services/TeamService
docker compose exec app php artisan make:class Repositories/TeamRepository
docker compose exec app php artisan make:class Repositories/Contracts/TeamRepositoryInterface
```

Jika Laravel sudah punya command `make:interface`, gunakan:

```bash
php artisan make:interface Repositories/Contracts/TeamRepositoryInterface
```

Jika belum ada, gunakan `make:class`, lalu ubah manual:

```php
class TeamRepositoryInterface
{
}
```

menjadi:

```php
interface TeamRepositoryInterface
{
}
```

---

## 2. Hasil Struktur Folder

Setelah generate, struktur file akan seperti ini:

```txt
app/
  Http/
    Controllers/
      Api/
        TeamController.php
    Requests/
      Team/
        StoreTeamRequest.php
        UpdateTeamRequest.php
    Resources/
      TeamResource.php
  Models/
    Team.php
  Services/
    TeamService.php
  Repositories/
    Contracts/
      TeamRepositoryInterface.php
    TeamRepository.php

database/
  migrations/
    xxxx_xx_xx_xxxxxx_create_teams_table.php
```

---

## 3. Fungsi Setiap Bagian Backend

### 3.1 Route

Lokasi:

```txt
routes/api.php
```

Route adalah alamat endpoint API.

Contoh:

```php
use App\Http\Controllers\Api\TeamController;
use Illuminate\Support\Facades\Route;

Route::prefix('teams')->group(function () {
    Route::get('/', [TeamController::class, 'index']);
    Route::post('/', [TeamController::class, 'store']);
    Route::get('/{team}', [TeamController::class, 'show']);
    Route::put('/{team}', [TeamController::class, 'update']);
    Route::patch('/{team}', [TeamController::class, 'update']);
    Route::delete('/{team}', [TeamController::class, 'destroy']);
});
```

Fungsi route:

```txt
Menentukan URL API.
Menentukan HTTP method.
Menghubungkan endpoint ke controller.
```

Route tidak boleh berisi:

```txt
Query database.
Logic bisnis panjang.
Validasi manual panjang.
Response kompleks.
```

---

### 3.2 Controller

Lokasi:

```txt
app/Http/Controllers/Api/TeamController.php
```

Controller adalah pintu masuk request API.

Tugas controller:

```txt
Menerima request.
Memanggil Request validation.
Memanggil Service.
Mengembalikan response JSON.
```

Contoh:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Services\TeamService;
use Illuminate\Http\JsonResponse;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamService $teamService,
    ) {
        //
    }

    public function index(): JsonResponse
    {
        $teams = $this->teamService->getTeams();

        return response()->json([
            'status' => 'success',
            'message' => 'Teams retrieved successfully.',
            'data' => TeamResource::collection($teams),
            'metadata' => [],
            'error' => null,
        ]);
    }

    public function store(StoreTeamRequest $request): JsonResponse
    {
        $team = $this->teamService->createTeam($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Team created successfully.',
            'data' => new TeamResource($team),
            'metadata' => [],
            'error' => null,
        ], 201);
    }

    public function show(Team $team): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Team detail retrieved successfully.',
            'data' => new TeamResource($team),
            'metadata' => [],
            'error' => null,
        ]);
    }

    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $updatedTeam = $this->teamService->updateTeam(
            $team,
            $request->validated(),
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Team updated successfully.',
            'data' => new TeamResource($updatedTeam),
            'metadata' => [],
            'error' => null,
        ]);
    }

    public function destroy(Team $team): JsonResponse
    {
        $this->teamService->deleteTeam($team);

        return response()->json([
            'status' => 'success',
            'message' => 'Team deleted successfully.',
            'data' => null,
            'metadata' => [],
            'error' => null,
        ]);
    }
}
```

Controller tidak boleh terlalu pintar.

Jangan taruh ini di controller:

```txt
Query database panjang.
Business logic panjang.
Transaction kompleks.
Hitung score.
Generate code.
Manipulasi data terlalu banyak.
```

---

### 3.3 Request

Lokasi:

```txt
app/Http/Requests/Team/StoreTeamRequest.php
app/Http/Requests/Team/UpdateTeamRequest.php
```

Request digunakan untuk validasi input dari frontend.

#### StoreTeamRequest

Digunakan saat create data baru.

```php
<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama team wajib diisi.',
            'name.min' => 'Nama team minimal 2 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
        ];
    }
}
```

#### UpdateTeamRequest

Digunakan saat update data.

```php
<?php

namespace App\Http\Requests\Team;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:2',
                'max:255',
            ],
            'email' => [
                'sometimes',
                'required',
                'email',
                'max:255',
            ],
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                'max:20',
            ],
        ];
    }
}
```

Perbedaan:

```txt
StoreRequest:
Field biasanya wajib karena membuat data baru.

UpdateRequest:
Field biasanya pakai sometimes karena update bisa sebagian.
```

---

### 3.4 Service

Lokasi:

```txt
app/Services/TeamService.php
```

Service adalah tempat logic utama fitur.

```php
<?php

namespace App\Services;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;

class TeamService
{
    public function __construct(
        private readonly TeamRepositoryInterface $teamRepository,
    ) {
        //
    }

    public function getTeams()
    {
        return $this->teamRepository->allLatest();
    }

    public function createTeam(array $data): Team
    {
        return $this->teamRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
        ]);
    }

    public function updateTeam(Team $team, array $data): Team
    {
        return $this->teamRepository->update($team, $data);
    }

    public function deleteTeam(Team $team): void
    {
        $this->teamRepository->delete($team);
    }
}
```

Service cocok untuk:

```txt
Business logic.
Default value.
Transaction.
Orchestration beberapa repository.
Validasi flow bisnis.
Approve/reject.
Hitung score.
Generate code.
Create/update/delete logic.
```

Contoh logic yang cocok di service:

```txt
Saat membuat team, generate team code.
Saat membuat todo, is_completed default false.
Saat approve pembayaran, update status registration.
Saat submit exam, hitung score.
```

---

### 3.5 Repository Contract

Lokasi:

```txt
app/Repositories/Contracts/TeamRepositoryInterface.php
```

Repository Contract adalah interface atau aturan method repository.

```php
<?php

namespace App\Repositories\Contracts;

use App\Models\Team;

interface TeamRepositoryInterface
{
    public function allLatest();

    public function create(array $data): Team;

    public function update(Team $team, array $data): Team;

    public function delete(Team $team): void;
}
```

Fungsi contract:

```txt
Menentukan method apa saja yang wajib dimiliki repository.
Membuat service tidak bergantung langsung ke class repository.
Memudahkan testing.
Memudahkan ganti implementasi repository.
```

Ringkasnya:

```txt
Contract = aturan kerja repository.
```

---

### 3.6 Repository

Lokasi:

```txt
app/Repositories/TeamRepository.php
```

Repository adalah tempat query database.

```php
<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;

class TeamRepository implements TeamRepositoryInterface
{
    public function allLatest()
    {
        return Team::query()
            ->latest()
            ->get();
    }

    public function create(array $data): Team
    {
        return Team::query()->create($data);
    }

    public function update(Team $team, array $data): Team
    {
        $team->update($data);

        return $team->fresh();
    }

    public function delete(Team $team): void
    {
        $team->delete();
    }
}
```

Repository cocok untuk:

```txt
Query list.
Query detail.
Create data.
Update data.
Delete data.
Filter data.
Search data.
Pagination.
Count summary.
Query relation.
```

Repository tidak boleh berisi:

```txt
Toast.
Redirect.
Response JSON.
Request validation.
UI logic.
```

---

### 3.7 Model

Lokasi:

```txt
app/Models/Team.php
```

Model adalah representasi tabel database.

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
    ];
}
```

Model cocok untuk:

```txt
Fillable.
Casts.
Relationship.
Accessor.
Mutator.
Scope kecil.
Behavior kecil milik entity.
```

Contoh relationship:

```php
public function members()
{
    return $this->hasMany(Member::class);
}
```

Model tidak disarankan untuk logic bisnis besar.

---

### 3.8 Resource

Lokasi:

```txt
app/Http/Resources/TeamResource.php
```

Resource membentuk data yang keluar ke frontend.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
```

Resource digunakan agar backend tidak langsung mengirim isi model mentah.

Fungsi resource:

```txt
Menentukan field yang dikirim ke frontend.
Menyembunyikan field sensitif.
Mengubah format tanggal.
Menjaga API contract.
Membuat response konsisten.
```

Contoh:

```txt
UserResource boleh kirim id, name, email.
UserResource tidak boleh kirim password dan remember_token.
```

---

### 3.9 Response

Response adalah hasil akhir yang dikirim ke frontend.

Format standar sukses:

```json
{
  "status": "success",
  "message": "Data berhasil diambil.",
  "data": {},
  "metadata": {},
  "error": null
}
```

Format standar error:

```json
{
  "status": "error",
  "message": "Validasi gagal.",
  "data": null,
  "metadata": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": [
        "Email wajib diisi."
      ]
    }
  }
}
```

Agar tidak menulis response berulang, bisa dibuat helper:

```txt
app/Support/ApiResponse.php
```

Contoh:

```php
<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'Success.',
        array $metadata = [],
        int $statusCode = 200,
    ): JsonResponse {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'metadata' => $metadata,
            'error' => null,
        ], $statusCode);
    }

    public static function error(
        string $message = 'Error.',
        string $code = 'SERVER_ERROR',
        array $details = [],
        int $statusCode = 500,
    ): JsonResponse {
        return response()->json([
            'status' => 'error',
            'message' => $message,
            'data' => null,
            'metadata' => [],
            'error' => [
                'code' => $code,
                'details' => $details,
            ],
        ], $statusCode);
    }
}
```

Pemakaian di controller:

```php
return ApiResponse::success(
    data: new TeamResource($team),
    message: 'Team created successfully.',
    statusCode: 201,
);
```

---

## 4. Binding Repository

Jika service memakai interface, Laravel harus diberi tahu interface itu memakai class apa.

Tambahkan binding di:

```txt
app/Providers/AppServiceProvider.php
```

Contoh:

```php
<?php

namespace App\Providers;

use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\TeamRepository;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(
            TeamRepositoryInterface::class,
            TeamRepository::class,
        );
    }

    public function boot(): void
    {
        //
    }
}
```

Tanpa binding, Laravel bisa error karena tidak tahu harus mengisi `TeamRepositoryInterface` dengan class apa.

---

## 5. Register Route API

Tambahkan route di:

```txt
routes/api.php
```

Contoh:

```php
use App\Http\Controllers\Api\TeamController;

Route::prefix('teams')->group(function () {
    Route::get('/', [TeamController::class, 'index']);
    Route::post('/', [TeamController::class, 'store']);
    Route::get('/{team}', [TeamController::class, 'show']);
    Route::put('/{team}', [TeamController::class, 'update']);
    Route::patch('/{team}', [TeamController::class, 'update']);
    Route::delete('/{team}', [TeamController::class, 'destroy']);
});
```

Cek route:

```bash
php artisan route:list
```

Versi Docker:

```bash
docker compose exec app php artisan route:list
```

---

## 6. Migration

File migration dibuat oleh command:

```bash
php artisan make:model Team -m
```

Contoh migration:

```php
Schema::create('teams', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email');
    $table->string('phone')->nullable();
    $table->timestamps();
});
```

Jalankan migration:

```bash
php artisan migrate
```

Versi Docker:

```bash
docker compose exec app php artisan migrate
```

---

## 7. Flow API

### 7.1 GET Many

Endpoint:

```txt
GET /api/teams
```

Alur:

```txt
Frontend request list teams
-> routes/api.php
-> TeamController@index
-> TeamService@getTeams
-> TeamRepositoryInterface
-> TeamRepository@allLatest
-> Team Model query database
-> TeamResource::collection
-> response JSON ke frontend
```

Response:

```json
{
  "status": "success",
  "message": "Teams retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Team Alpha",
      "email": "alpha@example.com",
      "phone": "08123456789",
      "created_at": "2026-06-14T10:00:00.000Z",
      "updated_at": "2026-06-14T10:00:00.000Z"
    }
  ],
  "metadata": {},
  "error": null
}
```

---

### 7.2 GET One

Endpoint:

```txt
GET /api/teams/{team}
```

Alur:

```txt
Frontend request detail team
-> routes/api.php
-> Laravel route model binding mencari Team
-> TeamController@show
-> TeamResource
-> response JSON ke frontend
```

Response:

```json
{
  "status": "success",
  "message": "Team detail retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Team Alpha",
    "email": "alpha@example.com",
    "phone": "08123456789",
    "created_at": "2026-06-14T10:00:00.000Z",
    "updated_at": "2026-06-14T10:00:00.000Z"
  },
  "metadata": {},
  "error": null
}
```

---

### 7.3 POST Create

Endpoint:

```txt
POST /api/teams
```

Request:

```json
{
  "name": "Team Alpha",
  "email": "alpha@example.com",
  "phone": "08123456789"
}
```

Alur:

```txt
Frontend submit form
-> routes/api.php
-> TeamController@store
-> StoreTeamRequest validasi input
-> TeamService@createTeam
-> TeamRepository@create
-> Team Model insert database
-> TeamResource bentuk response data
-> response JSON ke frontend
```

Response:

```json
{
  "status": "success",
  "message": "Team created successfully.",
  "data": {
    "id": 1,
    "name": "Team Alpha",
    "email": "alpha@example.com",
    "phone": "08123456789",
    "created_at": "2026-06-14T10:00:00.000Z",
    "updated_at": "2026-06-14T10:00:00.000Z"
  },
  "metadata": {},
  "error": null
}
```

---

### 7.4 PUT Update Full

Endpoint:

```txt
PUT /api/teams/{team}
```

Request:

```json
{
  "name": "Team Alpha Updated",
  "email": "alpha.updated@example.com",
  "phone": "08999999999"
}
```

Alur:

```txt
Frontend submit update full
-> routes/api.php
-> Laravel mencari Team berdasarkan ID
-> TeamController@update
-> UpdateTeamRequest validasi input
-> TeamService@updateTeam
-> TeamRepository@update
-> Team Model update database
-> TeamResource bentuk response data
-> response JSON ke frontend
```

PUT digunakan jika frontend mengirim data lengkap.

---

### 7.5 PATCH Update Partial

Endpoint:

```txt
PATCH /api/teams/{team}
```

Request:

```json
{
  "phone": "08999999999"
}
```

Alur:

```txt
Frontend submit update sebagian field
-> routes/api.php
-> Laravel mencari Team berdasarkan ID
-> TeamController@update
-> UpdateTeamRequest validasi input
-> TeamService@updateTeam
-> TeamRepository@update
-> Team Model update database
-> TeamResource bentuk response data
-> response JSON ke frontend
```

PATCH digunakan jika frontend hanya mengirim sebagian field.

---

### 7.6 DELETE

Endpoint:

```txt
DELETE /api/teams/{team}
```

Alur:

```txt
Frontend klik delete
-> routes/api.php
-> Laravel mencari Team berdasarkan ID
-> TeamController@destroy
-> TeamService@deleteTeam
-> TeamRepository@delete
-> Team Model delete database
-> response JSON ke frontend
```

Response:

```json
{
  "status": "success",
  "message": "Team deleted successfully.",
  "data": null,
  "metadata": {},
  "error": null
}
```

---

## 8. Middleware

Middleware adalah layer sebelum request masuk ke controller.

Fungsinya:

```txt
Cek user sudah login atau belum.
Cek role user.
Cek CSRF.
Handle Inertia shared props.
Redirect jika tidak punya akses.
Memodifikasi request sebelum masuk controller.
Memodifikasi response sebelum balik ke browser.
```

Contoh middleware di project:

```txt
app/Http/Middleware/HandleInertiaRequests.php
```

Middleware ini khusus untuk Inertia.

Contoh share data global:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),

        'auth' => [
            'user' => $request->user(),
        ],
    ];
}
```

Dengan ini, frontend bisa menerima data user login dari semua page Inertia.

---

## 9. API Contract vs Repository Contract

Ada dua istilah contract.

### API Contract

API Contract adalah kesepakatan antara frontend dan backend.

Contoh:

```txt
GET /api/teams harus mengembalikan status, message, data, metadata, error.
```

API Contract mengatur:

```txt
Endpoint.
Method.
Request body.
Query params.
Response success.
Response error.
Status code.
```

### Repository Contract

Repository Contract adalah interface backend.

Contoh:

```txt
TeamRepositoryInterface
```

Repository Contract mengatur:

```txt
Method apa saja yang wajib dimiliki repository.
```

Ringkasnya:

```txt
API Contract = aturan komunikasi frontend dan backend.
Repository Contract = aturan class backend.
```

---

## 10. Urutan Membuat Fitur API Baru

Gunakan urutan ini setiap membuat fitur baru:

```txt
1. Tentukan nama fitur.
2. Generate file backend.
3. Isi migration.
4. Isi model fillable, casts, dan relation.
5. Isi request validation.
6. Isi resource response.
7. Isi repository contract.
8. Isi repository query.
9. Isi service logic.
10. Isi controller response.
11. Binding repository di AppServiceProvider.
12. Daftarkan route di routes/api.php.
13. Jalankan migrate.
14. Cek route:list.
15. Test API via curl/Postman.
16. Buat feature test jika diperlukan.
```

---

## 11. Checklist Fitur API Baru

```txt
[ ] Controller dibuat.
[ ] StoreRequest dibuat.
[ ] UpdateRequest dibuat.
[ ] Resource dibuat.
[ ] Service dibuat.
[ ] Repository dibuat.
[ ] RepositoryInterface dibuat.
[ ] Model dibuat.
[ ] Migration dibuat.
[ ] Fillable model diisi.
[ ] Rules request diisi.
[ ] Resource hanya mengirim field aman.
[ ] Service berisi logic utama.
[ ] Repository berisi query database.
[ ] Controller tidak berisi query panjang.
[ ] Binding repository sudah ditambahkan.
[ ] Route API sudah dibuat.
[ ] Migration sudah dijalankan.
[ ] route:list sudah dicek.
[ ] Response mengikuti API contract.
[ ] Error validation aman.
[ ] API sudah dites manual.
```

---

## 12. Command Cek Akhir

Cek route:

```bash
php artisan route:list
```

Jalankan migration:

```bash
php artisan migrate
```

Clear cache:

```bash
php artisan optimize:clear
```

Jalankan test:

```bash
php artisan test
```

Versi Docker:

```bash
docker compose exec app php artisan route:list
docker compose exec app php artisan migrate
docker compose exec app php artisan optimize:clear
docker compose exec app php artisan test
```

---

## 13. Hafalan Cepat

```txt
Route = alamat endpoint.

Controller = penerima request dan pengirim response.

Request = validasi input.

Service = logic utama aplikasi.

Repository Contract = aturan method repository.

Repository = query database.

Model = representasi tabel database.

Resource = bentuk data keluar ke frontend.

Response = hasil akhir ke frontend.

Middleware = penjaga sebelum masuk controller.
```

---

## 14. Analogi Restoran

```txt
Route = alamat restoran.

Middleware = satpam.

Controller = pelayan.

Request = pengecek pesanan valid atau tidak.

Service = koki utama yang mengatur proses masak.

Repository = orang yang mengambil bahan dari gudang.

Model = bahan/data utama.

Resource = plating makanan.

Response = makanan yang sampai ke customer.
```
