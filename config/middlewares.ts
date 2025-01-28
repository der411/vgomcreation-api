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
                  'frame-src': ["'self'", "https://accounts.google.com"],
                  'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                  upgradeInsecureRequests: null,
              },
              session: {
                  enabled: true,
                  key: 'strapi.sid',
                  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax'
              },
          },
      },
  },
  {
      name: 'strapi::cors',
      config: {
          origin: [
              'https://www.vgomcreation.fr', 'http://localhost:3000'
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
            formLimit: '256mb',
            jsonLimit: '256mb',
            textLimit: '256mb',
            formidable: {
                maxFileSize: 200 * 1024 * 1024,
            },
            strict: true,
            parser: (ctx) => {
                // Ne pas parser le body pour les webhooks Stripe
                const isStripeWebhook = ctx.path.includes('/api/projets/webhook');
                if (isStripeWebhook) {
                    return false;
                }
                return true;
            },
            rawBody: true, // Important !
            includeUnparsed: true
        },
    },

    'strapi::favicon',
  'strapi::public',
]