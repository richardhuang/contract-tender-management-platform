const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/authController');

const router = express.Router();

// All routes in this file require authentication
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getUserById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

module.exports = router;