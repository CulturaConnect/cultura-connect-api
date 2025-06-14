const companyService = require('../services/companyUserService');
const userService = require('../services/userService');

async function addUser(req, res) {
  const { cpf } = req.body;
  const { id } = req.params;
  if (!cpf) return res.status(400).json({ message: 'CPF obrigatório' });
  const user = await userService.findUserByCpf(cpf);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  await companyService.addUserToCompany(id, user.id);
  res.status(201).json({ message: 'Usuário associado' });
}

async function listUsers(req, res) {
  const { id } = req.params;
  const users = await companyService.getUsersForCompany(id);
  const sanitized = users.map(u => {
    const { senha, ...rest } = u.toJSON();
    return rest;
  });
  res.json(sanitized);
}

module.exports = { addUser, listUsers };
