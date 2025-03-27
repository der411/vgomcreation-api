module.exports = ({ env }) => {
  const url = env('URL', 'https://vgomcreation-api.onrender.com');
  const client_url = env('CLIENT_URL', 'https://www.vgomcreation.fr');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    proxy: true, // Cela permet à Strapi de comprendre que les requêtes passent par un proxy inverse qui gère SSL
    trustProxy: true,  // Ceci assure que Strapi sait qu'il faut se fier aux en-têtes Proxy
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
  };
};
