export default {
    routes: [
        {
            method: 'POST',
            path: '/blogs/:id/increment-view',
            handler: 'blog.incrementViews',
            config: {
                policies: [],
                description: 'Incrémenter le compteur de vues du blog',
                tags: ['Blog'],
            },
        },
        {
            method: 'POST',
            path: '/blogs/:id/increment-like',
            handler: 'blog.incrementLikes',
            config: {
                policies: [],
                description: 'Incrémenter le compteur de likes du blog',
                tags: ['Blog'],
            },
        },
        {
            method: 'POST',
            path: '/blogs/:id/toggle-like',
            handler: 'blog.toggleLike',
        },

    ],
};
