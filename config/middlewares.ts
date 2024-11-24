module.exports = ({ env }) => [
    'strapi::errors',
    {
        name: 'strapi::security',
        config: {
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'connect-src': ["'self'", 'https:', 'http:'],
                    'img-src': ["'self'", 'data:', 'blob:', '*'],
                    'media-src': ["'self'", 'data:', 'blob:', '*'],
                    upgradeInsecureRequests: null,
                },
            },
        },
    },
    {
        name: 'strapi::cors',
        config: {
            enabled: true,
            headers: ['*'],  // Autorise tous les headers
            origin: ['*'],   // Autorise toutes les origines pendant le dev
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
            credentials: true,
            maxAge: 86400,
        },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::favicon',
    'strapi::public',
];