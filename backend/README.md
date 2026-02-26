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

## Tech Stack

- **Framework**: Fastify
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Refresh Token
- **Password**: Argon2id
- **Validation**: Zod
