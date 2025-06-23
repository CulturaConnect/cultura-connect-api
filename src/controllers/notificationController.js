const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

async function listForUser(req, res) {
  const { userId } = req.params;
  const notifications = await notificationService.getNotificationsForUser(userId);
  logger.info('Notifications listed for user', userId);
  res.json(notifications);
}

module.exports = { listForUser };
