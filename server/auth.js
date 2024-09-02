import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/User.js'; // Import the User model

export function configureAuth(app) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  // Configure Passport with the Google strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if the user already exists in your database
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // If the user does not exist, create a new user
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          photos: profile.photos,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));

  // Serialize user information into the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user information from the session
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  // Configure session middleware
  app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    resave: false, 
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI, // Make sure to set this in your .env file
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Auth routes
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['openid', 'profile', 'email'] })
  );

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('http://localhost:3000');
    }
  );

  app.get('/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/current_user', (req, res) => {
    if (req.user) {
      res.json({
        id: req.user.id,
        displayName: req.user.displayName,
        emails: req.user.emails,
        photos: req.user.photos
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}