const { v4: uuidv4 } = require('uuid');
const projectService = require('../services/projectService');
const companyUserService = require('../services/companyUserService');

async function create(req, res) {
  const data = req.body;
  if (!data.nome) {
    return res.status(400).json({ message: 'Nome do projeto é obrigatório' });
  }
  if (!data.modelo) {
    data.modelo = {
      missao: '',
      visao: '',
      mercado: '',
      publico_alvo: '',
      receita: '',
      proposta_valor: '',
      retencao: '',
    };
  }
  if (!data.areas_execucao) data.areas_execucao = [];
  if (!data.cronograma_atividades) data.cronograma_atividades = [];
  if (!data.equipe) data.equipe = [];
  if (data.responsavel_legal_id) {
    const allowed = await companyUserService.userBelongsToCompany(
      req.user.id,
      data.responsavel_legal_id,
    );
    if (!allowed) {
      return res.status(400).json({ message: 'Usuário não associado à empresa' });
    }
  }
  data.id = uuidv4();
  const project = await projectService.createProject(data);
  res.status(201).json(project);
}

async function list(req, res) {
  const projects = await projectService.getProjects();
  res.json(projects);
}

async function get(req, res) {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Projeto não encontrado' });
  res.json(project);
}

async function update(req, res) {
  const data = req.body;
  if (data.areas_execucao === undefined) data.areas_execucao = [];
  if (data.cronograma_atividades === undefined) data.cronograma_atividades = [];
  if (data.equipe === undefined) data.equipe = [];
  if (data.responsavel_legal_id) {
    const allowed = await companyUserService.userBelongsToCompany(
      req.user.id,
      data.responsavel_legal_id,
    );
    if (!allowed) {
      return res.status(400).json({ message: 'Usuário não associado à empresa' });
    }
  }
  const project = await projectService.updateProject(req.params.id, data);
  if (!project) return res.status(404).json({ message: 'Projeto não encontrado' });
  res.json(project);
}

async function remove(req, res) {
  const deleted = await projectService.deleteProject(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Projeto não encontrado' });
  res.status(204).send();
}

module.exports = { create, list, get, update, remove };
