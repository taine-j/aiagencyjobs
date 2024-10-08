import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/User.js'; // Import the User model

export function configureAuth(app) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  
  const BACKEND_URL = process.env.NODE_ENV === 'production' 
    ? 'https://aiagencyjobs-66f14b2f7923.herokuapp.com' 
    : 'http://localhost:1967';

  const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://aiagencyjobs.com'
    : 'http://localhost:3000';

  const isProduction = process.env.NODE_ENV === 'production';

  // Configure session middleware
  app.use(session({ 
    secret: process.env.SESSION_SECRET, 
    resave: false,  
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: isProduction, // Use secure cookies in production
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax' // 'none' for production, 'lax' for development
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
    })
  }));

  // Enable trust proxy
  app.set('trust proxy', 1);

  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize());
  app.use(passport.session());

  const callBackURL = process.env.NODE_ENV === 'production' ? `${BACKEND_URL}/auth/google/callback` : '/auth/google/callback'

  // Configure Passport with the Google strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callBackURL,
    proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    console.log('Google Strategy Callback - Profile:', profile);
    try {
      // Check if the user already exists in your database
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // If the user does not exist, create a new user
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
        user = await User.create({
          googleId: profile.id,
          displayName: profile.displayName,
          email: email,
          emails: profile.emails,
          photos: profile.photos,
        });
      }

      return done(null, user);
    } catch (err) {
      console.error('Error in Google Strategy:', err);
      return done(err, null);
    }
  }));

  // Serialize user information into the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user information from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Auth routes
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['openid', 'profile', 'email'] })
  );

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      console.log('Google Auth Callback - User:', req.user);
      const redirectUrl = isProduction
        ? 'https://aiagencyjobs.com'
        : 'http://localhost:3000';
      res.redirect(redirectUrl);
    }
  );

  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
      res.redirect(FRONTEND_URL);
    });
  });

  app.get('/current_user', (req, res) => {
    console.log('Current User Request - Session:', req.session);
    console.log('Current User Request - User:', req.user);
    console.log('Current User Request - Is Authenticated:', req.isAuthenticated());
    if (req.isAuthenticated()) {
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
        profilePicture: req.user.profilePicture // Include profilePicture in the response
      });
    } else {
      console.log('User is not authenticated');
      res.status(401).json({ error: 'Not authenticated' });
    }
  });
}