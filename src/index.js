require('dotenv').config();
const express = require('express');
const authRoutes = require('./auth');
const { sequelize } = require('./db');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log('Server listening on PORT:', PORT);
  });
});
