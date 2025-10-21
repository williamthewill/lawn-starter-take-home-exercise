# ==============================
# Step 1: Frontend (Node.js)
# ==============================
FROM node:20 AS frontend
WORKDIR /app

# Install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy the necessary files
COPY resources resources
COPY vite.config.* tsconfig.json ./

ENV DOCKER_BUILD=true

# Build the frontend
RUN npm run build

# ==============================
# Step 2: Backend (PHP/Laravel)
# ==============================
FROM php:8.3-fpm

# Install PHP/Laravel dependencies
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy the backend files
COPY . .

# Install ALL dependencies (including dev)
# This ensures that packages like nunomaduro/collision are available in the container.
RUN composer install --optimize-autoloader

# Copy the frontend build to the public directory
COPY --from=frontend /app/public/build /var/www/public/build

# Fix permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Start PHP-FPM server
CMD ["php-fpm"]
