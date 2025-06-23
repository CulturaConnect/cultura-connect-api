const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Lista notificações de um usuário
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de notificações
 */
router.get('/:userId', authMiddleware, asyncHandler(notificationController.listForUser));

module.exports = router;
