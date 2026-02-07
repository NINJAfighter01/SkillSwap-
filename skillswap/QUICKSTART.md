# SkillSwap Installation Guide

Follow this quick guide to set up SkillSwap locally.

## Prerequisites

- Node.js v14+ (Download from nodejs.org)
- npm v6+
- Git

## ⚡ QUICK START (Single Command)

### The Fastest Way to Run SkillSwap

#### Windows Users:

```bash
cd skillswap
run.bat
```

#### macOS/Linux Users:

```bash
cd skillswap
chmod +x run.sh
./run.sh
```

That's it! The script will:

- ✓ Install all dependencies (frontend + backend)
- ✓ Create .env file automatically
- ✓ Start both servers (Frontend on 3000, Backend on 5000)
- ✓ Open http://localhost:3000 in your browser

**This single command replaces all the setup steps below!**

---

## Manual Setup (Alternative)

If you prefer to set up manually or the quick start doesn't work:

### 1. Clone/Extract Project

```bash
cd skillswap
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Create .env File

```bash
cp .env.example .env
```

Edit `.env` and add:

- JWT_SECRET: Create a random string
- RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from your Razorpay account

#### Start Backend

```bash
npm start
```

✓ Backend runs on http://localhost:5000

### 3. Frontend Setup

#### Open New Terminal

```bash
cd ../frontend
npm install
```

#### Start Frontend

```bash
npm run dev
```

✓ Frontend runs on http://localhost:3000

## Usage

1. Open http://localhost:3000 in browser
2. Register or Login
3. Browse lectures
4. Watch lectures (uses tokens)
5. Subscribe for more tokens

## Test Accounts

After first run, you can use:

- Email: admin@skillswap.com
- Create your own account

## Environment Setup

### Razorpay Integration

1. Go to https://razorpay.com
2. Create account and get API keys
3. Add to .env file

### OAuth Setup (Optional)

**Google:**

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add Client ID and Secret to .env

**Facebook:**

1. Go to https://developers.facebook.com
2. Create app and get credentials
3. Add to .env

**Microsoft:**

1. Go to https://portal.azure.com
2. Register application
3. Add to .env

## Troubleshooting

### Port Already in Use

```bash
# Change port in backend
PORT=3001 npm start

# Or change frontend port in vite.config.js
```

### Dependencies Not Installing

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Database Issues

```bash
# Delete database and restart
rm database/skillswap.db
npm start  # Backend will recreate
```

### CORS Errors

Ensure backend is running on http://localhost:5000
and frontend proxy is configured in vite.config.js

## File Structure Created

```
skillswap/
├── frontend/           (React app)
├── backend/           (Express API)
├── database/          (SQLite database)
├── .env.example       (Configuration template)
└── README.md          (Full documentation)
```

## Key Files

- `backend/server.js` - Main server
- `frontend/src/App.jsx` - Main React app
- `backend/routes/` - API endpoints
- `frontend/src/pages/` - React pages
- `backend/models/` - Database models

## Next Steps

1. Test all features in browser
2. Verify payment flow (use Razorpay test keys)
3. Check database at `database/skillswap.db`
4. Review logs in console

## Support

Check README.md for detailed documentation
Contact: support@skillswap.com

---

**Ready to start?** Run both servers and visit http://localhost:3000
