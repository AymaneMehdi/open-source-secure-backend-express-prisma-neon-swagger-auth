import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Basic CRUD routes

// Get all categories
// GET /api/categories
router.get('/', getAllCategories);

// Get category by ID
// GET /api/categories/:id
router.get('/:id', getCategoryById);

// Create new category
// POST /api/categories
router.post('/', createCategory);

// Update category
// PUT /api/categories/:id
router.put('/:id', updateCategory);

// Delete category
// DELETE /api/categories/:id
router.delete('/:id', deleteCategory);

export default router;