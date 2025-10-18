# ==============================
# Etapa 1: Build do frontend (Vite)
# ==============================
FROM node:20 AS frontend
WORKDIR /app

# Instala dependências do frontend
COPY package*.json ./
RUN npm install

# Copia os arquivos necessários
COPY resources resources
COPY vite.config.* tsconfig.json ./

ENV DOCKER_BUILD=true

# Faz o build do frontend
RUN npm run build

# ==============================
# Etapa 2: Backend (Laravel + PHP)
# ==============================
FROM php:8.3-fpm

# Instala dependências do PHP/Laravel
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Instala Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copia os arquivos do backend
COPY . .

# Instala dependências do Laravel
RUN composer install --no-dev --optimize-autoloader

# Copia o build do frontend
COPY --from=frontend /app/public/build /var/www/public/build

# Corrige permissões
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

CMD ["php-fpm"]
