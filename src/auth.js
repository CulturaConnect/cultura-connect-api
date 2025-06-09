const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const data = require('./data');
const { sendEmail } = require('./email');
const authMiddleware = require('./authMiddleware');

const router = express.Router();
const JWT_SECRET = 'replace_this_secret'; // In real use, keep in env variable
const TOKEN_EXPIRY = '7d';

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
// Registration for person
router.post('/register/person', async (req, res) => {
  const { nomeCompleto, cpf, email, telefone, senha } = req.body;
  if (!nomeCompleto || !cpf || !email || !telefone || !senha) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  const existing = await data.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: 'Email já registrado' });
  }
  const hashed = await bcrypt.hash(senha, 10);
  const user = {
    id: uuidv4(),
    type: 'person',
    nomeCompleto,
    cpf,
    email,
    telefone,
    senha: hashed,
  };
  await data.createPerson(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
});

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
 *     responses:
 *       201:
 *         description: Registrado com sucesso
 *       400:
 *         description: Dados incompletos
 */
// Registration for company
router.post('/register/company', async (req, res) => {
  const {
    cnpj,
    isMei,
    email,
    senha,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    telefone,
  } = req.body;
  if (
    !cnpj ||
    typeof isMei !== 'boolean' ||
    !email ||
    !senha ||
    !razaoSocial ||
    !inscricaoEstadual ||
    !inscricaoMunicipal ||
    !telefone
  ) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  const existing = await data.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: 'Email já registrado' });
  }
  const hashed = await bcrypt.hash(senha, 10);
  const user = {
    id: uuidv4(),
    type: 'company',
    cnpj,
    isMei,
    email,
    senha: hashed,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    telefone,
  };
  await data.createCompany(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
});

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
// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await data.findUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
  const match = await bcrypt.compare(senha, user.senha);
  if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });
  const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  res.json({
    token,
    user: {
      id: user.id,
      tipo: user.type,
      email: user.email,
      nome: user.nome_completo || user.razao_social,
      telefone: user.telefone,
      cnpj: user.cnpj,
      isMei: user.is_mei,
      cpf: user.cpf,
      inscricaoEstadual: user.inscricao_estadual,
      inscricaoMunicipal: user.inscricao_municipal,
    },
  });
});

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
// Protected profile route
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await data.findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json({ user });
});

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
// Request password recovery code
router.post('/recover', async (req, res) => {
  const { email } = req.body;
  const user = await data.findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const existing = await data.getResetCode(email);
  const now = new Date();
  let code;
  if (existing && existing.expires_at > now) {
    code = existing.code;
  } else {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(now.getTime() + 60 * 60 * 1000); // 1h
    await data.saveResetCode(email, code, expires);
  }
  try {
    await sendEmail(email, 'Recuperação de Senha', `Seu código: ${code}`);
  } catch (e) {
    console.error('Erro ao enviar email', e);
  }
  res.json({ message: 'Código enviado' });
});

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
// Reset password with code
router.post('/reset', async (req, res) => {
  const { email, code, novaSenha } = req.body;
  const saved = await data.getResetCode(email);
  if (!saved || saved.code !== code || saved.expires_at < new Date()) {
    return res.status(400).json({ message: 'Código inválido' });
  }
  const user = await data.findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const hashed = await bcrypt.hash(novaSenha, 10);
  await data.updatePassword(email, hashed);
  await data.deleteResetCode(email);
  res.json({ message: 'Senha redefinida com sucesso' });
});

module.exports = router;
