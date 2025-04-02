// extensions/users-permissions/routes/routes.js
'use strict';

/**
 * Routes personnalisées pour users-permissions
 */

module.exports = {
    routes: [
        // Routes existantes pour Google
        {
            method: 'GET',
            path: '/google/login',
            handler: 'google-auth.connect',
            config: { auth: false }
        },
        {
            method: 'GET',
            path: '/google/callback',
            handler: 'google-auth.callback',
            config: { auth: false }
        },

        // Route pour accepter les termes
        {
            method: 'PUT',
            path: '/users/me/terms',
            handler: 'user.updateMe',
            config: { auth: { strategy: 'api-token' } }
        },

        // Route pour Facebook (automatiquement gérée par le plugin user-permissions)
        // Le controller auth.js étend la route existante, donc pas besoin de la redéfinir ici
    ]
};