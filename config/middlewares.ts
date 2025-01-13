module.exports = ({ env }) => [
  'strapi::errors',
  {
      name: 'strapi::security',
      config: {
          contentSecurityPolicy: {
              useDefaults: true,
              directives: {
                  'connect-src': ["'self'", 'https:'],
                  'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                  'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                  upgradeInsecureRequests: null,
              },
          },
      },
  },
  {
      name: 'strapi::cors',
      config: {
          origin: [
              'https://www.vgomcreation.fr', 'https://vgomcreation.fr', 'http://localhost:3000'
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
    {
        name: 'strapi::raw-body',
        config: {
            enabled: true,
            include: ['/api/webhook'], // Capture uniquement les données brutes pour cette route
            type: 'application/json', // Type MIME attendu
        },
    },
    {
        name: 'strapi::body',
        config: {
            includeUnparsed: true, // Nécessaire pour inclure rawBody
        },
    },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::favicon',
  'strapi::public',
]