module.exports = {
  apps: [
    {
      name: "cultura-connect-api",
      script: "src/index.js",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}
