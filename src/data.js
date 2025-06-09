const db = require('./db');

async function findUserByEmail(email) {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
}

async function createPerson(user) {
  const { nomeCompleto, cpf, email, telefone, senha, id } = user;
  await db.query(
    'INSERT INTO users (id, type, nome_completo, cpf, email, telefone, senha) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [id, 'person', nomeCompleto, cpf, email, telefone, senha]
  );
}

async function createCompany(user) {
  const { id, cnpj, isMei, email, senha, razaoSocial, inscricaoEstadual, inscricaoMunicipal, telefone } = user;
  await db.query(
    'INSERT INTO users (id, type, cnpj, is_mei, email, senha, razao_social, inscricao_estadual, inscricao_municipal, telefone) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
    [id, 'company', cnpj, isMei, email, senha, razaoSocial, inscricaoEstadual, inscricaoMunicipal, telefone]
  );
}

async function updatePassword(email, senha) {
  await db.query('UPDATE users SET senha = $1 WHERE email = $2', [senha, email]);
}

async function saveResetCode(email, code) {
  await db.query(
    'INSERT INTO reset_codes (email, code) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code',
    [email, code]
  );
}

async function getResetCode(email) {
  const { rows } = await db.query('SELECT code FROM reset_codes WHERE email = $1', [email]);
  return rows[0] ? rows[0].code : null;
}

async function deleteResetCode(email) {
  await db.query('DELETE FROM reset_codes WHERE email = $1', [email]);
}

module.exports = {
  findUserByEmail,
  createPerson,
  createCompany,
  updatePassword,
  saveResetCode,
  getResetCode,
  deleteResetCode,
};
