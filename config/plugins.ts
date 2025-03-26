export default ({ env }) => {

    return {
        upload: {
            config: {
                provider: 'cloudinary',
                providerOptions: {
                    cloud_name: env('CLOUDINARY_NAME'),
                    api_key: env('CLOUDINARY_KEY'),
                    api_secret: env('CLOUDINARY_SECRET'),
                },
                actionOptions: {
                    upload: {},
                    uploadStream: {},
                    delete: {},
                },
            },
        },
        email: {
            config: {
                provider: 'strapi-provider-email-custom-mailgun',
                providerOptions: {
                    key: env('MAILGUN_API_KEY'),
                    domain: env('MAILGUN_DOMAIN'),
                },
                settings: {
                    defaultFrom: 'VGOM Creation <postmaster@mg.vgomcreation.fr>',
                    defaultReplyTo: 'postmaster@mg.vgomcreation.fr',
                },
            },
        },
        'users-permissions': {
            config: {
                jwt: {
                    expiresIn: '7d',
                },
                register: {
                    allowedFields: ['username', 'email', 'password', 'firstName', 'lastName'],
                },
                email: {
                    config: {
                        from: 'VGOM Creation <postmaster@mg.vgomcreation.fr>',
                        replyTo: 'postmaster@mg.vgomcreation.fr',
                    },
                    settings: {
                        defaultFrom: 'VGOM Creation <postmaster@mg.vgomcreation.fr>',
                        defaultReplyTo: 'postmaster@mg.vgomcreation.fr',
                    },
                },
                providers: {
                    google: {
                        enabled: true,
                        config: {
                            clientId: env('GOOGLE_CLIENT_ID'),
                            clientSecret: env('GOOGLE_CLIENT_SECRET'),
                            // URL où Google redirigera après l'authentification (côté backend)
                            callback: '/api/connect/google/callback',
                            // URL où l'utilisateur sera redirigé après l'authentification (côté frontend)
                            redirect_uri: 'https://vgomcreation.fr/connect/google/redirect',
                            scope: ['email', 'profile']
                        }
                    }
                },
            },
        },
    }
};
