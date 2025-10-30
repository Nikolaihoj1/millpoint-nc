# Quick Start Without Docker

**For immediate testing when Docker is not available**

This setup uses SQLite instead of PostgreSQL and skips Meilisearch. Perfect for quick testing!

## 🚀 Quick Setup

```powershell
# 1. Navigate to backend
cd C:\Users\Psypox-DAW\Curser\millpoint-nc\backend

# 2. Copy the local environment file
Copy-Item .env.local .env -Force

# 3. Setup database (SQLite)
npm run db:setup

# 4. Start backend
npm run dev
```

## ✅ What's Different

- ✅ **SQLite** instead of PostgreSQL (file-based database)
- ⚠️ **No Meilisearch** (search will be slower but works)
- ✅ **No Docker required**
- ✅ **Everything else works the same**

## 🧪 Test It

Backend should start at: `http://localhost:3001`

Test:
```powershell
curl http://localhost:3001/health
```

## 🎯 When You Have Docker

Later, when you install Docker Desktop, you can switch to the full setup:

```powershell
# 1. Switch back to PostgreSQL
Copy-Item .env.example .env -Force

# 2. Start Docker services
docker compose up -d

# 3. Reset database
npm run db:setup

# 4. Restart backend
npm run dev
```

## 📝 Note

SQLite is perfect for development and testing but has some limitations:
- Single-user (not concurrent)
- No advanced search (Meilisearch disabled)
- Fine for Phase 1 testing!

The frontend and all API endpoints work exactly the same! 🎉


