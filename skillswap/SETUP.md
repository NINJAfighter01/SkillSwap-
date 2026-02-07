# SkillSwap Peer-to-Peer Learning Platform - Complete Setup Guide

## Prerequisites

- **Node.js** v14+ (recommend v16+)
- **npm** v6+
- **MySQL** or **SQLite** (project uses SQLite by default)
- **Git** (for version control)
- **VS Code** (recommended editor)

## Step-by-Step Installation

### Step 1: Backend Setup

#### 1.1 Install Backend Dependencies

```bash
cd c:\Users\Asus\Documents\69\skillswap\backend
npm install
```

#### 1.2 Create Environment Configuration

Create `.env` file in backend root:

```env
# Database Configuration
DATABASE_URL=sqlite:./database.db
DB_DIALECT=sqlite

# Server Configuration
PORT=5000
NODE_ENV=development

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# API Configuration
FRONTEND_URL=http://localhost:3001
```

#### 1.3 Initialize Database

```bash
# Sync all models to database
npm run db:sync

# Or if you want to reset:
npm run db:reset
```

#### 1.4 Seed Sample Data

```bash
# Populate with 27 skills and 5 mentor users
npm run seed
```

You'll see output like:

```
🌱 Starting database seeding...
✅ Created 27 skills
✅ Created 5 mentor users
✅ Assigned skills to mentors
🎉 Database seeding completed successfully!
```

#### 1.5 Start Backend Server

```bash
npm run dev
```

Expected output:

```
Server running on port 5000
Database connected successfully
```

**Server accessible at:** `http://localhost:5000`

---

### Step 2: Frontend Setup

#### 2.1 Install Frontend Dependencies

```bash
cd c:\Users\Asus\Documents\69\skillswap\frontend
npm install
```

#### 2.2 Create Environment Configuration

Create `.env` file in frontend root:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=SkillSwap
```

#### 2.3 Start Development Server

```bash
npm run dev
```

Expected output:

```
VITE v4.x.x ready in 500 ms

➜  Local:   http://localhost:5001
➜  Press h to show help
```

**Application accessible at:** `http://localhost:3001`

---

## Verify Installation

### Backend Health Check

```bash
curl http://localhost:5000/health
# or navigate to http://localhost:5000 in browser
```

### Frontend Load

- Open `http://localhost:3001` in browser
- Should show SkillSwap landing page
- If not authenticated, redirect to login

### Database Verification

```bash
# Check if database file exists
cd backend
ls -la | grep database.db

# Or verify in SQLite:
sqlite3 database.db ".tables"
# Should show: Users, Skills, UserSkills, Sessions, Reviews, Ratings, etc.
```

---

## First-Time Use

### 1. Login with Test Account

**Sample Mentor Account (After Seeding):**

- Email: `john.dev@skillswap.com`
- Password: `password123`

**Other Test Accounts:**

- `sarah.design@skillswap.com` - UI/UX Designer
- `mike.fitness@skillswap.com` - Fitness Trainer
- `alex.music@skillswap.com` - Music Instructor
- `emma.languages@skillswap.com` - Language Teacher

### 2. Explore Features

**As Learner:**

1. Click "Learn Anything" in navbar
2. Browse skills by category
3. Click a skill to see mentors
4. Click "Request Session" to request from a mentor

**As Mentor:**

1. Click "Become a Mentor" in navbar
2. Enter bio and select skills
3. Go to "My Sessions" to manage requests
4. Approve learner requests
5. Build your mentor profile with reviews

### 3. Check Dashboard

- Go to "/dashboard" after login
- See user stats and upcoming sessions

---

## Important Files & Structure

```
skillswap/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Skill.js
│   │   ├── UserSkill.js
│   │   ├── Session.js
│   │   ├── Review.js
│   │   └── Rating.js
│   ├── controllers/
│   │   ├── skillController.js
│   │   ├── sessionController.js
│   │   └── reviewController.js
│   ├── routes/
│   │   ├── skillRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── reviewRoutes.js
│   ├── seeders/
│   │   ├── seed.js
│   │   └── index.js
│   ├── server.js (main entry point)
│   ├── config/
│   │   └── database.js
│   └── .env (create this)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LearnAnything.jsx
│   │   │   ├── SkillDetail.jsx
│   │   │   ├── MySessions.jsx
│   │   │   ├── BecomeaMentor.jsx
│   │   │   ├── MentorProfile.jsx
│   │   │   └── TopMentors.jsx
│   │   ├── services/
│   │   │   └── peerLearningService.js
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── App.jsx (routes defined here)
│   │   └── main.jsx
│   └── .env (create this)
│
├── PEER_LEARNING_DOCUMENTATION.md (detailed docs)
├── QUICK_START_GUIDE.md (quick reference)
└── SETUP.md (this file)
```

---

## Database Schema Overview

### Models Created for Peer-to-Peer Learning

1. **Skill** - Available skills on platform
   - 25+ pre-populated skills across 6 categories

2. **UserSkill** - User-Skill association
   - Maps users to skills (teach/learn)
   - Stores proficiency level and session history

3. **Session** - Scheduled mentor-learner sessions
   - Tracks status: Pending → Approved → Completed
   - Stores ratings from both parties

4. **Review** - Learner feedback on mentors
   - Public reviews visible on profiles
   - Contributes to mentor rating

5. **Rating** - Alternative rating system
   - Optional anonymous ratings

6. **User** (enhanced)
   - Added: `isTeacher`, `averageRating`, `totalReviews`

---

## Common Tasks

### Reset Everything

```bash
# backend
npm run db:reset
npm run seed
npm run dev
```

### See Database Contents

```bash
cd backend
sqlite3 database.db
sqlite> .tables
sqlite> SELECT * FROM Skills;
sqlite> .quit
```

### Troubleshoot Connection

```bash
# Check if ports are in use
# Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :3001

# Kill process on port (if needed):
taskkill /PID <PID> /F
```

### View Logs

```bash
# Backend logs appear in terminal where npm run dev is running
# Frontend errors show in browser console (F12)
```

---

## Environment Variables Reference

### Backend (.env)

| Variable     | Required | Default              | Description            |
| ------------ | -------- | -------------------- | ---------------------- |
| DATABASE_URL | Yes      | sqlite:./database.db | Database connection    |
| PORT         | No       | 5000                 | Server port            |
| JWT_SECRET   | Yes      | (none)               | Secret for JWT signing |
| JWT_EXPIRE   | No       | 7d                   | Token expiration       |
| NODE_ENV     | No       | development          | Environment            |

### Frontend (.env)

| Variable | Required | Default | Description |
| VITE_API_URL | Yes | http://localhost:5000 | Backend API URL |
| VITE_APP_NAME | No | SkillSwap | App name |

---

## Troubleshooting

### Issue: "Port 5000 already in use"

```bash
# Find what's using the port:
netstat -ano | findstr :5000

# Kill the process:
taskkill /PID <PID> /F

# Or use different port in backend:
PORT=5001 npm run dev
```

### Issue: "Database locked"

```bash
# Backend SQLite file might be locked
# Stop the server and try again
npm run db:reset
npm run seed
```

### Issue: "Cannot find module 'dotenv'"

```bash
cd backend
npm install dotenv
```

### Issue: Skills not appearing on frontend

```bash
# Ensure seed was run:
npm run seed

# Check database has data:
sqlite3 database.db "SELECT COUNT(*) FROM Skills;"

# Should show: 27
```

### Issue: CORS errors

- Frontend might be on wrong port
- Check `.env` file has correct `VITE_API_URL`
- Ensure backend server is running
- Check browser console for exact errors

### Issue: Cannot login

```bash
# Verify seed created users:
sqlite3 database.db "SELECT email FROM Users WHERE isTeacher = true;"

# Should show mentor emails
```

---

## Performance Optimization

### For Development

- Frontend hot reload enabled ✅
- Backend auto-restart with nodemon ✅
- SQLite for quick development ✅

### For Production (Future)

- Switch to PostgreSQL
- Add Redis caching
- Implement CDN for assets
- Add compression middleware
- Use connection pooling

---

## Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in .env
- [ ] Update CORS settings
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Sanitize user inputs
- [ ] Add password hashing
- [ ] Add request validation
- [ ] Enable database backups
- [ ] Add error logging service
- [ ] Review API authentication

---

## Next Steps After Installation

1. ✅ **Explore the app** - Login and test features
2. ✅ **Review documentation** - Read PEER_LEARNING_DOCUMENTATION.md
3. ✅ **Test workflows** - Try learner and mentor flows
4. ✅ **Create custom data** - Add your own skills or mentors
5. ⏳ **Deploy** - Move to production when ready

---

## Support & Resources

### Documentation Files

- `PEER_LEARNING_DOCUMENTATION.md` - Complete feature documentation
- `QUICK_START_GUIDE.md` - Quick reference guide
- `SETUP.md` - This setup guide

### Code Locations

- Backend routes: `backend/routes/`
- Frontend pages: `frontend/src/pages/`
- API service: `frontend/src/services/peerLearningService.js`
- Database models: `backend/models/`

### Getting Help

1. Check documentation files first
2. Review component source code
3. Check API responses in browser Network tab
4. Review error messages in terminal
5. Reset database and reseed: `npm run seed`

---

## Version Information

| Component | Version | Status      |
| --------- | ------- | ----------- |
| Node.js   | 14+     | ✅ Required |
| React     | 18.2.0  | ✅ Frontend |
| Express   | Latest  | ✅ Backend  |
| Sequelize | Latest  | ✅ ORM      |
| SQLite    | Latest  | ✅ Database |

---

## Changelog

### Version 1.0 (Current)

- ✅ Peer-to-peer learning platform
- ✅ Skill discovery and browsing
- ✅ Session booking system
- ✅ Mentor ratings and reviews
- ✅ Multiple user roles
- ✅ Dark/light theme
- ✅ Responsive design

---

**Setup completed! Visit `http://localhost:3001` to start using SkillSwap.**

_Last Updated: January 2024_
_For issues, check PEER_LEARNING_DOCUMENTATION.md or QUICK_START_GUIDE.md_
