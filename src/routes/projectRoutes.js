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
 *               segmento:
 *                 type: string
 *               inicio:
 *                 type: string
 *                 format: date-time
 *               fim:
 *                 type: string
 *                 format: date-time
 *               empresa_responsavel:
 *                 type: string
 *               modelo:
 *                 type: object
 *                 properties:
 *                   missao:
 *                     type: string
 *                   visao:
 *                     type: string
 *                   mercado:
 *                     type: string
 *                   publico_alvo:
 *                     type: string
 *                   receita:
 *                     type: string
 *                   proposta_valor:
 *                     type: string
 *                   retencao:
 *                     type: string
 *               tipo_responsavel_legal:
 *                 type: string
 *               titulo_oficial:
 *                 type: string
 *               areas_execucao:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rua:
 *                       type: string
 *                     cep:
 *                       type: string
 *                     logradouro:
 *                       type: string
 *                     numero:
 *                       type: string
 *                     complemento:
 *                       type: string
 *                     bairro:
 *                       type: string
 *                     cidade:
 *                       type: string
 *               resumo:
 *                 type: string
 *               objetivos_gerais:
 *                 type: string
 *               metas:
 *                 type: string
 *               cronograma_atividades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                     descricao:
 *                       type: string
 *               responsavel_principal:
 *                 type: string
 *               responsavel_principal_cpf:
 *                 type: string
 *               equipe:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     funcao:
 *                       type: string
 *                     cpf_cnpj:
 *                       type: string
 *               responsavel_legal_id:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               segmento:
 *                 type: string
 *               inicio:
 *                 type: string
 *                 format: date-time
 *               fim:
 *                 type: string
 *                 format: date-time
 *               empresa_responsavel:
 *                 type: string
 *               modelo:
 *                 type: object
 *                 properties:
 *                   missao:
 *                     type: string
 *                   visao:
 *                     type: string
 *                   mercado:
 *                     type: string
 *                   publico_alvo:
 *                     type: string
 *                   receita:
 *                     type: string
 *                   proposta_valor:
 *                     type: string
 *                   retencao:
 *                     type: string
 *               tipo_responsavel_legal:
 *                 type: string
 *               titulo_oficial:
 *                 type: string
 *               areas_execucao:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rua:
 *                       type: string
 *                     cep:
 *                       type: string
 *                     logradouro:
 *                       type: string
 *                     numero:
 *                       type: string
 *                     complemento:
 *                       type: string
 *                     bairro:
 *                       type: string
 *                     cidade:
 *                       type: string
 *               resumo:
 *                 type: string
 *               objetivos_gerais:
 *                 type: string
 *               metas:
 *                 type: string
 *               cronograma_atividades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                     descricao:
 *                       type: string
 *               responsavel_principal:
 *                 type: string
 *               responsavel_principal_cpf:
 *                 type: string
 *               equipe:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     funcao:
 *                       type: string
 *                     cpf_cnpj:
 *                       type: string
 *               responsavel_legal_id:
 *                 type: string
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
