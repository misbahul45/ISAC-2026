# ISAC-2026

Laravel 13 + React/Inertia + TanStack Query + Vite + MySQL + Nginx + Docker Compose Watch.

## Stack

- Laravel 13
- PHP-FPM
- Nginx
- React
- Inertia.js
- TanStack Query
- Vite
- Tailwind CSS
- MySQL 8.4
- Docker Compose Watch

## Development URL

- App: http://localhost:8080
- Vite: http://localhost:5173
- API Status: http://localhost:8080/api/system/status
- MySQL Host Port: 3307

## Dua mode Docker

- Development tetap memakai `docker-compose.yml`, bind mount, dan Compose Watch.
- Production memakai `docker-compose.prod.yml` serta `Dockerfile.prod`; source, dependency production, dan asset frontend dibundel ke image.
- Panduan arsitektur, deployment, backup, dan troubleshooting tersedia di [`docs/docker.md`](docs/docker.md).

Mode development:

```bash
docker compose down --remove-orphans
docker compose up --build --watch
```

Mode production:

```bash
# Salin lalu isi semua placeholder, domain, password, dan APP_KEY.
cp .env.production.example .env.production
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## Setup

```bash
cp .env.example .env
docker compose down
docker compose up --build --watch
```

Setelah container berjalan, buat `APP_KEY`:

```bash
docker compose exec app php artisan key:generate
```

## Database Migration

```bash
docker compose exec app php artisan migrate
```

Jika perlu reset database development:

```bash
docker compose exec app php artisan migrate:fresh
```

## Docker Compose Watch

Jalankan mode development:

```bash
docker compose up --build --watch
```

Perilaku watch:

- Perubahan kode Laravel di `app`, `bootstrap`, `config`, `database`, `public`, `resources`, `routes`, dan `tests` akan disinkronkan ke container `app`.
- Perubahan React/Vite di `resources` dan `public` akan disinkronkan ke container `node`.
- Perubahan `docker/nginx/default.conf` akan sync dan restart service `nginx`.
- Perubahan `composer.json`, `composer.lock`, atau `Dockerfile` akan rebuild service `app`.
- Perubahan `package.json`, `package-lock.json`, atau `vite.config.js` akan sync dan restart service `node`, lalu command `npm install && npm run dev -- --host 0.0.0.0` berjalan ulang.
- Perubahan `.env` akan sync dan restart service `app`.

## Masuk Container

```bash
docker compose exec app sh
docker compose exec node sh
docker compose exec mysql mysql -uisac -pisac_password isac2026
```

## Troubleshooting

### Nginx upstream `app` tidak ditemukan

Jika muncul `host not found in upstream "app"`, recreate container dan network tanpa menghapus volume:

```bash
docker compose down --remove-orphans
docker compose up --build --watch
```

Config development memakai network eksplisit, healthcheck PHP-FPM, dan resolver DNS Docker agar Nginx tidak crash saat upstream belum siap. Pesan read-only dari entrypoint Nginx hanya informasional karena config memang di-mount `:ro`.

### Nginx rebuild error

Jika muncul error:

```text
can't watch service "nginx" with action rebuild without a build context
```

Pastikan service `nginx` tidak memakai `action: rebuild`. Service `nginx` memakai image langsung `nginx:1.27-alpine`, sehingga perubahan config harus memakai `sync+restart`.

### Docker daemon

Jika Docker command gagal karena daemon belum aktif, jalankan Docker Desktop atau service Docker, lalu ulangi:

```bash
docker compose ps
```

### MySQL

MySQL di dalam Docker memakai host `mysql` dan port `3306`. Dari komputer lokal gunakan port `3307`.

Jika koneksi gagal, cek healthcheck dan log:

```bash
docker compose ps
docker compose logs mysql
```

Data MySQL disimpan di volume `mysql_data`, sehingga tetap aman saat container dibuat ulang.

### Vite

Vite tersedia di:

```text
http://localhost:5173
```

Jika asset frontend tidak ter-refresh, cek log node:

```bash
docker compose logs node
```

Pastikan `npm run dev` berjalan dengan host `0.0.0.0` agar bisa diakses dari host.
