# Ontology Assistant Backend

Backend API for Ontology Assistant with user authentication and cloud sync.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

3. Set up database:
```bash
npm run db:generate
npm run db:migrate
```

4. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/chat` - Get chat messages
- `POST /api/projects/:id/chat` - Add chat message
- `GET /api/projects/:id/audit` - Get audit logs

### Preferences
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences

### Archetypes
- `GET /api/archetypes` - List imported archetypes
- `POST /api/archetypes` - Import archetype
- `GET /api/archetypes/:id` - Get archetype
- `DELETE /api/archetypes/:id` - Delete archetype

### Sync
- `POST /api/sync` - Batch sync (offline-first)
- `GET /api/sync/full` - Get full sync state

## Production Required Configuration

The following environment variables **must** be set in production. The server will **refuse to start** if they are missing or invalid:

| Variable | Requirement | Fail Behavior |
|----------|-------------|---------------|
| `JWT_SECRET` | Required, ≥ 32 characters | Startup crash with `FATAL` message |
| `CORS_ORIGIN` | Required, no wildcards (`*`) | Startup crash with `FATAL` message |
| `DATABASE_URL` | Required, valid PostgreSQL URL | Prisma connection failure |

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## Security Model

- **Auth:** JWT (access 15min + refresh 7 days) + Argon2id password hashing
- **Ownership:** All project/chat/audit endpoints verify `userId` match before read/write
- **CSRF:** Origin header validation on all state-changing requests
- **Rate Limiting:** Auth endpoints rate-limited (configurable via env)
- **Headers:** Helmet security headers on all responses
- **Sync:** Serializable isolation level for batch sync transactions
- **Demo Mode:** Demo account (`demo@example.com`) is handled server-side only; password never appears in frontend source code

## Tech Stack

- **Framework**: Fastify 5
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Refresh Token
- **Password**: Argon2id
- **Validation**: Zod
