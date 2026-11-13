#!/bin/bash
set -e

# Jika perintah yang dipanggil BUKAN 'php artisan' default (misalnya composer, sh, bash, dll),
# langsung jalankan perintah tersebut!
if [ "$1" != "php" ] || [ "$2" != "artisan" ]; then
    exec "$@"
fi

# Otomatis install composer jika composer.json ada tapi vendor belum ada
if [ -f "composer.json" ] && [ ! -d "vendor" ]; then
    echo "[backend] Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader || true
fi

# Otomatis buat .env dari .env.example jika belum ada
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[backend] Copying .env.example to .env..."
    cp .env.example .env
fi

# Jalankan server jika artisan ada, atau standby jika belum ada
if [ -f "artisan" ]; then
    exec "$@"
else
    echo "[backend] Menunggu inisialisasi Laravel oleh developer di folder ./backend..."
    echo "[backend] Jalankan 'docker compose run --rm backend ...' untuk inisialisasi."
    exec sleep infinity
fi
