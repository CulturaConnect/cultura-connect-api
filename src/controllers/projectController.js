const { v4: uuidv4 } = require('uuid');
const projectService = require('../services/projectService');
const companyUserService = require('../services/companyUserService');
const AppError = require('../errors/AppError');
const logger = require('../utils/logger');
const path = require('path');
const { Project } = require('../models');

const parseFloatSafe = (val) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

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
  data.orcamento_previsto = parseFloatSafe(
    data.orcamento_previsto ?? req.body.orcamentoPrevisto,
  );

  data.orcamento_gasto = parseFloatSafe(
    data.orcamento_gasto ?? req.body.orcamentoGasto,
  );

  data.id = uuidv4();
  data.status = 'novo';

  const anexos = [];

  Object.entries(req.body).forEach(([key, value]) => {
    console.log(`Processing key: ${key}, value: ${value}`);
    const match = key.match(/^anexos_descricao_(\d+)$/);
    if (match) {
      const idx = parseInt(match[1], 10);
      anexos[idx] = anexos[idx] || {};
      anexos[idx].descricao = value;
    }
  });

  let imagemFile = null;

  if (req.files && req.files.length) {
    for (const file of req.files) {
      if (file.fieldname === 'imagem') {
        imagemFile = file;
        continue;
      }

      const match = file.fieldname.match(/^anexos_arquivo_(\d+)$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const ext = path.extname(file.originalname);
        const baseName = path
          .basename(file.originalname, ext)
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9\-]/g, '');
        const fileName = `${Date.now()}_${baseName}${ext}`;
        const key = `projects/${data.id}/anexos/${fileName}`;
        const url = await require('../services/s3Service').uploadFile(
          file.buffer,
          key,
          file.mimetype,
        );
        anexos[idx] = anexos[idx] || {};
        anexos[idx].arquivo_url = url;
      }
    }
  }

  data.anexos = anexos.filter((a) => a && (a.descricao || a.arquivo_url));

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

  if (imagemFile) {
    try {
      const ext = path.extname(imagemFile.originalname);

      const baseName = path
        .basename(imagemFile.originalname, ext)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '');

      const fileName = `${Date.now()}_${baseName}${ext}`;
      const key = `projects/${data.id}/${fileName}`;

      const url = await require('../services/s3Service').uploadFile(
        imagemFile.buffer,
        key,
        imagemFile.mimetype,
      );
      data.imagem_url = url;
    } catch (e) {
      logger.error('Erro ao enviar imagem', e);
      throw new AppError('Erro ao salvar imagem', 500);
    }
  }
  const project = await projectService.createProject(data);
  await require('../services/notificationService').notifyProjectCreated(project);
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
  const jsonFields = [
    'modelo',
    'areas_execucao',
    'cronograma_atividades',
    'equipe',
    'anexos',
  ];
  jsonFields.forEach((f) => {
    if (typeof data[f] === 'string') {
      try {
        data[f] = JSON.parse(data[f]);
      } catch (_) {}
    }
  });
  // Não sobrescrever cronograma_atividades e anexos se não foram fornecidos
  // Isso preserva os dados existentes em operações PATCH
  if (data.cronograma_atividades === undefined) {
    delete data.cronograma_atividades;
  }
  if (data.anexos === undefined) {
    delete data.anexos;
  }
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
  await require('../services/notificationService').notifyProjectUpdated(project);
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

async function changeProjectVisibility(req, res) {
  const { id } = req.params;
  const { isPublic } = req.body;

  const project = await projectService.getProjectById(id);
  if (!project) throw new AppError('Projeto não encontrado', 404);

  project.is_public = isPublic;
  await Project.update({ is_public: !!isPublic }, { where: { id } });
  logger.info('Project visibility updated', id);
  res.json({ message: 'Visibilidade atualizada com sucesso' });
}

module.exports = {
  create,
  list,
  get,
  update,
  remove,
  uploadImage,
  changeProjectVisibility,
};
