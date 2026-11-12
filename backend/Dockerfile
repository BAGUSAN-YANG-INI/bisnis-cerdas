# Image Dasar: php:8.4-cli (Menggunakan base image lokal yang sudah ada di Docker)
FROM php:8.4-cli

WORKDIR /var/www/html

# Install package sistem dan library pendukung PHP (Debian)
RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    git \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    libonig-dev \
    default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql mbstring bcmath gd zip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Composer 2.8 Binary
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Copy project files
COPY . .

# Ensure entrypoint script is executable
RUN if [ -f "./docker-entrypoint.sh" ]; then chmod +x ./docker-entrypoint.sh; fi

EXPOSE 8000

ENTRYPOINT ["/bin/bash", "./docker-entrypoint.sh"]

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
