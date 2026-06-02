# Docker Setup — AN-NADJAH

Production-ready Docker infrastructure for the AN-NADJAH school management platform.

## Architecture

```
┌──────────────────────────────────────────────────┐
│                   Docker Host                      │
│  ┌──────────────────────────────────────────────┐ │
│  │        Next.js App Container                  │ │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────┐  │ │
│  │  │  Next.js │  │ Prisma   │  │  Health     │  │ │
│  │  │  Server  │  │ Client   │  │  Check      │  │ │
│  │  └─────────┘  └──────────┘  └────────────┘  │ │
│  └──────────────────────────────────────────────┘ │
│                          │                         │
│               ┌──────────┴──────────┐              │
│               │  Neon PostgreSQL     │              │
│               │  (External SaaS)     │              │
│               └─────────────────────┘              │
└──────────────────────────────────────────────────┘
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) >= 24
- [Docker Compose](https://docs.docker.com/compose/install/) >= 2.20
- [Neon PostgreSQL](https://neon.tech) database URL

## Quick Start

### 1. Environment Variables

Create a `.env` file in the project root (or use the existing one):

```bash
DATABASE_URL="postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-secret-key"
```

### 2. Build & Run (Production)

```bash
# From project root — build and start
npm run docker:build

# Start the container
npm run docker:up

# View logs
npm run docker:logs

# Stop the container
npm run docker:down
```

### 3. Development Mode

```bash
# Start with hot-reload
docker compose --profile development up

# Or use the full development stack
docker compose --profile development up app-dev
```

## File Structure

```
docker/
├── Dockerfile          # Multi-stage production build
├── docker-compose.yml  # Service orchestration
├── .dockerignore       # Build context exclusions
└── README.md           # This file
```

## Dockerfile Stages

| Stage     | Purpose                                  | Size  |
|-----------|------------------------------------------|-------|
| `deps`    | Install all dependencies                 | Large |
| `builder` | Generate Prisma client & build Next.js   | Large |
| `runner`  | Minimal production image (default target) | Small |

## Configuration

### Ports

| Service | Default Port | Override               |
|---------|-------------|------------------------|
| App     | 3000        | `APP_PORT` env variable |

### Profiles

| Profile       | Service       | Use Case                    |
|---------------|---------------|-----------------------------|
| `production`  | `app`         | Production deployment       |
| `development` | `app` / `app-dev` | Local development with hot-reload |

## Commands

```bash
# Build production image
npm run docker:build

# Start services
npm run docker:up

# Stop services
npm run docker:down

# Tail logs
npm run docker:logs

# Manual builds
docker compose -f docker/docker-compose.yml build app
docker compose -f docker/docker-compose.yml up app
docker compose -f docker/docker-compose.yml down
```

## Health Checks

The app container includes a health check that pings `/api/auth/me` every 30 seconds. The container is considered healthy after a 40-second startup grace period and 3 consecutive successful checks.

## Best Practices

1. **Never commit `.env` files** containing real secrets to version control
2. **Use Docker secrets** or a secrets manager for production secrets
3. **Set memory limits** in production: `docker compose up --memory="1g"` 
4. **Monitor logs** via `docker:logs` or your logging aggregator
5. **Database migrations**: Run `npx prisma db push` inside the container or as a one-off command
6. **Prisma Studio**: `docker exec -it annadjah-app npx prisma studio`

## Troubleshooting

| Problem                          | Solution                                      |
|----------------------------------|-----------------------------------------------|
| Container exits immediately      | Check `docker logs annadjah-app`              |
| Database connection refused      | Verify `DATABASE_URL` in `.env`               |
| Prisma client not found          | Ensure `npx prisma generate` ran in builder   |
| Port 3000 already in use         | Set `APP_PORT=3001` in `.env`                 |
| Health check failing             | Ensure app starts within 40s (check logs)     |
