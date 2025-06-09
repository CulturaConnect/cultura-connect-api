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

module.exports = { sequelize, User, ResetCode };
