module.exports = ({ env }) => [
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'https:', 'http:'], // Élargir pour autoriser toutes les connexions HTTPS
                    'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com', 'lh3.googleusercontent.com'], // Ajouter Google Images
                    'frame-src': ["'self'", 'https://accounts.google.com', 'https://*.google.com'],
                    'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    upgradeInsecureRequests: null,
                },
            },
            crossOriginOpenerPolicy: {
                policy: 'unsafe-none' // Modifier pour permettre les communications cross-origin avec la popup Google
            },
        },
    },
    {
        name: 'strapi::cors',
        config: {
            origin: ['https://www.vgomcreation.fr', 'http://localhost:3000', '*'], // Ajouter * pour déboguer
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            headers: ['*'], // Autoriser tous les headers
            credentials: true,
            maxAge: 3600,
            keepHeaderOnError: true, // Important pour que les en-têtes CORS soient présents même en cas d'erreur
        },
    },
    'strapi::logger',
    'strapi::query',
    // Autres middlewares inchangés
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
                const isStripeWebhook = ctx.path.includes('/api/projets/webhook');
                return !isStripeWebhook;
            },
            rawBody: true,
            includeUnparsed: true
        },
    },
    {
        name: 'strapi::session',
        config: {
            key: 'koa.sess',
            maxAge: 86400000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        },
    },
    'strapi::poweredBy',
    'strapi::public',
    'strapi::favicon'
];