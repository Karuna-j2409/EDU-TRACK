// Combines all feature routers under /api/v1
const express = require('express');
const { authenticate } = require('../middlewares/auth');
const authRoutes = require('./auth.routes');
const studentRoutes = require('./student.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', authenticate, studentRoutes); // only logged-in admins

module.exports = router;
