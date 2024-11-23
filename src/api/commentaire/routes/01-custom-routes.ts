export default {
    routes: [
        {
            method: 'POST',
            path: '/commentaires/:id/add-comment',
            handler: 'commentaire.addComment',
            config: {
                policies: [],
                description: 'Ajouter un commentaire au blog',
                tags: ['Commentaire'],
            },
        },
        {
            method: 'GET',
            path: '/commentaires/:id/comments',
            handler: 'commentaire.findComments',
            config: {
                policies: [],
                description: 'Récupérer les commentaires du blog',
                tags: ['Commentaire'],
            },
        },
    ],
};
