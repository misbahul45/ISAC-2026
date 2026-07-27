# Docker development dan production

Repo ini memiliki dua mode Docker yang sengaja dipisahkan. Mode development mempertahankan bind mount dan Compose Watch, sedangkan mode production membangun image immutable tanpa source mount dan tanpa Vite development server.

## Ringkasan arsitektur

| Aspek | Development | Production |
| --- | --- | --- |
| Compose | `docker-compose.yml` | `docker-compose.prod.yml` |
| PHP image | `Dockerfile` | target `app` di `Dockerfile.prod` |
| Nginx | image resmi + config bind mount | target `nginx` berisi config dan asset publik |
| Source code | bind mount dari host | disalin saat image build |
| Composer | `composer install` saat container start | dependency `--no-dev` saat image build |
| Frontend | Vite dev server di port 5173 | `npm ci && npm run build` saat image build |
| Database | MySQL diekspos ke host di port 3307 | hanya tersedia di network internal Docker |
| Process lain | tidak ada worker khusus | queue worker dan scheduler terpisah |
| Environment | `.env` | `.env.production` |

## Analisis error Nginx development

Error fatal yang diamati:

```text
host not found in upstream "app"
```

Nama `app` sudah benar karena itu adalah nama service Compose. Saat diperiksa, container `app` memiliki alias DNS `app`, tetapi container Nginx tidak memiliki endpoint pada network Compose (`NetworkSettings.Networks` kosong). Ini biasanya merupakan state container/network yang stale, bukan kesalahan port PHP-FPM.

Pesan berikut bukan penyebab crash:

```text
can not modify /etc/nginx/conf.d/default.conf (read-only file system?)
```

Config Nginx memang di-mount read-only. Skrip entrypoint image Nginx hanya gagal melakukan modifikasi opsional, lalu tetap melanjutkan startup.

Perbaikan development terdiri dari:

- seluruh service memakai network `app_network` secara eksplisit;
- `app` memiliki healthcheck TCP untuk PHP-FPM port 9000;
- Nginx menunggu `app` berstatus healthy;
- Nginx memakai DNS internal Docker `127.0.0.11` dan melakukan resolusi upstream saat request, sehingga startup tidak crash jika DNS sempat belum siap;
- container dan network lama direkreasi, tanpa menghapus volume database.

Jalankan mode development:

```bash
docker compose down --remove-orphans
docker compose up --build --watch
```

Verifikasi:

```bash
docker compose ps
docker compose logs --tail=100 nginx app
curl -f http://localhost:8080/up
```

## Menyiapkan production

Salin template environment. Ganti domain, credential mail, ImageKit, dan seluruh password. `APP_KEY` dibuat pada langkah setelahnya:

```bash
cp .env.production.example .env.production
```

Buat `APP_KEY` baru dan salin hasilnya ke `.env.production`:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app php artisan key:generate --show
```

Nilai `VITE_*` adalah konfigurasi publik yang dibundel ke asset browser pada saat image build. Karena itu image perlu dibangun ulang jika nilai tersebut berubah.

## Build dan deployment production

Validasi Compose lebih dulu:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
```

Build image:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml build
```

Nyalakan database, jalankan migration satu kali, lalu jalankan seluruh service:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml up -d mysql
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app php artisan migrate --force
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

Verifikasi deployment:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml ps
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 nginx app queue scheduler
curl -f "http://127.0.0.1:80/up"
```

Untuk deployment publik, letakkan TLS termination di load balancer atau reverse proxy host dan arahkan ke port `APP_PORT`. Jangan membuka port MySQL ke internet.

## Update production

Setelah source berubah:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml build
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml run --rm app php artisan migrate --force
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml up -d --remove-orphans
```

Jika hanya environment backend yang berubah, recreate service tanpa rebuild. Jika nilai `VITE_*` berubah, build ulang image karena nilainya tertanam di bundle frontend.

## Operasional production

Backup database sebelum migration atau deployment berisiko:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml exec -T mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' > isac-backup.sql
```

Restore harus diuji di environment terpisah sebelum dipakai pada production. Volume `mysql_data` dan `app_storage` tidak dihapus oleh `docker compose down`; jangan gunakan opsi `--volumes` kecuali memang ingin menghapus data.

Perintah operasional umum:

```bash
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan about
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml exec app php artisan optimize:clear
env PROD_ENV_FILE=.env.production docker compose --env-file .env.production -f docker-compose.prod.yml restart queue scheduler
```

Untuk rollback aplikasi, deploy kembali image/tag versi sebelumnya. Migration database perlu dirancang backward-compatible karena rollback kode tidak otomatis membatalkan schema database.

## Checklist production

- `APP_ENV=production`, `APP_DEBUG=false`, dan `APP_KEY` unik sudah terisi.
- `APP_URL`, cookie secure, dan daftar domain Sanctum sesuai domain HTTPS.
- Password MySQL kuat dan berbeda untuk user aplikasi serta root.
- Credential mail dan ImageKit valid.
- Backup database terjadwal dan restore pernah diuji.
- TLS, firewall, log collection, disk monitoring, dan alert health endpoint tersedia di host/platform.
- Image dipindai dan dependency diperbarui secara berkala.
