function sanitizeCpfCnpj(value) {
  return value?.replace(/[^\d]+/g, '') ?? '';
}

module.exports = {
  sanitizeCpfCnpj,
};
