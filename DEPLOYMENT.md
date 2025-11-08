# 🚀 Инструкция по развертыванию

Полное руководство по развертыванию Instagram Slide Carousel Creator на вашем сервере.

---

## 📋 Предварительные требования

- Docker и Docker Compose
- Аккаунт Supabase (бесплатный tier подходит)
- Домен или IP адрес сервера (опционально)

---

## 🔧 Шаг 1: Настройка Supabase

### 1.1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запомните пароль базы данных (понадобится позже)
4. Дождитесь завершения инициализации проекта (~2 минуты)

### 1.2. Получение ключей API

1. В Dashboard перейдите в **Project Settings** → **API**
2. Скопируйте следующие значения:
   - **Project URL** (например: `https://xxxxx.supabase.co`)
   - **Project ID** (например: `xxxxx`)
   - **anon/public key** (длинный JWT токен)

### 1.3. Инициализация базы данных

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Создайте новый запрос
3. Скопируйте содержимое файла `database-init.sql`
4. Вставьте в редактор и нажмите **Run**
5. Убедитесь, что все команды выполнились успешно

### 1.4. Настройка Authentication

1. Перейдите в **Authentication** → **Providers**
2. Включите **Email** провайдер
3. Перейдите в **Authentication** → **URL Configuration**
4. Добавьте URL вашего приложения в **Site URL** и **Redirect URLs**:
   - Для локального тестирования: `http://localhost:8080`
   - Для production: `https://yourdomain.com`

5. **ВАЖНО**: Для тестирования включите автоподтверждение email:
   - **Authentication** → **Settings**
   - Найдите **Enable email confirmations**
   - **Отключите** эту опцию (чтобы не нужно было подтверждать email)

---

## 🐳 Шаг 2: Подготовка приложения

### 2.1. Клонирование репозитория

```bash
git clone <your-repository-url>
cd instagram-carousel-creator
```

### 2.2. Настройка переменных окружения

```bash
# Создайте .env файл из примера
cp .env.example .env

# Откройте .env и вставьте ваши Supabase ключи
nano .env
```

Замените значения в `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id
```

---

## 🚢 Шаг 3: Развертывание через Docker

### 3.1. Сборка и запуск

```bash
# Сборка образа и запуск контейнера
docker compose up -d --build
```

Это:
- Соберет React приложение
- Создаст production build
- Запустит Nginx сервер на порту 8080

### 3.2. Проверка работы

```bash
# Проверить статус контейнера
docker compose ps

# Посмотреть логи
docker compose logs -f
```

Откройте браузер: `http://localhost:8080`

### 3.3. Управление контейнером

```bash
# Остановить
docker compose down

# Перезапустить
docker compose restart

# Пересобрать после изменений
docker compose up -d --build
```

---

## 🌐 Шаг 4: Production deployment на сервере

### 4.1. Подготовка сервера

```bash
# Установка Docker на Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
```

### 4.2. Настройка Nginx как reverse proxy (опционально)

Создайте `/etc/nginx/sites-available/carousel`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация конфигурации
sudo ln -s /etc/nginx/sites-available/carousel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3. SSL сертификат с Let's Encrypt

```bash
# Установка certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d yourdomain.com
```

### 4.4. Изменение порта в docker-compose.yml

Для production можно изменить порт или использовать Nginx:

```yaml
services:
  web:
    ports:
      - "8080:80"  # или любой другой порт
```

---

## 🔒 Шаг 5: Безопасность

### 5.1. Настройка RLS политик в Supabase

Все политики уже настроены через `database-init.sql`:
- ✅ Users могут видеть только свои generation_jobs
- ✅ Users могут видеть только свой profile
- ✅ Автоматическое создание profile при регистрации

### 5.2. Переменные окружения

На production сервере используйте:

```bash
# Создайте .env на сервере
export VITE_SUPABASE_URL="https://..."
export VITE_SUPABASE_PUBLISHABLE_KEY="..."
export VITE_SUPABASE_PROJECT_ID="..."

# Или используйте docker-compose с env_file
```

---

## 📊 Шаг 6: Мониторинг и логи

### 6.1. Просмотр логов приложения

```bash
# Логи контейнера
docker compose logs -f web

# Последние 100 строк
docker compose logs --tail=100 web
```

### 6.2. Мониторинг Supabase

В Supabase Dashboard:
- **Database** → **Logs** - логи запросов
- **Authentication** → **Users** - список пользователей
- **Table Editor** → **generation_jobs** - статус генераций

---

## 🔄 Обновление приложения

```bash
# На сервере
cd /path/to/app
git pull origin main

# Пересобрать и перезапустить
docker compose down
docker compose up -d --build
```

---

## 🐛 Решение проблем

### Проблема: "requested path is invalid" при логине

**Решение:**
1. В Supabase Dashboard → Authentication → URL Configuration
2. Добавьте URL вашего приложения в Redirect URLs
3. Убедитесь что Site URL совпадает с URL приложения

### Проблема: Нет доступа к generation_jobs

**Решение:**
1. Убедитесь что пользователь авторизован
2. Проверьте RLS политики в Supabase Dashboard
3. Убедитесь что `user_id` заполняется при создании job

### Проблема: Контейнер не запускается

```bash
# Проверить логи
docker compose logs

# Проверить что порт 8080 свободен
sudo lsof -i :8080

# Пересобрать без кеша
docker compose build --no-cache
docker compose up -d
```

---

## 📝 Checklist развертывания

- [ ] Supabase проект создан
- [ ] База данных инициализирована (database-init.sql)
- [ ] Email auth включен и настроен
- [ ] Redirect URLs добавлены в Supabase
- [ ] .env файл создан и заполнен
- [ ] Docker и Docker Compose установлены
- [ ] Приложение собрано и запущено
- [ ] Доступ по http://localhost:8080 работает
- [ ] Регистрация и логин работают
- [ ] Генерация изображений работает
- [ ] (Production) Домен настроен
- [ ] (Production) SSL сертификат установлен
- [ ] (Production) Firewall настроен

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи Docker: `docker compose logs`
2. Проверьте логи Supabase в Dashboard
3. Убедитесь что все переменные окружения правильные
4. Проверьте что база данных инициализирована

---

## 🎯 Архитектура

```
User Browser
    ↓
Nginx (Docker) :80
    ↓
React App (static files)
    ↓
Supabase API
    ↓
PostgreSQL Database
```

---

## 📄 Файлы конфигурации

- `Dockerfile` - образ приложения
- `docker-compose.yml` - оркестрация контейнеров
- `nginx.conf` - конфигурация веб-сервера
- `database-init.sql` - инициализация БД
- `.env` - переменные окружения (НЕ коммитится)
- `.env.example` - пример переменных

---

**Готово!** 🎉 Ваше приложение развернуто и готово к использованию.
