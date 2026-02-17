module.exports = {
  apps: [{
    name: 'productive-core-api',
    script: 'dist/index.js',
    cwd: '/root/productive-core-backend',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
    },
    // Log configuration
    error_file: '/var/log/pm2/productive-core-error.log',
    out_file: '/var/log/pm2/productive-core-out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Graceful shutdown
    kill_timeout: 10000,
    listen_timeout: 10000,
    // Restart strategy
    max_restarts: 10,
    restart_delay: 1000,
    exp_backoff_restart_delay: 100,
  }]
};
