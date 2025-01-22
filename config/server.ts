module.exports = ({ env }) => {
  const url = env('URL', 'https://vgomcreation-api.onrender.com');

  // Log pour vérifier la valeur de l'URL
  console.log('URL utilisée par Strapi :', url);

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url, // Utilisation de la constante url
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
        origin: ['https://www.vgomcreation.fr', 'https://vgomcreation.fr', 'http://localhost:3000'], // Origines autorisées pour le CORS
      },
      public: {
        path: './public', // Répertoire pour servir les fichiers publics
      },
    },
  };
};
