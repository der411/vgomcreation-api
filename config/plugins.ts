export default ({ env }) => ({
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
            provider: 'mailgun',
            providerOptions: {
                apiKey: env('MAILGUN_API_KEY'),
                domain: env('MAILGUN_DOMAIN'),
                baseUrl: env('MAILGUN_BASE_URL'),
            },
            settings: {
                defaultFrom: 'no-reply@mg.vgomcreation.com',
                defaultReplyTo: 'no-reply@mg.vgomcreation.com',
            },
        },
    },
});
