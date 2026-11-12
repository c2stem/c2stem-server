// pm2 start ecosystem.config.js
// One process is plenty for ~100 concurrent students. Auth is a stateless JWT,
// so this can be switched to exec_mode "cluster" with more instances later.
module.exports = {
  apps: [
    {
      name: "c2stem-server",
      script: "index.js",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        // PORT, MONGO_URI, JWT_SECRET_KEY, CORS_ORIGINS are read from server/.env
      },
    },
  ],
};
