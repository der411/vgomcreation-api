export default {
    routes: [
        {
            method: 'POST',
            path: '/auth/google',
            handler: 'auth.googleLogin',
            config: {
                policies: [],
                middlewares: [],
            }
        }
    ]
};
