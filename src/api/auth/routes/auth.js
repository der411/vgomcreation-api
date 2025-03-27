module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/auth/google/callback',
            handler: 'auth.googleLogin',
            config: {
                policies: [],
                auth: false,
            },
        },
    ],
};
