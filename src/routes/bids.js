const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBid } = require('../middleware/validation');
const {
  getAllBids,
  getBidById,
  createBid,
  updateBid,
  deleteBid,
  submitBid,
  reviewBid
} = require('../controllers/bidController');

const router = express.Router();

// Public routes (require authentication)
router.get('/', authenticateToken, getAllBids);

// Bid-specific routes
router.get('/:id', authenticateToken, getBidById);
router.post('/', authenticateToken, validateBid, createBid);
router.put('/:id', authenticateToken, validateBid, updateBid);
router.delete('/:id', authenticateToken, deleteBid);

// Bid actions
router.post('/:id/submit', authenticateToken, submitBid);
router.post('/:id/review', authenticateToken, authorizeRoles('admin', 'manager'), reviewBid);

module.exports = router;