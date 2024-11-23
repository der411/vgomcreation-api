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
            cors: {
                origin: ['http://localhost:3000', 'https://vgomcreation-fullstack.vercel.app'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                headers: ['Content-Type', 'Authorization'],
            },
        },
    },
    'strapi::cors', // Middleware CORS
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
];
