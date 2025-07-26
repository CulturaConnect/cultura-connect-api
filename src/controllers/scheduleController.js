const projectService = require('../services/projectService');
const s3Service = require('../services/s3Service');
const AppError = require('../errors/AppError');
const path = require('path');

async function update(req, res) {
  const { id } = req.params;
  let cronograma = req.body.cronograma_atividades || req.body;
  if (typeof cronograma === 'string') {
    try {
      cronograma = JSON.parse(cronograma);
    } catch (e) {
      throw new AppError('Cronograma inválido', 400);
    }
  }
  if (!Array.isArray(cronograma)) {
    throw new AppError('Cronograma inválido', 400);
  }
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const allowed = await projectService.userCanViewProject(project, req.user);
  if (!allowed) throw new AppError('Projeto não encontrado', 404);
  await projectService.updateProject(id, { cronograma_atividades: cronograma });
  const updated = await projectService.getProjectById(id);
  res.json(updated.cronograma_atividades);
}

async function uploadEvidence(req, res) {
  const { id, index } = req.params;
  if (!req.file) throw new AppError('Nenhum arquivo enviado', 400);
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const allowed = await projectService.userCanViewProject(project, req.user);
  if (!allowed) throw new AppError('Projeto não encontrado', 404);
  const cronograma = project.cronograma_atividades || [];
  const idx = parseInt(index, 10);
  if (Number.isNaN(idx) || idx < 0 || idx >= cronograma.length) {
    throw new AppError('Atividade não encontrada', 404);
  }
  const ext = path.extname(req.file.originalname);
  const baseName = path
    .basename(req.file.originalname, ext)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '');
  const fileName = `${Date.now()}_${baseName}${ext}`;
  const key = `projects/${id}/atividades/${index}/${fileName}`;
  const url = await s3Service.uploadFile(req.file.buffer, key, req.file.mimetype);
  if (!cronograma[idx].evidencias) cronograma[idx].evidencias = [];
  cronograma[idx].evidencias.push(url);
  await projectService.updateProject(id, { cronograma_atividades: cronograma });
  res.json({ url });
}

async function list(req, res) {
  const { id } = req.params;
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const allowed = await projectService.userCanViewProject(project, req.user);
  if (!allowed) throw new AppError('Projeto não encontrado', 404);
  res.json(project.cronograma_atividades || []);
}

module.exports = { update, list, uploadEvidence };
