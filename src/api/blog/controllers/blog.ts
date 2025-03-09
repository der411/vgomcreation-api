// controllers/blog.ts
import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::blog.blog', ({ strapi }) => ({

    async incrementViews(ctx: Context) {
        const { id } = ctx.params;

        // Récupérer le blog spécifique avec les relations `likedBy` et `commentaire`
        const blog = await strapi.db.query('api::blog.blog').findOne({
            where: { id },
            populate: ['likedBy', 'commentaires'],  // Utilisez `commentaires` pour la relation multiple
        });

        if (!blog) {
            return ctx.notFound('Blog non trouvé');
        }

        // Incrémenter le compteur de vues
        const updatedBlog = await strapi.db.query('api::blog.blog').update({
            where: { id },
            data: { vue_count: (blog.vue_count || 0) + 1 },
        });

        return ctx.send({ data: updatedBlog });
    },

    async incrementLikes(ctx: Context) {
        const { id } = ctx.params;

        // Récupérer le blog spécifique avec les relations `likedBy` et `commentaires`
        const blog = await strapi.db.query('api::blog.blog').findOne({
            where: { id },
            populate: ['likedBy', 'commentaires'],  // Utilisez `commentaires` pour la relation multiple
        });

        if (!blog) {
            return ctx.notFound('Blog non trouvé');
        }

        // Incrémenter le compteur de likes
        const updatedBlog = await strapi.db.query('api::blog.blog').update({
            where: { id },
            data: { likes_count: (blog.likes_count || 0) + 1 },
        });

        return ctx.send({ data: updatedBlog });
    },

    async getLikes(ctx: Context) {
        try {
            const userId = ctx.state.user?.id;

            if (!userId) {
                return ctx.unauthorized('Utilisateur non authentifié');
            }

            // Récupérer tous les blogs likés par l'utilisateur
            const likedBlogs = await strapi.db.query('api::blog.blog').findMany({
                where: {
                    likes_users: {
                        id: userId
                    }
                },
                select: ['id']
            });

            // Formater la réponse
            const likes = likedBlogs.map(blog => ({
                articleId: blog.id
            }));

            return ctx.send({ likes });

        } catch (error) {
            console.error('Erreur dans getLikes:', error);
            return ctx.badRequest('Erreur lors de la récupération des likes');
        }
    },

    async toggleLike(ctx) {
        const { id } = ctx.params;
        const userId = ctx.state.user.id;

        // Récupérer le blog avec ses relations
        const blog = await strapi.db.query('api::blog.blog').findOne({
            where: { id },
            populate: ['likes_users']
        });

        if (!blog) {
            return ctx.notFound('Blog non trouvé');
        }

        const hasLiked = blog.likes_users?.some(user => user.id === userId);
        const currentLikesCount = blog.likes_count || 0;

        // Mise à jour du blog
        const updatedBlog = await strapi.db.query('api::blog.blog').update({
            where: { id },
            data: {
                likes_users: hasLiked
                    ? { disconnect: [userId] }
                    : { connect: [userId] },
                likes_count: hasLiked
                    ? currentLikesCount - 1
                    : currentLikesCount + 1
            }
        });

        // Récupérer le blog mis à jour
        const finalBlog = await strapi.db.query('api::blog.blog').findOne({
            where: { id },
            populate: ['likes_users']
        });

        return ctx.send({
            data: {
                likes_count: finalBlog.likes_count,
                hasLiked: !hasLiked
            }
        });
    }
}));
