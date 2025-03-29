module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('URL', 'https://vgomcreation-api.onrender.com'),
  proxy: {
    enabled: true,
    ssl: true
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
});