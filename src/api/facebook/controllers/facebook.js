// Fichier: src/api/facebook/controllers/facebook.js
'use strict';

module.exports = {
    async dataDeleteRequest(ctx) {
        try {
            const { signed_request } = ctx.request.body;

            if (!signed_request) {
                return ctx.badRequest('Requête invalide');
            }

            // Décodage de la requête signée par Facebook
            const [encodedSig, encodedPayload] = signed_request.split('.');
            const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString('utf-8'));

            // Extraire l'identifiant utilisateur Facebook
            const { user_id } = payload;

            if (!user_id) {
                return ctx.badRequest('Identifiant utilisateur manquant');
            }

            // Rechercher les utilisateurs associés à cet ID Facebook
            const users = await strapi.query('plugin::users-permissions.user').findMany({
                where: {
                    'facebook_id': user_id
                }
            });

            // Programmation de la suppression des données
            if (users.length > 0) {
                // Marquer les utilisateurs pour suppression
                for (const user of users) {
                    await strapi.query('plugin::users-permissions.user').update({
                        where: { id: user.id },
                        data: {
                            deletion_requested: true,
                            deletion_requested_date: new Date().toISOString(),
                        }
                    });
                }

                // Créer un enregistrement de la demande
                await strapi.entityService.create('api::deletion-request.deletion-request', {
                    data: {
                        external_id: user_id,
                        provider: 'facebook',
                        status: 'pending',
                        confirmation_code: Math.random().toString(36).substring(2, 15),
                        publishedAt: new Date().toISOString(),
                    }
                });
            }

            // Renvoyer la réponse de confirmation à Facebook
            return {
                url: `https://vgomcreation.fr/facebook-deletion-confirmation`,
                confirmation_code: Math.random().toString(36).substring(2, 15)
            };

        } catch (error) {
            console.error('Erreur lors de la demande de suppression de données Facebook:', error);
            return ctx.internalServerError('Erreur interne du serveur');
        }
    }
};