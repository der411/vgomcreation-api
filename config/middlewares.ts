module.exports = ({ env }) => [
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
            'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    {
      name: 'strapi::cors',
      config: {
        enabled: true,
        origin: [
          'http://localhost:3000', // Frontend local
          'https://vgomcreation-fullstack.vercel.app', // Frontend déployé
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        headers: ['Content-Type', 'Authorization'],
      },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
  ];
  