'use strict';

/**
 * Contrôleur personnalisé pour les projets
 */
module.exports = {
    /**
     * Incrémente le compteur de likes d'un projet
     */
    async incrementLikes(ctx) {
        const { id } = ctx.params;

        try {
            // Récupérer le projet
            const projet = await strapi.db.query('api::projet.projet').findOne({
                where: { id }
            });

            if (!projet) {
                return ctx.notFound('Projet non trouvé');
            }

            // Incrémenter le compteur de likes
            const updatedProjet = await strapi.db.query('api::projet.projet').update({
                where: { id },
                data: { likes: (projet.likes || 0) + 1 }
            });

            return ctx.send({
                success: true,
                likes: updatedProjet.likes
            });
        } catch (error) {
            strapi.log.error('Erreur lors de l\'incrémentation des likes:', error);
            return ctx.throw(500, 'Une erreur est survenue lors de la mise à jour des likes');
        }
    },

    /**
     * Décrémente le compteur de likes d'un projet
     */
    async decrementLikes(ctx) {
        const { id } = ctx.params;

        try {
            // Récupérer le projet
            const projet = await strapi.db.query('api::projet.projet').findOne({
                where: { id }
            });

            if (!projet) {
                return ctx.notFound('Projet non trouvé');
            }

            // Décrémenter le compteur de likes, mais pas en dessous de 0
            const updatedProjet = await strapi.db.query('api::projet.projet').update({
                where: { id },
                data: { likes: Math.max(0, (projet.likes || 0) - 1) }
            });

            return ctx.send({
                success: true,
                likes: updatedProjet.likes
            });
        } catch (error) {
            strapi.log.error('Erreur lors de la décrémentation des likes:', error);
            return ctx.throw(500, 'Une erreur est survenue lors de la mise à jour des likes');
        }
    },

    /**
     * Méthode spécifique pour gérer les likes selon l'action
     */
    async manageLike(ctx) {
        const { id } = ctx.params;
        const { action } = ctx.request.body || {};

        strapi.log.info(`Action like reçue pour le projet ${id}: ${action}`);

        try {
            if (action === 'like') {
                return await this.incrementLikes(ctx);
            } else if (action === 'unlike') {
                return await this.decrementLikes(ctx);
            } else {
                return ctx.badRequest('Action non reconnue. Utilisez "like" ou "unlike"');
            }
        } catch (error) {
            strapi.log.error('Erreur lors de la gestion du like:', error);
            return ctx.throw(500, 'Une erreur est survenue lors de la gestion du like');
        }
    }
};