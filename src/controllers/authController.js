const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');
const { sendEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';

async function registerPerson(req, res) {
  const { nomeCompleto, cpf, email, telefone, senha } = req.body;
  if (!nomeCompleto || !cpf || !email || !telefone || !senha) {
    return res.status(400).json({ message: 'Dados incompletos' });
  }
  const existing = await userService.findUserByEmail(email);
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
  await userService.createPerson(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
}

async function registerCompany(req, res) {
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
  const existing = await userService.findUserByEmail(email);
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
  await userService.createCompany(user);
  res.status(201).json({ message: 'Registrado com sucesso' });
}

async function login(req, res) {
  const { email, senha } = req.body;
  const user = await userService.findUserByEmail(email);
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
}

async function profile(req, res) {
  const user = await userService.findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json({ user });
}

async function recoverPassword(req, res) {
  const { email } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const existing = await userService.getResetCode(email);
  const now = new Date();
  let code;
  if (existing && existing.expires_at > now) {
    code = existing.code;
  } else {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(now.getTime() + 60 * 60 * 1000); // 1h
    await userService.saveResetCode(email, code, expires);
  }
  try {
    await sendEmail(email, 'Recuperação de Senha', `Seu código: ${code}`);
  } catch (e) {
    console.error('Erro ao enviar email', e);
  }
  res.json({ message: 'Código enviado' });
}

async function resetPassword(req, res) {
  const { email, code, novaSenha } = req.body;
  const saved = await userService.getResetCode(email);
  if (!saved || saved.code !== code || saved.expires_at < new Date()) {
    return res.status(400).json({ message: 'Código inválido' });
  }
  const user = await userService.findUserByEmail(email);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  const hashed = await bcrypt.hash(novaSenha, 10);
  await userService.updatePassword(email, hashed);
  await userService.deleteResetCode(email);
  res.json({ message: 'Senha redefinida com sucesso' });
}

module.exports = {
  registerPerson,
  registerCompany,
  login,
  profile,
  recoverPassword,
  resetPassword,
};
