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
        {
            method: 'PUT',
            path: '/users/me/terms',
            handler: 'user.updateMe',
            config: { auth: { strategy: 'api-token' } }
        },
        {
            method: 'POST',
            path: '/auth/facebook-login',
            handler: 'custom-facebook.facebookLogin',
            config: {
                prefix: '',
                auth: false,
                description: "Authentification avec Facebook",
                tag: {
                    plugin: 'users-permissions',
                    name: 'Auth'
                }
            }
        }
    ]
};