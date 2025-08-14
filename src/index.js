require('dotenv').config();
const express = require('express');
var cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const notificationService = require('./services/notificationService');
const { ensureAdminUser } = require('./services/adminService');

const app = express();
app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

sequelize.sync({
  alter: true
}).then(async () => {
  await ensureAdminUser(
    process.env.ADMIN_EMAIL || 'admin@example.com',
    process.env.ADMIN_PASSWORD || 'admin123',
  );

  // Inicializa os cron jobs
  require('./tasks/scheduler'); // 👈 aqui entra o novo

  app.listen(PORT, () => {
    logger.info('Server listening on PORT:', PORT);
  });
});
