# MillPoint NC Backend API

Backend API for MillPoint NC Program Management System, following Cursor Clause 4.5 Rules.

## 🚀 Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Search**: Meilisearch
- **Storage**: Local filesystem (MinIO optional)
- **Cache**: Redis (Phase 4)

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/                    # API routes and schemas
│   │   ├── programs/           # Program endpoints
│   │   ├── machines/           # Machine endpoints
│   │   ├── setup-sheets/       # Setup sheet endpoints
│   │   └── schemas/            # Zod validation schemas
│   ├── services/               # Business logic layer
│   ├── db/                     # Database layer
│   │   ├── prisma/             # Prisma schema
│   │   ├── migrations/         # SQL migrations
│   │   └── seed.ts             # Database seeding
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Helper utilities
│   ├── types/                  # TypeScript types
│   └── server.ts               # Express server setup
├── templates/                  # Code templates
├── tests/                      # Tests
├── storage/                    # File storage (created on init)
├── docker-compose.yml          # Docker services
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose (for services)
- Git

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Services (PostgreSQL, Meilisearch, Redis)

```bash
docker compose up -d
```

Verify services are running:
```bash
docker compose ps
```

### 3. Setup Database

```bash
# Generate Prisma Client, run migrations, and seed data
npm run db:setup
```

Or run steps individually:
```bash
npm run prisma:generate     # Generate Prisma Client
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Seed initial data
```

### 4. Configure Environment

Copy `.env.example` to `.env` (or use existing `.env`):

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/millpoint_nc?schema=public"
PORT=3001
NODE_ENV=development
STORAGE_PATH=./storage
CORS_ORIGIN=http://localhost:5173
```

### 5. Start Development Server

```bash
npm run dev
```

API will be available at: `http://localhost:3001`

## 📡 API Endpoints

### Health Check
- `GET /health` - Server health status

### Programs
- `GET /api/programs` - List programs (with filtering, search, pagination)
- `GET /api/programs/:id` - Get program details
- `POST /api/programs` - Create program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program
- `POST /api/programs/:id/approve` - Approve/change status
- `GET /api/programs/:id/versions` - Get version history

### Machines
- `GET /api/machines` - List machines
- `GET /api/machines/:id` - Get machine details
- `POST /api/machines` - Create machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `PATCH /api/machines/:id/status` - Update machine status

### Setup Sheets
- `GET /api/setup-sheets?programId=xxx` - List setup sheets for program
- `GET /api/setup-sheets/:id` - Get setup sheet details
- `POST /api/setup-sheets` - Create setup sheet
- `PUT /api/setup-sheets/:id` - Update setup sheet
- `DELETE /api/setup-sheets/:id` - Delete setup sheet
- `POST /api/setup-sheets/:id/approve` - Approve setup sheet

## 🧪 Development

### Run in Watch Mode

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### View Database

```bash
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Reset Database

```bash
npx prisma migrate reset
npm run prisma:seed
```

## 🧩 Database Schema

### Core Models
- **User** - Authentication and authorization
- **NCProgram** - NC program metadata and status
- **Machine** - CNC machines
- **SetupSheet** - Setup instructions with tools, offsets, fixtures, media
- **Tool** - Tool list for setup sheets
- **OriginOffset** - Work coordinate systems (G54, etc.)
- **Fixture** - Fixture information
- **Media** - Images/videos for setup instructions
- **ProgramVersion** - Version history tracking

## 📝 Coding Standards (Clause 4.5)

### Naming Conventions
- **PascalCase**: Types, interfaces, classes
- **camelCase**: Functions, variables, parameters
- **kebab-case**: File names (except components)

### Component Structure
```typescript
/**
 * Service description
 */
export class ProgramService {
  /**
   * Method description
   * @param param - Description
   * @returns Description
   */
  async getPrograms(query: ProgramQueryInput) {
    // Implementation
  }
}
```

### Validation
- Use Zod schemas for all API input/output validation
- Define schemas in `src/api/schemas/`
- Export TypeScript types from schemas

### Error Handling
- Use `AppError` class for operational errors
- Use `asyncHandler` wrapper for route handlers
- Global error handler catches all errors

## 🔧 Utilities

### File Storage
- Local filesystem storage in `./storage/`
- Organized by category: `nc/`, `cad/`, `dxf/`, `media/`, `documents/`, `versions/`
- Version backup support

### Validation Middleware
```typescript
import { validate } from '../middleware/validate';
import { createProgramSchema } from '../api/schemas/program.schema';

router.post('/', validate(createProgramSchema, 'body'), asyncHandler(handler));
```

## 🐳 Docker Services

Start all services:
```bash
docker compose up -d
```

Stop services:
```bash
docker compose down
```

View logs:
```bash
docker compose logs -f
```

Reset all data:
```bash
docker compose down -v
```

## 📦 Seeded Test Data

After running `npm run prisma:seed`, the following test data is available:

### Test Users
- `programmer@millpoint.com` - Hans Jensen (Programmer)
- `quality@millpoint.com` - Mette Nielsen (Quality)
- `operator@millpoint.com` - Lars Andersen (Operator)
- `admin@millpoint.com` - Admin User

### Test Machines
- DMG Mori DMU 50 (Fræsemaskine)
- Haas VF-2 (Fræsemaskine)
- Mazak Integrex i-200 (Drejebænk)
- Okuma MU-6300V (5-akset fræser)
- Sodick AQ537L (EDM)

### Sample Program
- Flange_Face_Mill (P-2024-001) with setup sheet

## 🔐 Security Notes

- Currently no authentication (Phase 1)
- Use temporary `system-user-id` for user actions
- CORS configured for development
- Environment variables for secrets
- Validate all inputs with Zod

## 🚧 TODO (Remaining Phase 1 Tasks)

- [ ] Integrate Meilisearch for fast search
- [ ] Add file upload endpoints
- [ ] Create automated tests
- [ ] Generate API documentation

## 📄 License

ISC

