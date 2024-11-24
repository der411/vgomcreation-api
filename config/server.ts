module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),  // Très important : spécifie l'écoute sur toutes les interfaces
  port: env.int('PORT', 1337),   // Utilise la variable PORT de Railway
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('URL', 'https://vgomcreation-api-production.up.railway.app'),
});