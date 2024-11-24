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
          origin: ['*'
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
