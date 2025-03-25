module.exports = ({ env }) => [
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", "https://accounts.google.com"],
                    'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    'frame-src': ["'self'", "https://accounts.google.com"],
                    'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    upgradeInsecureRequests: null,
                },
            },
            crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
        },
    },
    {
        name: 'strapi::cors',
        config: {
            origin: [
                'https://www.vgomcreation.fr',
                'http://localhost:3000',
                'https://vgomcreation-api.onrender.com',
                'https://accounts.google.com'
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
                const isStripeWebhook = ctx.path.includes('/api/projets/webhook');
                return !isStripeWebhook;
            },
            rawBody: true,
            includeUnparsed: true
        },
    },
    'strapi::session',
    'strapi::favicon',
    'strapi::public'
];