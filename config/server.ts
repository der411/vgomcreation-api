module.exports = ({ env }) => {
  const url = env('URL', 'https://vgomcreation-api.onrender.com');
  const client_url = env('CLIENT_URL', 'https://www.vgomcreation.fr');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    url, // Utilisation de la constante url
    client_url, // Ajout explicite de la constante client_url pour l'utiliser dans les templates ou autres
    app: {
      keys: env.array('APP_KEYS'),
    },
    proxy: true,
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
    admin: {
      auth: {
        secret: env('ADMIN_JWT_SECRET'),
      },
    },
    settings: {
      cors: {
        origin: ['https://www.vgomcreation.fr'],
        credentials: true, // S'assurer que les cookies sont bien envoyés
      },
    },
  };
};
