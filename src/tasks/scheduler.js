const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

// Roda todo dia às 08:00 (hora do servidor)
cron.schedule('0 8 * * *', async () => {
  try {
    logger.info('🕗 Executando notifyUpcomingProjects...');
    await notificationService.notifyUpcomingProjects();
  } catch (err) {
    logger.error('Erro ao executar notifyUpcomingProjects:', err);
  }
});

// Roda todo dia às 03:00
cron.schedule('0 3 * * *', async () => {
  try {
    logger.info('🧹 Executando removeOldProjects...');
    await notificationService.removeOldProjects();
  } catch (err) {
    logger.error('Erro ao executar removeOldProjects:', err);
  }
});

logger.info('📆 Cron jobs agendados!');
