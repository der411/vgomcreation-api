/**
 * Contrôleur personnalisé pour les projets avec méthodes like et views
 */
export default {
    // Gérer les likes
    like: async (ctx) => {
        const { id } = ctx.params;
        const { action } = ctx.request.body || {};

        try {
            // Récupérer le projet
            const projet = await strapi.entityService.findOne('api::projet.projet', id);

            if (!projet) {
                return ctx.notFound('Projet non trouvé');
            }

            // Incrémenter ou décrémenter le nombre de likes
            const likesCount = action === 'unlike'
                ? Math.max(0, (projet.likes || 0) - 1)
                : (projet.likes || 0) + 1;

            // Mettre à jour le projet
            const updatedProjet = await strapi.entityService.update('api::projet.projet', id, {
                data: {
                    likes: likesCount
                }
            });

            return ctx.body = {
                success: true,
                likes: updatedProjet.likes
            };
        } catch (error) {
            strapi.log.error('Erreur lors de la mise à jour des likes:', error);
            return ctx.throw(500, 'Une erreur est survenue lors de la mise à jour des likes');
        }
    },

    // Gérer les vues
    views: async (ctx) => {
        const { id } = ctx.params;

        try {
            // Récupérer le projet
            const projet = await strapi.entityService.findOne('api::projet.projet', id);

            if (!projet) {
                return ctx.notFound('Projet non trouvé');
            }

            // Incrémenter les vues
            const views = (projet.views || 0) + 1;

            // Mettre à jour le projet
            const updatedProjet = await strapi.entityService.update('api::projet.projet', id, {
                data: { views }
            });

            return ctx.body = {
                success: true,
                views: updatedProjet.views
            };
        } catch (error) {
            strapi.log.error('Erreur lors de l\'incrémentation des vues:', error);
            return ctx.throw(500, 'Une erreur est survenue lors de l\'incrémentation des vues');
        }
    }
};