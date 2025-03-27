module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/auth/google/callback',
            handler: 'user.googleLogin', // Référence à ta fonction dans le contrôleur
            config: {
                policies: [],
                auth: false, // Pas besoin d'authentification préalable pour accéder à ce callback
            },
        },
        {
            method: 'GET',
            path: '/api/connect/google',
            handler: 'google.connect', // Route qui initialise la connexion Google
        },
        {
            method: 'GET',
            path: '/api/connect/google/callback',
            handler: 'google.callback', // Route appelée par Google après la connexion
        },
    ],
};
