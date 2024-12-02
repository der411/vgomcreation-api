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
          cookie: {
              httpOnly: true, // Empêche l'accès aux cookies via JavaScript
              secure: env.bool('NODE_ENV', 'development') === 'production', // Utilise HTTPS uniquement en production
              sameSite: 'lax', // Cookies accessibles dans le même site
              maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
          },
      },
  },
  {
      name: 'strapi::cors',
      config: {
          origin: [
              'https://www.vgomcreation.fr', 'https://vgomcreation.fr, http://localhost:3000'
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
      name: 'strapi::session',
      config: {
          key: 'koa.sess', // Nom du cookie de session
          maxAge: 24 * 60 * 60 * 1000, // 1 jour en millisecondes
          autoCommit: true, // Active la validation automatique des en-têtes
          overwrite: true, // Permet d'écraser les cookies
          httpOnly: true, // Empêche l'accès via JavaScript
          signed: true, // Signer le cookie pour éviter toute falsification
          rolling: false, // Définit un nouveau cookie pour chaque requête
          renew: false, // Renouvelle le cookie si la session expire bientôt
          secure: env('NODE_ENV') === 'production', // Active HTTPS en production
          sameSite: 'strict', // Politique d'accès stricte aux cookies
      },
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::favicon',
  'strapi::public',
]