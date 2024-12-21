module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/consent',
            handler: 'consent.setConsent',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/consent',
            handler: 'consent.getConsent',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ],
};
