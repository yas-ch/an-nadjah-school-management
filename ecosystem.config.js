// =============================================================================
// AN-NADJAH — PM2 Ecosystem Configuration
// Production deployment for Ubuntu VPS
// =============================================================================

module.exports = {
  apps: [
    {
      name: "annadjah",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      env_file: ".env",

      // ── Process Management ──
      instances: 2,
      exec_mode: "cluster",
      max_memory_restart: "1G",

      // ── Logging ──
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/annadjah-error.log",
      out_file: "./logs/annadjah-out.log",
      merge_logs: true,

      // ── Health & Restart ──
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,
      watch: false,
      kill_timeout: 5000,

      // ── Metrics ──
      disable_source_map_support: true,
      instance_var: "INSTANCE_ID",
    },
  ],

  // ── Deployment Configuration ──
  deploy: {
    production: {
      user: "deploy",
      host: "YOUR_SERVER_IP",
      ref: "origin/main",
      repo: "https://github.com/yas-ch/an-nadjah-school-management.git",
      path: "/var/www/annadjah",
      "post-deploy":
        "npm ci --omit=dev && " +
        "npm run build && " +
        "npx prisma generate && " +
        "pm2 reload ecosystem.config.js --env production",
      "pre-setup": "apt-get update && apt-get install -y nodejs npm",
      ssh_options: "StrictHostKeyChecking=no",
    },
  },
};
