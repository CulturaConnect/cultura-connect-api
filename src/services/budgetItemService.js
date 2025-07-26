const { BudgetItem, Project } = require('../models');
const { v4: uuidv4 } = require('uuid');

async function getItemsForProject(projectId) {
  const data = await BudgetItem.findAll({ where: { project_id: projectId } });
  if (!data || data.length === 0) {
    return [];
  }
  const items = data.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unit: item.unit,
    unitQty: item.unit_qty,
    unitValue: item.unit_value,
    adjustTotal: item.adjust_total,
  }));
  return items;
}

async function replaceItems(projectId, items) {
  await BudgetItem.destroy({ where: { project_id: projectId } });
  const records = [];
  for (const item of items) {
    const data = {
      id: uuidv4(),
      project_id: projectId,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unit_qty: item.unitQty,
      unit_value: item.unitValue,
      adjust_total: item.adjustTotal,
    };
    records.push(await BudgetItem.create(data));
  }
  await updateProjectTotal(projectId);
  return records;
}

async function updateProjectTotal(projectId) {
  const items = await getItemsForProject(projectId);
  let total = 0;
  for (const i of items) {
    const value = (i.quantity || 0) * (i.unitQty || 0) * (i.unitValue || 0);
    if (i.adjustTotal) total += value;
  }
  await Project.update(
    { orcamento_gasto: total },
    { where: { id: projectId } },
  );
}

module.exports = {
  getItemsForProject,
  replaceItems,
  updateProjectTotal,
};
