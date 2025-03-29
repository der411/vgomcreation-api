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
                jwtSecret: process.env.JWT_SECRET,
                debug: true,
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
                            client_id: env('GOOGLE_CLIENT_ID'),
                            client_secret: env('GOOGLE_CLIENT_SECRET'),
                            callback: `${env('PUBLIC_URL', 'https://vgomcreation-api.onrender.com')}/api/connect/google/callback`,
                            redirect_uri: `${env('CLIENT_URL', 'https://vgomcreation.fr')}/connect/google/redirect`,
                            scope: ['email', 'profile'],
                        },
                    },
                },
            },
        },
    }
};
