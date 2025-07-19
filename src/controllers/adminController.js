const { Project } = require('../models');
const { fn, col } = require('sequelize');

async function metrics(req, res) {
  const totalProjects = await Project.count();
  const raw = await Project.findAll({
    attributes: ['status', [fn('COUNT', col('status')), 'count']],
    group: ['status'],
  });
  const projectsByStatus = raw.map(r => ({ status: r.status, count: parseInt(r.get('count'), 10) }));
  res.json({ totalProjects, projectsByStatus });
}

module.exports = { metrics };
