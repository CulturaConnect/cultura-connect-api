const express = require('express');
const projectController = require('../controllers/projectController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Cria um novo projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Projeto criado
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authMiddleware, projectController.create);

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Lista projetos
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de projetos
 */
router.get('/', authMiddleware, projectController.list);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Obtém projeto por ID
 *     tags: [Projects]
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
 *         description: Projeto
 *       404:
 *         description: Projeto não encontrado
 */
router.get('/:id', authMiddleware, projectController.get);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Atualiza um projeto
 *     tags: [Projects]
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
 *         description: Projeto atualizado
 *       404:
 *         description: Projeto não encontrado
 */
router.put('/:id', authMiddleware, projectController.update);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Remove um projeto
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Projeto removido
 *       404:
 *         description: Projeto não encontrado
 */
router.delete('/:id', authMiddleware, projectController.remove);

module.exports = router;
