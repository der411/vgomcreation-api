module.exports = ({ env }) => {
  const url = env('URL', 'https://vgomcreation-api.onrender.com');
  const client_url = env('CLIENT_URL', 'https://www.vgomcreation.fr');

  // Logs pour vérifier les valeurs de configuration
  console.log('URL utilisée par Strapi (Backend) :', url);
  console.log('CLIENT_URL utilisée pour le Frontend :', client_url);

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url, // Utilisation de la constante url
    client_url, // Ajout explicite de la constante client_url pour l'utiliser dans les templates ou autres
    app: {
      keys: env.array('APP_KEYS'),
    },
    admin: {
      auth: {
        secret: env('ADMIN_JWT_SECRET'),
      },
    },
    settings: {
      cors: {
        origin: [
          'https://www.vgomcreation.fr',
          'https://vgomcreation.fr',
          'http://localhost:3000',
        ], // Origines autorisées pour le CORS
          credentials: true,
      },
      public: {
        path: './public', // Répertoire pour servir les fichiers publics
      },
    },
  };
};
