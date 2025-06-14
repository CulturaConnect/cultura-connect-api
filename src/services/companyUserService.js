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

async function userBelongsToCompany(companyId, userId) {
  const link = await CompanyUser.findOne({ where: { company_id: companyId, user_id: userId } });
  return !!link;
}

module.exports = { addUserToCompany, getUsersForCompany, userBelongsToCompany };
