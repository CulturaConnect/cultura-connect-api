const budgetService = require('../services/budgetItemService');
const projectService = require('../services/projectService');
const companyUserService = require('../services/companyUserService');
const AppError = require('../errors/AppError');

async function update(req, res) {
  const { id } = req.params;
  const items = Array.isArray(req.body) ? req.body : req.body.items;
  if (!Array.isArray(items)) {
    throw new AppError('Lista de itens inválida', 400);
  }
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const canEdit = await projectService.userCanViewProject(project, req.user);
  if (!canEdit) throw new AppError('Projeto não encontrado', 404);
  if (project.company_id && req.user.type === 'company' && project.company_id !== req.user.id) {
    throw new AppError('Projeto não encontrado', 404);
  }
  if (req.user.type === 'company') {
    if (project.company_id !== req.user.id) {
      throw new AppError('Projeto não encontrado', 404);
    }
  } else if (
    req.user.id !== project.responsavel_principal_id &&
    req.user.id !== project.responsavel_legal_id &&
    !(await companyUserService.userBelongsToCompany(project.company_id, req.user.id))
  ) {
    throw new AppError('Projeto não encontrado', 404);
  }
  const result = await budgetService.replaceItems(id, items);
  await require('../services/notificationService').notifyBudgetUpdated(project);
  res.json(result);
}

async function list(req, res) {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const allowed = await projectService.userCanViewProject(project, req.user);
  if (!allowed) throw new AppError('Projeto não encontrado', 404);
  const items = await budgetService.getItemsForProject(id);
  res.json(items);
}

module.exports = { update, list };
