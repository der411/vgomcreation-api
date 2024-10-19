export default {
    routes: [
        {
            method: 'POST',
            path: '/projets',
            handler: 'projet.create',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/projets',
            handler: 'projet.find',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/projets/:id',
            handler: 'projet.findOne',
            config: {
                policies: [],
            },
        },
        {
            method: 'PUT',
            path: '/projets/:id',
            handler: 'projet.update',
            config: {
                policies: [],
            },
        },
        {
            method: 'DELETE',
            path: '/projets/:id',
            handler: 'projet.delete',
            config: {
                policies: [],
            },
        },
    ],
};
