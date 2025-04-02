'use strict';

/**
 * Custom auth controller for handling social login
 */

module.exports = {
    /**
     * Facebook login handler
     */
    async facebookLogin(ctx) {
        try {
            const { facebook_id, email, name, picture } = ctx.request.body;

            if (!facebook_id || !email) {
                return ctx.badRequest('ID Facebook et email requis');
            }

            strapi.log.info('Tentative de connexion Facebook:', { facebook_id, email });

            // Rechercher l'utilisateur par facebook_id ou par email
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: {
                    $or: [
                        { facebook_id },
                        { email }
                    ]
                }
            });

            if (!user) {
                strapi.log.info('Création d\'un nouvel utilisateur Facebook:', email);

                // Récupérer le rôle par défaut
                const pluginStore = await strapi.store({
                    type: 'plugin',
                    name: 'users-permissions',
                });

                const settings = await pluginStore.get({ key: 'advanced' });
                const defaultRole = await strapi.query('plugin::users-permissions.role')
                    .findOne({ where: { type: settings.default_role } });

                if (!defaultRole) {
                    return ctx.badRequest('Rôle par défaut non trouvé');
                }

                // Créer un nouvel utilisateur Facebook
                const nameParts = name.split(' ');
                const firstname = nameParts[0] || '';
                const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                user = await strapi.query('plugin::users-permissions.user').create({
                    data: {
                        username: `fb_${facebook_id}`,
                        email,
                        provider: 'facebook',
                        facebook_id,
                        confirmed: true,
                        blocked: false,
                        role: defaultRole.id,
                        firstname,
                        lastname,
                        avatar: picture,
                        password: await strapi.plugins['users-permissions'].services.user.hashPassword(
                            Math.random().toString(36).slice(-8)
                        ),
                    }
                });
            } else if (!user.facebook_id) {
                strapi.log.info('Liaison du compte existant avec Facebook:', email);

                // Mettre à jour l'utilisateur existant avec l'ID Facebook
                user = await strapi.query('plugin::users-permissions.user').update({
                    where: { id: user.id },
                    data: {
                        facebook_id,
                        // Conserver le provider original si c'est un compte standard
                        // ou mettre à jour si c'est un autre provider social
                        provider: user.provider === 'local' ? user.provider : 'facebook',
                        confirmed: true // Marquer comme confirmé car confirmé par Facebook
                    }
                });
            }

            // Générer un JWT pour l'utilisateur
            const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // Récupérer l'utilisateur avec ses relations
            const populatedUser = await strapi.query('plugin::users-permissions.user').findOne({
                where: { id: user.id },
                populate: ['role', 'avatar_url']
            });

            // Nettoyer les données sensibles
            const sanitizedUser = await strapi.plugins['users-permissions'].services.user.sanitizeUser(populatedUser);

            strapi.log.info('Authentification Facebook réussie pour:', email);

            // Renvoyer le JWT et les informations utilisateur
            return ctx.send({ jwt, user: sanitizedUser });
        } catch (error) {
            strapi.log.error('Erreur authentification Facebook:', error);
            return ctx.internalServerError('Une erreur est survenue');
        }
    }
};