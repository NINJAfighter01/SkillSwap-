# SkillSwap - Complete Setup & Run Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Project](#running-the-project)
6. [Troubleshooting](#troubleshooting)
7. [Project Structure](#project-structure)
8. [API Documentation](#api-documentation)

---

## 🎓 Project Overview

**SkillSwap** is a peer-to-peer learning platform with:

- Real-time progress tracking
- Token-based learning system
- 24/7 AI-powered support
- Professional feedback system
- Interactive notes
- Premium video filtering
- WebSocket real-time updates

**Tech Stack:**

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite + Sequelize ORM
- Real-time: Socket.io
- Authentication: JWT

---

## ⚙️ System Requirements

### Minimum Requirements:

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **RAM**: 2GB minimum
- **Storage**: 500MB minimum
- **OS**: Windows, macOS, or Linux

### Install Node.js:

1. Download from: https://nodejs.org/
2. Install LTS version (recommended)
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

---

## 📦 Installation Steps

### Step 1: Clone the Repository

```bash
# Using Git
git clone https://github.com/NINJAfighter01/SkillSwap-.git

# Navigate to project
cd skillswap
```

### Step 2: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install npm packages
npm install

# Check installation
npm list
```

**Expected Packages:**

- express
- sequelize
- sqlite3
- socket.io
- jsonwebtoken
- dotenv
- bcryptjs
- And more...

### Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd ../frontend

# Install npm packages
npm install

# Check installation
npm list
```

**Expected Packages:**

- react
- react-router-dom
- socket.io-client
- tailwindcss
- vite
- And more...

---

## 🔧 Configuration

### Step 1: Create Environment Files

#### Backend `.env` file:

Create file: `backend/.env`

```env
# Server Port
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=skillswap
DB_DIALECT=sqlite
DB_STORAGE=./database/skillswap.db

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Node Environment
NODE_ENV=development

# Firebase (Optional)
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_firebase_domain
```

#### Frontend `.env` file:

Create file: `frontend/.env`

```env
# API URL
VITE_API_URL=http://localhost:5000

# Socket.io URL
VITE_SOCKET_URL=http://localhost:5000

# Environment
VITE_NODE_ENV=development
```

### Step 2: Database Setup

The database is automatically created on first run using SQLite.

```bash
# Database location: backend/database/skillswap.db
# Database will auto-sync on server startup
```

---

## 🚀 Running the Project

### Best Way: Run Both Servers Simultaneously (Using Separate Terminals)

#### Terminal 1 - Backend Server:

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Start backend server
npm start
# OR
node server.js

# Expected output:
# Server running on port 5000
# Database synced successfully
# WebSocket server initialized
```

#### Terminal 2 - Frontend Server:

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies (if not done)
npm install

# Start frontend development server
npm run dev

# Expected output:
# VITE v5.4.21 ready in 564 ms
# Local: http://localhost:3000/
```

#### Terminal 3 (Optional) - View Logs:

```bash
# Monitor processes
netstat -ano | findstr :5000   # Check backend
netstat -ano | findstr :3000   # Check frontend
```

---

## 🌐 Access the Application

Once both servers are running:

1. **Open Browser**: Go to `http://localhost:3000`
2. **You should see**: SkillSwap HomePage with logo
3. **Features available**:
   - Register/Login
   - View videos
   - Access support system
   - View token history
   - Submit feedback
   - Track progress

---

## 🔐 Default Credentials

After first setup, create a test account:

1. Click **"Register"** on login page
2. Fill in details:
   - Email: `test@example.com`
   - Password: `Test@123`
   - Name: `Test User`
3. Submit and login

---

## 🧪 Testing the Features

### Test Real-time Features:

1. **Support System**:
   - Click 💬 floating button (bottom-right)
   - Create a support ticket
   - Watch typing indicator
   - Receive AI response

2. **Token History**:
   - Click "💰 Earn Tokens" on homepage
   - View transaction history
   - See real-time balance updates

3. **Feedback**:
   - Click "💬 Share Feedback"
   - Select category and submit
   - View feedback display

4. **Progress Tracking**:
   - Watch a lecture/video
   - Check progress updates in real-time

---

## 📂 Project Structure

```
skillswap/
├── backend/
│   ├── models/              # Database models
│   │   ├── User.js
│   │   ├── Video.js
│   │   ├── Lecture.js
│   │   ├── Note.js
│   │   ├── Feedback.js
│   │   ├── Support.js
│   │   ├── SupportMessage.js
│   │   ├── Progress.js
│   │   ├── VideoProgress.js
│   │   └── TokenHistory.js
│   ├── controllers/         # Business logic
│   │   ├── userController.js
│   │   ├── videoController.js
│   │   ├── supportController.js
│   │   ├── feedbackController.js
│   │   └── notesController.js
│   ├── routes/             # API routes
│   │   ├── userRoutes.js
│   │   ├── videoRoutes.js
│   │   ├── supportRoutes.js
│   │   └── feedbackRoutes.js
│   ├── config/             # Configuration
│   │   └── database.js
│   ├── database/           # SQLite database
│   │   └── skillswap.db
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── Navbar.jsx
│   │   │   ├── SupportWidget.jsx
│   │   │   ├── Support247.jsx
│   │   │   └── ...
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── VideoList.jsx
│   │   │   ├── TokenHistoryPage.jsx
│   │   │   ├── Support247.jsx
│   │   │   └── ...
│   │   ├── services/       # API services
│   │   │   ├── videoService.js
│   │   │   ├── supportService.js
│   │   │   └── ...
│   │   ├── context/        # React context
│   │   │   ├── AuthContext.js
│   │   │   ├── ThemeContext.js
│   │   │   └── WebSocketContext.js
│   │   ├── assets/         # Images, logos, etc
│   │   │   └── skillswap-logo.svg
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                # Environment variables
│
└── README.md               # Project documentation
```

---

## 🔗 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

```
POST   /auth/register          - Register new user
POST   /auth/login             - Login user
POST   /auth/logout            - Logout user
GET    /auth/profile           - Get user profile
```

### Video Endpoints

```
GET    /videos                 - Get all videos
GET    /videos/:id             - Get video details
POST   /videos                 - Upload video (teacher)
PUT    /videos/:id             - Update video (teacher)
DELETE /videos/:id             - Delete video (teacher)
GET    /videos/search/:query   - Search videos
```

### Support Endpoints

```
POST   /support/tickets        - Create support ticket
POST   /support/messages       - Send message
GET    /support/tickets        - Get user tickets
GET    /support/tickets/:id    - Get ticket details
GET    /support/stats          - Get support stats
PUT    /support/tickets/:id/close   - Close ticket
PUT    /support/tickets/:id/reopen  - Reopen ticket
```

### Feedback Endpoints

```
POST   /feedback               - Submit feedback
GET    /feedback               - Get feedback list
```

### Notes Endpoints

```
POST   /notes                  - Create note
GET    /notes                  - Get user notes
PUT    /notes/:id              - Update note
DELETE /notes/:id              - Delete note
```

---

## 🐛 Troubleshooting

### Issue 1: Backend Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:

```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=5001
```

### Issue 2: Frontend Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Kill process on port 3000
taskkill /F /IM node.exe

# Or specify different port
npm run dev -- --port 3001
```

### Issue 3: Database Connection Error

**Error**: `Error: Cannot find module 'sqlite3'`

**Solution**:

```bash
cd backend
npm install sqlite3
npm install
```

### Issue 4: Module Not Found Errors

**Error**: `Cannot find module '@module-name'`

**Solution**:

```bash
# In backend or frontend folder
npm install
npm install --save missing-package-name
```

### Issue 5: WebSocket Connection Failed

**Error**: `GET http://localhost:5000/socket.io/?... 404 (Not Found)`

**Solution**:

- Ensure backend is running on port 5000
- Check firewall settings
- Clear browser cache
- Restart both servers

### Issue 6: CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
Backend server.js has CORS enabled. If still having issues:

```bash
# Check backend CORS configuration
# Should have: app.use(cors())
```

---

## 📱 Development Tips

### Enable Debug Mode:

```bash
# Backend
DEBUG=* npm start

# Frontend
VITE_DEBUG=true npm run dev
```

### Hot Reload:

- Frontend: Changes auto-refresh (Vite)
- Backend: Requires manual restart (use nodemon)

### Install Nodemon for Auto-Restart:

```bash
cd backend
npm install --save-dev nodemon

# Update package.json scripts:
"start": "nodemon server.js"

# Run with nodemon:
npm start
```

### Browser DevTools:

- Open DevTools: F12
- Check Console for errors
- Check Network tab for API calls
- Check Application tab for cookies/storage

---

## 🚀 Production Deployment

### Before Deploying:

1. **Set Environment Variables**:

   ```env
   NODE_ENV=production
   JWT_SECRET=long-random-secret-key
   ```

2. **Build Frontend**:

   ```bash
   cd frontend
   npm run build
   # Creates dist/ folder
   ```

3. **Use Process Manager**:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "skillswap-backend"
   ```

### Deploy Options:

- **Hosting**: Vercel, Netlify, Heroku, AWS
- **Database**: Upgrade to PostgreSQL/MySQL
- **File Storage**: AWS S3, Cloudinary
- **Email**: SendGrid, Mailgun

---

## 📞 Support & Troubleshooting

### Common Issues Resolution:

1. **Blank Page on http://localhost:3000**
   - Check browser console for errors
   - Verify backend is running
   - Clear cache and reload

2. **Features Not Working**
   - Check backend console for errors
   - Verify WebSocket connection
   - Check network tab for failed requests

3. **Database Issues**
   - Delete `backend/database/skillswap.db`
   - Restart backend (will recreate database)

4. **Package Installation Issues**
   - Delete `node_modules` folder
   - Delete `package-lock.json`
   - Run `npm install` again

---

## 📚 Additional Resources

- **React Documentation**: https://react.dev
- **Node.js Documentation**: https://nodejs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Socket.io**: https://socket.io
- **Sequelize ORM**: https://sequelize.org

---

## ✅ Checklist for First Run

- [ ] Node.js installed (v14+)
- [ ] Repository cloned
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` files created in both folders
- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3000
- [ ] Browser shows http://localhost:3000
- [ ] Can login/register
- [ ] WebSocket connected (check console)
- [ ] Support system working (floating button)
- [ ] Real-time features working

---

## 🎉 You're All Set!

Once you see the SkillSwap homepage with the logo and all features working, your setup is complete!

### Next Steps:

1. Create test account
2. Explore all features
3. Test real-time functionality
4. Customize as needed

---

## 📝 Notes

- Keep both servers running for full functionality
- WebSocket requires both servers active
- Database auto-syncs on startup
- Changes to frontend auto-reload (Vite)
- Backend changes require manual restart

---

**Happy Learning with SkillSwap! 🚀📚**
