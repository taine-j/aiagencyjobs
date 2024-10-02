import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/User.js';

export function configureAuth(app) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? 'https://aiagencyjobs-66f14b2f7923.herokuapp.com' 
    : 'http://localhost:1967';

  const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://aiagencyjobs.com'
    : 'http://localhost:3000';

  // Updated session configuration
  app.use(session({ 
    secret: process.env.SESSION_SECRET || 'your-secret-key', 
    resave: false,  
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      domain: process.env.NODE_ENV === 'production' ? 'aiagencyjobs.com' : 'localhost' // Explicitly set domain
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // 14 days
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  const callbackURL = process.env.NODE_ENV === 'production' 
    ? `${BACKEND_URL}/auth/google/callback` 
    : '/auth/google/callback';

  // Updated Google Strategy configuration
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        try {
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: email,
            emails: profile.emails,
            photos: profile.photos,
          });
        } catch (createError) {
          console.error('Error creating new user:', createError);
          return done(createError, null);
        }
      }

      return done(null, user);
    } catch (err) {
      console.error('Error in Google Strategy:', err);
      return done(err, null);
    }
  }));

  // Updated serialization
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Updated deserialization with error handling
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error('User not found'), null);
      }
      done(null, user);
    } catch (err) {
      console.error('Error deserializing user:', err);
      done(err, null);
    }
  });

  // Google authentication route
  app.get('/auth/google',
    passport.authenticate('google', { 
      scope: ['openid', 'profile', 'email'],
      prompt: 'select_account'
    })
  );

  // Updated callback route with explicit login and error handling
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log('Google OAuth callback reached');
      console.log('User:', req.user);
      console.log('Session:', req.session);

      if (req.user) {
        req.login(req.user, (err) => {
          if (err) {
            console.error('Error logging in user:', err);
            return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
          }
          console.log('User authenticated:', req.user.id);
          res.redirect(`${FRONTEND_URL}?auth=success`);
        });
      } else {
        console.log('Authentication failed');
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }
    }
  );

  // Updated logout route
  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect(FRONTEND_URL);
      });
    });
  });

  // Updated current user route with additional checks
  app.get('/current_user', (req, res) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    console.log('Is Authenticated:', req.isAuthenticated());

    if (req.isAuthenticated() && req.user) {
      const userWithoutProfilePicture = {
        id: req.user.id,
        displayName: req.user.displayName,
        emails: req.user.emails,
        photos: req.user.photos,
        companyName: req.user.companyName,
        location: req.user.location,
        companyDescription: req.user.companyDescription,
        techStack: req.user.techStack,
        googleId: req.user.googleId,
        appliedJobs: req.user.appliedJobs || []
      };

      console.log('User is authenticated:', userWithoutProfilePicture);
      res.json({
        ...userWithoutProfilePicture,
        profilePicture: req.user.profilePicture
      });
    } else {
      console.log('User is not authenticated or user object is missing');
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}