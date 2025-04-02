'use strict';

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/auth/facebook-login',
            handler: 'custom-auth.facebookLogin',
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