const PORT = process.env.PORT || 3000;
const HOST = process.env.HOSTNAME || "0.0.0.0";

module.exports = {
  apps: [
    {
      name: "annadjah",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: PORT,
        HOSTNAME: HOST,
      },
      env_file: ".env",

      instances: process.env.NODE_ENV === "production" ? 2 : 1,
      exec_mode: "cluster",
      max_memory_restart: "1G",

      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/annadjah-error.log",
      out_file: "./logs/annadjah-out.log",
      merge_logs: true,

      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 5000,
      watch: false,
      kill_timeout: 5000,
      listen_timeout: 10000,

      disable_source_map_support: true,
    },
  ],
};
