# Phase 1 Setup Guide
**MillPoint NC Program Management - Core Repository**

This guide will help you set up and run the Phase 1 implementation of the MillPoint NC system.

## 📋 Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **Git**
- **Windows** (PowerShell)

## 🚀 Quick Start

### 1. Clone and Install

```powershell
# Navigate to project directory
cd C:\Users\Psypox-DAW\Curser\millpoint-nc

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start Backend Services

```powershell
# Start PostgreSQL, Meilisearch, and Redis
cd backend
docker compose up -d

# Verify services are running
docker compose ps
```

Expected output:
```
millpoint-postgres      Up (healthy)
millpoint-meilisearch   Up (healthy)
millpoint-redis         Up (healthy)
```

### 3. Setup Database

```powershell
# Generate Prisma Client, run migrations, and seed data
npm run db:setup
```

This will:
- Generate Prisma Client
- Create database schema
- Seed test data (users, machines, programs)
- Index programs in Meilisearch

### 4. Start Backend API

```powershell
# In backend directory
npm run dev
```

API will be available at: `http://localhost:3001`

You should see:
```
✅ File storage initialized
✅ Meilisearch: Connected to existing programs index
🚀 MillPoint NC Backend API
📡 Server running on http://localhost:3001
```

### 5. Start Frontend

Open a new terminal:

```powershell
# Navigate to frontend
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🧪 Verify Installation

### Test Backend API

Open browser to: `http://localhost:3001/health`

Expected response:
```json
{
  "success": true,
  "message": "MillPoint NC API is running",
  "timestamp": "2025-10-30T...",
  "environment": "development"
}
```

### Test Programs Endpoint

```powershell
# Get all programs
curl http://localhost:3001/api/programs

# Get machines
curl http://localhost:3001/api/machines

# Search programs
curl "http://localhost:3001/api/programs?search=flange"
```

### View Database

```powershell
cd backend
npm run prisma:studio
```

Opens Prisma Studio at `http://localhost:5555` - browse and edit database data visually.

## 📊 Test Data

After seeding, you'll have:

### Test Users
- `programmer@millpoint.com` - Hans Jensen (Programmer)
- `quality@millpoint.com` - Mette Nielsen (Quality)
- `operator@millpoint.com` - Lars Andersen (Operator)
- `admin@millpoint.com` - Admin User

### Test Machines
- DMG Mori DMU 50 (Fræsemaskine) - Online
- Haas VF-2 (Fræsemaskine) - Online
- Mazak Integrex i-200 (Drejebænk) - Offline
- Okuma MU-6300V (5-akset fræser) - Online
- Sodick AQ537L (EDM) - Maintenance

### Sample Program
- **Flange_Face_Mill** (P-2024-001)
  - Status: Released
  - Customer: Vestas Wind Systems
  - Machine: DMG Mori DMU 50
  - Has setup sheet with tools, fixtures, and safety checklist

## 📁 Project Structure

```
millpoint-nc/
├── backend/                   # Express API
│   ├── src/
│   │   ├── api/              # API routes and schemas
│   │   ├── services/         # Business logic
│   │   ├── db/               # Prisma schema and seed
│   │   ├── middleware/       # Error handling, validation
│   │   ├── utils/            # File storage
│   │   └── server.ts         # Express setup
│   ├── storage/              # File storage (created on init)
│   ├── docker-compose.yml    # Services config
│   └── package.json
│
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── api/              # API client
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript types
│   │   └── data/             # Mock data (fallback)
│   └── package.json
│
└── plans/                     # Documentation
    ├── README.md              # Technical plan
    └── EXECUTIVE-SUMMARY-DA.md # Danish summary
```

## 🔧 Development Workflow

### Backend Development

```powershell
# Watch mode (auto-reload on changes)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Reset database
npx prisma migrate reset
npm run prisma:seed
```

### Frontend Development

```powershell
# Dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### View Logs

```powershell
# Backend API logs
cd backend
# (logs show in terminal where npm run dev is running)

# Docker service logs
docker compose logs -f postgres
docker compose logs -f meilisearch
```

## 🛠️ Troubleshooting

### Port Already in Use

**Backend (3001)**:
```powershell
# Find process using port
netstat -ano | findstr :3001
# Kill process
taskkill /PID <PID> /F
```

**Frontend (5173)**:
```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**PostgreSQL (5432)**:
```powershell
docker compose down
docker compose up -d postgres
```

### Database Connection Issues

```powershell
# Check PostgreSQL is running
docker compose ps postgres

# Restart PostgreSQL
docker compose restart postgres

# View PostgreSQL logs
docker compose logs postgres
```

### Prisma Client Not Generated

```powershell
cd backend
npx prisma generate
```

### Frontend Can't Connect to API

1. Check backend is running: `http://localhost:3001/health`
2. Check `.env` file exists in frontend:
   ```
   VITE_API_URL=http://localhost:3001
   ```
3. Restart frontend dev server

### Meilisearch Issues

```powershell
# Restart Meilisearch
docker compose restart meilisearch

# View logs
docker compose logs meilisearch

# Re-index programs
cd backend
npm run prisma:seed
```

### Clear Everything and Start Fresh

```powershell
# Stop all services
cd backend
docker compose down -v

# Delete node_modules
cd backend
Remove-Item -Recurse -Force node_modules
cd ../frontend
Remove-Item -Recurse -Force node_modules

# Reinstall and restart
cd ../backend
npm install
docker compose up -d
npm run db:setup
npm run dev

# In new terminal
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

### Health
- `GET /health` - Server status

### Programs
- `GET /api/programs` - List programs
- `GET /api/programs/:id` - Get program
- `POST /api/programs` - Create program
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program
- `POST /api/programs/:id/approve` - Update status
- `GET /api/programs/:id/versions` - Version history

### Machines
- `GET /api/machines` - List machines
- `GET /api/machines/:id` - Get machine
- `POST /api/machines` - Create machine
- `PUT /api/machines/:id` - Update machine
- `DELETE /api/machines/:id` - Delete machine
- `PATCH /api/machines/:id/status` - Update status

### Setup Sheets
- `GET /api/setup-sheets?programId=xxx` - List by program
- `GET /api/setup-sheets/:id` - Get setup sheet
- `POST /api/setup-sheets` - Create setup sheet
- `PUT /api/setup-sheets/:id` - Update setup sheet
- `DELETE /api/setup-sheets/:id` - Delete setup sheet
- `POST /api/setup-sheets/:id/approve` - Approve

## 🎯 What's Implemented (Phase 1)

✅ **Backend**
- Express API with TypeScript
- PostgreSQL database with Prisma ORM
- Zod validation schemas
- File storage service
- Meilisearch integration
- Version control for programs
- Basic approval workflow
- Error handling middleware

✅ **Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS styling
- API client with hooks
- Program list with filtering
- Machine view
- Setup sheet preview
- Danish localization

✅ **Infrastructure**
- Docker Compose for services
- Database migrations
- Seed data script
- Development tooling

## 📝 Next Steps (Phase 2)

- [ ] React Native mobile app for setup sheets
- [ ] Camera integration for media capture
- [ ] Offline-first sync
- [ ] Kiosk mode for shop floor

## 📚 Documentation

- **Technical Plan**: `plans/README.md`
- **Danish Summary**: `plans/EXECUTIVE-SUMMARY-DA.md`
- **Backend README**: `backend/README.md`
- **Coding Rules**: `.cursor/rules/4.5-rules.md`

## 🔐 Security Notes

⚠️ **Development Only**
- No authentication implemented yet
- Default passwords in docker-compose.yml
- CORS open to localhost
- Don't use in production!

## 💡 Tips

1. **Always start backend services first** (docker-compose up -d)
2. **Run db:setup after first clone** (creates schema + seed data)
3. **Use Prisma Studio** to inspect/edit database
4. **Check docker-compose logs** if services fail
5. **Frontend auto-connects** to backend via .env

## ✅ Success Checklist

- [ ] Docker services running (postgres, meilisearch, redis)
- [ ] Backend API responds at :3001/health
- [ ] Prisma Studio opens at :5555
- [ ] Frontend loads at :5173
- [ ] Programs list shows sample data
- [ ] Machines view displays 5 machines
- [ ] No console errors in browser/terminal

## 🆘 Need Help?

1. Check this guide's Troubleshooting section
2. Review logs in terminal and Docker
3. Verify all prerequisites are installed
4. Try "Clear Everything" steps above

---

**Phase 1 Status**: ✅ Core Repository Complete

**Estimated Setup Time**: 10-15 minutes

**Last Updated**: October 30, 2025

