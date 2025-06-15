const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/cultura', {
  dialect: 'postgres',
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nome_completo: DataTypes.STRING,
  cpf: DataTypes.STRING,
  cnpj: DataTypes.STRING,
  is_mei: DataTypes.BOOLEAN,
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  telefone: DataTypes.STRING,
  senha: DataTypes.STRING,
  imagem_url: DataTypes.STRING,
  razao_social: DataTypes.STRING,
  inscricao_estadual: DataTypes.STRING,
  inscricao_municipal: DataTypes.STRING,
}, {
  tableName: 'users',
  timestamps: false,
});

const ResetCode = sequelize.define('ResetCode', {
  email: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  code: DataTypes.STRING,
  expires_at: DataTypes.DATE,
}, {
  tableName: 'reset_codes',
  timestamps: false,
});

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    allowNull: false,
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  segmento: DataTypes.STRING,
  inicio: DataTypes.DATE,
  fim: DataTypes.DATE,
  modelo: DataTypes.JSONB,
  titulo_oficial: DataTypes.STRING,
  imagem_url: DataTypes.STRING,
  areas_execucao: DataTypes.JSONB,
  resumo: DataTypes.TEXT,
  objetivos_gerais: DataTypes.TEXT,
  metas: DataTypes.TEXT,
  cronograma_atividades: DataTypes.JSONB,
  responsavel_principal_id: DataTypes.UUID,
  equipe: DataTypes.JSONB,
  responsavel_legal_id: DataTypes.UUID,
}, {
  tableName: 'projects',
  timestamps: false,
});

const CompanyUser = sequelize.define('CompanyUser', {
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'company_users',
  timestamps: false,
});

module.exports = { sequelize, User, ResetCode, Project, CompanyUser };
