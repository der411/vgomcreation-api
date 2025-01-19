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
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
    {
        name: 'strapi::body',
        config: {
            jsonLimit: '10mb',
            formLimit: '10mb',
            textLimit: '10mb',
            strict: true,
            rawBody: true, // Important !
            includeUnparsed: true
        },
    },

    'strapi::favicon',
  'strapi::public',
]