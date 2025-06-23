const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('./emailService');
const companyUserService = require('./companyUserService');
const projectService = require('./projectService');
const userService = require('./userService');
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

async function getUsersForProject(project) {
  if (project.company_id) {
    const owner = await userService.findUserById(project.company_id);
    if (owner && owner.type === 'company') {
      return companyUserService.getUsersForCompany(project.company_id);
    }
    if (owner) return [owner];
  }
  const ids = [project.responsavel_principal_id, project.responsavel_legal_id]
    .filter(Boolean)
    .filter((id, index, self) => self.indexOf(id) === index);
  const users = [];
  for (const id of ids) {
    const u = await userService.findUserById(id);
    if (u) users.push(u);
  }
  return users;
}

async function notifyProjectStatusChange(project) {
  const users = await getUsersForProject(project);
  if (users.length === 0) return;
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
    const users = await getUsersForProject(p);
    if (users.length === 0) continue;
    if (p.inicio && new Date(p.inicio) <= soon && new Date(p.inicio) > now) {
      for (const u of users) {
        try {
          await sendEmail(u.email, 'Projeto prestes a iniciar', `O projeto ${p.nome} inicia em breve.`);
          await addNotification(u.id, `O projeto ${p.nome} inicia em breve.`);
        } catch (_) {}
      }
    }
    if (p.fim && new Date(p.fim) <= soon && new Date(p.fim) > now) {
      for (const u of users) {
        try {
          await sendEmail(u.email, 'Projeto prestes a finalizar', `O projeto ${p.nome} termina em breve.`);
          await addNotification(u.id, `O projeto ${p.nome} termina em breve.`);
        } catch (_) {}
      }
    }
  }
}

async function removeOldProjects() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const old = await projectService.getOldNewProjects(cutoff);
  for (const p of old) {
    await projectService.deleteProject(p.id);
    const users = await getUsersForProject(p);
    for (const u of users) {
      try {
        await sendEmail(u.email, 'Projeto removido', `O projeto ${p.nome} foi removido por inatividade.`);
        await addNotification(u.id, `O projeto ${p.nome} foi removido por inatividade.`);
      } catch (_) {}
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
