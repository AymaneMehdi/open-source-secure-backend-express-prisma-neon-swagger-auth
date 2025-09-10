import express from 'express';
import {
  filterCategoriesByName,
  filterCategoriesWithPagination,
  filterCategoriesByDateRange,
  filterCategoriesWithPosts,
  filterCategoriesWithoutPosts
} from '../controllers/categoryFilterController.js';

const router = express.Router();

// Filter categories by name
// GET /api/categories/filter/name/:name 
router.get('/:name', filterCategoriesByName);

// Filter with pagination (skip/take)
// GET /api/categories/filter/pagination
router.get('/pagination', filterCategoriesWithPagination);

// Filter by creation date range
// GET /api/categories/filter/date-range 
router.get('/date-range', filterCategoriesByDateRange);

// Filter categories that have posts
// GET /api/categories/filter/with-posts 
router.get('/with-posts', filterCategoriesWithPosts);

// Filter categories without posts
// GET /api/categories/filter/without-posts 
router.get('/without-posts', filterCategoriesWithoutPosts);

export default router;
