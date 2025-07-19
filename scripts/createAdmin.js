require('dotenv').config();
const { sequelize } = require('../src/models');
const { ensureAdminUser } = require('../src/services/adminService');

(async () => {
  try {
    await sequelize.sync();
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const senha = process.env.ADMIN_PASSWORD || 'admin123';
    await ensureAdminUser(email, senha);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
})();
