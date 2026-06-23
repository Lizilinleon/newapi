## 当前启动方式

本仓库基于 `QuantumNous/new-api`，当前推荐使用 Docker 启动后端依赖与后端服务，使用 Bun 启动默认前端。

### 1. 启动后端与依赖

```bash
docker compose -f docker-compose.dev.yml up -d
```

后端默认地址：

```text
http://localhost:3000
```

如果修改了 Go 后端代码，需要重建后端容器：

```bash
docker compose -f docker-compose.dev.yml up -d --build new-api
```

停止本地开发环境：

```bash
docker compose -f docker-compose.dev.yml down
```

如需连同数据库卷一起清理：

```bash
docker compose -f docker-compose.dev.yml down -v
```

### 2. 启动默认前端

```bash
cd web
bun install
cd default
bun run dev -- --host 0.0.0.0 --port 5173
```

默认前端地址：

```text
http://localhost:5173
```

### 3. 可选：使用 make 命令

如果本机有 `make`：

```bash
make dev-api
make dev-web
```

其中：

- `make dev-api` 启动 Docker 后端、PostgreSQL、Redis。
- `make dev-web` 启动默认前端与 classic 前端。
- 默认前端：`http://localhost:5173`
- classic 前端：`http://localhost:5174`

### 4. 常用配置

开发环境配置在 `docker-compose.dev.yml`：

- `SQL_DSN=postgresql://root:123456@postgres:5432/new-api`
- `REDIS_CONN_STRING=redis://redis`
- `TZ=Asia/Shanghai`
- `BATCH_UPDATE_ENABLED=true`

本地默认开发数据使用 Docker volume 保存；需要重置时执行：

```bash
docker compose -f docker-compose.dev.yml down -v
```

---
