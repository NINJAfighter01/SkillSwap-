You are an expert senior full-stack software engineer.

Your task is to generate a COMPLETE, PRODUCTION-READY, FULLY WORKING web application named "SkillSwap".

This application must work end-to-end without missing logic.

Do NOT give explanations.
Do NOT give partial code.
Do NOT leave TODOs.
Everything must be implemented.

=================================================
TECH STACK (MANDATORY)
=================================================

Frontend:

- React.js (with Vite)
- Tailwind CSS
- Axios
- Dark Mode Toggle

Backend:

- Node.js
- Express.js
- JWT Authentication

Database:

- json (using Sequelize ORM)

Auth:

- Email & Password
- Google OAuth
- Facebook OAuth
- Microsoft OAuth

Payment:

- Razorpay (India)

=================================================
PROJECT STRUCTURE (AUTO CREATE)
=================================================

/skillswap
├── frontend
│ ├── src
│ ├── components
│ ├── pages
│ ├── context
│ ├── services
│ ├── App.jsx
│ └── main.jsx
│
├── backend
│ ├── controllers
│ ├── models
│ ├── routes
│ ├── middleware
│ ├── config
│ ├── server.js
│
├── database
│ └── schema.json
│
├── .env.example
└── README.md

=================================================
CORE FEATURES (MUST IMPLEMENT ALL)
=================================================

AUTHENTICATION:

- Register
- Login
- Logout (global logout destroys session)
- Google / Facebook / Microsoft login
- JWT based auth with middleware

DASHBOARD UI:

- Top Left: SkillSwap (website name)
- Top Center Menu:
  Home
  How It Works
  About
  Services
  Contact
  Feedback
  Blog
  Website Information
- Top Center Search Bar (search lectures)
- Top Right:
  Remaining Learning Tokens
  Logout Button
- Dark Mode Toggle Switch

DASHBOARD MODULES:

- Customer Support
  - Chat
  - Call
  - Contact Form
- Profile
- Progress Tracker
- Lectures & Tasks Count
- Portfolio
- Subscription

SUBSCRIPTION PLANS:
Plan 1 (₹300):

- Learning Tokens
- Chat Tokens
- Anytime Support

Plan 2 (₹500):

- Learning Tokens
- Chat Tokens
- Anytime Support
- Premium Lectures
- Free Notes

Plan 3 (Premium):

- Learning Tokens
- Chat Tokens
- Anytime Support
- Premium Lectures
- Premium Notes
- Free Notes

Payments must be fully integrated with Razorpay.
On successful payment, user subscription and tokens update automatically.

LECTURE SYSTEM:

- Lecture listing
- Lecture search
- Click lecture → video player page
- Pre-recorded video
- Token deduction per lecture
- Teacher profile visible
- Tokens transferred to teacher
- Teacher can use tokens to learn other skills

NOTES SYSTEM:

- Right-side notes editor on lecture page
- Save notes to database
- View & download notes

TOKEN SYSTEM:

- Wallet system
- Token history
- Token spend and earn logic

COURSES:

- Teacher uploads course
- Student enrolls
- Recorded + live lecture support

=================================================
DATABASE (AUTO CREATE WITH RELATIONS)
=================================================

Tables:

- users
- lectures
- courses
- subscriptions
- payments
- tokens
- token_history
- notes
- progress
- feedback
- blogs
- contacts

Use proper foreign keys and relations.

=================================================
API REQUIREMENTS
=================================================

- REST APIs
- JWT protected routes
- Clean controller-service architecture
- Error handling middleware

=================================================
FINAL REQUIREMENT
=================================================

- The app must run with:
  npm install
  npm run dev (frontend)
  npm start (backend)

- Everything must be connected and functional
- This is a FINAL YEAR ENGINEERING PROJECT
- No mock logic
- No placeholders

Generate all files and all code now.
