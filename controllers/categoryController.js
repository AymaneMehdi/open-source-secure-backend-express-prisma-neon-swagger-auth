import prisma from '../index.js';

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        posts: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc' // Newest posts first
          }
        }
      },
      orderBy: {
        name: 'asc' // Categories alphabetically A-Z
      }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc' // Newest posts first
          }
        }
      }
    });  
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await prisma.category.create({
      data: { name }
    });
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;  
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name }
    });    
    res.json(updatedCategory);
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else if (error.code === 'P2002') {
      res.status(400).json({ error: 'Category name already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query; // Optional force delete    
    // Check if category exists and has posts
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    // Category not found
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }  
    // If category has posts and not force delete, return error
    if (category._count.posts > 0 && !force) {
      return res.status(400).json({ 
        error: 'Cannot delete category with posts',
        message: `Category has ${category._count.posts} posts. Use force=true to delete anyway or remove posts first.`,
        postCount: category._count.posts
      });
    }    
    // If force delete, disconnect posts first
    if (force && category._count.posts > 0) {
      await prisma.category.update({
        where: { id },
        data: {
          posts: {
            set: [] // Disconnect all posts
          }
        }
      });
    }  
    // Now delete the category
    const deletedCategory = await prisma.category.delete({
      where: { id }
    });    
    res.json({ 
      message: 'Category deleted successfully', 
      category: deletedCategory,
      disconnectedPosts: force ? category._count.posts : 0
    });
  } catch (error) {
    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Category not found' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};
