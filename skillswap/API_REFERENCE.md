# SkillSwap - API Reference & Common Workflows

## Quick Reference Guide

### Base URLs

- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Database**: `./database/skillswap.db`

---

## Authentication Flow

### 1. User Registration

```javascript
POST /auth/register
Body: {
  name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123"
}
Response: {
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id, name, email, tokens: 100 }
}
```

### 2. User Login

```javascript
POST /auth/login
Body: {
  email: "john@example.com",
  password: "SecurePass123"
}
Response: {
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { id, name, email, tokens }
}
```

### 3. Get Current User (Protected)

```javascript
GET /auth/me
Headers: Authorization: Bearer {token}
Response: { id, name, email, tokens, profilePicture, bio, isTeacher }
```

---

## Lecture Management

### Create a Lecture (Teacher Only)

```javascript
POST /lectures
Headers: Authorization: Bearer {token}
Body: {
  title: "Web Development Basics",
  description: "Learn HTML, CSS, and JavaScript",
  fullDescription: "In this course...",
  videoUrl: "https://example.com/video.mp4",
  tokens: 15,
  category: "web-development",
  duration: 45,
  isPremium: false,
  isLive: false
}
Response: { id, title, description, tokens, teacherId, createdAt }
```

### Browse All Lectures

```javascript
GET /lectures?page=1&limit=12&search=web
Response: {
  count: 50,
  rows: [
    {
      id, title, description, tokens, category,
      views, teacher: { name, profilePicture }
    }
  ]
}
```

### Get Lecture Details

```javascript
GET /lectures/5
Response: {
  id, title, description, fullDescription, videoUrl,
  tokens, category, duration, teacher: { name, bio },
  views, createdAt
}
```

### Watch a Lecture (Deduct Tokens)

```javascript
POST /lectures/5/watch
Headers: Authorization: Bearer {token}
Response: {
  success: true,
  tokensDeducted: 15,
  userTokens: 85,
  progress: { userId, lectureId, completionPercentage: 0, isCompleted: false }
}
```

### Get Teacher's Lectures

```javascript
GET /lectures/teacher/list
Headers: Authorization: Bearer {token}
Response: [
  { id, title, tokens, views, createdAt },
  ...
]
```

---

## Notes Management

### Create a Note

```javascript
POST /notes
Headers: Authorization: Bearer {token}
Body: {
  lectureId: 5,
  content: "Key points: HTML structure, semantic tags..."
}
Response: { id, lectureId, userId, content, createdAt }
```

### Get Notes for a Lecture

```javascript
GET /notes/lecture/5
Headers: Authorization: Bearer {token}
Response: [
  { id, content, createdAt },
  { id, content, createdAt }
]
```

### Update a Note

```javascript
PUT /notes/10
Headers: Authorization: Bearer {token}
Body: { content: "Updated notes..." }
Response: { id, content, updatedAt }
```

### Delete a Note

```javascript
DELETE /notes/10
Headers: Authorization: Bearer {token}
Response: { success: true }
```

### Download Notes as Text File

```javascript
GET /notes/lecture/5/download
Headers: Authorization: Bearer {token}
Response: Text file download (notes.txt)
```

---

## Payment & Subscription

### Get Subscription Plans

```javascript
GET / payments / plans;
Response: [
  {
    id: 1,
    name: "Basic",
    price: 300,
    tokens: 100,
    features: ["Chat support", "Basic tokens", "3 tutorials"],
    isPopular: false,
  },
  {
    id: 2,
    name: "Pro",
    price: 500,
    tokens: 500,
    features: ["Email support", "Advanced lectures", "Free notes"],
    isPopular: true,
  },
  {
    id: 3,
    name: "Premium",
    price: 800,
    tokens: 1000,
    features: ["24/7 support", "Everything", "Certificate"],
    isPopular: false,
  },
];
```

### Initiate Payment

```javascript
POST /payments/initiate
Headers: Authorization: Bearer {token}
Body: { planId: 2 }
Response: {
  orderId: "order_123456",
  amount: 500,
  currency: "INR"
}
```

### Verify Payment (After Razorpay)

```javascript
POST /payments/verify
Headers: Authorization: Bearer {token}
Body: {
  orderId: "order_123456",
  paymentId: "pay_123456",
  signature: "signature_hash"
}
Response: {
  success: true,
  message: "Payment verified",
  subscription: { id, userId, planId, status: "active" },
  tokensAdded: 500
}
```

### Get Active Subscription

```javascript
GET /payments/subscription
Headers: Authorization: Bearer {token}
Response: {
  id, planId, status, startDate, endDate,
  plan: { name, tokens, features }
}
```

### Get Token History

```javascript
GET /payments/token-history
Headers: Authorization: Bearer {token}
Response: [
  {
    id, type: "earned", amount: 15, reason: "Teaching reward",
    relatedId: 5, createdAt
  },
  {
    id, type: "spent", amount: 10, reason: "Watched lecture",
    relatedId: 3, createdAt
  }
]
```

### Get Wallet Info

```javascript
GET /payments/wallet
Headers: Authorization: Bearer {token}
Response: {
  tokens: 125,
  history: [
    { type, amount, reason, createdAt },
    ...
  ]
}
```

---

## User Management

### Get User Profile

```javascript
GET /users/profile
Headers: Authorization: Bearer {token}
Response: {
  id, name, email, tokens, profilePicture, bio,
  isTeacher, lecturesCompleted, tasksCompleted, totalHours,
  createdAt
}
```

### Update User Profile

```javascript
PUT /users/profile
Headers: Authorization: Bearer {token}
Body: {
  name: "John Doe",
  bio: "Web developer passionate about teaching",
  isTeacher: true
}
Response: { id, name, bio, isTeacher, updatedAt }
```

### Get Learning Progress

```javascript
GET /users/progress
Headers: Authorization: Bearer {token}
Response: {
  stats: {
    lecturesCompleted: 5,
    tasksCompleted: 12,
    totalHours: 15.5
  },
  progress: [
    {
      id, lectureId, completionPercentage: 75,
      isCompleted: false, lecture: { title, videoUrl }
    }
  ]
}
```

### Update Learning Progress

```javascript
PUT /users/progress
Headers: Authorization: Bearer {token}
Body: {
  lectureId: 5,
  completionPercentage: 50
}
Response: {
  id, lectureId, completionPercentage: 50,
  isCompleted: false, updatedAt
}
```

### Get User Portfolio

```javascript
GET /users/portfolio
Headers: Authorization: Bearer {token}
Response: {
  id, name, bio, isTeacher,
  lecturesCount: 8,
  totalViews: 256,
  lectures: [
    { id, title, tokens, views },
    ...
  ]
}
```

### Update Portfolio

```javascript
PUT /users/portfolio
Headers: Authorization: Bearer {token}
Body: {
  bio: "Expert in web development with 5 years experience",
  isTeacher: true
}
Response: { id, bio, isTeacher, updatedAt }
```

---

## Feedback & Ratings

### Submit Feedback

```javascript
POST /feedback
Headers: Authorization: Bearer {token}
Body: {
  rating: 5,
  message: "Great course! Learned a lot."
}
Response: { id, userId, rating, message, createdAt }
```

### Get All Feedback

```javascript
GET /feedback?page=1&limit=10
Response: {
  count: 50,
  rows: [
    {
      id, rating, message, createdAt,
      user: { name, profilePicture }
    }
  ]
}
```

### Submit Contact Form

```javascript
POST /contact
Body: {
  name: "Jane Doe",
  email: "jane@example.com",
  message: "I have a question about the platform"
}
Response: { id, name, email, message, status: "open", createdAt }
```

---

## Common Workflows

### Workflow 1: User Onboarding

1. **Register**: POST /auth/register
   - Creates user with 100 initial tokens
2. **Get Lectures**: GET /lectures?page=1&limit=12
   - Browse available courses
3. **Get Profile**: GET /auth/me
   - Check tokens and account status

### Workflow 2: Watching a Lecture

1. **Get Lectures**: GET /lectures?search=javascript
   - Find relevant courses
2. **Get Details**: GET /lectures/5
   - View full lecture info
3. **Watch Lecture**: POST /lectures/5/watch
   - Deduct tokens, start progress tracking
4. **Take Notes**: POST /notes
   - Create notes while watching
5. **Update Progress**: PUT /users/progress
   - Track completion % manually or auto-track

### Workflow 3: Becoming a Teacher

1. **Update Profile**: PUT /users/profile
   - Set `isTeacher: true`
2. **Create Lecture**: POST /lectures
   - Upload course content
3. **Monitor Success**: GET /lectures/teacher/list
   - Check views and engagement

### Workflow 4: Purchasing Subscription

1. **Get Plans**: GET /payments/plans
   - Display 3 subscription options
2. **Initiate**: POST /payments/initiate
   - Create Razorpay order
3. **Payment**: (Razorpay popup UI)
   - User completes payment
4. **Verify**: POST /payments/verify
   - Confirm payment, add tokens
5. **Check Sub**: GET /payments/subscription
   - Verify active subscription

### Workflow 5: OAuth Login (Google)

1. **Frontend**: User clicks "Sign in with Google"
2. **Frontend**: Google SDK returns `idToken`
3. **Backend**: POST /auth/google
   - Submits token to backend
   - Backend verifies with Google
   - Creates user if new, returns JWT
4. **Frontend**: Store JWT, redirect to dashboard

---

## Error Codes & Handling

### Common HTTP Status Codes

- **200**: Success
- **201**: Created (new resource)
- **400**: Bad Request (validation error)
- **401**: Unauthorized (no token or invalid)
- **403**: Forbidden (not enough permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate email, etc)
- **500**: Server error

### Example Error Response

```javascript
{
  success: false,
  message: "Invalid email or password",
  status: 401
}
```

---

## Testing with cURL

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Get Current User (with token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Browse Lectures

```bash
curl -X GET "http://localhost:5000/api/lectures?page=1&limit=12&search=web"
```

### Watch Lecture

```bash
curl -X POST http://localhost:5000/api/lectures/1/watch \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Database Queries

### Get User Info

```sql
SELECT * FROM users WHERE email = 'john@example.com';
```

### Get All Lectures by Teacher

```sql
SELECT * FROM lectures WHERE teacherId = 1 ORDER BY createdAt DESC;
```

### Get User's Token History

```sql
SELECT * FROM token_history WHERE userId = 1 ORDER BY createdAt DESC;
```

### Get Active Subscriptions

```sql
SELECT * FROM subscriptions WHERE status = 'active';
```

### Get Popular Courses

```sql
SELECT * FROM lectures ORDER BY views DESC LIMIT 10;
```

---

## Environment Variables (.env)

```
# Server
PORT=5000
NODE_ENV=development

# Database
DB_PATH=./database/skillswap.db

# JWT
JWT_SECRET=your_super_secret_key_here_change_this
JWT_EXPIRE=30d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
FACEBOOK_APP_ID=your_facebook_app_id
MICROSOFT_CLIENT_ID=your_microsoft_client_id

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Useful Command Reference

### Backend

```bash
# Start server
npm start

# Development mode (auto-restart)
npm run dev

# Install dependencies
npm install
```

### Frontend

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install dependencies
npm install
```

### Database

```bash
# Access SQLite CLI
sqlite3 database/skillswap.db

# Run SQL query
sqlite3 database/skillswap.db "SELECT COUNT(*) FROM users;"

# Create backup
cp database/skillswap.db database/skillswap.backup.db
```

---

## Performance Tips

1. **Frontend Caching**: Images and videos are cached by browser
2. **API Pagination**: Always use pagination for large datasets
3. **Database Indexing**: Primary keys already indexed
4. **Token Refresh**: JWT 30-day expiration, extend if needed
5. **Database Backups**: Regular backups recommended for production
6. **CDN Usage**: Serve videos from S3/CloudFront for scale

---

This reference guide covers all major API endpoints and workflows. For more details, check individual service files in the frontend or controller files in the backend.

**Project Status**: Production-ready ✅
**Last Updated**: 2024
**Version**: 1.0.0
