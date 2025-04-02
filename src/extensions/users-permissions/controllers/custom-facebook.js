'use strict';

module.exports = ({ strapi }) => ({
    async login(ctx) {
        try {
            const { facebook_id, email, name, picture } = ctx.request.body;

            if (!facebook_id || !email) {
                return ctx.badRequest('ID Facebook et email requis');
            }

            strapi.log.info('Tentative de connexion Facebook:', { facebook_id, email });

            // Rechercher l'utilisateur par email ou facebook_id
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email }
            });

            if (user) {
                // L'utilisateur existe déjà, mettre à jour ses infos Facebook si nécessaire
                if (!user.facebook_id) {
                    user = await strapi.query('plugin::users-permissions.user').update({
                        where: { id: user.id },
                        data: {
                            facebook_id,
                            confirmed: true
                        }
                    });
                }
            } else {
                // Créer un nouvel utilisateur
                const pluginStore = await strapi.store({
                    type: 'plugin',
                    name: 'users-permissions',
                });

                const settings = await pluginStore.get({ key: 'advanced' });
                const defaultRole = await strapi.query('plugin::users-permissions.role')
                    .findOne({ where: { type: settings.default_role } });

                const nameParts = name.split(' ');
                const firstname = nameParts[0] || '';
                const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                user = await strapi.query('plugin::users-permissions.user').create({
                    data: {
                        username: email,
                        email,
                        provider: 'facebook',
                        facebook_id,
                        confirmed: true,
                        blocked: false,
                        role: defaultRole.id,
                        firstname,
                        lastname,
                        avatar: picture,
                        password: Math.random().toString(36).slice(-8)
                    }
                });
            }

            // Générer le JWT
            const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // Nettoyer les données sensibles
            const sanitizedUser = await strapi.plugins['users-permissions'].services.user.sanitizeUser(user);

            strapi.log.info('Authentification Facebook réussie:', user.email);

            // Renvoyer JWT et infos utilisateur
            return ctx.send({
                jwt,
                user: sanitizedUser
            });
        } catch (error) {
            strapi.log.error('Erreur authentification Facebook:', error);
            return ctx.internalServerError('Une erreur est survenue');
        }
    }
});