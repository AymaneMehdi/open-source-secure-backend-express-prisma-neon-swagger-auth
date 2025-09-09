const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

// Register a new user
const register = async (req, res) => {
  try {
    const { username, firstName, lastName, email, age, password } = req.body;
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'User Already Exists',
        message: existingUser.email === email 
          ? 'User with this email already exists' 
          : 'Username is already taken'
      });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        firstName,
        lastName,
        email,
        age,
        password: hashedPassword,
        provider: 'local'
      },
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
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to register user'
    });
  }
};

// Login user
const login = async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: info.message || 'Invalid credentials'
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session login error:', err);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to create session'
        });
      }
      
      // Generate JWT token
      const token = generateToken(user.id);
      
      res.json({
        message: 'Login successful',
        user,
        token
      });
    });
  })(req, res, next);
};

// Logout user
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to logout'
      });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'Failed to destroy session'
        });
      }
      
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }
    
    res.json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { username, firstName, lastName, email, age } = req.body;
    const userId = req.user.id;
    
    // Check if username or email is already taken by another user
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                username ? { username } : {},
                email ? { email } : {}
              ].filter(obj => Object.keys(obj).length > 0)
            }
          ]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          error: 'Conflict',
          message: existingUser.username === username 
            ? 'Username is already taken'
            : 'Email is already in use'
        });
      }
    }
    
    // Update user
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (age !== undefined) updateData.age = age;
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot change password for OAuth users'
      });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Authentication Failed',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
    
    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password'
    });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    // Logout and destroy session
    req.logout((err) => {
      if (err) console.error('Logout error during account deletion:', err);
    });
    
    req.session.destroy((err) => {
      if (err) console.error('Session destroy error during account deletion:', err);
    });
    
    res.clearCookie('connect.sid');
    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete account'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
};