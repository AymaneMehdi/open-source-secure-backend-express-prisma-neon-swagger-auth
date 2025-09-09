const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// UUID validation
const validateId = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Category validation
const validateCategory = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim()
    .escape(),
  handleValidationErrors
];

const validateUpdateCategory = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category name must be between 1 and 100 characters')
    .trim()
    .escape(),
  handleValidationErrors
];

// Post validation
const validatePost = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Post title must be between 1 and 200 characters')
    .trim()
    .escape(),
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Post content must be between 1 and 10000 characters')
    .trim(),
  handleValidationErrors
];

const validateUpdatePost = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Post title must be between 1 and 200 characters')
    .trim()
    .escape(),
  body('content')
    .optional()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Post content must be between 1 and 10000 characters')
    .trim(),
  handleValidationErrors
];

// Profile Image validation
const validateProfileImage = [
  body('url')
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Please provide a valid URL')
    .isLength({ max: 2048 })
    .withMessage('URL must not exceed 2048 characters'),
  body('altText')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Alt text must not exceed 255 characters')
    .trim()
    .escape(),
  handleValidationErrors
];

const validateUpdateProfileImage = [
  body('url')
    .optional()
    .isURL({
      protocols: ['http', 'https'],
      require_protocol: true
    })
    .withMessage('Please provide a valid URL')
    .isLength({ max: 2048 })
    .withMessage('URL must not exceed 2048 characters'),
  body('altText')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Alt text must not exceed 255 characters')
    .trim()
    .escape(),
  handleValidationErrors
];

module.exports = {
  validateId,
  validatePagination,
  validateCategory,
  validateUpdateCategory,
  validatePost,
  validateUpdatePost,
  validateProfileImage,
  validateUpdateProfileImage,
  handleValidationErrors
};