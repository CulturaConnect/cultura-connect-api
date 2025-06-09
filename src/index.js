require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth');
const { sequelize } = require('./db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Server listening on PORT:', PORT);
  });
});
