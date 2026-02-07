# SkillSwap - Learn and Teach Skills

A complete peer-to-peer skill-sharing platform where users can learn new skills and earn tokens by teaching others. Built with modern tech stack including React, Node.js, Express, and SQLite.

## Features

### Authentication

- Email & Password registration/login
- Google OAuth
- Facebook OAuth
- Microsoft OAuth
- JWT-based authentication
- Global logout with session destruction

### Dashboard

- Top navigation with SkillSwap branding
- Menu items: Home, How It Works, About, Services, Contact, Feedback, Blog, Info
- Search functionality for lectures
- Display remaining learning tokens
- Dark mode toggle
- User profile with avatar

### Modules

- **Customer Support**: Chat, Call, Contact Form
- **Profile Management**: Update name, bio, profile picture
- **Progress Tracker**: Track lecture completion and learning progress
- **Lectures & Tasks Count**: View statistics
- **Portfolio**: Showcase created lectures and skills
- **Subscription Management**: Manage active plans

### Subscription Plans

1. **Basic (₹300)**
   - Learning Tokens
   - Chat Tokens
   - Anytime Support

2. **Pro (₹500)**
   - All Basic features
   - Premium Lectures
   - Free Notes

3. **Premium (₹800)**
   - All Pro features
   - Premium Notes
   - Priority Support

### Lecture System

- Browse and search lectures by category
- Video player with lecture content
- Token deduction on lecture view
- Automatic token transfer to teachers
- Teacher profile visible during lecture
- Lecture ratings and reviews

### Notes System

- Right-side notes editor on lecture page
- Auto-save notes to database
- Download notes as text file
- Edit and delete notes

### Token System

- Wallet showing current balance
- Token history with earn/spend transactions
- Token deduction per lecture viewed
- Token earning when teaching lectures

### Payment Integration

- Razorpay payment gateway integration
- Secure payment verification
- Automatic token addition on successful payment
- Subscription plan management

## Project Structure

```
skillswap/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── database/
│   └── schema.json
│
├── .env.example
└── README.md
```

## Tech Stack

### Frontend

- **React.js** with Vite for fast development
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation
- Dark mode support

### Backend

- **Node.js** with Express.js
- **Sequelize ORM** for database management
- **SQLite** for persistent storage
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Razorpay** for payment processing
- **CORS** for cross-origin requests

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### ⚡ Quick Start (Single Command)

**Windows:**

```bash
run.bat
```

**macOS/Linux:**

```bash
chmod +x run.sh
./run.sh
```

This single command will:

- Install all dependencies (frontend & backend)
- Create .env file
- Start both servers automatically
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

---

### Manual Setup (If Quick Start Doesn't Work)

### Backend Setup

1. **Navigate to backend directory**

```bash
cd skillswap/backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Create environment file**

```bash
cp .env.example .env
```

4. **Configure environment variables**
   - Update `.env` with your Razorpay keys
   - Set JWT_SECRET
   - Configure OAuth credentials (Google, Facebook, Microsoft)

5. **Start backend server**

```bash
npm start
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**

```bash
cd skillswap/frontend
```

2. **Install dependencies**

```bash
npm install
```

3. **Start development server**

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile
- `POST /auth/google` - Google OAuth login
- `POST /auth/facebook` - Facebook OAuth login
- `POST /auth/microsoft` - Microsoft OAuth login

### Lectures

- `GET /lectures` - Get all lectures (paginated, searchable)
- `GET /lectures/:id` - Get lecture details
- `POST /lectures` - Create new lecture (teacher)
- `PUT /lectures/:id` - Update lecture
- `DELETE /lectures/:id` - Delete lecture
- `POST /lectures/:id/watch` - Watch lecture (deduct tokens)
- `GET /lectures/teacher/list` - Get teacher's lectures

### Notes

- `GET /notes/lecture/:lectureId` - Get notes for lecture
- `POST /notes` - Create note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note
- `GET /notes/lecture/:lectureId/download` - Download notes

### Payments

- `GET /payments/plans` - Get subscription plans
- `POST /payments/initiate` - Initiate payment
- `POST /payments/verify` - Verify payment
- `GET /payments/subscription` - Get user subscription
- `GET /payments/token-history` - Get token transaction history
- `GET /payments/wallet` - Get wallet balance

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/progress` - Get learning progress
- `PUT /users/progress` - Update progress
- `GET /users/portfolio` - Get user portfolio
- `PUT /users/portfolio` - Update portfolio

### Feedback

- `POST /feedback` - Submit feedback
- `GET /feedback` - Get all feedback

### Contact

- `POST /contact` - Submit contact form

## Database Schema

### Tables

- `users` - User accounts and profiles
- `lectures` - Course lectures
- `notes` - User notes on lectures
- `subscriptions` - User subscriptions
- `payments` - Payment transactions
- `token_history` - Token earning/spending logs
- `progress` - User learning progress
- `feedback` - User feedback
- `contacts` - Contact form submissions

## Environment Variables

```
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
DB_PATH=./database/skillswap.db
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Usage

1. **Register/Login**
   - Create account with email/password or OAuth
   - JWT token stored in localStorage

2. **Browse Lectures**
   - Search for lectures by category or keyword
   - View lecture details and teacher profile

3. **Watch Lectures**
   - Select lecture to watch
   - Tokens automatically deducted
   - Tokens transferred to teacher
   - View notes alongside video

4. **Take Notes**
   - Type notes while watching
   - Auto-save to database
   - Download as text file

5. **Subscribe**
   - Choose subscription plan
   - Complete Razorpay payment
   - Receive tokens automatically

6. **Teach**
   - Create lecture content
   - Upload video
   - Earn tokens when others watch
   - Manage your portfolio

## Features Implementation

### Dark Mode

- Toggle switch in navbar
- Persisted in localStorage
- Applied to all components

### Token Economy

- Users earn tokens by teaching
- Token deduction on lecture viewing
- Token history tracking
- Wallet management

### Payment Integration

- Razorpay order creation
- Payment verification
- Automatic subscription activation
- Token addition on success

### Authentication

- Password hashing with bcrypt
- JWT token generation
- Protected routes
- Middleware validation

### Database Relations

- User → Lecture (one-to-many)
- User → Subscription (one-to-many)
- Lecture → Notes (one-to-many)
- User → TokenHistory (one-to-many)

## Security Features

- JWT authentication for protected routes
- Password hashing with bcrypt
- CORS configuration
- SQL injection prevention with ORM
- Request validation
- Error handling middleware

## Future Enhancements

- Live lecture scheduling and streaming
- Advanced user analytics
- Recommendation engine
- Messaging system for support
- Video hosting service integration
- Certificate generation
- Leaderboards and achievements
- Advanced search filters

## Testing

To test the application:

1. Run both frontend and backend servers
2. Open `http://localhost:3000` in browser
3. Test registration/login flows
4. Browse and search lectures
5. Test payment integration
6. Verify token transactions

## Troubleshooting

### Backend won't start

- Check Node.js version (v14+)
- Verify port 5000 is available
- Check environment variables

### Frontend connection error

- Ensure backend is running on port 5000
- Check CORS is enabled
- Verify API_URL in services

### Database issues

- Delete existing `skillswap.db` file
- Server will recreate on restart
- Check database permissions

## Contributing

1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request

## License

MIT License - Free to use for educational and commercial purposes

## Support

For issues and questions:

- Email: support@skillswap.com
- Contact form in application
- GitHub issues

## Authors

SkillSwap Development Team

---

**Note**: This is a production-ready application suitable for final-year engineering projects. All features are fully implemented with complete error handling, validation, and database integration.
