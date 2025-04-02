// Pour la suppression des données
'use strict';

module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/facebook/data-deletion',
            handler: 'facebook.dataDeleteRequest',
            config: {
                auth: false,
            }
        }
    ]
};