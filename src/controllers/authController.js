const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const userService = require('../services/userService');
const companyService = require('../services/companyUserService');
const { sendEmail } = require('../services/emailService');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || '7d';

async function registerPerson(req, res) {
  const { nomeCompleto, cpf, email, telefone, senha } = req.body;
  if (!nomeCompleto || !cpf || !email || !telefone || !senha) {
    throw new AppError('Dados incompletos', 400);
  }
  const existing = await userService.findUserByEmail(email);
  if (existing) {
    throw new AppError('Email já registrado', 400);
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
  logger.info('User registered', user.id);
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
    usuariosCpfs,
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
    throw new AppError('Dados incompletos', 400);
  }
  const existing = await userService.findUserByEmail(email);
  if (existing) {
    throw new AppError('Email já registrado', 400);
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
  if (Array.isArray(usuariosCpfs)) {
    for (const cpf of usuariosCpfs) {
      const u = await userService.findUserByCpf(cpf);
      if (!u) throw new AppError('Usuário não encontrado', 404);
      await companyService.addUserToCompany(user.id, u.id);
    }
  }
  logger.info('Company registered', user.id);
  res.status(201).json({ message: 'Registrado com sucesso', id: user.id });
}

async function login(req, res) {
  const { email, senha } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user) throw new AppError('Credenciais inválidas', 401);
  const match = await bcrypt.compare(senha, user.senha);
  if (!match) throw new AppError('Credenciais inválidas', 401);
  const token = jwt.sign({ id: user.id, type: user.type }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  logger.info('User login', user.id);

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
      imagemUrl: user.imagem_url,
    },
  });
}

async function profile(req, res) {
  const user = await userService.findUserById(req.user.id);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  const { senha, ...safe } = user.toJSON();
  res.json({ user: safe });
}

async function updateProfile(req, res) {
  const user = await userService.findUserById(req.user.id);
  if (!user) throw new AppError('Usuário não encontrado', 404);

  const updates = {};
  if (user.type === 'person') {
    if (req.body.nomeCompleto) updates.nome_completo = req.body.nomeCompleto;
    if (req.body.telefone) updates.telefone = req.body.telefone;
  } else if (user.type === 'company') {
    if (req.body.telefone) updates.telefone = req.body.telefone;
  }

  if (req.body.novaSenha) {
    if (!req.body.senhaAtual)
      throw new AppError('Senha atual obrigatória', 400);
    const match = await bcrypt.compare(req.body.senhaAtual, user.senha);
    if (!match) throw new AppError('Senha atual incorreta', 400);
    updates.senha = await bcrypt.hash(req.body.novaSenha, 10);
  }

  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const baseName = path
        .basename(req.file.originalname, ext)
        .toLowerCase()
        .replace(/\s+/g, '-') // espaços → hífen
        .replace(/[^a-z0-9\-]/g, ''); // remove caracteres estranhos (acentos, etc.)

      const fileName = `${Date.now()}_${baseName}${ext}`;
      const key = `users/${user.id}/${fileName}`;

      const url = await require('../services/s3Service').uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype,
      );

      updates.imagem_url = url;
    } catch (e) {
      logger.error('Erro ao enviar imagem', e);
      throw new AppError('Erro ao salvar imagem', 500);
    }
  }

  await userService.updateUser(user.id, updates);
  const updated = await userService.findUserById(user.id);
  const { senha, ...safe } = updated.toJSON();
  res.json({ user: safe });
}

async function recoverPassword(req, res) {
  const { email } = req.body;
  const user = await userService.findUserByEmail(email);
  if (!user) throw new AppError('Usuário não encontrado', 404);
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
    res.json({ message: 'Código enviado' });
  } catch (e) {
    logger.error('Erro ao enviar email', e);
    throw new AppError('Erro ao enviar email', 500);
  }
}

async function resetPassword(req, res) {
  const { email, code, novaSenha } = req.body;
  const saved = await userService.getResetCode(email);
  if (!saved || saved.code !== code || saved.expires_at < new Date()) {
    throw new AppError('Código inválido', 400);
  }
  const user = await userService.findUserByEmail(email);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  const hashed = await bcrypt.hash(novaSenha, 10);
  await userService.updatePassword(email, hashed);
  await userService.deleteResetCode(email);
  res.json({ message: 'Senha redefinida com sucesso' });
}

async function checkResetCode(req, res) {
  const { email, code } = req.body;
  const saved = await userService.getResetCode(email);
  if (!saved || saved.code !== code || saved.expires_at < new Date()) {
    throw new AppError('Código inválido', 400);
  }
  res.json({ valid: true });
}

module.exports = {
  registerPerson,
  registerCompany,
  login,
  profile,
  updateProfile,
  recoverPassword,
  resetPassword,
  checkResetCode,
};
