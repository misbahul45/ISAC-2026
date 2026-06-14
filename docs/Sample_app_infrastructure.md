# App Infrastructure dan Foldering

Dokumentasi ini menjelaskan struktur aplikasi ISAC-2026 setelah refactor foldering. Fokus refactor adalah merapikan code management tanpa mengubah UI, behavior fitur Todo, response API Todo, database schema, copywriting, styling, atau alur user-facing yang sudah berjalan.

## Scope Domain

Domain yang masuk scope saat ini:

- Auth
- Todos
- Dashboard

Domain di luar scope seperti Participants, Competitions, Payments, Admin, Products, Orders, Settings, dan Profile tidak dibuat.

## Ringkasan Arsitektur

Aplikasi menggunakan Laravel sebagai backend, React Inertia dengan TypeScript sebagai frontend, dan TanStack Query untuk state data fetching di frontend.

Backend mengikuti layering:

```text
Controller -> Request -> Resource -> Service -> Repository -> Model
```

Frontend mengikuti pola:

```text
Pages tipis -> features untuk domain logic -> components untuk reusable UI/layout
```

Prinsip utama:

- Controller hanya mengatur HTTP request/response.
- Request menangani validasi input.
- Resource menjaga bentuk response JSON.
- Service menyimpan business/use-case logic.
- Repository menangani akses data.
- Model tetap fokus pada behavior Eloquent.
- Inertia Pages hanya menjadi entry page.
- API call, hook, schema, type, dan component domain berada di folder `features`.

## Backend Foldering

Struktur backend utama:

```text
app/
  Http/
    Controllers/
      Api/
        AuthController.php
        DashboardController.php
        TodoController.php
      Controller.php
    Middleware/
      HandleInertiaRequests.php
    Requests/
      Auth/
        LoginRequest.php
        RegisterRequest.php
      Todo/
        StoreTodoRequest.php
        UpdateTodoRequest.php
    Resources/
      DashboardSummaryResource.php
      TodoResource.php
      UserResource.php
  Models/
    Todo.php
    User.php
  Providers/
    AppServiceProvider.php
  Repositories/
    Contracts/
      DashboardRepositoryInterface.php
      TodoRepositoryInterface.php
    DashboardRepository.php
    TodoRepository.php
  Services/
    AuthService.php
    DashboardService.php
    TodoService.php
```

### Backend Layer Responsibility

| Layer | Lokasi | Tanggung jawab |
| --- | --- | --- |
| Controller | `app/Http/Controllers/Api` | Menerima request, memanggil service, mengembalikan response |
| Request | `app/Http/Requests` | Validasi input per domain |
| Resource | `app/Http/Resources` | Menjaga kontrak response JSON |
| Service | `app/Services` | Use-case dan orchestration domain |
| Repository Contract | `app/Repositories/Contracts` | Interface akses data |
| Repository | `app/Repositories` | Query Eloquent dan persistence |
| Model | `app/Models` | Entity Eloquent dan behavior model |
| Provider | `app/Providers` | Binding dependency injection |

### Todos Backend

Todo adalah domain existing yang dijaga stabil.

File penting:

- `app/Http/Controllers/Api/TodoController.php`
- `app/Http/Requests/Todo/StoreTodoRequest.php`
- `app/Http/Requests/Todo/UpdateTodoRequest.php`
- `app/Http/Resources/TodoResource.php`
- `app/Services/TodoService.php`
- `app/Repositories/TodoRepository.php`
- `app/Repositories/Contracts/TodoRepositoryInterface.php`
- `app/Models/Todo.php`

Kontrak yang dijaga:

- Endpoint `/api/todos` tetap sama.
- Response JSON Todo tetap sama.
- Validasi `StoreTodoRequest` dan `UpdateTodoRequest` tetap sama.
- Alur create, update/toggle, dan delete Todo tetap sama.
- Todo UI tidak bergantung pada perubahan backend selain import endpoint constant di frontend.

### Dashboard Backend

Dashboard memakai summary Todo secara read-only.

File penting:

- `app/Http/Controllers/Api/DashboardController.php`
- `app/Http/Resources/DashboardSummaryResource.php`
- `app/Services/DashboardService.php`
- `app/Repositories/DashboardRepository.php`
- `app/Repositories/Contracts/DashboardRepositoryInterface.php`

Endpoint:

```text
GET /api/dashboard/summary
```

Response:

```json
{
  "status": "success",
  "message": "Dashboard summary retrieved successfully.",
  "data": {
    "total": 0,
    "active": 0,
    "completed": 0
  }
}
```

Dashboard tidak mengubah Todo logic. Repository hanya membaca agregasi jumlah Todo.

### Auth Backend

Auth saat ini hanya disiapkan sebagai struktur minimal.

File penting:

- `app/Http/Controllers/Api/AuthController.php`
- `app/Http/Requests/Auth/LoginRequest.php`
- `app/Http/Requests/Auth/RegisterRequest.php`
- `app/Services/AuthService.php`
- `app/Http/Resources/UserResource.php`

Catatan:

- API route Auth belum dipasang.
- Tidak ada session/token/auth flow baru yang dipaksakan.
- Struktur disiapkan agar implementasi Auth berikutnya tetap masuk domain Auth, bukan bercampur dengan Todo/Dashboard.

### Dependency Injection

Binding repository ada di:

```text
app/Providers/AppServiceProvider.php
```

Binding aktif:

```php
DashboardRepositoryInterface::class -> DashboardRepository::class
TodoRepositoryInterface::class -> TodoRepository::class
```

## Frontend Foldering

Struktur frontend utama:

```text
resources/js/
  app.tsx
  vite-env.d.ts
  Pages/
    Auth/
      Login.tsx
      Register.tsx
    Dashboard/
      Index.tsx
    Todos/
      Index.tsx
  features/
    auth/
      api/
        authApi.ts
      components/
        AuthShell.tsx
        LoginForm.tsx
        RegisterForm.tsx
      hooks/
        useLogin.ts
        useLogout.ts
        useRegister.ts
      schemas/
        authSchema.ts
      types/
        authTypes.ts
    dashboard/
      api/
        dashboardApi.ts
      components/
        DashboardHero.tsx
        DashboardStats.tsx
        DashboardSummaryCard.tsx
        RecentTodosCard.tsx
        TodoProgressCard.tsx
      hooks/
        useDashboard.ts
      types/
        dashboardTypes.ts
    todos/
      api/
        todoApi.ts
      components/
        TodoCreateForm.tsx
        TodoEmptyState.tsx
        TodoErrorState.tsx
        TodoHero.tsx
        TodoItem.tsx
        TodoList.tsx
        TodoLoadingState.tsx
        TodoStats.tsx
      hooks/
        useTodos.ts
      schemas/
        todoSchema.ts
      types/
        todoTypes.ts
  components/
    layouts/
    shared/
    ui/
  constants/
    app.ts
    navigation.ts
    routes.ts
  hooks/
    use-debounce.ts
    use-mobile.ts
  lib/
    api.ts
    formatters.ts
    utils.ts
  providers/
    QueryProvider.tsx
  types/
    index.ts
    inertia.ts
```

### Pages

`Pages` adalah entry Inertia.

Aturan:

- Boleh import `Head` dari Inertia.
- Boleh import layout.
- Boleh import hook feature.
- Boleh import feature components.
- Tidak boleh berisi API request langsung.
- Tidak boleh menyimpan business logic besar.
- Tidak boleh menampung semua component inline.

Page existing Todo:

```text
resources/js/Pages/Todos/Index.tsx
```

Page ini tetap merender UI Todo yang sama dan menggunakan:

- `useTodos`
- `TodoHero`
- `TodoCreateForm`
- `TodoList`

### Features

Folder `features` menyimpan logic per domain.

Konvensi per domain:

```text
features/<domain>/
  api/
  components/
  hooks/
  schemas/
  types/
```

Untuk Dashboard tidak ada schema karena belum ada form input Dashboard.

#### Todos Feature

`features/todos` adalah feature yang paling stabil dan harus dijaga.

File penting:

- `api/todoApi.ts`
- `hooks/useTodos.ts`
- `schemas/todoSchema.ts`
- `types/todoTypes.ts`
- `components/TodoCreateForm.tsx`
- `components/TodoList.tsx`
- `components/TodoItem.tsx`
- state components Todo lain

Kontrak yang dijaga:

- Endpoint tetap `/api/todos`.
- Hook `useTodos` tetap mengatur list/create/toggle/delete.
- Schema Todo tetap menjaga validasi input.
- Type Todo tetap berada di `features/todos/types/todoTypes.ts`, bukan di global `types`.
- Komponen Todo tidak dipindah ke `components/shared` atau `components/ui`.

#### Dashboard Feature

`features/dashboard` menyimpan fetch summary dashboard dan komponen display Dashboard.

File penting:

- `api/dashboardApi.ts`
- `hooks/useDashboard.ts`
- `types/dashboardTypes.ts`
- `components/DashboardStats.tsx`
- `components/TodoProgressCard.tsx`

Dashboard mengambil data dari:

```text
/api/dashboard/summary
```

#### Auth Feature

`features/auth` menyimpan struktur Auth.

File penting:

- `api/authApi.ts`
- `hooks/useLogin.ts`
- `hooks/useRegister.ts`
- `hooks/useLogout.ts`
- `schemas/authSchema.ts`
- `types/authTypes.ts`
- `components/AuthShell.tsx`
- `components/LoginForm.tsx`
- `components/RegisterForm.tsx`

Catatan:

- Auth API belum diaktifkan di route backend.
- Form Auth mencegah submit default supaya tidak membuat request ke endpoint yang belum tersedia.
- Implementasi Auth berikutnya harus tetap berada di domain Auth.

### Components

Folder `components` dipakai untuk komponen reusable lintas halaman atau primitive UI.

```text
components/
  ui/
  layouts/
  shared/
```

Aturan:

- `components/ui` hanya primitive UI reusable.
- `components/layouts` hanya layout halaman.
- `components/shared` hanya block reusable lintas halaman.
- Komponen domain seperti `TodoItem` dan `TodoCreateForm` tetap berada di `features/todos/components`.

### Constants, Hooks, Lib, Providers, Types

Folder global:

- `constants`: constant global seperti route dan navigation.
- `hooks`: hook reusable lintas domain.
- `lib`: helper teknis global seperti fetch wrapper, formatter, dan utility class.
- `providers`: provider global React.
- `types`: type global lintas domain.

Catatan:

- Business logic domain tidak boleh masuk `lib`.
- Type Todo tidak boleh masuk `types/index.ts`; tetap di `features/todos/types/todoTypes.ts`.
- `QueryProvider` memindahkan konfigurasi TanStack Query dari `app.tsx` tanpa mengubah behavior query.

## Route Web

Route web final:

| Method | Path | Inertia Page | Name |
| --- | --- | --- | --- |
| GET | `/` | `Todos/Index` | `todos.index` |
| GET | `/login` | `Auth/Login` | `login` |
| GET | `/register` | `Auth/Register` | `register` |
| GET | `/dashboard` | `Dashboard/Index` | `dashboard.index` |
| GET | `/todos` | `Todos/Index` | `todos.page` |

`/` tetap render Todo untuk menjaga perubahan minimal.

## Route API

Route API final:

| Method | Path | Controller |
| --- | --- | --- |
| GET | `/api/system/status` | Closure |
| GET | `/api/todos` | `TodoController@index` |
| POST | `/api/todos` | `TodoController@store` |
| PATCH | `/api/todos/{todo}` | `TodoController@update` |
| DELETE | `/api/todos/{todo}` | `TodoController@destroy` |
| GET | `/api/dashboard/summary` | `DashboardController@summary` |

Auth route API belum dibuat karena belum ada implementasi Auth existing yang aman untuk diekspos.

## Command Verifikasi

Command yang digunakan untuk verifikasi setelah refactor:

```bash
npm run typecheck
npm run build
composer install --no-interaction --no-progress
php artisan route:list
php artisan test
```

Hasil:

- TypeScript typecheck berhasil.
- Frontend build berhasil.
- Laravel route list berhasil setelah dependency Composer lengkap.
- Laravel test berhasil: 2 tests passed.

## Batasan Perubahan

Hal yang sengaja tidak diubah:

- UI Todo.
- Styling Todo.
- Copywriting Todo.
- Struktur visual Todo.
- Behavior loading, error, empty state Todo.
- Logic create/update/toggle/delete Todo.
- Response JSON `/api/todos`.
- Validasi Todo.
- Database schema.
- Endpoint existing Todo.

## Catatan Maintenance

Saat menambah domain baru, jangan langsung menaruh file di global folder. Buat folder feature domain terlebih dahulu:

```text
resources/js/features/<domain>/
```

Lalu pisahkan:

- `api` untuk request.
- `hooks` untuk query/mutation/state.
- `components` untuk UI domain.
- `schemas` untuk validasi form.
- `types` untuk type domain.

Di backend, domain baru harus mengikuti pola:

```text
Controller -> Request -> Resource -> Service -> Repository -> Model
```

Binding repository hanya ditambahkan jika service memakai interface.
