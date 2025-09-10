import prisma from '../index.js';

// Get categories with post count
export const getCategoriesWithPostCount = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });  
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get total count of categories
export const getTotalCategoriesCount = async (req, res) => {
  try {
    const totalCount = await prisma.category.count();
    res.json({
      totalCategories: totalCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get categories grouped by post count ranges
export const getCategoriesGroupedByPostCount = async (req, res) => {
  try {
    const categoriesWithCount = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        }
      }
    });
    const grouped = {
      noPost: [],
      fewPosts: [], // 1-5 posts
      manyPosts: [], // 6-20 posts
      mostPosts: [] // 20+ posts
    };
    categoriesWithCount.forEach(category => {
      const postCount = category._count.posts;
      if (postCount === 0) {
        grouped.noPost.push(category);
      } else if (postCount <= 5) {
        grouped.fewPosts.push(category);
      } else if (postCount <= 20) {
        grouped.manyPosts.push(category);
      } else {
        grouped.mostPosts.push(category);
      }
    });
    res.json({
      summary: {
        noPost: grouped.noPost.length,
        fewPosts: grouped.fewPosts.length,
        manyPosts: grouped.manyPosts.length,
        mostPosts: grouped.mostPosts.length
      },
      data: grouped
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get top categories by post count
export const getTopCategoriesByPostCount = async (req, res) => {
  try {
    const { limit = 5 } = req.query;    
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: true }
        },
        posts: {
          take: 3, // Show sample posts
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        posts: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get basic category counts (total, with posts, without posts)
export const getCategoryCounts = async (req, res) => {
  try {
    const totalCategories = await prisma.category.count();    
    const categoriesWithPosts = await prisma.category.count({
      where: {
        posts: {
          some: {} // Categories that have at least one post
        }
      }
    });
    const categoriesWithoutPosts = totalCategories - categoriesWithPosts;
    res.json({
      totalCategories,
      categoriesWithPosts,
      categoriesWithoutPosts,
      summary: {
        active: categoriesWithPosts,
        inactive: categoriesWithoutPosts,
        activePercentage: Math.round((categoriesWithPosts / totalCategories) * 100)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
