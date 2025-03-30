// ./src/api/projet/routes/custom-projet.js
'use strict';

module.exports = {
    routes: [
        // Route pour incrémenter les likes
        {
            method: 'POST',
            path: '/projets/:id/increment-like',
            handler: 'api::projet.custom.incrementLikes',
            config: {
                auth: false
            }
        },
        // Route pour décrémenter les likes
        {
            method: 'POST',
            path: '/projets/:id/decrement-like',
            handler: 'api::projet.custom.decrementLikes',
            config: {
                auth: false
            }
        },
        // Route unifiée pour gérer les likes
        {
            method: 'POST',
            path: '/projets/:id/like',
            handler: 'api::projet.custom.manageLike',
            config: {
                auth: false
            }
        }
    ]
};