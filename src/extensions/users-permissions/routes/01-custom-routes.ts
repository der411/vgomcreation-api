export default {
    routes: [
        {
            method: 'GET',
            path: '/auth/google',
            handler: 'auth.googleCallback',
            config: {
                policies: [],
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/auth/google/callback',
            handler: 'auth.googleLogin',
            config: {
                policies: [],
                middlewares: [],
                auth: false
            }
        }
    ]
};
