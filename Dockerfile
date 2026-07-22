FROM php:8.4-fpm

WORKDIR /var/www/html

ARG HOST_UID=1000
ARG HOST_GID=1000

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    default-mysql-client \
    libzip-dev \
    libpng-dev \
    libicu-dev \
    libonig-dev \
    libxml2-dev \
    ca-certificates \
    gnupg

RUN groupmod -o -g "${HOST_GID}" www-data \
 && usermod -o -u "${HOST_UID}" -g "${HOST_GID}" www-data

# Install Node 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y nodejs

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    zip \
    exif \
    intl \
    pcntl \
    bcmath \
    gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

RUN git config --system --add safe.directory /var/www/html

CMD ["php-fpm"]
