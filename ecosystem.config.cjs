module.exports = {
  apps: [{
    name: 'listingai',
    script: './dist/index.js',
    cwd: process.cwd(),
    instances: 1,
    exec_mode: 'fork',
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: process.env.PORT || 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    
    // Restart configuration
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Logging
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Process management
    kill_timeout: 5000,
    listen_timeout: 8000,
    shutdown_with_message: true,
    
    // Node.js specific
    node_args: '--max-old-space-size=1024',
    
    // Source map support for better error traces
    source_map_support: true,
    
    // Health monitoring (will use PORT from env)
    health_check_url: `http://localhost:${process.env.PORT || 3000}/api/health`,
    health_check_grace_period: 30000,
    
    // Advanced PM2 options
    increment_var: 'PORT',
    force: true,
    
    // Error handling
    exit_code: 1,
    stop_exit_codes: [0],
    
    // Script arguments
    args: [],
    
    // Environment file
    env_file: '.env'
  }]
} 