export default {
    routes: [
        // Route principale pour initier l'auth Google
        {
            method: 'GET',
            path: '/api/connect/google',
            handler: 'auth.googleAuth',
            config: {
                auth: false
            }
        },
        // Route de callback pour le retour de Google
        {
            method: 'GET',
            path: '/api/connect/google/callback',
            handler: 'auth.googleCallback',
            config: {
                auth: false
            }
        }
    ]
};