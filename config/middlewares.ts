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
          'http://localhost:3000',
          'https://vgomcreation-fullstack.vercel.app',
          'https://vgomcreation-api-production.up.railway.app'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        headers: [
          'Content-Type',
          'Authorization', 
          'Origin',
          'Accept',
          'Access-Control-Allow-Headers'
        ],
        credentials: true,
        maxAge: 3600
      },
    },
    'strapi::poweredBy',
    'strapi::logger', 
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
  ]