module.exports = [
  // Middleware de gestion des erreurs
  'strapi::errors',

  // Middleware de sécurité (CSRF, CSP, etc.)
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'blob:', '*'],
          'media-src': ["'self'", 'data:', 'blob:', '*'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },

  // Middleware pour CORS
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000', // Frontend local pour le dev
        'https://vgomcreation-fullstack.vercel.app', // Frontend déployé sur Vercel
        'https://vgomcreation-api.onrender.com', // Backend déployé sur Render
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'], // Méthodes autorisées
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'], // En-têtes autorisés
      credentials: true, // Autorise les cookies et authentifications basées sur les tokens
    },
  },

  // Powered by header
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'MyApp', // Facultatif, personnalise le header X-Powered-By
    },
  },

  // Journalisation
  'strapi::logger',

  // Parsing des requêtes
  'strapi::query',
  'strapi::body',

  // Middleware de session (si nécessaire)
  'strapi::session',

  // Favicon pour les réponses HTTP
  'strapi::favicon',

  // Middleware public (sert les fichiers statiques comme les images)
  'strapi::public',
];
