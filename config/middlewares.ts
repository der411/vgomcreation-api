module.exports = ({ env }) => [
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", "https:"],
                    'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    'frame-src': ["'self'", "https://accounts.google.com"],
                    'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    'script-src': ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'accounts.google.com'],
                    'frame-ancestors': ["'self'"],
                    upgradeInsecureRequests: process.env.NODE_ENV === 'production',
                },
                frameguard: {
                    action: 'sameorigin'
                },
                session: {
                    enabled: true,
                    key: 'strapi.sid',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
                    httpOnly: true,
                    secure: process.env.NODE_ENV !== 'development',
                    sameSite: process.env.NODE_ENV === 'development' ? 'lax' : 'none'
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
    {
        name: 'strapi::session',
        config: {
            key: 'koa.sess',
            maxAge: 86400000, // 1 jour
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Cookies sécurisés seulement en production
            sameSite: 'lax', // Ajuste la politique SameSite
        },
    },
    'strapi::poweredBy',
    'strapi::public',
    'strapi::favicon'
];