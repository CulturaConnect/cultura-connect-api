function log(level, ...args) {
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}]`, ...args);
}

module.exports = {
  info: (...args) => log('log', ...args),
  error: (...args) => log('error', ...args),
};
