const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * @swagger
 * /auth/register/person:
 *   post:
 *     summary: Registra uma pessoa
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nomeCompleto
 *               - cpf
 *               - email
 *               - telefone
 *               - senha
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *               cpf:
 *                 type: string
 *               email:
 *                 type: string
 *               telefone:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrado com sucesso
 *       400:
 *         description: Dados incompletos
 */
router.post('/register/person', authController.registerPerson);

/**
 * @swagger
 * /auth/register/company:
 *   post:
 *     summary: Registra uma empresa
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cnpj
 *               - isMei
 *               - email
 *               - senha
 *               - razaoSocial
 *               - inscricaoEstadual
 *               - inscricaoMunicipal
 *               - telefone
 *             properties:
 *               cnpj:
 *                 type: string
 *               isMei:
 *                 type: boolean
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               razaoSocial:
 *                 type: string
 *               inscricaoEstadual:
 *                 type: string
 *               inscricaoMunicipal:
 *                 type: string
 *               telefone:
 *                 type: string
 *               usuariosCpfs:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Registrado com sucesso
 *       400:
 *         description: Dados incompletos
 */
router.post('/register/company', authController.registerCompany);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login do usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token JWT
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Retorna perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/profile', authMiddleware, authController.profile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nomeCompleto:
 *                 type: string
 *               telefone:
 *                 type: string
 *               senhaAtual:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *               imagem:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Usuário não encontrado
 */
router.put(
  '/profile',
  authMiddleware,
  upload.single('imagem'),
  authController.updateProfile,
);

/**
 * @swagger
 * /auth/recover:
 *   post:
 *     summary: Envia código de recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Código enviado
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/recover', authController.recoverPassword);

/**
 * @swagger
 * /auth/reset:
 *   post:
 *     summary: Redefine a senha utilizando código
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - novaSenha
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Código inválido
 *       404:
 *         description: Usuário não encontrado
 */
router.post('/reset', authController.resetPassword);

module.exports = router;
