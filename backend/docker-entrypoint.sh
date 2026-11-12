#!/bin/bash
set -e

# If composer.json exists but vendor does not, install dependencies
if [ -f "composer.json" ] && [ ! -d "vendor" ]; then
    echo "[backend] Installing composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader || true
fi

# If .env does not exist and .env.example exists, copy it
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "[backend] Copying .env.example to .env..."
    cp .env.example .env
fi

# Check if artisan exists
if [ -f "artisan" ]; then
    if [ ! -f ".env" ]; then
        cp .env.example .env
    fi
    exec "$@"
else
    echo "[backend] Menunggu inisialisasi Laravel oleh developer di folder ./backend..."
    echo "[backend] Letakkan project Laravel Anda di sini, service akan otomatis siap dijalankan."
    exec sleep infinity
fi
