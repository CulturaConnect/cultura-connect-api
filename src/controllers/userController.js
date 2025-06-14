const userService = require('../services/userService');

async function searchByCpf(req, res) {
  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ message: 'CPF obrigatório' });
  const user = await userService.findUserByCpf(cpf);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json({ id: user.id, nome: user.nome_completo, cpf: user.cpf, email: user.email });
}

module.exports = { searchByCpf };
