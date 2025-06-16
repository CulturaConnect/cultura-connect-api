const userService = require('../services/userService');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

async function searchByCpf(req, res) {
  const { cpf } = req.query;
  if (!cpf) throw new AppError('CPF obrigatório', 400);
  const user = await userService.findUserByCpf(cpf);
  if (!user) throw new AppError('Usuário não encontrado', 404);
  logger.info('User search by CPF', cpf);
  res.json({ id: user.id, nome: user.nome_completo, cpf: user.cpf, email: user.email });
}

module.exports = { searchByCpf };
