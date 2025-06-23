const { Project } = require('../models');

async function createProject(data) {
  return Project.create(data);
}

async function getProjects() {
  return Project.findAll();
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
  getProjectById,
  updateProject,
  deleteProject,
  getOldNewProjects,
};
