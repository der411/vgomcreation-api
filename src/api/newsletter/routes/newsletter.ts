export default {
    routes: [
        {
            method: 'POST',
            path: '/newsletter',
            handler: 'newsletter.create',
            config: {
                policies: [],
            },
        },
    ],
};
