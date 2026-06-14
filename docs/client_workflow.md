# Frontend API Workflow Standard

Dokumentasi ini menjelaskan standar workflow frontend untuk memanggil API di project React + Inertia + TypeScript + TanStack Query.

Standar ini mengikuti pola fitur `todos`.

---

## 1. Pola Utama Frontend

Alur frontend wajib seperti ini:

```txt
Page
-> Component
-> Custom Hook
-> TanStack Query
-> Feature API Function
-> API Client
-> Backend API
```

Contoh real:

```txt
Pages/Todos/Index.tsx
-> TodoCreateForm / TodoList
-> useTodos()
-> useQuery / useMutation
-> todoApi.ts
-> lib/api.ts
-> /api/todos
```

---

## 2. Prinsip Utama

Frontend tidak boleh langsung memanggil API dari component.

Jangan buat seperti ini:

```tsx
fetch('/api/teams')
```

atau:

```tsx
axios.get('/api/teams')
```

langsung di component.

Yang benar:

```txt
Component
-> panggil props action dari Page
-> Page dapat action dari hook
-> Hook memakai TanStack Query
-> Hook memanggil API function
-> API function memakai API client
```

---

## 3. Struktur Folder Feature

Misal membuat fitur `teams`.

Gunakan struktur:

```txt
resources/js/features/teams/
  api/
    teamApi.ts
  components/
    TeamCreateForm.tsx
    TeamList.tsx
    TeamItem.tsx
    TeamLoadingState.tsx
    TeamErrorState.tsx
    TeamEmptyState.tsx
  hooks/
    useTeams.ts
  schemas/
    teamSchema.ts
  types/
    teamTypes.ts

resources/js/Pages/Teams/
  Index.tsx
```

Jika perlu buat folder:

```bash
mkdir -p resources/js/features/teams/api
mkdir -p resources/js/features/teams/components
mkdir -p resources/js/features/teams/hooks
mkdir -p resources/js/features/teams/schemas
mkdir -p resources/js/features/teams/types
mkdir -p resources/js/Pages/Teams
```

---

## 4. Tanggung Jawab Setiap File

### Page

Contoh:

```txt
resources/js/Pages/Teams/Index.tsx
```

Tugas Page:

```txt
Menjadi entry halaman Inertia.
Memanggil custom hook.
Menyusun layout halaman.
Mengirim data ke component.
Mengirim loading/error state ke component.
Mengirim action mutation ke component.
```

Page boleh memakai:

```txt
useTeams()
Head / Seo
Layout
Component feature
```

Page tidak boleh:

```txt
Menulis fetch langsung.
Menulis query API langsung.
Menulis validasi form panjang.
Menulis logic UI terlalu banyak.
```

---

### Component

Contoh:

```txt
TeamCreateForm.tsx
TeamList.tsx
TeamItem.tsx
```

Tugas Component:

```txt
Menampilkan UI.
Menerima props dari Page.
Memanggil callback seperti onCreate, onUpdate, onDelete.
Menampilkan loading, error, empty state.
```

Component tidak boleh:

```txt
fetch langsung ke API.
useQuery langsung.
useMutation langsung.
import teamApi.ts langsung.
```

Component harus tetap fokus UI.

---

### Hook

Contoh:

```txt
resources/js/features/teams/hooks/useTeams.ts
```

Tugas Hook:

```txt
Mengatur TanStack Query.
Mengatur useQuery untuk GET.
Mengatur useMutation untuk POST, PUT, PATCH, DELETE.
Mengatur invalidateQueries setelah mutation sukses.
Mengolah data ringan seperti stats atau derived data.
Mengembalikan data, query state, dan mutation state ke Page.
```

Hook adalah pusat penghubung antara UI dan API.

---

### API Function

Contoh:

```txt
resources/js/features/teams/api/teamApi.ts
```

Tugas API Function:

```txt
Menyediakan function request API.
Memanggil API client dari lib/api.ts.
Menggunakan type response.
Tidak mengatur UI.
Tidak mengatur toast.
Tidak mengatur cache.
Tidak mengatur loading state.
```

---

### API Client

Contoh:

```txt
resources/js/lib/api.ts
```

Tugas API Client:

```txt
Membungkus fetch.
Mengatur header JSON.
Mengatur CSRF token.
Mengubah response error menjadi Error.
Menjadi utility request reusable.
```

---

### Types

Contoh:

```txt
resources/js/features/teams/types/teamTypes.ts
```

Tugas Types:

```txt
Mendefinisikan bentuk data dari backend.
Mendefinisikan bentuk response API.
Mendefinisikan payload create/update/delete.
```

---

### Schema

Contoh:

```txt
resources/js/features/teams/schemas/teamSchema.ts
```

Tugas Schema:

```txt
Validasi form frontend.
Biasanya memakai Zod.
Menjadi sumber type input form.
```

---

## 5. Standar API Response Type

Gunakan type global:

```ts
export type ApiStatus = 'success' | 'error';

export type ApiResponse<T> = {
    status: ApiStatus;
    message: string;
    data: T;
};
```

Jika backend sudah memakai metadata dan error, boleh diperluas menjadi:

```ts
export type ApiStatus = 'success' | 'error';

export type ApiError = {
    code: string;
    details?: Record<string, string[] | string>;
};

export type ApiMetadata = {
    page?: number;
    perPage?: number;
    totalItems?: number;
    totalPages?: number;
    [key: string]: unknown;
};

export type ApiResponse<T> = {
    status: ApiStatus;
    message: string;
    data: T;
    metadata?: ApiMetadata;
    error?: ApiError | null;
};
```

---

## 6. Contoh Types

File:

```txt
resources/js/features/teams/types/teamTypes.ts
```

Isi:

```ts
import type { ApiResponse } from '@/types';
import type { CreateTeamInput, UpdateTeamInput } from '../schemas/teamSchema';

export type Team = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    created_at: string;
    updated_at: string;
};

export type TeamListResponse = ApiResponse<Team[]>;

export type TeamResponse = ApiResponse<Team>;

export type DeleteTeamResponse = ApiResponse<null>;

export type CreateTeamPayload = CreateTeamInput;

export type UpdateTeamPayload = UpdateTeamInput;
```

---

## 7. Contoh Schema

File:

```txt
resources/js/features/teams/schemas/teamSchema.ts
```

Isi:

```ts
import { z } from 'zod';

export const createTeamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Nama team minimal 2 karakter.')
        .max(255, 'Nama team maksimal 255 karakter.'),

    email: z
        .string()
        .trim()
        .min(1, 'Email wajib diisi.')
        .email('Format email tidak valid.')
        .max(255, 'Email maksimal 255 karakter.'),

    phone: z
        .string()
        .trim()
        .max(20, 'Nomor HP maksimal 20 karakter.')
        .optional()
        .or(z.literal('')),
});

export const updateTeamSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, 'Nama team minimal 2 karakter.')
        .max(255, 'Nama team maksimal 255 karakter.')
        .optional(),

    email: z
        .string()
        .trim()
        .email('Format email tidak valid.')
        .max(255, 'Email maksimal 255 karakter.')
        .optional(),

    phone: z
        .string()
        .trim()
        .max(20, 'Nomor HP maksimal 20 karakter.')
        .optional()
        .or(z.literal('')),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
```

---

## 8. Tambah Route Constant

File:

```txt
resources/js/constants/routes.ts
```

Tambahkan:

```ts
export const ROUTES = {
    home: '/',
    login: '/auth/login',
    register: '/auth/register',
    dashboard: '/dashboard',
    todos: '/todos',
    teams: '/teams',

    api: {
        todos: '/api/todos',
        dashboardSummary: '/api/dashboard/summary',
        teams: '/api/teams',
    },
} as const;
```

Jangan hardcode endpoint di banyak file.

Jangan seperti ini:

```ts
fetchJson('/api/teams')
```

Lebih baik:

```ts
fetchJson(ROUTES.api.teams)
```

---

## 9. Contoh API Function

File:

```txt
resources/js/features/teams/api/teamApi.ts
```

Isi:

```ts
import {
    deleteJson,
    fetchJson,
    patchJson,
    postJson,
} from '@/lib/api';

import { ROUTES } from '@/constants/routes';

import type {
    CreateTeamPayload,
    DeleteTeamResponse,
    TeamListResponse,
    TeamResponse,
    UpdateTeamPayload,
} from '../types/teamTypes';

export function getTeams(): Promise<TeamListResponse> {
    return fetchJson<TeamListResponse>(ROUTES.api.teams);
}

export function createTeam(payload: CreateTeamPayload): Promise<TeamResponse> {
    return postJson<TeamResponse>(ROUTES.api.teams, payload);
}

export function updateTeam(
    id: number,
    payload: UpdateTeamPayload,
): Promise<TeamResponse> {
    return patchJson<TeamResponse>(`${ROUTES.api.teams}/${id}`, payload);
}

export function deleteTeam(id: number): Promise<DeleteTeamResponse> {
    return deleteJson<DeleteTeamResponse>(`${ROUTES.api.teams}/${id}`);
}
```

Aturan:

```txt
GET many -> getTeams()
POST create -> createTeam()
PATCH update partial -> updateTeam()
DELETE -> deleteTeam()
```

Jika butuh PUT full update, tambahkan helper `putJson` di `lib/api.ts`.

---

## 10. API Client Standard

File:

```txt
resources/js/lib/api.ts
```

Standar yang dipakai:

```ts
export async function fetchJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    const response = await fetch(url, {
        ...restOptions,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(headers || {}),
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const validationMessage =
            data?.errors && typeof data.errors === 'object'
                ? Object.values(data.errors).flat().join(' ')
                : null;

        const message = validationMessage || data?.message || 'Request failed';

        throw new Error(message);
    }

    return data as T;
}
```

Untuk request yang mengubah data, gunakan CSRF token:

```ts
export function getCsrfToken(): string {
    const token = document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content');

    return token || '';
}
```

POST:

```ts
export async function postJson<T>(
    url: string,
    body: unknown,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}
```

PATCH:

```ts
export async function patchJson<T>(
    url: string,
    body: unknown,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}
```

DELETE:

```ts
export async function deleteJson<T>(
    url: string,
    options: RequestInit = {},
): Promise<T> {
    const { headers, ...restOptions } = options;

    return fetchJson<T>(url, {
        ...restOptions,
        method: 'DELETE',
        headers: {
            'X-CSRF-TOKEN': getCsrfToken(),
            ...(headers || {}),
        },
    });
}
```

---

## 11. Contoh Hook TanStack Query

File:

```txt
resources/js/features/teams/hooks/useTeams.ts
```

Isi:

```ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    createTeam,
    deleteTeam,
    getTeams,
    updateTeam,
} from '../api/teamApi';

import type {
    CreateTeamPayload,
    DeleteTeamResponse,
    TeamListResponse,
    TeamResponse,
    UpdateTeamPayload,
} from '../types/teamTypes';

const TEAMS_QUERY_KEY = ['teams'] as const;

type UpdateTeamVariables = {
    id: number;
    payload: UpdateTeamPayload;
};

export function useTeams() {
    const queryClient = useQueryClient();

    const teamsQuery = useQuery<TeamListResponse, Error>({
        queryKey: TEAMS_QUERY_KEY,
        queryFn: getTeams,
    });

    const createTeamMutation = useMutation<TeamResponse, Error, CreateTeamPayload>({
        mutationFn: createTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TEAMS_QUERY_KEY,
            });
        },
    });

    const updateTeamMutation = useMutation<TeamResponse, Error, UpdateTeamVariables>({
        mutationFn: ({ id, payload }) => updateTeam(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TEAMS_QUERY_KEY,
            });
        },
    });

    const deleteTeamMutation = useMutation<DeleteTeamResponse, Error, number>({
        mutationFn: deleteTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: TEAMS_QUERY_KEY,
            });
        },
    });

    const teams = teamsQuery.data?.data ?? [];

    return {
        teams,
        teamsQuery,
        createTeamMutation,
        updateTeamMutation,
        deleteTeamMutation,
    };
}
```

Aturan penting:

```txt
GET -> useQuery
POST -> useMutation
PATCH -> useMutation
DELETE -> useMutation
Setelah mutation sukses -> invalidateQueries
```

---

## 12. Contoh Page

File:

```txt
resources/js/Pages/Teams/Index.tsx
```

Isi:

```tsx
import { Head } from '@inertiajs/react';

import { TeamCreateForm } from '@/features/teams/components/TeamCreateForm';
import { TeamList } from '@/features/teams/components/TeamList';
import { useTeams } from '@/features/teams/hooks/useTeams';

type TeamsIndexProps = {
    title?: string;
};

export default function TeamsIndex({ title }: TeamsIndexProps) {
    const {
        teams,
        teamsQuery,
        createTeamMutation,
        updateTeamMutation,
        deleteTeamMutation,
    } = useTeams();

    return (
        <>
            <Head title={title || 'Teams'} />

            <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
                <div className="mx-auto max-w-5xl space-y-8">
                    <TeamCreateForm
                        isSubmitting={createTeamMutation.isPending}
                        errorMessage={createTeamMutation.error?.message}
                        onCreate={(payload) => {
                            createTeamMutation.mutate(payload);
                        }}
                    />

                    <TeamList
                        teams={teams}
                        isLoading={teamsQuery.isLoading}
                        isError={teamsQuery.isError}
                        errorMessage={teamsQuery.error?.message}
                        isFetching={teamsQuery.isFetching}
                        isUpdating={updateTeamMutation.isPending}
                        isDeleting={deleteTeamMutation.isPending}
                        onUpdate={(id, payload) => {
                            updateTeamMutation.mutate({
                                id,
                                payload,
                            });
                        }}
                        onDelete={(id) => {
                            deleteTeamMutation.mutate(id);
                        }}
                    />
                </div>
            </main>
        </>
    );
}
```

Page hanya mengatur komposisi.

Page tidak melakukan fetch langsung.

---

## 13. Contoh Create Form Component

File:

```txt
resources/js/features/teams/components/TeamCreateForm.tsx
```

Isi sederhana:

```tsx
import { FormEvent, useState } from 'react';

import type { CreateTeamPayload } from '../types/teamTypes';

type TeamCreateFormProps = {
    isSubmitting: boolean;
    errorMessage?: string;
    onCreate: (payload: CreateTeamPayload) => void;
};

export function TeamCreateForm({
    isSubmitting,
    errorMessage,
    onCreate,
}: TeamCreateFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        onCreate({
            name,
            email,
            phone,
        });

        setName('');
        setEmail('');
        setPhone('');
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Team name"
            />

            <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Team email"
            />

            <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone"
            />

            {errorMessage && <p>{errorMessage}</p>}

            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Create Team'}
            </button>
        </form>
    );
}
```

Kalau memakai React Hook Form + Zod, component tetap sama prinsipnya:

```txt
Form validasi lokal
-> hasil valid dikirim ke onCreate
-> onCreate dari Page
-> Page menjalankan mutation
```

Form tidak boleh langsung import `createTeam`.

---

## 14. Contoh List Component

File:

```txt
resources/js/features/teams/components/TeamList.tsx
```

Isi:

```tsx
import type { Team, UpdateTeamPayload } from '../types/teamTypes';

type TeamListProps = {
    teams: Team[];
    isLoading: boolean;
    isError: boolean;
    errorMessage?: string;
    isFetching: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
    onUpdate: (id: number, payload: UpdateTeamPayload) => void;
    onDelete: (id: number) => void;
};

export function TeamList({
    teams,
    isLoading,
    isError,
    errorMessage,
    isFetching,
    isUpdating,
    isDeleting,
    onUpdate,
    onDelete,
}: TeamListProps) {
    if (isLoading) {
        return <p>Loading teams...</p>;
    }

    if (isError) {
        return <p>{errorMessage || 'Failed to load teams.'}</p>;
    }

    if (teams.length === 0) {
        return <p>No teams found.</p>;
    }

    return (
        <section>
            {isFetching && <p>Refreshing...</p>}

            {teams.map((team) => (
                <article key={team.id}>
                    <h2>{team.name}</h2>
                    <p>{team.email}</p>
                    <p>{team.phone}</p>

                    <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => {
                            onUpdate(team.id, {
                                name: `${team.name} Updated`,
                            });
                        }}
                    >
                        Update
                    </button>

                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => {
                            onDelete(team.id);
                        }}
                    >
                        Delete
                    </button>
                </article>
            ))}
        </section>
    );
}
```

---

## 15. Flow GET Many

Endpoint:

```txt
GET /api/teams
```

Frontend flow:

```txt
Teams/Index.tsx dibuka
-> useTeams()
-> useQuery()
-> getTeams()
-> fetchJson(ROUTES.api.teams)
-> Backend GET /api/teams
-> Response masuk ke teamsQuery.data
-> teams = teamsQuery.data?.data ?? []
-> TeamList menerima teams
-> UI menampilkan list
```

---

## 16. Flow POST Create

Endpoint:

```txt
POST /api/teams
```

Frontend flow:

```txt
User isi TeamCreateForm
-> submit form
-> onCreate(payload)
-> createTeamMutation.mutate(payload)
-> useMutation menjalankan createTeam(payload)
-> createTeam memanggil postJson()
-> Backend POST /api/teams
-> Jika sukses, onSuccess jalan
-> invalidateQueries(['teams'])
-> useQuery GET /api/teams jalan ulang
-> UI list otomatis refresh
```

---

## 17. Flow PATCH Update

Endpoint:

```txt
PATCH /api/teams/{id}
```

Frontend flow:

```txt
User klik update
-> onUpdate(id, payload)
-> updateTeamMutation.mutate({ id, payload })
-> useMutation menjalankan updateTeam(id, payload)
-> updateTeam memanggil patchJson()
-> Backend PATCH /api/teams/{id}
-> Jika sukses, invalidateQueries(['teams'])
-> List teams otomatis refresh
```

---

## 18. Flow DELETE

Endpoint:

```txt
DELETE /api/teams/{id}
```

Frontend flow:

```txt
User klik delete
-> onDelete(id)
-> deleteTeamMutation.mutate(id)
-> useMutation menjalankan deleteTeam(id)
-> deleteTeam memanggil deleteJson()
-> Backend DELETE /api/teams/{id}
-> Jika sukses, invalidateQueries(['teams'])
-> List teams otomatis refresh
```

---

## 19. Aturan TanStack Query

Wajib:

```txt
GET data memakai useQuery.
POST data memakai useMutation.
PUT data memakai useMutation.
PATCH data memakai useMutation.
DELETE data memakai useMutation.
Mutation sukses harus invalidate query yang terdampak.
Query key harus konsisten.
API function tidak boleh mengatur UI.
Component tidak boleh call API langsung.
Page tidak boleh fetch langsung.
```

Tidak boleh:

```tsx
useEffect(() => {
    fetch('/api/teams');
}, []);
```

Yang benar:

```tsx
const { teams, teamsQuery } = useTeams();
```

Tidak boleh:

```tsx
<button onClick={() => createTeam(payload)}>
    Save
</button>
```

Yang benar:

```tsx
<button onClick={() => createTeamMutation.mutate(payload)}>
    Save
</button>
```

---

## 20. Standar Query Key

Untuk fitur kecil, boleh lokal di hook:

```ts
const TEAMS_QUERY_KEY = ['teams'] as const;
```

Untuk fitur besar, lebih baik buat:

```txt
resources/js/query/keys.ts
```

Contoh:

```ts
export const queryKeys = {
    teams: ['teams'] as const,
    teamDetail: (id: number) => ['teams', id] as const,
};
```

Lalu hook memakai:

```ts
queryKey: queryKeys.teams
```

Dan invalidate:

```ts
queryClient.invalidateQueries({
    queryKey: queryKeys.teams,
});
```

---

## 21. Standar Loading dan Error

Dari hook, Page mengambil:

```tsx
teamsQuery.isLoading
teamsQuery.isError
teamsQuery.error?.message
teamsQuery.isFetching
```

Lalu dikirim ke component:

```tsx
<TeamList
    teams={teams}
    isLoading={teamsQuery.isLoading}
    isError={teamsQuery.isError}
    errorMessage={teamsQuery.error?.message}
    isFetching={teamsQuery.isFetching}
/>
```

Component yang menentukan tampilan:

```tsx
if (isLoading) {
    return <p>Loading teams...</p>;
}

if (isError) {
    return <p>{errorMessage || 'Failed to load teams.'}</p>;
}

if (teams.length === 0) {
    return <p>No teams found.</p>;
}
```

---

## 22. Checklist Fitur Frontend API Baru

```txt
[ ] Folder feature dibuat.
[ ] File api dibuat.
[ ] File hook dibuat.
[ ] File types dibuat.
[ ] File schema dibuat jika ada form.
[ ] File components dibuat.
[ ] Page Inertia dibuat.
[ ] Route constant ditambahkan.
[ ] API function memakai lib/api.ts.
[ ] GET memakai useQuery.
[ ] POST memakai useMutation.
[ ] PATCH/PUT memakai useMutation.
[ ] DELETE memakai useMutation.
[ ] Mutation sukses invalidate query.
[ ] Component tidak call API langsung.
[ ] Page tidak fetch langsung.
[ ] Type response memakai ApiResponse<T>.
[ ] Error/loading state dipassing ke component.
[ ] Build berhasil.
```

---

## 23. Command Cek

Jalankan build:

```bash
npm run build
```

Versi Docker:

```bash
docker compose exec node npm run build
```

Jika perlu cek TypeScript:

```bash
npx tsc --noEmit
```

Versi Docker:

```bash
docker compose exec node npx tsc --noEmit
```

---

## 24. Ringkasan Cepat

```txt
types = bentuk data
schema = validasi form
api = function request ke backend
hook = TanStack Query
page = susun data dan UI
component = tampilan saja
lib/api = fetch wrapper
```

Flow standar:

```txt
Page
-> useFeatureHook
-> useQuery / useMutation
-> featureApi
-> lib/api
-> backend
```

Contoh:

```txt
TeamsIndex
-> useTeams
-> useQuery getTeams
-> teamApi.getTeams
-> fetchJson
-> GET /api/teams
```
