const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
        age: true,
        provider: true,
        createdAt: true,
        updatedAt: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email', // Use email as username
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      if (!user.password) {
        return done(null, false, { message: 'Please use OAuth to login' });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Invalid email or password' });
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails[0].value },
            { 
              provider: 'google',
              providerId: profile.id
            }
          ]
        }
      });

      if (user) {
        // Update user with Google info if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'google',
            providerId: profile.id,
            refreshToken: refreshToken
          }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            username: profile.emails[0].value.split('@')[0] + '_' + Date.now(),
            firstName: profile.name.givenName || 'Unknown',
            lastName: profile.name.familyName || 'User',
            email: profile.emails[0].value,
            age: 18, // Default age
            provider: 'google',
            providerId: profile.id,
            refreshToken: refreshToken
          }
        });
      }

      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }));
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: profile.emails?.[0]?.value },
            { 
              provider: 'github',
              providerId: profile.id
            }
          ].filter(Boolean)
        }
      });

      if (user) {
        // Update user with GitHub info if needed
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            provider: 'github',
            providerId: profile.id,
            refreshToken: refreshToken
          }
        });
      } else {
        // Create new user
        const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
        user = await prisma.user.create({
          data: {
            username: profile.username || profile.displayName?.replace(/\s+/g, '_').toLowerCase() || 'github_user_' + Date.now(),
            firstName: profile.displayName?.split(' ')[0] || profile.username || 'Unknown',
            lastName: profile.displayName?.split(' ').slice(1).join(' ') || 'User',
            email: email,
            age: 18, // Default age
            provider: 'github',
            providerId: profile.id,
            refreshToken: refreshToken
          }
        });
      }

      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }));
}

module.exports = passport;