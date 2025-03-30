module.exports = ({ env }) => [
    'strapi::logger',
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", "https://accounts.google.com", env('CLIENT_URL', 'http://localhost:3000'), env('REACT_APP_API_URL', 'http://localhost:1337'), 'https:'],
                    'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    'frame-src': ["'self'", "https://accounts.google.com"],
                    'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
                    upgradeInsecureRequests: null,
                },
            },
            session: {
                enabled: true,
                secure: env('NODE_ENV') === 'production',
            },
        },
    },
    {
        name: 'strapi::cors',
        config: {
            origin: [
                'https://www.vgomcreation.fr',
                env('CLIENT_URL', 'http://localhost:3000'),
                'https://vgomcreation-api.onrender.com',
                env('REACT_APP_API_URL', 'http://localhost:1337'),
            ],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            headers: [
                'Content-Type',
                'Authorization',
                'Origin',
                'Accept',
                'Access-Control-Allow-Headers',
                'Access-Control-Allow-Origin',
            ],
            credentials: true,
            maxAge: 3600
        },
    },
    'strapi::poweredBy',
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
            rolling: true,
            renew: true,
            sameSite: 'none',
            httpOnly: true,
            secure: env('NODE_ENV') === 'production',
            maxAge: 86400000, // 24 heures comme dans votre configuration de session
            keys: [env('APP_KEYS', '').split(',')[0]], // utilise la première clé de APP_KEYS
            overwrite: true,
            signed: true,
        },
    },
    'strapi::favicon',
    'strapi::public'
];