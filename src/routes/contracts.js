const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateContract } = require('../middleware/validation');
const {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractHistory,
  getContractStats
} = require('../controllers/contractController');

const router = express.Router();

// Public routes (require authentication)
router.get('/', authenticateToken, getAllContracts);
router.get('/stats', authenticateToken, getContractStats);

// Contract-specific routes
router.get('/:id', authenticateToken, getContractById);
router.post('/', authenticateToken, validateContract, createContract);
router.put('/:id', authenticateToken, validateContract, updateContract);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), deleteContract);

// Contract history
router.get('/:id/history', authenticateToken, getContractHistory);

module.exports = router;