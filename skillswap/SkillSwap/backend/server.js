const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const { PORT } = process.env;

// Import routes
const authRoutes = require('./routes/authRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const notesRoutes = require('./routes/notesRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'your_secret_key', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Connect to the database
mongoose.connect(process.env.DB_PATH, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use routes
app.use('/auth', authRoutes);
app.use('/lectures', lectureRoutes);
app.use('/notes', notesRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/contact', contactRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});