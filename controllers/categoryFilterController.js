import prisma from '../index.js';

// Filter categories by name
export const filterCategoriesByName = async (req, res) => {
  try {
    const { name } = req.params;
    const categories = await prisma.category.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive' // Case insensitive search (Tech = tech = TECH)
        }
      },
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
          }
        }
      },
      orderBy: {
        name: 'asc' // Sort filtered categories alphabetically A-Z for consistent results
      }
    });    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter categories with pagination (skip/take)
export const filterCategoriesWithPagination = async (req, res) => {
  try {
    const { skip = 0, take = 10 } = req.query;  
    const categories = await prisma.category.findMany({
      skip: parseInt(skip), // Number of records to skip for pagination
      take: parseInt(take), // Number of records to return (limit)
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
          }
        }
      },
      orderBy: {
        name: 'asc' // Alphabetical ordering prevents pagination chaos
      }
    });  
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter categories by date range
export const filterCategoriesByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate); // Greater than or equal to start date
      if (endDate) where.createdAt.lte = new Date(endDate);     // Less than or equal to end date
    }  
    const categories = await prisma.category.findMany({
      where,
      include: {
        posts: true
      },
      orderBy: {
        createdAt: 'desc' // Sort by creation date - newest first (makes sense for date filtering)
      }
    });  
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter categories that have posts
export const filterCategoriesWithPosts = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        posts: {
          some: {} // Categories that have at least one post (not empty categories)
        }
      },
      include: {
        posts: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc' // Sort active categories alphabetically
      }
    });  
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Filter categories without posts
export const filterCategoriesWithoutPosts = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        posts: {
          none: {} // Categories that have no posts (empty)
        }
      },
      orderBy: {
        name: 'asc' // Sort empty categories alphabetically
      }
    });    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
