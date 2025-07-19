const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @swagger
 * /admin/metrics:
 *   get:
 *     summary: Retorna métricas dos projetos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas retornadas com sucesso
 */
router.get('/metrics', authMiddleware, asyncHandler(adminController.metrics));

module.exports = router;
