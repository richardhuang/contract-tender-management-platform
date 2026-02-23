const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateVendor } = require('../middleware/validation');
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorPerformance
} = require('../controllers/vendorController');

const router = express.Router();

// Public routes (require authentication)
router.get('/', authenticateToken, getAllVendors);

// Vendor-specific routes
router.get('/:id', authenticateToken, getVendorById);
router.post('/', authenticateToken, validateVendor, createVendor);
router.put('/:id', authenticateToken, validateVendor, updateVendor);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'manager'), deleteVendor);

// Vendor performance
router.get('/:id/performance', authenticateToken, getVendorPerformance);

module.exports = router;