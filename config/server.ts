module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'), // Rend l'application accessible sur toutes les interfaces
  port: env.int('PORT', 1337), // Utilise le port fourni par Render
  app: {
    keys: env.array('APP_KEYS'),
  },
  url: env('URL', 'https://vgomcreation-api.onrender.com'), // URL de base de votre backend déployé
  admin: {
    url: '/admin', // Chemin de l'administration
    auth: {
      secret: env('ADMIN_JWT_SECRET'), // Secret pour sécuriser l'accès admin
    },
  },
});
