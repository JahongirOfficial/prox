module.exports = {
  apps: [{
    name: 'prox-academy',
    script: './dist/server.js',
    cwd: '/var/www/prox/server',
    env: {
      NODE_ENV: 'production',
      PORT: '5055',
      MONGODB_URI: process.env.MONGODB_URI,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRE: '7d',
      GROQ_API_KEY: process.env.GROQ_API_KEY
    }
  }]
}
