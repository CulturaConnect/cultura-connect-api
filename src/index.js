require('dotenv').config();
const express = require('express');
var cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const { sequelize } = require('./models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/users', userRoutes);
app.use('/companies', companyRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Server listening on PORT:', PORT);
  });
});
