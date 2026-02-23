const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateTender } = require('../middleware/validation');
const {
  getAllTenders,
  getTenderById,
  createTender,
  updateTender,
  deleteTender,
  publishTender,
  closeTender
} = require('../controllers/tenderController');

const router = express.Router();

// Public routes (require authentication)
router.get('/', authenticateToken, getAllTenders);

// Tender-specific routes
router.get('/:id', authenticateToken, getTenderById);
router.post('/', authenticateToken, validateTender, createTender);
router.put('/:id', authenticateToken, validateTender, updateTender);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), deleteTender);

// Tender actions
router.post('/:id/publish', authenticateToken, authorizeRoles('admin', 'manager'), publishTender);
router.post('/:id/close', authenticateToken, authorizeRoles('admin', 'manager'), closeTender);

module.exports = router;