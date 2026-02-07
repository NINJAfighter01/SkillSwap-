# SkillSwap Peer-to-Peer Learning - Quick Reference Guide

## 🚀 Quick Start

### Run Backend

```bash
cd backend
npm install
npm run seed      # Populate with sample skills & mentors
npm run dev       # Start on http://localhost:5000
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev       # Start on http://localhost:3001
```

### Test Accounts (After Seeding)

**Mentors:**

- Email: `john.dev@skillswap.com` | Password: `password123`
- Email: `sarah.design@skillswap.com` | Password: `password123`
- Email: `mike.fitness@skillswap.com` | Password: `password123`

---

## 📱 User Journey

### I'm a Learner - I want to learn a skill

1. **Navigate to "/learn-anything"**
   - Search for a skill (e.g., "JavaScript")
   - Or browse by category (Programming, Design, Music, etc.)
   - Click on a skill card

2. **View Skill Details (/skill/:id)**
   - See all mentors teaching this skill
   - Read their reviews and ratings
   - Click "Request Session" on a mentor

3. **Request Session**
   - Fill form: title, description, date, duration
   - Submit → Session status = "Pending"

4. **Wait for Approval**
   - Go to "/my-sessions" → "Learning Sessions"
   - Wait for mentor to approve
   - Status changes to "Approved"

5. **After Session**
   - Click "Rate & Complete"
   - Rate mentor 1-5 stars
   - Your rating shows on their profile

---

### I'm a Teacher - I want to teach skills

1. **Become a Mentor (/become-mentor)**
   - Enter your bio (min 10 characters)
   - Select skills you want to teach
   - Choose proficiency level for each
   - Click "Become a Mentor"

2. **Manage Session Requests**
   - Go to "/my-sessions" → "Teaching Sessions"
   - See pending requests from learners
   - Click "Approve" or "Reject"

3. **Complete Session**
   - On approval date, conduct the session
   - Click "Rate & Complete"
   - Rate learner 1-5 stars

4. **Build Your Reputation**
   - Ratings show on your profile
   - Get 4.0+ rating → "Top Mentor" badge
   - Appear on "/top-mentors" page

---

### I want to find the best mentors

1. **Go to /top-mentors**
   - See mentors with 4.0+ rating
   - Top 3 have 🥇🥈🥉 badges
   - Filter by skill (optional)

2. **View Mentor Profile (/mentor/:mentorId)**
   - See bio, skills, reviews
   - Click "Request Session" on any skill

---

## 🗺️ Site Navigation

| Page           | Path                | For      | Purpose                  |
| -------------- | ------------------- | -------- | ------------------------ |
| Learn Anything | `/learn-anything`   | Learners | Browse all skills        |
| Skill Detail   | `/skill/:id`        | Learners | View mentors for skill   |
| Become Mentor  | `/become-mentor`    | Teachers | Register teaching skills |
| My Sessions    | `/my-sessions`      | Both     | Manage sessions          |
| Mentor Profile | `/mentor/:mentorId` | Both     | View mentor details      |
| Top Mentors    | `/top-mentors`      | Both     | Find best mentors        |

---

## 📊 Key Concepts

### Skills

- 25+ skills across 6 categories
- Each skill has: title, description, category, rating, trending badge

### Categories

1. **Programming** - JavaScript, React, Python, Node.js, TypeScript, DSA
2. **Design** - UI/UX, Figma, Adobe, Web Design
3. **Music** - Guitar, Piano, Music Production, Vocal
4. **Fitness** - Training, Yoga, Nutrition, HIIT
5. **Languages** - English, Spanish, French, Mandarin
6. **Business** - Marketing, Communication, Entrepreneurship, PM
7. **Electronics** - Arduino, Raspberry Pi, CircuitDesign

### Mentors

- Users with `isTeacher = true`
- Appear on skill pages
- Show on top mentors if rating ≥ 4.0
- Have reviews from learners

### Sessions

- Learner requests → Status: **Pending**
- Mentor approves → Status: **Approved**
- Session happens → Status: **Completed**
- Both rate each other
- Mentor rating auto-updates

---

## 🎯 Session Lifecycle

```
1. Learner requests session (Status: PENDING)
   ↓
2. Mentor reviews request
   ↓ [Approve]           ↓ [Reject]           ↓ [Cancel]
   ↓                     ↓                     ↓
3. APPROVED           REJECTED             CANCELLED
   ↓
4. [Before scheduled date]
   - Either can cancel (→ CANCELLED)
   ↓
5. After session
   - Both rate each other
   ↓
6. COMPLETED
   - Rating shows on mentor profile
   - Session in history
```

---

## 🔧 API Endpoints Quick Ref

### Skills

- `GET /api/skills/all?page=1&limit=12` - Get skills
- `GET /api/skills/categories` - Get categories
- `GET /api/skills/:id` - Get skill with mentors
- `POST /api/skills/add-to-user` - Become mentor

### Sessions

- `POST /api/sessions` - Request session
- `GET /api/sessions/mentor` - Mentor's sessions
- `GET /api/sessions/learner` - Learner's sessions
- `PUT /api/sessions/:id/approve` - Approve
- `PUT /api/sessions/:id/complete` - Complete & rate

### Reviews

- `POST /api/reviews` - Write review
- `GET /api/reviews/mentor/:id` - Get reviews
- `GET /api/reviews/profile/:id` - Mentor profile
- `GET /api/reviews/top-mentors` - Top 4.0+ mentors

---

## 💾 Database Models

**Skill** - Skills available on platform
**User** - Users (mentors + learners) with rating fields
**UserSkill** - Junction: links users to teach/learn skills
**Session** - Scheduled mentor-learner sessions
**Review** - Learner feedback on mentors
**Rating** - Alternative rating system

---

## 🎨 Navbar Menu Items

- **Home** - Main dashboard
- **Learn Anything** - Browse skills
- **Top Mentors** - View best mentors
- **My Sessions** - Manage sessions
- **Become Mentor** - Register as teacher
- **How It Works** - FAQ/Guide
- **About** - About SkillSwap
- **Contact** - Contact us
- **Feedback** - Send feedback
- **Blog** - Blog posts
- **Info** - Information page

---

## ⭐ Mentor Badge System

### Regular Mentor

- `isTeacher = true`
- Appears on skill pages
- Can receive reviews

### Top Mentor 🏆

- `averageRating ≥ 4.0`
- `isTopMentor = true`
- Appears on `/top-mentors` page
- Top 3 overall get 🥇🥈🥉 badges

---

## 📈 Sample Data

**After seeding**, you'll have:

- 27 skills
- 5 sample mentors
- Each mentor teaching 3-4 skills
- Sample data ready to explore

**First Time?** Login with John Developer:

- Email: john.dev@skillswap.com
- Password: password123

---

## 🐛 Common Issues & Fixes

| Issue                 | Solution                           |
| --------------------- | ---------------------------------- |
| Skills not showing    | Run `npm run seed` in backend      |
| Can't become mentor   | Restart server after seed          |
| Session request fails | Verify mentor teaches that skill   |
| Ratings not updating  | Check both rated before completing |
| Top mentors empty     | Ensure mentors have 4.0+ rating    |

---

## 🎓 Next Features (Coming Soon)

- ✅ Skill discovery & browsing
- ✅ Session booking & management
- ✅ Mentor reviews & ratings
- ⏳ Live video call integration
- ⏳ Messaging between mentor-learner
- ⏳ Group session scheduling
- ⏳ Availability calendar for mentors
- ⏳ Payment processing
- ⏳ Certificates on completion

---

## 📞 Need Help?

1. Check `/PEER_LEARNING_DOCUMENTATION.md` for detailed docs
2. Review frontend components in `src/pages/`
3. Check API routes in `backend/routes/`
4. Seed fresh data if stuck: `npm run seed`

---

**Version:** 1.0 | **Status:** ✅ Ready to Use
