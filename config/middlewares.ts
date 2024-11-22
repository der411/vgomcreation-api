module.exports = [
    'strapi::errors',
    'strapi::security',
    {
      name: 'strapi::cors',
      config: {
        origin: ['https://vgomcreation-fullstack.vercel.app', 'https://vgomcreation-api-production.up.railway.app'], // Remplacez par votre URL frontend
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
        credentials: true, // Permet les cookies/headers d'authentification
      },
    },
    
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
  ];
  