const companyService = require('../services/companyUserService');
const userService = require('../services/userService');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

async function addUser(req, res) {
  const { cpf } = req.body;
  const { id } = req.params;
  if (!cpf) throw new AppError('CPF obrigatório', 400);
  const user = await userService.findUserByCpf(cpf);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  await companyService.addUserToCompany(id, user.id);
  logger.info('User added to company', id, user.id);
  res.status(201).json({ message: 'Usuário associado' });
}

async function listUsers(req, res) {
  const { id } = req.params;
  const users = await companyService.getUsersForCompany(id);
  const sanitized = users.map(u => {
    const { senha, ...rest } = u.toJSON();
    return rest;
  });
  logger.info('Listed users for company', id);
  res.json(sanitized);
}

module.exports = { addUser, listUsers };
