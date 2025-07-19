const { User, ResetCode } = require('../models');

async function findUserByEmail(email) {
  return User.findOne({ where: { email } });
}

async function findUserByCpf(cpf) {
  return User.findOne({ where: { cpf } });
}

async function findUserByCnpj(cnpj) {
  return User.findOne({ where: { cnpj } });
}

async function findUserById(id) {
  return User.findByPk(id);
}

async function findUsersByCpfs() {
  return User.findAll({
    where: {
      type: 'person',
    },
    attributes: ['cpf'],
  });
}

async function createPerson(user) {
  const { nomeCompleto, cpf, email, telefone, senha, id } = user;
  await User.create({
    id,
    type: 'person',
    nome_completo: nomeCompleto,
    cpf,
    email,
    telefone,
    senha,
  });
}

async function createCompany(user) {
  const {
    id,
    cnpj,
    isMei,
    email,
    senha,
    razaoSocial,
    inscricaoEstadual,
    inscricaoMunicipal,
    telefone,
  } = user;
  await User.create({
    id,
    type: 'company',
    cnpj,
    is_mei: isMei,
    email,
    senha,
    razao_social: razaoSocial,
    inscricao_estadual: inscricaoEstadual,
    inscricao_municipal: inscricaoMunicipal,
    telefone,
  });
}

async function createAdmin(user) {
  const { id, email, senha, nome } = user;
  await User.create({
    id,
    type: 'admin',
    email,
    senha,
    nome_completo: nome,
  });
}

async function updatePassword(email, senha) {
  await User.update({ senha }, { where: { email } });
}

async function updateUser(id, data) {
  await User.update(data, { where: { id } });
  return findUserById(id);
}

async function saveResetCode(email, code, expiresAt) {
  await ResetCode.upsert({ email, code, expires_at: expiresAt });
}

async function getResetCode(email) {
  return ResetCode.findOne({ where: { email } });
}

async function deleteResetCode(email) {
  await ResetCode.destroy({ where: { email } });
}

module.exports = {
  findUserByEmail,
  findUserByCpf,
  findUserByCnpj,
  findUserById,
  createPerson,
  createCompany,
  createAdmin,
  updatePassword,
  updateUser,
  saveResetCode,
  getResetCode,
  deleteResetCode,
  findUsersByCpfs,
};
