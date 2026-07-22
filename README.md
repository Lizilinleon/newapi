## Current Development Startup

This repository is based on `QuantumNous/new-api`. The current recommended local development flow is:

- backend dependencies and backend service via Docker
- frontend via Bun
- default frontend only unless classic debugging is specifically needed

### 1. Start backend and dependencies

```bash
docker compose -f docker-compose.dev.yml up -d
```

Backend default address:

```text
http://localhost:3000
```

If Go backend code changes, rebuild the backend container:

```bash
docker compose -f docker-compose.dev.yml up -d --build new-api
```

Stop local dev environment:

```bash
docker compose -f docker-compose.dev.yml down
```

If you also want to reset local data volumes:

```bash
docker compose -f docker-compose.dev.yml down -v
```

### 2. Start the default frontend

```bash
cd web/default
bun install
bun run dev -- --host 0.0.0.0 --port 5173
```

Default frontend address:

```text
http://localhost:5173
```

Frontend-only mode is useful for public-page and layout debugging. API-backed pages still need the
backend service above.

### 3. Optional make commands

If `make` is available locally:

```bash
make dev-api
make dev-web
```

Notes:

- `make dev-api` starts Docker backend, PostgreSQL, and Redis
- `make dev-web` starts frontend development service

### 4. Common local config

Development environment configuration is in `docker-compose.dev.yml`:

- `SQL_DSN=postgresql://root:123456@postgres:5432/new-api`
- `REDIS_CONN_STRING=redis://redis`
- `TZ=Asia/Shanghai`
- `BATCH_UPDATE_ENABLED=true`

If you need to fully reset local development data:

```bash
docker compose -f docker-compose.dev.yml down -v
```

---

## Server Deployment (Docker, Recommended)

The following example builds the current repository on a 64-bit Linux server and uses SQLite for a
simple single-node deployment. Install Git and Docker Engine first. For a multi-node or high-traffic
deployment, use PostgreSQL or MySQL plus Redis instead of SQLite.

### 1. Clone and build

```bash
git clone <your-repository-url> new-api
cd new-api
docker build -t new-api:local .
```

The production image includes both the Go backend and the compiled default frontend.

### 2. Prepare persistent data and secrets

```bash
mkdir -p data
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
```

Edit `.env` and set at least the following values. Use the two different random values printed above.
The `.env` file is ignored by Git; keep it private and never commit its secrets:

```dotenv
SESSION_SECRET=replace-with-the-first-random-value
CRYPTO_SECRET=replace-with-the-second-random-value
TZ=Asia/Shanghai
```

### 3. Start the service

```bash
docker run -d \
  --name new-api \
  --restart unless-stopped \
  --env-file .env \
  -p 127.0.0.1:3000:3000 \
  -v "$(pwd)/data:/data" \
  new-api:local
```

Check the container and local HTTP endpoint:

```bash
docker logs --tail 100 new-api
curl -I http://127.0.0.1:3000
```

The application data is stored in `./data`. Back up this directory regularly. On the first visit,
open the site in a browser and follow the initialization page to create the administrator account.

### 4. Configure an HTTPS reverse proxy

Keep port `3000` bound to localhost and expose the service through Nginx. Replace `api.example.com`
with your domain:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }
}
```

After the domain resolves to the server, enable HTTPS with your preferred certificate tool (for
example, Certbot). Only ports `80` and `443` need to be publicly accessible; do not expose the
database, Redis, or port `3000` to the internet.

### 5. Update the deployment

```bash
git pull --ff-only
docker build -t new-api:local .
docker stop new-api
docker rm new-api
docker run -d \
  --name new-api \
  --restart unless-stopped \
  --env-file .env \
  -p 127.0.0.1:3000:3000 \
  -v "$(pwd)/data:/data" \
  new-api:local
```

The bind-mounted `./data` directory is preserved when the container is replaced. Back it up before
upgrading, and review release notes for any migration-specific instructions.

---

## 指定服务器部署（前后端）

本节用于将当前 `dev/next` 分支部署到服务器 `122.51.35.238`。主站使用端口 `5170`，项目文档站使用端口 `5171`，均位于服务器可用的 `5170-5180` 端口范围内。

生产镜像会在构建阶段完成默认前端和 classic 前端的 Bun 构建，然后编译 Go 后端，并将前端资源嵌入后端程序。因此主站前后端只需运行一个 `new-api` 容器，不需要在服务器上另外启动前端开发服务器。

| 服务 | 公网地址 | 用途 |
|------|----------|------|
| New API 主站 | `http://122.51.35.238:5170` | 前端页面、管理后台和 API |
| 项目文档站 | `http://122.51.35.238:5171` | `docs-site` 文档 |
| PostgreSQL | 不对公网开放 | 业务数据库 |
| Redis | 不对公网开放 | 缓存和同步 |

### 1. 登录服务器

```bash
ssh root@122.51.35.238
```

SSH 密码请在终端提示时输入，不要把服务器密码写进 README、脚本、Git 提交或命令行参数。如果服务器的 SSH 端口不是默认的 `22`，请使用 `ssh -p <SSH端口> root@122.51.35.238`；`5170-5180` 是应用端口范围，不是 SSH 端口。

### 2. 安装 Git 和 Docker

以下命令适用于 Ubuntu/Debian：

```bash
apt-get update
apt-get install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version
docker compose version
```

如果服务器已经安装 Docker 和 Docker Compose，可以跳过此步骤。

### 3. 克隆项目

```bash
mkdir -p /opt/armnet
cd /opt/armnet
git clone -b dev/next <仓库地址> newapi
cd newapi
```

如果 `/opt/armnet/newapi` 已经存在，不要重复克隆，直接更新：

```bash
cd /opt/armnet/newapi
git pull --ff-only
```

### 4. 准备数据目录和应用配置

```bash
mkdir -p /data/armnet/app
mkdir -p /data/armnet/db
mkdir -p /data/armnet/redis
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
```

编辑应用配置：

```bash
nano .env
```

至少设置以下内容。两个密钥分别使用上面生成的两个随机值；数据库和 Redis 连接密码必须与 `docker-compose.yml` 中的配置保持一致：

```dotenv
PORT=3000
TZ=Asia/Shanghai
SQL_DSN=postgres://armnet_token:<数据库密码>@postgres:5432/armnet_token?sslmode=disable
REDIS_CONN_STRING=redis://default:<Redis密码>@redis:6379/0
SESSION_SECRET=<第一个随机值>
CRYPTO_SECRET=<第二个随机值>
BATCH_UPDATE_ENABLED=true
ERROR_LOG_ENABLED=true
```

`SQL_DSN` 中如果使用包含 `@`、`:`、`/`、`?` 或 `#` 的密码，需要先进行 URL 编码。为了便于配置，可使用 `openssl rand -hex 24` 生成只包含十六进制字符的数据库和 Redis 密码。正式部署前应同时替换 `docker-compose.yml` 中已经写入的旧密码，确保 Compose 和 `.env` 使用相同的新值。

### 5. 启动 PostgreSQL、Redis 和文档站

```bash
cd /opt/armnet/newapi
docker compose up -d --build postgres redis docs
docker compose ps
```

确认 PostgreSQL 和 Redis 已正常启动：

```bash
docker exec newapi-postgres pg_isready -U armnet_token -d armnet_token
docker exec newapi-redis redis-cli -a '<Redis密码>' ping
curl -I http://127.0.0.1:5171
```

不要在命令中直接填写服务器登录密码。这里的 `<Redis密码>` 指 Redis 服务密码。

### 6. 构建包含前后端的生产镜像

```bash
cd /opt/armnet/newapi
docker build -t armnet-new-api:local .
```

该命令会在 Docker 构建环境中安装 Bun 和 Go 依赖、编译两个前端，并构建后端二进制文件。首次构建需要下载依赖，耗时会相对较长。

### 7. 启动主站前后端

```bash
docker run -d \
  --name new-api \
  --restart unless-stopped \
  --network new-api-unit \
  --env-file /opt/armnet/newapi/.env \
  -p 5170:3000 \
  -v /data/armnet/app:/data \
  armnet-new-api:local
```

检查运行状态：

```bash
docker ps
docker logs --tail 100 new-api
curl http://127.0.0.1:5170/api/status
```

部署完成后访问：

```text
主站：http://122.51.35.238:5170
文档：http://122.51.35.238:5171
```

首次访问主站时，按照初始化页面的提示创建管理员账户。服务器安全组或防火墙需要放行 TCP `5170` 和 `5171`，不需要向公网开放 `3000`、`5432` 或 `6379`。

### 8. 更新部署

```bash
cd /opt/armnet/newapi
git pull --ff-only

docker compose up -d --build postgres redis docs
docker build -t armnet-new-api:local .

docker stop new-api
docker rm new-api
docker run -d \
  --name new-api \
  --restart unless-stopped \
  --network new-api-unit \
  --env-file /opt/armnet/newapi/.env \
  -p 5170:3000 \
  -v /data/armnet/app:/data \
  armnet-new-api:local

docker logs --tail 100 new-api
curl http://127.0.0.1:5170/api/status
```

更新容器不会删除 `/data/armnet/app`、`/data/armnet/db` 和 `/data/armnet/redis` 中的持久化数据。升级前仍应备份这些目录，并检查版本发布说明中是否包含额外的数据库迁移要求。

### 9. 常用运维命令

```bash
# 查看所有相关容器
docker ps

# 实时查看主站日志
docker logs -f --tail 100 new-api

# 重启主站
docker restart new-api

# 重启数据库、Redis 和文档站
cd /opt/armnet/newapi
docker compose restart postgres redis docs

# 停止主站
docker stop new-api
```

---

## Project Notes

For this customized project state, also read:

- `AGENTS.md`
- `docs/README.md`
- `docs/CLAUDE.md`
- `docs/PROJECT_CUSTOMIZATIONS.md`
