module.exports = {
  apps: [
    {
      name: "protels",
      script: "dist/index.cjs",
      cwd: "/var/www/protels",
      node_args: "--env-file=.env",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
