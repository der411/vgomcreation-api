module.exports = [
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: ['https://vgomcreation-fullstack.vercel.app', 'https://vgomcreation-api-production.up.railway.app'], // Remplacez par votre URL frontend
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        credentials: true, // Permet les cookies/headers d'authentification
      },
    },
    {
      name: 'strapi::redirect',
      config: {
        https: true, // Force la redirection HTTPS
      },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
  ];
  