import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from '../models/User.js'; // Import the User model

export function configureAuth(app) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const REDIRECT_URI = NODE_ENV === 'production' 
    ? 'https://aiagencyjobs-66f14b2f7923.herokuapp.com/auth/google/callback'
    : 'http://localhost:3000/auth/google/callback';

console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current REDIRECT_URI:', REDIRECT_URI);

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

  // Initialize Passport and restore authentication state, if any, from the session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport with the Google strategy
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
  },
  async (accessToken, refreshToken, profile, done) => {
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
    passport.authenticate('google', { 
      failureRedirect: NODE_ENV === 'production' ? 'https://aiagencyjobs.com/login' : 'http://localhost:3000/login'
    }),
    (req, res) => {
      res.redirect(NODE_ENV === 'production' ? 'https://aiagencyjobs.com' : 'http://localhost:3000');
    }
  );

  app.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ error: 'Failed to logout' });
      }
       // Redirect based on the environment
    const redirectUrl = NODE_ENV === 'production' 
    ? 'https://aiagencyjobs.com'
    : 'http://localhost:3000';
    res.redirect(redirectUrl);
    });
  });

  app.get('/current_user', (req, res) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.user) {

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