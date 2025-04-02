'use strict';

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/facebook/data-deletion',
            handler: 'facebook.dataDeleteRequest',
            config: {
                auth: false, // Pas besoin d'authentification pour cette route
            }
        }
    ]
};