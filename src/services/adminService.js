const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const userService = require('./userService');
const logger = require('../utils/logger');

async function ensureAdminUser(email, senha, nome = 'Master Admin') {
  if (!email || !senha) {
    throw new Error('Email e senha são obrigatórios');
  }
  let user = await userService.findUserByEmail(email);
  if (user) {
    logger.info('Admin já existe', email);
    return user;
  }
  const hashed = await bcrypt.hash(senha, 10);
  user = {
    id: uuidv4(),
    email,
    senha: hashed,
    nome,
  };
  await userService.createAdmin(user);
  logger.info('Admin criado', email);
  return user;
}

module.exports = { ensureAdminUser };
