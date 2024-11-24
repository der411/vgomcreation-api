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
          origin: [
              'http://localhost:3000', // Frontend local
              'https://vgomcreation-fullstack.vercel.app', // Frontend déployé
              'https://vgomcreation-api-production.up.railway.app', // Backend déployé
          ],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
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
];
