const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('./emailService');
const companyUserService = require('./companyUserService');
const projectService = require('./projectService');
const { Notification } = require('../models');

async function addNotification(userId, message) {
  return Notification.create({
    id: uuidv4(),
    user_id: userId,
    message,
    created_at: new Date(),
  });
}

async function getNotificationsForUser(userId) {
  return Notification.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
}

async function notifyProjectStatusChange(project) {
  if (!project.company_id) return;
  const users = await companyUserService.getUsersForCompany(project.company_id);
  for (const user of users) {
    try {
      await sendEmail(
        user.email,
        'Status do Projeto Atualizado',
        `O projeto ${project.nome} teve o status alterado para ${project.status}.`,
      );
      await addNotification(
        user.id,
        `O projeto ${project.nome} teve o status alterado para ${project.status}.`,
      );
    } catch (_) {}
  }
}

async function notifyUpcomingProjects() {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const projects = await projectService.getProjects();
  for (const p of projects) {
    if (p.company_id) {
      if (p.inicio && new Date(p.inicio) <= soon && new Date(p.inicio) > now) {
        const users = await companyUserService.getUsersForCompany(p.company_id);
        for (const u of users) {
          try {
            await sendEmail(u.email, 'Projeto prestes a iniciar', `O projeto ${p.nome} inicia em breve.`);
            await addNotification(u.id, `O projeto ${p.nome} inicia em breve.`);
          } catch (_) {}
        }
      }
      if (p.fim && new Date(p.fim) <= soon && new Date(p.fim) > now) {
        const users = await companyUserService.getUsersForCompany(p.company_id);
        for (const u of users) {
          try {
            await sendEmail(u.email, 'Projeto prestes a finalizar', `O projeto ${p.nome} termina em breve.`);
            await addNotification(u.id, `O projeto ${p.nome} termina em breve.`);
          } catch (_) {}
        }
      }
    }
  }
}

async function removeOldProjects() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const old = await projectService.getOldNewProjects(cutoff);
  for (const p of old) {
    await projectService.deleteProject(p.id);
    if (p.company_id) {
      const users = await companyUserService.getUsersForCompany(p.company_id);
      for (const u of users) {
        try {
          await sendEmail(u.email, 'Projeto removido', `O projeto ${p.nome} foi removido por inatividade.`);
          await addNotification(u.id, `O projeto ${p.nome} foi removido por inatividade.`);
        } catch (_) {}
      }
    }
  }
}

module.exports = {
  notifyProjectStatusChange,
  notifyUpcomingProjects,
  removeOldProjects,
  addNotification,
  getNotificationsForUser,
};
