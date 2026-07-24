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

## 全新数据库部署（Docker）

以下命令适用于全新服务器和空数据目录。生产镜像已包含前端与 Go 后端，无需单独启动前端服务。

### 1. 安装并克隆

```bash
apt-get update && apt-get install -y git ca-certificates curl
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

git clone -b dev/next <仓库地址> /newapi
cd /newapi
```

### 2. 配置

先替换 `docker-compose.yml` 中所有 PostgreSQL 和 Redis 密码，并删除它们的公网端口映射（或绑定到 `127.0.0.1`）。PostgreSQL 密码只在数据库首次初始化时生效。

```bash
mkdir -p /data/armnet/{new-api,logs,db,redis}
cp .env.example .env
chmod 600 .env
openssl rand -hex 32
openssl rand -hex 32
nano .env
```

`.env` 至少包含以下内容，密码须与 `docker-compose.yml` 一致：

```dotenv
PORT=3000
TZ=Asia/Shanghai
SQL_DSN=postgres://armnet_token:<数据库密码>@postgres:5432/armnet_token?sslmode=disable
REDIS_CONN_STRING=redis://default:<Redis密码>@redis:6379/0
SESSION_SECRET=<随机值一>
CRYPTO_SECRET=<随机值二>
BATCH_UPDATE_ENABLED=true
```

建议密码只使用 `openssl rand -hex 24` 生成的十六进制字符，避免 DSN URL 编码问题。

确认关键变量不是注释且已有值，否则应用会回退到 SQLite：

```bash
grep -E '^(SQL_DSN|REDIS_CONN_STRING|SESSION_SECRET|CRYPTO_SECRET)=' .env | sed 's/=.*/=<已配置>/'
```

### 3. 启动并检查数据库

```bash
docker compose up -d postgres redis
docker compose ps
```

确认 PostgreSQL 和 Redis 均为 `healthy` 后再继续。

### 4. 构建前后端

服务器无法访问 `proxy.golang.org` 时，使用临时 Dockerfile 和国内代理构建，不会修改 Git 工作区：

```bash
cp Dockerfile /tmp/new-api.Dockerfile
sed -i "s#RUN go mod download#RUN GOPROXY='https://goproxy.cn|https://mirrors.aliyun.com/goproxy/|direct' go mod download#" /tmp/new-api.Dockerfile
docker build --network=host -f /tmp/new-api.Dockerfile -t new-api:local .
rm -f /tmp/new-api.Dockerfile
docker image inspect new-api:local --format '{{.Id}}'
```

### 5. 启动前后端

```bash
docker run -d \
  --name newapi-app \
  --restart unless-stopped \
  --network new-api-unit \
  --env-file /newapi/.env \
  -p 5170:3000 \
  -v /data/armnet/new-api:/data \
  -v /data/armnet/logs:/app/logs \
  new-api:local --log-dir /app/logs
```

如果重试部署时提示 `newapi-app` 已存在，先保留旧容器再执行上面的启动命令：

```bash
docker stop newapi-app
docker rename newapi-app "newapi-app-backup-$(date +%Y%m%d-%H%M%S)"
```

等待数秒后验证：

```bash
docker ps
docker logs --tail 100 newapi-app
curl -fsS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5170/api/status
```

日志中不应出现 `SQL_DSN not set, using SQLite as database`。返回 `200` 表示应用正常。随后在云服务器安全组中放行入站 TCP `5170`；如果启用了 UFW，再执行：

```bash
ufw allow 5170/tcp
ufw status
```

浏览器访问 `http://<服务器IP>:5170`，按照初始化页面创建管理员，即完成部署。不要向公网开放 `3000`、`5432` 或 `6379`。如果网页无法访问，依次检查：

```bash
ss -lntp | grep 5170
docker ps -a --filter name=newapi-app
docker logs --tail 200 newapi-app
```

---

## Project Notes

For this customized project state, also read:

- `AGENTS.md`
- `docs/README.md`
- `docs/CLAUDE.md`
- `docs/PROJECT_CUSTOMIZATIONS.md`
