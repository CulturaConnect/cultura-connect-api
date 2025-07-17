const { v4: uuidv4 } = require('uuid');
const projectService = require('../services/projectService');
const companyUserService = require('../services/companyUserService');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');
const path = require('path');

async function create(req, res) {
  const data = req.body;
  const jsonFields = [
    'modelo',
    'areas_execucao',
    'cronograma_atividades',
    'equipe',
  ];
  jsonFields.forEach((f) => {
    if (typeof data[f] === 'string') {
      try {
        data[f] = JSON.parse(data[f]);
      } catch (_) {}
    }
  });
  if (!data.nome) {
    throw new AppError('Nome do projeto é obrigatório', 400);
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
  if (!data.orcamento_previsto && req.body.orcamentoPrevisto) {
    data.orcamento_previsto = parseFloat(req.body.orcamentoPrevisto);
  }
  if (!data.orcamento_gasto && req.body.orcamentoGasto) {
    data.orcamento_gasto = parseFloat(req.body.orcamentoGasto);
  }
  if (req.user.type === 'company') {
    if (data.responsavel_principal_id) {
      const allowed = await companyUserService.userBelongsToCompany(
        req.user.id,
        data.responsavel_principal_id,
      );
      if (!allowed) {
        throw new AppError('Usuário não associado à empresa', 400);
      }
    }
    if (data.responsavel_legal_id) {
      const allowed = await companyUserService.userBelongsToCompany(
        req.user.id,
        data.responsavel_legal_id,
      );
      if (!allowed) {
        throw new AppError('Usuário não associado à empresa', 400);
      }
    }
    data.company_id = req.user.id;
  } else {
    data.responsavel_principal_id = req.user.id;
    data.responsavel_legal_id = req.user.id;
  }
  data.id = uuidv4();
  data.status = 'novo';
  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);

      const baseName = path
        .basename(req.file.originalname, ext)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

      const fileName = `${Date.now()}_${baseName}${ext}`;
      const key = `projects/${data.id}/${fileName}`;

      const url = await require('../services/s3Service').uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype,
      );
      data.imagem_url = url;
    } catch (e) {
      logger.error('Erro ao enviar imagem', e);
      throw new AppError('Erro ao salvar imagem', 500);
    }
  }
  const project = await projectService.createProject(data);
  logger.info('Project created', project.id);
  res.status(201).json(project);
}

async function list(req, res) {
  const projects = await projectService.getProjectsForUser(req.user);
  res.json(projects);
}

async function get(req, res) {
  const project = await projectService.getProjectById(req.params.id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  const allowed = await projectService.userCanViewProject(project, req.user);
  if (!allowed) throw new AppError('Projeto não encontrado', 404);
  res.json(project);
}

async function update(req, res) {
  const data = req.body;
  let originalStatus;
  const allowedStatuses = [
    'novo',
    'andamento',
    'pendente',
    'atrasado',
    'concluido',
  ];
  if (data.cronograma_atividades === undefined) data.cronograma_atividades = [];
  if (req.body.orcamentoPrevisto) {
    data.orcamento_previsto = parseFloat(req.body.orcamentoPrevisto);
  }
  if (req.body.orcamentoGasto) {
    data.orcamento_gasto = parseFloat(req.body.orcamentoGasto);
  }
  if (data.status !== undefined && !allowedStatuses.includes(data.status)) {
    throw new AppError('Status inválido', 400);
  }
  let project = await projectService.getProjectById(req.params.id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  originalStatus = project.status;
  if (req.user.type === 'company') {
    if (data.responsavel_principal_id) {
      const allowed = await companyUserService.userBelongsToCompany(
        req.user.id,
        data.responsavel_principal_id,
      );
      if (!allowed) {
        throw new AppError('Usuário não associado à empresa', 400);
      }
    }
    if (data.responsavel_legal_id) {
      const allowed = await companyUserService.userBelongsToCompany(
        req.user.id,
        data.responsavel_legal_id,
      );
      if (!allowed) {
        throw new AppError('Usuário não associado à empresa', 400);
      }
    }
  } else {
    data.responsavel_principal_id = req.user.id;
    data.responsavel_legal_id = req.user.id;
  }
  project = await projectService.updateProject(req.params.id, data);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  if (data.status && data.status !== originalStatus) {
    await require('../services/notificationService').notifyProjectStatusChange(
      project,
    );
  }
  logger.info('Project updated', req.params.id);
  res.json(project);
}

async function remove(req, res) {
  const deleted = await projectService.deleteProject(req.params.id);
  if (!deleted) throw new AppError('Projeto não encontrado', 404);
  logger.info('Project removed', req.params.id);
  res.status(204).send();
}

async function uploadImage(req, res) {
  const { id } = req.params;
  if (!req.file) {
    throw new AppError('Nenhum arquivo enviado', 400);
  }
  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);
  try {
    const key = `projects/${id}/${Date.now()}_${req.file.originalname}`;
    const url = await require('../services/s3Service').uploadFile(
      req.file.buffer,
      key,
      req.file.mimetype,
    );
    await projectService.updateProject(id, { imagem_url: url });
    res.json({ imagem_url: url });
  } catch (e) {
    logger.error('Erro ao enviar imagem', e);
    throw new AppError('Erro ao salvar imagem', 500);
  }
}

module.exports = { create, list, get, update, remove, uploadImage };
