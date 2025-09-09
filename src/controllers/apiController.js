const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Users CRUD operations
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ]);
    
    res.json({
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve users'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
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
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.json({
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve user'
    });
  }
};

// Categories CRUD operations
const getAllCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.count()
    ]);
    
    res.json({
      message: 'Categories retrieved successfully',
      data: categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve categories'
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!category) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }
    
    res.json({
      message: 'Category retrieved successfully',
      data: category
    });
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve category'
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    const category = await prisma.category.create({
      data: { name }
    });
    
    res.status(201).json({
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Conflict',
        message: 'Category with this name already exists'
      });
    }
    
    console.error('Create category error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create category'
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const category = await prisma.category.update({
      where: { id },
      data: { name }
    });
    
    res.json({
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Conflict',
        message: 'Category with this name already exists'
      });
    }
    
    console.error('Update category error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update category'
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.category.delete({
      where: { id }
    });
    
    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Category not found'
      });
    }
    
    console.error('Delete category error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete category'
    });
  }
};

// Posts CRUD operations
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count()
    ]);
    
    res.json({
      message: 'Posts retrieved successfully',
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve posts'
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await prisma.post.findUnique({
      where: { id }
    });
    
    if (!post) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    res.json({
      message: 'Post retrieved successfully',
      data: post
    });
  } catch (error) {
    console.error('Get post by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve post'
    });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const post = await prisma.post.create({
      data: { title, content }
    });
    
    res.status(201).json({
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Conflict',
        message: 'Post with this title or content already exists'
      });
    }
    
    console.error('Create post error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create post'
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    
    const post = await prisma.post.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        error: 'Conflict',
        message: 'Post with this title or content already exists'
      });
    }
    
    console.error('Update post error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update post'
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.post.delete({
      where: { id }
    });
    
    res.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Post not found'
      });
    }
    
    console.error('Delete post error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete post'
    });
  }
};

// Profile Images CRUD operations
const getAllProfileImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const [images, total] = await Promise.all([
      prisma.profileImage.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.profileImage.count()
    ]);
    
    res.json({
      message: 'Profile images retrieved successfully',
      data: images,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get profile images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve profile images'
    });
  }
};

const getProfileImageById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const image = await prisma.profileImage.findUnique({
      where: { id }
    });
    
    if (!image) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Profile image not found'
      });
    }
    
    res.json({
      message: 'Profile image retrieved successfully',
      data: image
    });
  } catch (error) {
    console.error('Get profile image by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve profile image'
    });
  }
};

const createProfileImage = async (req, res) => {
  try {
    const { url, altText } = req.body;
    
    const image = await prisma.profileImage.create({
      data: { url, altText }
    });
    
    res.status(201).json({
      message: 'Profile image created successfully',
      data: image
    });
  } catch (error) {
    console.error('Create profile image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create profile image'
    });
  }
};

const updateProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, altText } = req.body;
    
    const updateData = {};
    if (url !== undefined) updateData.url = url;
    if (altText !== undefined) updateData.altText = altText;
    
    const image = await prisma.profileImage.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      message: 'Profile image updated successfully',
      data: image
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Profile image not found'
      });
    }
    
    console.error('Update profile image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile image'
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.profileImage.delete({
      where: { id }
    });
    
    res.json({
      message: 'Profile image deleted successfully'
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Profile image not found'
      });
    }
    
    console.error('Delete profile image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete profile image'
    });
  }
};

module.exports = {
  // Users
  getAllUsers,
  getUserById,
  
  // Categories
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  
  // Posts
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  
  // Profile Images
  getAllProfileImages,
  getProfileImageById,
  createProfileImage,
  updateProfileImage,
  deleteProfileImage
};