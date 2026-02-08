const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User');

// Serialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
});

// Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ googleId: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

// Facebook OAuth strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ facebookId: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

// Microsoft OAuth strategy
passport.use(new MicrosoftStrategy({
    clientID: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackURL: '/auth/microsoft/callback'
}, (accessToken, refreshToken, profile, done) => {
    User.findOrCreate({ microsoftId: profile.id }, (err, user) => {
        return done(err, user);
    });
}));

module.exports = passport;