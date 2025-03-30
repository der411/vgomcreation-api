export default {
    routes: [

        // Route pour liker un projet
        {
            method: 'POST',
            path: '/projets/:id/like',
            handler: 'api::projet.custom.like',
            config: {
                auth: false
            }
        },

        // Route pour incrémenter les vues
        {
            method: 'POST',
            path: '/projets/:id/views',
            handler: 'api::projet.custom.views',
            config: {
                auth: false
            }
        }
    ]
};