const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users, resetCodes } = require('./data');

const router = express.Router();
const JWT_SECRET = 'replace_this_secret'; // In real use, keep in env variable
const TOKEN_EXPIRY = '7d';

// Helper to find user by email
function findUserByEmail(email) {
  return users.find(u => u.email === email);
}

// Registration for person
router.post('/register/person', async (req, res) => {
  const { nomeCompleto, cpf, email, telefone, senha } = req.body;
  if (!nomeCompleto || !cpf || !email || !telefone || !senha) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  if (findUserByEmail(email)) {
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
  users.push(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
});

// Registration for company
router.post('/register/company', async (req, res) => {
  const { cnpj, isMei, email, senha, razaoSocial, inscricaoEstadual, inscricaoMunicipal, telefone } = req.body;
  if (!cnpj || typeof isMei !== 'boolean' || !email || !senha || !razaoSocial || !inscricaoEstadual || !inscricaoMunicipal || !telefone) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  if (findUserByEmail(email)) {
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
  users.push(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ message: 'Credenciais inválidas' });
  const match = await bcrypt.compare(senha, user.senha);
  if (!match) return res.status(401).json({ message: 'Credenciais inválidas' });
  const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.json({ token });
});

// Request password recovery code
router.post('/recover', (req, res) => {
  const { email } = req.body;
  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  resetCodes.set(email, code);
  console.log(`Código de recuperação para ${email}: ${code}`);
  res.json({ message: 'Código enviado' });
});

// Reset password with code
router.post('/reset', async (req, res) => {
  const { email, code, novaSenha } = req.body;
  const savedCode = resetCodes.get(email);
  if (!savedCode || savedCode !== code) {
    return res.status(400).json({ message: 'Código inválido' });
  }
  const user = findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  user.senha = await bcrypt.hash(novaSenha, 10);
  resetCodes.delete(email);
  res.json({ message: 'Senha redefinida com sucesso' });
});

module.exports = router;
