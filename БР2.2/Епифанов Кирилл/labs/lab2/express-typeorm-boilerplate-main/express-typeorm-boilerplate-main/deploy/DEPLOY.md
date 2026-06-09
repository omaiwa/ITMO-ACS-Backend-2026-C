# ЛР4: Развёртывание на удалённом сервере

Ручной деплой микросервисного API (Docker Compose + host nginx reverse proxy).

## Архитектура

```
Internet → host nginx :80 → Docker gateway nginx :8080 (localhost) → микросервисы
```

- **Внутренний gateway** (контейнер `gateway`) — маршрутизация `/api/*` между сервисами (ЛР3).
- **Внешний nginx** (на хосте) — публичный HTTP-доступ (ЛР4).

## Требования к серверу

| Параметр | Значение |
|----------|----------|
| ОС | Ubuntu 22.04 / 24.04 LTS |
| RAM | ≥ 2 GB |
| Открытые порты | 22 (SSH), 80 (HTTP) |
| ПО | Docker, Docker Compose plugin, nginx, git, ufw |

Заполните перед деплоем:

```
SERVER_IP=
SSH_USER=ubuntu
DEPLOY_PATH=/opt/rental-api
GIT_REPO_URL=
```

---

## Часть 1 — Предварительная настройка сервера

### 1.1 Подключение по SSH

```bash
ssh -i /path/to/key.pem ubuntu@<SERVER_IP>
```

### 1.2 Установка зависимостей

Скопируйте репозиторий на сервер или клонируйте, затем выполните:

```bash
cd <DEPLOY_PATH>
sudo bash deploy/server-setup.sh
```

Скрипт установит Docker, nginx, git, ufw и откроет порты 22 и 80.

**Важно:** после добавления в группу `docker` перелогиньтесь:

```bash
exit
ssh ubuntu@<SERVER_IP>
```

---

## Часть 2 — Развёртывание приложения

### 2.1 Клонирование репозитория

```bash
sudo mkdir -p /opt/rental-api
sudo chown "$USER":"$USER" /opt/rental-api
git clone <GIT_REPO_URL> /opt/rental-api
cd /opt/rental-api
```

Если проект лежит в подпапке монорепозитория, перейдите в каталог с `docker-compose.yml`:

```bash
cd "БР2.2/Епифанов Кирилл/labs/lab2/express-typeorm-boilerplate-main/express-typeorm-boilerplate-main"
```

### 2.2 Создание production `.env`

```bash
cp .env.production.example .env
nano .env   # замените все CHANGE_ME на сильные случайные значения
```

Пример генерации секретов:

```bash
openssl rand -hex 32   # для JWT_SECRET_KEY и INTERNAL_SERVICE_TOKEN
openssl rand -hex 16   # для POSTGRES_PASSWORD
```

### 2.3 Запуск стека

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build
```

Или через npm:

```bash
npm run start:prod
```

### 2.4 Проверка контейнеров

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

Все сервисы должны быть в состоянии `running`, `auth` и `user` — `healthy`.

Проверка gateway на localhost:

```bash
curl -s http://127.0.0.1:8080/health
# {"status":"ok"}
```

---

## Часть 3 — nginx reverse proxy (на хосте)

### 3.1 Установка конфигурации

```bash
sudo cp deploy/nginx/rental-api.conf /etc/nginx/sites-available/rental-api
sudo ln -sf /etc/nginx/sites-available/rental-api /etc/nginx/sites-enabled/rental-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 3.2 Проверка снаружи

С локальной машины:

```bash
curl -s http://<SERVER_IP>/health
# {"status":"ok"}

curl -s -o /dev/null -w "%{http_code}\n" http://<SERVER_IP>/api/health
# 200
```

### 3.3 Тест API — регистрация пользователя

```bash
curl -s -X POST http://<SERVER_IP>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","email":"test@example.com","password":"password123"}'
```

Ожидается ответ с `accessToken` или сообщение об ошибке валидации (если пользователь уже существует).

---

## Часть 4 — Безопасность (production override)

`docker-compose.prod.yml` обеспечивает:

- PostgreSQL и RabbitMQ **не** публикуются на `0.0.0.0`
- Docker gateway слушает только `127.0.0.1:8080` (доступен через host nginx)

Проверка с внешней машины — порты должны быть закрыты:

```bash
nc -zv <SERVER_IP> 15432   # Connection refused / timed out
nc -zv <SERVER_IP> 5672    # Connection refused / timed out
nc -zv <SERVER_IP> 15672   # Connection refused / timed out
```

---

## Обновление приложения

```bash
cd /opt/rental-api
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env up -d --build
```

---

## Устранение неполадок

| Симптом | Действие |
|---------|----------|
| `502 Bad Gateway` от nginx | `docker compose ps` — дождитесь `healthy`; `curl http://127.0.0.1:8080/health` |
| Контейнеры не стартуют | `docker compose logs <service>` |
| `permission denied` для docker | `newgrp docker` или перелогиньтесь |
| nginx config error | `sudo nginx -t` |

Просмотр логов:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f gateway
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f user
```

---

## Чеклист для отчёта

- [ ] Скриншот `docker compose ps` — все сервисы running/healthy
- [ ] Скриншот `sudo nginx -t` — syntax is ok
- [ ] Скриншот `curl http://<SERVER_IP>/health` с локальной машины
- [ ] Скриншот успешного `POST /api/auth/register` или `POST /api/auth/login`
- [ ] Подтверждение: порты 15432, 5672, 15672 недоступны снаружи
- [ ] Описание шагов: установка Docker/nginx, клонирование, `.env`, `docker compose up`, nginx config

---

## Опционально: HTTPS (если есть домен)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

После получения сертификата обновите `server_name` в `/etc/nginx/sites-available/rental-api`.
