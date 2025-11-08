# 📸 Instagram Slide Carousel Creator

Веб-приложение для создания красивых текстовых слайдов для Instagram каруселей с автоматической генерацией фоновых изображений.

## ✨ Возможности

- 🎨 Автоматическое разбиение текста на слайды
- 🖼️ AI-генерация фоновых изображений для каждого слайда
- ⚙️ Гибкая настройка стилей (шрифт, размер, отступы, тени)
- 📱 Адаптивный дизайн для всех устройств
- 🔐 Безопасная аутентификация пользователей
- 💾 Сохранение истории генераций
- 📊 Формат 4:5 (1080×1350) оптимизированный для Instagram

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонировать репозиторий
git clone <YOUR_GIT_URL>
cd instagram-carousel-creator

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактируйте .env и добавьте ваши Supabase ключи

# Запустить dev сервер
npm run dev
```

Откройте [http://localhost:5173](http://localhost:5173)

### Production развертывание

**📖 Полная инструкция в файле [DEPLOYMENT.md](./DEPLOYMENT.md)**

Быстрый запуск через Docker:

```bash
# Настроить .env
cp .env.example .env
nano .env  # добавьте Supabase ключи

# Запустить
docker compose up -d --build

# Приложение доступно на http://localhost:8080
```

## 🛠️ Технологии

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **Deployment**: Docker, Nginx
- **AI**: Lovable AI для генерации изображений

## 📁 Структура проекта

```
.
├── src/
│   ├── components/       # React компоненты
│   ├── pages/           # Страницы приложения
│   ├── lib/             # Утилиты и хелперы
│   ├── hooks/           # Custom React hooks
│   └── integrations/    # Supabase интеграция
├── supabase/
│   └── migrations/      # Миграции БД
├── public/              # Статические файлы
├── Dockerfile           # Docker образ
├── docker-compose.yml   # Docker оркестрация
├── nginx.conf           # Nginx конфигурация
├── database-init.sql    # Инициализация БД
└── DEPLOYMENT.md        # Полная инструкция
```

## 🔑 Переменные окружения

Создайте `.env` файл (см. `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Получите ключи из Supabase Dashboard → Project Settings → API

## 📖 Использование

1. **Войдите или зарегистрируйтесь** (при первом заходе можно просматривать без авторизации)
2. **Вставьте текст** в текстовое поле (разделяйте параграфы пустой строкой)
3. **Настройте стили** (шрифт, размер, отступы, цвет)
4. **Нажмите "Update Slides"** для создания слайдов
5. **"Generate All Images"** для AI-генерации фонов
6. **Используйте заголовки**: оберните текст в `**заголовок**` для увеличенного размера
7. **Сохраните изображения** долгим нажатием на слайд

## 🔒 Безопасность

- ✅ Row Level Security (RLS) включен для всех таблиц
- ✅ Пользователи видят только свои данные
- ✅ Аутентификация через Supabase Auth
- ✅ Защищенные API endpoints
- ✅ Автоматическое создание профилей пользователей

## 📊 База данных

### Таблицы

- **profiles** - профили пользователей
- **generation_jobs** - история генераций изображений

Инициализация: запустите `database-init.sql` в Supabase SQL Editor

## 🐛 Решение проблем

### Ошибка при логине "requested path is invalid"

В Supabase Dashboard → Authentication → URL Configuration добавьте URL вашего приложения в Redirect URLs

### Не видно generation_jobs

Убедитесь что:
- Пользователь авторизован
- RLS политики применены (запустите database-init.sql)
- user_id заполняется при создании job

### Docker контейнер не запускается

```bash
docker compose logs  # смотрим логи
docker compose down
docker compose up -d --build  # пересобираем
```

## 📝 Команды разработки

```bash
# Разработка
npm run dev           # Dev сервер на :5173
npm run build         # Production сборка
npm run preview       # Просмотр production build

# Docker
docker compose up -d           # Запуск
docker compose down            # Остановка
docker compose logs -f         # Логи
docker compose up -d --build   # Пересборка
```

## 🌐 Production чеклист

- [ ] Настроить Supabase проект
- [ ] Запустить database-init.sql
- [ ] Настроить Redirect URLs в Supabase
- [ ] Создать .env с production ключами
- [ ] Настроить домен и SSL
- [ ] Запустить через Docker
- [ ] Протестировать регистрацию и генерацию

**Полная инструкция: [DEPLOYMENT.md](./DEPLOYMENT.md)**

## 🎨 Разработка в Lovable

**Project URL**: https://lovable.dev/projects/d0d2583c-80da-4d85-a1ab-185d98c03787

Изменения через Lovable автоматически коммитятся в этот репозиторий.

## 📄 Лицензия

MIT

---

**Создано с использованием [Lovable](https://lovable.dev)** 💜
