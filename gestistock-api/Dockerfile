FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends git unzip libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --prefer-dist --no-interaction

COPY . .

RUN php artisan package:discover || true

EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force; php artisan db:seed --force; php artisan config:cache; php artisan storage:link || true; exec php artisan serve --host=0.0.0.0 --port=${PORT} --no-reload"]
