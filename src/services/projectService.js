const { Project } = require('../models');
const companyUserService = require('./companyUserService');

async function createProject(data) {
  return Project.create(data);
}

async function getProjects() {
  return Project.findAll();
}

async function userCanViewProject(project, user) {
  if (project.is_public) return true;
  if (!user) return false;
  if (project.company_id) {
    if (user.id === project.company_id) return true;
    return companyUserService.userBelongsToCompany(project.company_id, user.id);
  }
  return (
    user.id === project.responsavel_principal_id ||
    user.id === project.responsavel_legal_id
  );
}

async function getProjectsForUser(user) {
  const projects = await getProjects();
  const allowed = [];
  for (const p of projects) {
    if (await userCanViewProject(p, user)) allowed.push(p);
  }
  return allowed;
}

async function getProjectById(id) {
  return Project.findByPk(id);
}

async function updateProject(id, data) {
  await Project.update(data, { where: { id } });
  return getProjectById(id);
}


async function getOldNewProjects(cutoff) {
  return Project.findAll({ where: { status: 'novo', created_at: { [require('sequelize').Op.lt]: cutoff } } });
}

async function deleteProject(id) {
  return Project.destroy({ where: { id } });
}

module.exports = {
  createProject,
  getProjects,
  getProjectsForUser,
  userCanViewProject,
  getProjectById,
  updateProject,
  deleteProject,
  getOldNewProjects,
};
