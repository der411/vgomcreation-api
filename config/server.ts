module.exports = ({ env }) => {
  const url = env('URL', 'https://vgomcreation-api.onrender.com');
  const client_url = env('CLIENT_URL', 'https://www.vgomcreation.fr');

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    proxy: env.bool('PROXY', true),
    url,
    client_url,
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
