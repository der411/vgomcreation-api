/**
 * commentaire controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::commentaire.commentaire', ({ strapi }) => ({
    // Méthode pour ajouter un commentaire à un blog
    async addComment(ctx: Context) {
        console.log('Début de addComment');
        const { id } = ctx.params; // ID du blog
        const { contenu } = ctx.request.body.data || {}; // Données du commentaire

        // Vérifier si l'utilisateur est connecté
        if (!ctx.state.user) {
            console.log('Utilisateur non connecté');
            return ctx.unauthorized('Vous devez être connecté pour ajouter un commentaire.');
        }

        console.log('Utilisateur connecté:', ctx.state.user);

        try {
            // Création du commentaire en l'associant à l'utilisateur connecté et au blog
            const newComment = await strapi.db.query('api::commentaire.commentaire').create({
                data: {
                    auteur: ctx.state.user.username, // Nom d'utilisateur
                    contenu,
                    blog: id, // Associe le commentaire au blog
                    date: new Date().toISOString(),
                    users_permissions_user: ctx.state.user.id, // Associe le commentaire à l'utilisateur connecté
                },
            });

            console.log('Nouveau commentaire créé:', newComment);

            // Récupérer le blog pour obtenir le compteur actuel
            const blog = await strapi.db.query('api::blog.blog').findOne({
                where: { id },
            });

            if (!blog) {
                console.error('Blog introuvable avec ID:', id);
                return ctx.notFound('Blog introuvable.');
            }

            // Incrémenter le compteur de commentaires
            const updatedBlog = await strapi.db.query('api::blog.blog').update({
                where: { id },
                data: { commentaire_count: (blog.commentaire_count || 0) + 1 },
            });

            console.log('Blog mis à jour avec le compteur de commentaires:', updatedBlog);

            return ctx.send({ data: newComment, blog: updatedBlog });
        } catch (error) {
            console.error('Erreur lors de l\'ajout du commentaire:', error);
            return ctx.badRequest('Impossible d\'ajouter le commentaire');
        }
    },

    // Méthode pour récupérer les commentaires d'un blog
    async findComments(ctx: Context) {
        const { id } = ctx.params;

        try {
            // Récupération des commentaires associés au blog
            const comments = await strapi.db.query('api::commentaire.commentaire').findMany({
                where: { blog: id },
                populate: ['blog'], // Inclure les informations sur le blog si nécessaire
            });

            console.log('Commentaires récupérés:', comments);

            return ctx.send({ data: comments });
        } catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            return ctx.badRequest('Impossible de récupérer les commentaires');
        }
    },
}));
