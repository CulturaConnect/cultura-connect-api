const { Project, User, CompanyUser } = require('../models');
const { fn, col } = require('sequelize');

async function metrics(req, res) {
  const totalProjects = await Project.count();
  const raw = await Project.findAll({
    attributes: ['status', [fn('COUNT', col('status')), 'count']],
    group: ['status'],
  });
  const projectsByStatus = raw.map((r) => ({
    status: r.status,
    count: parseInt(r.get('count'), 10),
  }));

  const totalUsers = await User.count();
  const totalCompanies = await CompanyUser.count();

  const projectsBySegmentRaw = await Project.findAll({
    attributes: ['segmento', [fn('COUNT', col('segmento')), 'count']],
    group: ['segmento'],
  });

  const projectsBySegment = projectsBySegmentRaw.map((r) => ({
    name: r.segmento,
    count: parseInt(r.get('count'), 10),
  }));

  const usersByTypeRaw = await User.findAll({
    attributes: ['type', [fn('COUNT', col('type')), 'count']],
    group: ['type'],
  });

  const usersByType = usersByTypeRaw.map((r) => ({
    name: r.type,
    count: parseInt(r.get('count'), 10),
  }));

  const projectsByMonthRaw = await Project.findAll({
    attributes: [
      [fn('DATE_TRUNC', 'month', col('created_at')), 'month'],
      [fn('COUNT', col('id')), 'count'],
    ],
    group: ['month'],
    order: [[fn('DATE_TRUNC', 'month', col('created_at')), 'ASC']],
  });

  console.log('Projects by month raw:', projectsByMonthRaw);

  const projectsByMonth = projectsByMonthRaw.map((r) => ({
    month: r.get('month'),
    count: parseInt(r.get('count'), 10),
  }));

  res.json({
    totalProjects,
    projectsByStatus,
    totalUsers,
    totalCompanies,
    projectsBySegment,
    usersByType,
    projectsByMonth,
  });
}

module.exports = { metrics };
