# SkillSwap - Peer-to-Peer Learning Platform Documentation

## 🎓 Overview

SkillSwap has been transformed into a peer-to-peer learning platform where users can both **teach** and **learn** skills through live or scheduled sessions with mentors. Instead of pre-recorded lectures, the platform connects learners with experienced mentors for personalized, interactive learning experiences.

## 📋 Table of Contents

1. [Features](#features)
2. [Database Schema](#database-schema)
3. [Getting Started](#getting-started)
4. [User Workflows](#user-workflows)
5. [API Endpoints](#api-endpoints)
6. [Frontend Pages](#frontend-pages)
7. [Seeding the Database](#seeding-the-database)
8. [Development Guide](#development-guide)

---

## ✨ Features

### For Learners

- 🔍 **Skill Discovery**: Browse and search 25+ skills across 6 categories
- 👨‍🏫 **Find Mentors**: View experienced mentors teaching specific skills
- 📅 **Schedule Sessions**: Request 1-on-1 or group learning sessions
- ⭐ **View Reviews**: See mentor ratings and reviews from other learners
- 📊 **Track Progress**: Monitor completed sessions and learning history

### For Mentors

- 🎓 **Become a Mentor**: Register skills you can teach
- 👥 **Manage Requests**: Approve, reject, or cancel session requests
- ⭐ **Build Reputation**: Get rated by learners to become a Top Mentor
- 📈 **Track Sessions**: Monitor completed sessions and learner feedback
- 🏆 **Top Mentor Badge**: Earn recognition with 4.0+ average rating

### Platform-Wide

- 🌙 **Dark/Light Mode**: Theme toggle for comfortable viewing
- 🔐 **Secure Authentication**: JWT-based login system
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Real-time Ratings**: Automatic mentor quality scoring

---

## 🗄️ Database Schema

### Core Tables

#### 1. **Skill**

Master list of learnable skills

```
- id (PK)
- title (unique)
- description
- category (Programming, Design, Music, Fitness, Languages, Business, Electronics)
- icon
- averageRating (float)
- totalReviews (int)
- isTrending (boolean)
- createdAt, updatedAt
```

#### 2. **UserSkill** (Junction Table)

Links users to skills they teach or learn

```
- id (PK)
- userId (FK → User)
- skillId (FK → Skill)
- type (ENUM: 'teach', 'learn')
- proficiencyLevel (ENUM: Beginner, Intermediate, Advanced, Expert)
- hoursSpent (int)
- rating (float)
- sessionsCompleted (int)
- createdAt, updatedAt
```

#### 3. **Session**

Scheduled mentor-learner sessions

```
- id (PK)
- mentorId (FK → User)
- learnerId (FK → User)
- skillId (FK → Skill)
- title
- description
- scheduleDate (datetime)
- duration (int - minutes)
- status (ENUM: Pending, Approved, Rejected, Completed, Cancelled)
- sessionType (ENUM: OneToOne, Group)
- meetingLink
- notes
- mentorRating (1-5)
- learnerRating (1-5)
- createdAt, updatedAt
```

#### 4. **Review**

Public feedback on mentors (visible on profiles)

```
- id (PK)
- reviewerId (FK → User)
- mentorId (FK → User)
- skillId (FK → Skill, optional)
- rating (1-5)
- title
- comment
- category (optional)
- createdAt, updatedAt
```

#### 5. **Rating**

Alternative rating system (optional usage)

```
- id (PK)
- ratedById (FK → User)
- mentorId (FK → User)
- userSkillId (FK → UserSkill, optional)
- rating (1-5)
- feedback
- isAnonymous (boolean)
- createdAt, updatedAt
```

#### 6. **User** (Enhanced)

```
- ... (existing fields)
- isTeacher (boolean) - Set to true when user adds first teaching skill
- averageRating (float) - Auto-updated from reviews
- totalReviews (int) - Auto-updated from reviews
```

---

## 🚀 Getting Started

### 1. Backend Setup

#### Install Dependencies

```bash
cd skillswap/backend
npm install
```

#### Configure Database

Create `.env` file:

```
DATABASE_URL=sqlite:./database.db
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

#### Sync Database Models

```bash
npm run db:sync
```

#### Seed with Sample Data

```bash
npm run seed
```

This populates the database with:

- 27 skills across 6 categories
- 5 sample mentor accounts
- Skill assignments for mentors

### 2. Frontend Setup

#### Install Dependencies

```bash
cd skillswap/frontend
npm install
```

#### Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

#### Environment Configuration

Create `.env` file:

```
VITE_API_URL=http://localhost:5000
```

---

## 👥 User Workflows

### Workflow 1: Learner Discovering and Requesting Sessions

```
1. Login/Register
   ↓
2. Navigate to "Learn Anything" page
   - Browse skills by category
   - Search for specific skills
   - View skill details and mentors
   ↓
3. Click on a skill
   - See all mentors teaching this skill
   - View mentor reviews and ratings
   ↓
4. Click "Request Session" on desired mentor
   - Fill session details:
     * Session title
     * Description (what you want to learn)
     * Preferred date/time
     * Duration (30-180 minutes)
   ↓
5. Session Request Created (Status: Pending)
   ↓
6. Wait for mentor approval
   - Check "My Sessions" → Learning Sessions
   - View request status
   ↓
7. Once Approved (Status: Approved)
   - See session details
   - Option to cancel if needed
   ↓
8. After session completion
   - Rate mentor (1-5 stars)
   - Mark session as complete
   ↓
9. Session Completed
   - Your rating visible on mentor profile
   - Session appears in learning history
```

### Workflow 2: User Becoming a Mentor

```
1. Login
   ↓
2. Navigate to "Become a Mentor"
   - Enter your bio (min 10 characters)
   - Select skills you can teach
   ↓
3. Choose proficiency level for each skill
   - Beginner
   - Intermediate
   - Advanced
   - Expert
   ↓
4. Click "Become a Mentor"
   - Skills added as teaching skills
   - isTeacher flag set to true
   ↓
5. Your profile now shows as mentor
   - Appears on "Top Mentors" page
   - Listed on skill detail pages
```

### Workflow 3: Mentor Managing Sessions

```
1. Navigate to "My Sessions"
   - Switch to "Teaching Sessions" tab
   ↓
2. View Pending Sessions
   - See learner name and request details
   - Read learner's description
   ↓
3. Review request and decide
   - Click "Approve" (Status → Approved)
   - Click "Reject" with reason
   - Click "Cancel" to cancel
   ↓
4. If Approved, prepare for session
   - View scheduled date/time
   - Provide meeting link
   - Add session notes
   ↓
5. After session
   - Click "Rate & Complete"
   - Rate learner (1-5 stars)
   - Mark session as complete
   ↓
6. Session Completed
   - Learner rating stored
   - Learner can submit their review
   - Session in history
```

### Workflow 4: Viewing Mentor Profiles

```
1. Navigate to "Top Mentors"
   - See all mentors with 4.0+ rating
   - See rank badges (🥇🥈🥉 for top 3)
   ↓
2. Filter by skill (optional)
   ↓
3. View mentor card
   - Name and avatar
   - Average rating
   - Skills teaching
   - Total reviews
   ↓
4. Click "View Profile"
   - Full profile with bio
   - Complete list of teaching skills
   - All reviews from learners
   - Proficiency levels
   - Completed sessions count
   ↓
5. Click "Request Session" on any skill
   - Redirected to skill detail page
   - Form pre-filled with mentor
```

---

## 🔌 API Endpoints

### Skills API

**Base:** `/api/skills`

| Method | Endpoint                 | Auth | Description                            |
| ------ | ------------------------ | ---- | -------------------------------------- |
| GET    | `/all`                   | -    | Get all skills (paginated, searchable) |
| GET    | `/categories`            | -    | Get all skill categories               |
| GET    | `/trending`              | -    | Get trending skills                    |
| GET    | `/:id`                   | -    | Get skill with mentors                 |
| POST   | `/add-to-user`           | ✅   | Add skill to user (teach/learn)        |
| GET    | `/user/:userId/teaching` | -    | Get user's teaching skills             |
| GET    | `/user/learning`         | ✅   | Get user's learning skills             |

**Example:** Request `GET /api/skills/all?page=1&limit=12&search=javascript&category=Programming`

### Sessions API

**Base:** `/api/sessions`

| Method | Endpoint        | Auth | Description             |
| ------ | --------------- | ---- | ----------------------- |
| POST   | `/`             | ✅   | Create session request  |
| GET    | `/mentor`       | ✅   | Get mentor's sessions   |
| GET    | `/learner`      | ✅   | Get learner's sessions  |
| GET    | `/all`          | ✅   | Get all user's sessions |
| PUT    | `/:id/approve`  | ✅   | Approve session         |
| PUT    | `/:id/reject`   | ✅   | Reject session          |
| PUT    | `/:id/complete` | ✅   | Complete & rate session |
| DELETE | `/:id/cancel`   | ✅   | Cancel session          |

**Example:** `POST /api/sessions` with body:

```json
{
  "mentorId": 2,
  "skillId": 1,
  "title": "Learn JavaScript Basics",
  "description": "Want to understand variables and functions",
  "scheduleDate": "2024-01-15T14:00:00Z",
  "duration": 60
}
```

### Reviews API

**Base:** `/api/reviews`

| Method | Endpoint             | Auth | Description                   |
| ------ | -------------------- | ---- | ----------------------------- |
| POST   | `/`                  | ✅   | Create review for mentor      |
| POST   | `/rating`            | ✅   | Create rating for mentor      |
| GET    | `/mentor/:mentorId`  | -    | Get mentor's reviews          |
| GET    | `/profile/:mentorId` | -    | Get mentor's full profile     |
| GET    | `/top-mentors`       | -    | Get top mentors (4.0+ rating) |

---

## 🖥️ Frontend Pages

### 1. **Learn Anything** (`/learn-anything`)

Main skill discovery page

- **Components:**
  - Search bar for skills
  - Category filter buttons
  - Grid of skill cards (responsive)
  - Each card shows: icon, title, category, rating
- **Actions:**
  - Click skill → Navigate to skill detail page
- **API Calls:**
  - `getAllSkills()` - Get skills with pagination
  - `getCategories()` - Get available categories

### 2. **Skill Detail** (`/skill/:id`)

Detailed view of a skill with mentors

- **Components:**
  - Skill info: title, description, rating, reviews
  - Mentor cards (all teaching this skill)
  - Session request modal form
- **Actions:**
  - Click mentor card "Request Session"
  - Fill session request form
  - Submit to create pending session
- **API Calls:**
  - `getSkillById()` - Get skill with mentors
  - `createSessionRequest()` - Create session

### 3. **My Sessions** (`/my-sessions`)

Dashboard for managing sessions

- **Tabs:**
  - Teaching Sessions (mentor view)
  - Learning Sessions (learner view)
- **Features:**
  - View sessions by status
  - Approve/reject/complete sessions
  - Rate after completion
  - Cancel if before scheduled
- **API Calls:**
  - `getMentorSessions()` - Get teaching sessions
  - `getLearnerSessions()` - Get learning sessions
  - `approveSession()`, `rejectSession()`, `completeSession()`, `cancelSession()`

### 4. **Become a Mentor** (`/become-mentor`)

Form to register as a mentor

- **Sections:**
  - Bio textarea (min 10 chars)
  - Skills selection grid
  - Proficiency level for each skill
- **Features:**
  - Search and filter skills
  - Select multiple skills
  - Set proficiency level per skill
  - Status badges
- **API Calls:**
  - `getAllSkills()` - Get skills to choose from
  - `getCategories()` - Get categories for filtering
  - `addSkillToUser()` - Register as mentor

### 5. **Mentor Profile** (`/mentor/:mentorId`)

Public mentor profile page

- **Displays:**
  - Avatar, name, email
  - Bio and stats (rating, reviews, sessions)
  - Teaching skills with proficiency
  - Recent reviews with ratings
  - Top Mentor badge if 4.0+ rating
- **Actions:**
  - Click "Request Session" on skill
  - Navigate back
- **API Calls:**
  - `getMentorProfile()` - Get full mentor data
  - `getMentorReviews()` - Get mentor's reviews
  - `getUserTeachingSkills()` - Get mentor's skills

### 6. **Top Mentors** (`/top-mentors`)

Showcase of best mentors

- **Features:**
  - Filter by skill
  - Rank badges (🥇🥈🥉 for top 3)
  - Mentor cards with stats
  - Teaching skills preview
- **Actions:**
  - Click "View Profile" → Go to mentor profile
  - Filter by skill → Update filtered list
- **API Calls:**
  - `getTopMentors()` - Get mentors with 4.0+ rating
  - `getAllSkills()` - Get skills for filtering

---

## 🌱 Seeding the Database

### Method 1: NPM Script (Recommended)

Add to `backend/package.json`:

```json
{
  "scripts": {
    "seed": "node seeders/index.js",
    "dev": "nodemon server.js"
  }
}
```

Run:

```bash
cd backend
npm run seed
```

### Method 2: Manual Seeding in Terminal

```javascript
// In Node.js REPL or separate file:
const seedSkills = require("./seeders/seed");
await seedSkills();
```

### What Gets Seeded

**27 Skills** across 6 categories:

1. **Programming** (6 skills)
   - JavaScript Basics, React.js, Python, Node.js, DSA, TypeScript

2. **Design** (4 skills)
   - UI/UX, Figma, Adobe Suite, Web Design

3. **Music** (4 skills)
   - Guitar, Piano, Music Production, Vocal Training

4. **Fitness** (4 skills)
   - Personal Training, Yoga, Nutrition, HIIT

5. **Languages** (4 skills)
   - English, Spanish, French, Mandarin

6. **Business** (4 skills)
   - Digital Marketing, Communication, Entrepreneurship, PM

7. **Electronics** (3 skills)
   - Arduino, Raspberry Pi, Circuit Design

**5 Mentor Users**:

- John Developer (10+ years, JavaScript/React expert)
- Sarah Designer (8 years, UI/UX specialist)
- Mike Fitness (Personal trainer, fitness expert)
- Alex Musician (Multi-instrumentalist)
- Emma Languages (Polyglot, language expert)

Each mentor is assigned 3-4 relevant skills with Expert proficiency level.

---

## 👨‍💻 Development Guide

### Adding a New Skill

**Backend:**

```javascript
// In seeders/seed.js or via API
const skill = await Skill.create({
  title: "new-skill-name",
  description: "...",
  category: "Programming",
  icon: "💻",
  averageRating: 0,
  totalReviews: 0,
  isTrending: false,
});
```

**API Endpoint:** `POST /api/skills` (admin)

### Making User a Mentor

```javascript
// Call this endpoint with JWT auth
POST /api/skills/add-to-user
{
  "skillId": 1,
  "type": "teach",
  "proficiencyLevel": "Expert"
}
```

This automatically sets `User.isTeacher = true`

### Creating a Session Request

```javascript
POST /api/sessions
{
  "mentorId": 2,
  "skillId": 1,
  "title": "Learn JavaScript",
  "description": "Want to master ES6 features",
  "scheduleDate": "2024-01-15T14:00:00Z",
  "duration": 60
}
```

Validates that mentor teaches the skill before creating.

### Session Status Flow

```
Pending → [Approved → Completed] OR Rejected
   ↘              ↙
      Cancelled ←
```

### Mentor Rating System

When session completes:

1. Both mentor and learner provide 1-5 star rating
2. Learner can optionally write review
3. Mentor's `averageRating` is recalculated
4. If rating ≥ 4.0 → `isTopMentor = true`

---

## 🔐 Security Considerations

### Protected Routes

All `/api/sessions` endpoints require JWT authentication
Session operations validate user ownership

### Data Validation

- Mentor skill check before session creation
- Status workflow validation
- Field length validation for bio and reviews

### User Privacy

- Email shown only on profiles (not elsewhere)
- Anonymous rating option
- Users can only modify their own data

---

## 📊 Key Metrics

The platform tracks:

- **Mentor Quality**: averageRating, totalReviews
- **User Activity**: sessionsCompleted per skill
- **Skill Popularity**: isTrending, totalReviews
- **Learning Progress**: hoursSpent per skill

---

## 🐛 Troubleshooting

### Skills not appearing?

- Run `npm run seed` to populate database
- Check that Skill records exist in database
- Verify API endpoints are accessible

### Can't request session from new mentor?

- Ensure mentor finished "Become a Mentor" flow
- Verify mentor has the skill in UserSkill table
- Check JWT token is valid and not expired

### Session ratings not saving?

- Ensure both mentor and learner provided ratings
- Check session status is exactly "Approved"
- Verify `completeSession` API call includes ratings

---

## 📞 Contact & Support

For issues or feature requests, contact:

- Documentation: See this file
- GitHub Issues: Report bugs
- Support Email: support@skillswap.com

---

**Last Updated:** January 2024
**Version:** 1.0
**Status:** ✅ Production Ready
