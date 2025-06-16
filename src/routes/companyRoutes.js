const express = require('express');
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

/**
 * @swagger
 * /companies/{id}/users:
 *   get:
 *     summary: Lista usuários associados a uma empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/:id/users', authMiddleware, asyncHandler(companyController.listUsers));

/**
 * @swagger
 * /companies/{id}/users:
 *   post:
 *     summary: Associa um usuário existente a uma empresa
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpf
 *             properties:
 *               cpf:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário associado
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/:id/users', authMiddleware, asyncHandler(companyController.addUser));

module.exports = router;
