# SkillSwap - Troubleshooting Guide

## Common Issues & Solutions

---

## Frontend Issues

### Issue 1: Port 3000 Already in Use

**Error**: `Error: Port 3000 is already in use`

**Solution**:

```bash
# Option 1: Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Option 2: Use a different port in vite.config.js
```

**Edit `vite.config.js`**:

```javascript
export default {
  server: {
    port: 3001, // Change to different port
  },
};
```

---

### Issue 2: API Proxy Not Working

**Error**: `Cannot GET /lectures` or API calls fail with 404

**Solution**:

1. Ensure backend is running on `http://localhost:5000`
2. Check vite.config.js proxy setting:
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:5000',
         changeOrigin: true,
         rewrite: (path) => path
       }
     }
   }
   ```
3. Restart frontend dev server after changes

---

### Issue 3: Blank Page or White Screen

**Cause**: React errors, missing context providers, or build issues

**Solution**:

1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Clear cache: `Ctrl+Shift+Delete` → Clear all
5. Hard refresh: `Ctrl+Shift+R`
6. Verify AuthContext and ThemeContext are imported in App.jsx

---

### Issue 4: Dark Mode Not Persisting

**Problem**: Theme resets on page reload

**Solution**:

1. Check browser localStorage is enabled
2. Verify ThemeContext initialization:
   ```javascript
   const saved = localStorage.getItem("theme") === "true";
   ```
3. Check that index.html has `document.documentElement.classList`

---

### Issue 5: OAuth Login Fails

**Error**: "Invalid Client ID" or "CORS error"

**Solution**:

1. Ensure OAuth credentials are valid
2. Add localhost URLs to OAuth app settings:
   - Google: Add `http://localhost:3000/login` to authorized origins
   - Facebook: Add `http://localhost:3000` to App Domains
   - Microsoft: Add `http://localhost:3000` to Redirect URIs
3. Check browser console for CORS errors
4. Ensure backend receives OAuth token correctly

---

### Issue 6: Notes Editor Not Saving

**Error**: Create/Update note fails silently

**Solution**:

1. Check backend is running
2. Verify user is authenticated (check localStorage for token)
3. Check browser DevTools Network tab for errors
4. Ensure lectureId matches actual lecture
5. Check backend logs for database errors

---

## Backend Issues

### Issue 1: Port 5000 Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::5000`

**Solution**:

```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Or use different port:
PORT=5001 npm start
```

---

### Issue 2: Module Not Found Errors

**Error**: `Cannot find module 'express'` or similar

**Solution**:

```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install

# Specific package
npm install express
npm install sequelize sqlite3
```

---

### Issue 3: Database Lock Error

**Error**: `SQLITE_BUSY: database is locked` or `database table is locked`

**Solution**:

```bash
# Stop all processes: Close all terminals, VS Code, apps using database
# Delete database file and restart:
rm database/skillswap.db
npm start  # Creates fresh database

# Or close database connections:
sqlite3 database/skillswap.db ".tables"  # Check one connection

# Restart server:
npm start
```

---

### Issue 4: JWT Token Errors

**Error**: `Invalid token`, `Token expired`, `Unauthorized`

**Solution**:

1. Verify JWT_SECRET in .env matches server expectations:
   ```bash
   # Generate new secret if needed:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update .env with new secret
3. Clear frontend localStorage tokens: `localStorage.clear()`
4. Log in again to get new token
5. Check token expiration (30 days default)

---

### Issue 5: Password Hashing Not Working

**Error**: Users can't login, or passwords don't match

**Solution**:

1. Verify bcrypt is installed:
   ```bash
   npm list bcryptjs
   ```
2. Check User model beforeCreate hook:
   ```javascript
   if (instance.password) {
     instance.password = bcryptjs.hashSync(instance.password, 10);
   }
   ```
3. Verify validatePassword method exists in User model
4. Check password comparison in login controller

---

### Issue 6: Razorpay Integration Failing

**Error**: "Invalid API key" or payment verification fails

**Solution**:

1. Verify Razorpay keys in .env:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=xxxxx
   ```
2. Ensure using TEST keys (not production)
3. Check signature verification logic:
   ```javascript
   const signature = crypto
     .createHmac("sha256", RAZORPAY_KEY_SECRET)
     .update(body)
     .digest("hex");
   ```
4. Test with Razorpay test credentials:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Any future date

---

### Issue 7: CORS Errors

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:

1. Verify CORS is enabled in server.js:
   ```javascript
   app.use(
     cors({
       origin: "http://localhost:3000",
       credentials: true,
     }),
   );
   ```
2. Check frontend makes requests to `/api` (proxy routes)
3. Clear browser cache and restart
4. Ensure credentials header in Axios:
   ```javascript
   axios.defaults.withCredentials = true;
   ```

---

### Issue 8: Sample Data Not Inserting

**Error**: Database empty, no lectures to show

**Solution**:

1. Check server.js has createSampleData call:
   ```javascript
   if (count === 0) await createSampleData();
   ```
2. Verify database sync completes:
   ```javascript
   await sequelize.sync({ alter: isDevelopment });
   ```
3. Add console.log to confirm:
   ```javascript
   console.log("Sample data inserted:", count, "lectures");
   ```
4. Check database file exists:
   ```bash
   ls -la database/
   ```

---

## Database Issues

### Issue 1: Database File Corrupted

**Error**: `SQLITE_CORRUPT: database disk image is malformed`

**Solution**:

```bash
# Backup corrupted database
mv database/skillswap.db database/skillswap.db.corrupt

# Restart server to create fresh database
npm start

# Optional: Restore from backup (if exists)
# cp database/skillswap.backup.db database/skillswap.db
```

---

### Issue 2: Missing Tables

**Error**: `SequelizeEagerLoadingError` or `table not found`

**Solution**:

1. Verify sequelize.sync() runs:
   ```javascript
   console.log("Syncing database...");
   await sequelize.sync({ alter: true });
   console.log("Sync complete");
   ```
2. Check all models are required: `require('./models')`
3. Restart server:
   ```bash
   npm start
   ```
4. Verify tables exist:
   ```bash
   sqlite3 database/skillswap.db ".tables"
   ```

---

### Issue 3: Foreign Key Constraint Errors

**Error**: `SQLITE_CONSTRAINT: FOREIGN KEY constraint failed`

**Solution**:

1. Enable foreign keys in database config:
   ```javascript
   const sequelize = new Sequelize({
     dialectOptions: {
       foreignKeys: true,
     },
   });
   ```
2. Ensure parent records exist before creating dependent records
3. Delete in correct order (child first, then parent)
4. Check model relationships are defined correctly

---

## Authentication Issues

### Issue 1: Cannot Login

**Error**: `Invalid email or password` when credentials are correct

**Solution**:

1. Verify user exists in database:
   ```bash
   sqlite3 database/skillswap.db "SELECT email FROM users WHERE email='test@example.com';"
   ```
2. Check password hashing:
   ```bash
   # rehash password
   # User.beforeCreate hook should hash it
   ```
3. Compare bcrypt directly:
   ```javascript
   const match = await bcryptjs.compare(password, hashedPassword);
   ```
4. Create new test user:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"new@test.com","password":"Test123!"}'
   ```

---

### Issue 2: Protected Routes Not Working

**Error**: Can access pages without login, or always redirected even with token

**Solution**:

1. Verify token is stored in localStorage:
   ```javascript
   console.log("Token:", localStorage.getItem("token"));
   ```
2. Check ProtectedRoute component:
   ```javascript
   {
     user && <Component />;
   } // or {isAuthenticated}
   ```
3. Verify AuthContext provides correct state:
   ```javascript
   const { user, isAuthenticated } = useContext(AuthContext);
   ```
4. Check token expiration:
   ```javascript
   // Should be 30 days from login
   jwt.verify(token, JWT_SECRET);
   ```

---

### Issue 3: Logout Not Working

**Problem**: User remains logged in after logout

**Solution**:

1. Verify logout clears localStorage:
   ```javascript
   localStorage.removeItem("token");
   ```
2. Check logout API endpoint returns success
3. Redirect to login after logout:
   ```javascript
   navigate("/login");
   ```
4. Clear any cached user data from context

---

## Frontend-Backend Communication Issues

### Issue 1: Requests Getting 404

**Error**: `404 Not Found` for valid API endpoints

**Solution**:

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/health
   # Should return 200 OK
   ```
2. Check API endpoint format:
   - Frontend: `/api/lectures`
   - Backend: `GET /lectures` (under /api prefix)
3. Verify routes are mounted in server.js:
   ```javascript
   app.use("/api/lectures", lectureRoutes);
   app.use("/api/auth", authRoutes);
   ```
4. Check method matches (GET, POST, PUT, DELETE)

---

### Issue 2: Request Timeouts

**Error**: `ERR_CONNECTION_TIMED_OUT` or infinite loading

**Solution**:

1. Check backend is responding:
   ```bash
   curl -v http://localhost:5000/api/lectures
   ```
2. Increase Axios timeout:
   ```javascript
   axios.defaults.timeout = 30000; // 30 seconds
   ```
3. Check for infinite loops in controllers
4. Add error boundaries in React components

---

### Issue 3: Token Not Being Sent

**Error**: Backend says `Unauthorized` but token exists

**Solution**:

1. Verify Axios header configuration:
   ```javascript
   axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
   ```
2. Check authService sets headers:
   ```javascript
   api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
   ```
3. Verify AuthContext updates headers on login:
   ```javascript
   const login = (token) => {
     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
   };
   ```
4. Test with cURL:
   ```bash
   curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/auth/me
   ```

---

## Performance Issues

### Issue 1: Slow Page Loads

**Problem**: Frontend takes long to load

**Solution**:

1. Check for large bundle size:
   ```bash
   npm run build
   # Check dist folder size
   ```
2. Enable code splitting in Vite:
   ```javascript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           react: ["react"];
         }
       }
     }
   }
   ```
3. Lazy load routes:
   ```javascript
   const HomePage = lazy(() => import("./pages/HomePage"));
   ```
4. Use React.memo for components

---

### Issue 2: Slow API Responses

**Problem**: Lecture list takes 5+ seconds

**Solution**:

1. Add database indexes:
   ```javascript
   // In model definition
   index: true,
   ```
2. Use pagination:
   ```javascript
   GET /lectures?page=1&limit=12
   ```
3. Limit related data fetched:
   ```javascript
   Lecture.findAll({
     attributes: ["id", "title", "tokens"],
     include: { association: "teacher", attributes: ["name"] },
   });
   ```
4. Add caching layer for static data

---

## Setup Script Issues

### Windows (setup.bat) Errors

**Issue**: Script doesn't run

```bash
# Make sure you're in correct directory
cd skillswap
setup.bat

# Or run manually:
cd frontend && npm install
cd ../backend && npm install
```

**Issue**: npm not found

```bash
# Ensure Node.js is installed
node --version
npm --version

# If not, download from nodejs.org and install
```

---

### macOS/Linux (setup.sh) Errors

**Issue**: Permission denied

```bash
# Make script executable
chmod +x setup.sh
./setup.sh
```

**Issue**: Module not found after setup

```bash
# Verify npm installed packages
npm list

# Reinstall specific package
npm install package-name
```

---

## Development Mode Issues

### Issue 1: Hot Module Replacement (HMR) Not Working

**Problem**: Changes don't reflect without manual refresh

**Solution**:

1. Check vite.config.js HMR configuration
2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```
3. Check browser WebSocket connection (DevTools → Network → WS)
4. Restart dev server

---

### Issue 2: Console Warnings About React Strict Mode

**Message**: `Warning: useLayoutEffect does nothing on the server...`

**Solution**:

1. These are normal in development
2. To suppress for production, remove Strict Mode:
   ```javascript
   // In main.jsx
   // Remove <React.StrictMode>
   ```
3. Actually useful for catching issues - leave during development

---

## Getting Help

### Debugging Checklist

- [ ] Browser DevTools Console for errors
- [ ] Browser DevTools Network tab for API failures
- [ ] Backend terminal logs for errors
- [ ] Database exists at `./database/skillswap.db`
- [ ] Both frontend and backend running
- [ ] Correct ports (3000, 5000)
- [ ] Valid JWT token in localStorage
- [ ] .env file configured with secrets
- [ ] All npm dependencies installed

### Useful Debug Commands

**Check running processes**:

```bash
# Windows
tasklist | find "node"

# macOS/Linux
ps aux | grep node
```

**View server logs**:

```bash
# Run with verbose logging
DEBUG=* npm start
```

**Test API directly**:

```bash
# Get lectures
curl http://localhost:5000/api/lectures

# Login
curl -X POST http://localhost:5000/api/auth/login -d '...'

# Check server status
curl -i http://localhost:5000/health
```

**Database inspection**:

```bash
# Open SQLite shell
sqlite3 database/skillswap.db

# List tables
.tables

# View users
SELECT * FROM users;

# View lectures
SELECT * FROM lectures;

# Count records
SELECT COUNT(*) FROM users;
```

---

## Still Having Issues?

1. **Check Documentation**: Review README.md, QUICKSTART.md, and this file
2. **Check Logs**: Look at browser console and terminal output
3. **Verify Setup**: Ensure .env is configured, dependencies installed
4. **Clean Install**: Delete node_modules, package-lock.json, reinstall
5. **Fresh Database**: Delete database file, restart server
6. **Clear Cache**: Clear browser cache and localStorage

---

**Last Updated**: 2024
**Version**: 1.0.0

For issues not covered here, check the original error message in browser console or server terminal for more details.
