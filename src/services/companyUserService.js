const { CompanyUser, User } = require('../models');

async function addUserToCompany(companyId, userId) {
  return CompanyUser.create({ company_id: companyId, user_id: userId });
}

async function getUsersForCompany(companyId) {
  const links = await CompanyUser.findAll({ where: { company_id: companyId } });
  const ids = links.map(l => l.user_id);
  if (ids.length === 0) return [];
  return User.findAll({ where: { id: ids } });
}

module.exports = { addUserToCompany, getUsersForCompany };
