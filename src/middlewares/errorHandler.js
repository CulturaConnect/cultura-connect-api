const { ValidationError, UniqueConstraintError } = require('sequelize');
const logger = require('../utils/logger');
const AppError = require('../errors/AppError');

module.exports = (err, req, res, next) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    const message = err.errors && err.errors[0] ? err.errors[0].message : err.message;
    return res.status(400).json({ error: message });
  }

  return res.status(500).json({ error: 'Internal server error' });
};
