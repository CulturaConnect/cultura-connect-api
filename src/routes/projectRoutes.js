const express = require('express');
const projectController = require('../controllers/projectController');
const budgetController = require('../controllers/budgetController');
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const asyncHandler = require('../utils/asyncHandler');

const upload = multer({ storage: multer.memoryStorage() });

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
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
 *               apresentacao:
 *                 type: string
 *               historico:
 *                 type: string
 *               observacoes:
 *                 type: string
 *               descricao_proposta:
 *                 type: string
 *               descricao_contrapartida:
 *                 type: string
 *               justificativa:
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
 *                     acompanhamento:
 *                       type: string
 *                     evidencias:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *               responsavel_principal_id:
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
 *               anexos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     descricao:
 *                       type: string
 *                     arquivo:
 *                       type: string
 *                       format: binary
 *     responses:
 *       201:
 *         description: Projeto criado
 *       400:
 *         description: Dados inválidos
 */
router.post(
  '/',
  authMiddleware,
  upload.any(),
  asyncHandler(projectController.create),
);

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
router.get('/', authMiddleware, asyncHandler(projectController.list));

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
router.get('/:id', authMiddleware, asyncHandler(projectController.get));

/**
 * @swagger
 * /projects/{id}:
 *   patch:
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
 *         multipart/form-data:
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
 *                     acompanhamento:
 *                       type: string
 *                     evidencias:
 *                       type: array
 *                       items:
 *                         type: string
 *                         format: uri
 *               responsavel_principal_id:
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
router.patch('/:id', authMiddleware, asyncHandler(projectController.update));

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
router.delete('/:id', authMiddleware, asyncHandler(projectController.remove));

/**
 * @swagger
 * /projects/{id}/imagem:
 *   post:
 *     summary: Faz upload da imagem do projeto
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL da imagem enviada
 */
router.post(
  '/:id/imagem',
  authMiddleware,
  upload.single('imagem'),
  asyncHandler(projectController.uploadImage),
);

/**
 * @swagger
 * /projects/{id}/budget-items:
 *   get:
 *     summary: Lista itens de orçamento do projeto
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
 *         description: Lista de itens
 */
router.get(
  '/:id/budget-items',
  authMiddleware,
  asyncHandler(budgetController.list),
);

/**
 * @swagger
 * /projects/{id}/budget-items:
 *   patch:
 *     summary: Atualiza itens de orçamento do projeto
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
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 description:
 *                   type: string
 *                 quantity:
 *                   type: number
 *                 unit:
 *                   type: string
 *                 unitQty:
 *                   type: number
 *                 unitValue:
 *                   type: number
 *                 adjustTotal:
 *                   type: boolean
 *     responses:
 *       200:
 *         description: Itens atualizados
 */
router.patch(
  '/:id/budget-items',
  authMiddleware,
  asyncHandler(budgetController.update),
);

/**
 * @swagger
 * /projects/{id}/cronograma:
 *   get:
 *     summary: Lista atividades do cronograma do projeto
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
 *         description: Lista de atividades
 */
router.get(
  '/:id/cronograma',
  authMiddleware,
  asyncHandler(scheduleController.list),
);

/**
 * @swagger
 * /projects/{id}/visibilidade:
 *   patch:
 *     summary: Atualiza visibilidade do projeto
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
 *               isPublic:
 *                 type: boolean
 *                 description: Define se o projeto é público ou privado
 *     responses:
 *       200:
 *         description: Visibilidade atualizada
 *       404:
 *         description: Projeto não encontrado
 */
router.patch(
  '/:id/visibilidade',
  authMiddleware,
  asyncHandler(projectController.changeProjectVisibility),
);

/**
 * @swagger
 * /projects/{id}/cronograma:
 *   patch:
 *     summary: Atualiza o cronograma de atividades do projeto
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cronograma_atividades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                     descricao:
 *                       type: string
 *                     acompanhamento:
 *                       type: string
 *                     inicio:
 *                       type: string
 *                       format: date-time
 *                     fim:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *               evidencias[0]:
 *                 type: string
 *                 format: binary
 *               evidencias[1]:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cronograma atualizado
 */
router.patch(
  '/:id/cronograma',
  authMiddleware,
  upload.any(),
  asyncHandler(scheduleController.update),
);

/**
 * @swagger
 * /projects/{id}/cronograma/{index}/evidencias:
 *   post:
 *     summary: Adiciona evidência a uma atividade do cronograma
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: URL da evidência
 */
router.post(
  '/:id/cronograma/:index/evidencias',
  authMiddleware,
  upload.single('arquivo'),
  asyncHandler(scheduleController.uploadEvidence),
);

module.exports = router;
