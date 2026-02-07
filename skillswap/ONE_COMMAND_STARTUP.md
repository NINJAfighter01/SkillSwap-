# SkillSwap - One Command Startup Guide

## Run the Entire Project with ONE Command

### Windows Users

Open PowerShell or Command Prompt in the `skillswap` folder and run:

```bat
run.bat
```

That's it! The script will:

- **Check & Install Dependencies** - Both frontend and backend
- **Create .env File** - With default configuration
- **Start Backend Server** - Running on `http://localhost:5000`
- **Start Frontend Server** - Running on `http://localhost:3000`

### macOS/Linux Users

Open Terminal in the `skillswap` folder and run:

```bash
chmod +x run.sh
./run.sh
```

Same result:

- **Both servers start automatically**
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`

---

## Alternative: Using npm Commands

If you prefer command line, after the quick install, you can use:

```bash
npm install-all      # Install dependencies only (one-time)
npm start            # Start both servers
npm dev              # Same as npm start
npm backend          # Start only backend
npm frontend         # Start only frontend
```

---

## What Happens When You Run `run.bat` or `run.sh`

1. **Checks node_modules** - Installs `concurrently` if needed
2. **Installs backend dependencies** - `npm install` in backend folder
3. **Installs frontend dependencies** - `npm install` in frontend folder
4. **Creates .env file** - Copies from .env.example automatically
5. **Starts both servers** - Using concurrently package
6. **Shows URLs** - Frontend and backend URLs displayed

---

## Once Everything is Running

### Create Your First Account

1. Go to `http://localhost:3000`
2. Click "Register"
3. Sign up with email, password, and name
4. You'll get **100 tokens** to start learning!

### Test the Application

- **Browse Lectures**: See 4 sample lectures in the database
- **Watch a Lecture**: Click any lecture (costs tokens)
- **Take Notes**: Add notes while watching
- **View Profile**: Check your stats and progress
- **Dark Mode**: Toggle theme in top right corner

### Login Options

- Email/Password
- Google OAuth
- Facebook OAuth
- Microsoft OAuth
  (OAuth requires credentials setup in .env)

---

## Stopping the Servers

**In the terminal window where servers are running:**

- Press `Ctrl+C` to stop both servers

---

## Troubleshooting

### Script Won't Run

```bash
# Make sure you're in the correct directory
cd skillswap

# Windows: Just double-click run.bat OR
run.bat

# macOS/Linux:
chmod +x run.sh
./run.sh
```

### Port Already in Use

If port 3000 or 5000 is already in use:

- Edit vite.config.js to use different frontend port
- Edit backend/.env to use different PORT
- Then run the script again

### Module Not Found Error

```bash
# Delete everything and reinstall
rm -rf backend/node_modules frontend/node_modules node_modules
npm install-all
npm start
```

### Database Error

```bash
# Delete the database and restart
rm database/skillswap.db
npm start
# Fresh database will be created automatically
```

---

## What You Get

✅ **Full Frontend** - React app with 20+ pages
✅ **Full Backend** - Express API with 7 route files
✅ **Database** - SQLite with sample data
✅ **Authentication** - Email + OAuth (Google, Facebook, Microsoft)
✅ **Payments** - Razorpay integration
✅ **Token System** - Earn by teaching, spend by learning
✅ **Notes** - Take notes while watching
✅ **Dark Mode** - Theme toggle with persistence

---

## Default Test Credentials

The database includes sample data:

- **4 Sample Lectures** - For browsing and testing
- **8 Sample Teachers** - In teacher directory
- **3 Subscription Plans** - For payment testing

Create your own account to test full functionality.

---

## Environment Configuration

The script automatically creates `.env` with defaults. To customize:

```bash
# Open backend/.env and update:
JWT_SECRET=your_random_secret_key
RAZORPAY_KEY_ID=your_razorpay_test_key
RAZORPAY_KEY_SECRET=your_razorpay_test_secret
PORT=5000
```

---

## Project Structure

```
skillswap/
├── frontend/          # React app (port 3000)
├── backend/          # Express API (port 5000)
├── database/         # SQLite database
├── run.bat          # Windows one-command startup
├── run.sh           # macOS/Linux one-command startup
├── package.json     # Root npm config
├── QUICKSTART.md    # Detailed setup guide
├── README.md        # Full documentation
└── API_REFERENCE.md # API endpoints reference
```

---

## First Time Setup Timeline

| Step                 | Time                          |
| -------------------- | ----------------------------- |
| Run run.bat/run.sh   | 1-2 seconds                   |
| Install dependencies | 2-3 minutes (first time only) |
| Start servers        | 5-10 seconds                  |
| **Total**            | **~3 minutes**                |

Subsequent runs (dependencies cached):

- **~5 seconds** to start both servers!

---

## Video Guide

1. Open PowerShell/Terminal
2. `cd c:\Users\Asus\Documents\69\skillswap` (Windows) or navigate to folder (Mac/Linux)
3. `run.bat` (Windows) or `./run.sh` (Mac/Linux)
4. Wait for "Frontend and Backend Servers" message
5. Go to `http://localhost:3000`
6. Create account and start exploring!

---

## Need Help?

- **Setup Issues?** → See TROUBLESHOOTING.md
- **API Endpoints?** → See API_REFERENCE.md
- **Project Structure?** → See PROJECT_STRUCTURE.md
- **Full Documentation?** → See README.md

---

**That's it! Enjoy SkillSwap! 🚀**
