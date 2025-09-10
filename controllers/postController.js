import prisma from '../index.js';

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        categories: true
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get post by ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        categories: true
      }
    });    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get posts by user
export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        categories: true
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new post
export const createPost = async (req, res) => {
  try {
    const { title, content, authorId, categoryIds } = req.body;
    const data = {
      title,
      content,
      authorId
    };
    // If categoryIds is a non-empty array, connect the post to exactly these categories
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      data.categories = {
        set: categoryIds.map(id => ({ id }))
      };
    }
    // Create the post with the provided data and include author and categories in the response
    const newPost = await prisma.post.create({
      data,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        categories: true
      }
    });
    // Send the created post as the response
    res.status(201).json(newPost);
  } catch (error) {
    // Handle unique constraint and not found errors
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Post with this title and content already exists' });
    } else if (error.code === 'P2025') {
      res.status(400).json({ error: 'Author or category not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryIds } = req.body;
    // Build the update data object
    const updateData = {};
    if (typeof title === 'string') updateData.title = title;
    if (typeof content === 'string') updateData.content = content;
    // If categoryIds is provided, update the post categories
    if (Array.isArray(categoryIds)) {
      if (categoryIds.length > 0) {
        updateData.categories = {
          connect: categoryIds.map(id => ({ id })) // Connect to these categories
        };
      } else {
        updateData.categories = {
          set: [] // Remove all categories if empty array
        };
      }
    }
    // Update the post and include author and categories in the response
    const updatedPost = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        categories: true
      }
    });
    // Send the updated post as the response
    res.json(updatedPost);
  } catch (error) {
    // Handle not found and unique constraint errors
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Post not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Post with this title and content already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    // First, disconnect all categories from the post (if any)
    await prisma.post.update({
      where: { id },
      data: {
        categories: {
          set: [] // Disconnect all categories
        }
      }
    });
    // Now delete the post
    const deletedPost = await prisma.post.delete({
      where: { id }
    });
    res.json({ message: 'Post deleted successfully', post: deletedPost });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Post not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};