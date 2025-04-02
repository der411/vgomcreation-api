// extensions/users-permissions/controllers/auth.js
'use strict';

/**
 * Auth.js controller extension
 * Gère spécifiquement l'authentification Facebook
 */

const _ = require('lodash');
const { getService } = require('@strapi/plugin-users-permissions/server/utils');
const utils = require('@strapi/utils');
const { ApplicationError } = utils.errors;

module.exports = {
    // Étendre uniquement la méthode de callback
    async callback(ctx) {
        const provider = ctx.params.provider || ctx.request.body.provider;

        // Si c'est Facebook, utilisez la logique personnalisée
        if (provider === 'facebook') {
            return this.handleFacebookCallback(ctx);
        }

        // Pour les autres providers, laissez le comportement par défaut de Strapi
        // Cela permettra à votre contrôleur Google de continuer à fonctionner
        return await getService('providers').connect(provider, ctx.query);
    },

    // Méthode spécifique pour Facebook
    async handleFacebookCallback(ctx) {
        const provider = 'facebook';
        const params = ctx.request.query;
        const store = await strapi.store({ type: 'plugin', name: 'users-permissions' });

        const access_token = params.access_token || params.code || params.oauth_token;

        if (!access_token) {
            throw new ApplicationError('No access_token or code provided');
        }

        // Récupérer les données utilisateur de Facebook
        try {
            // Connecter à Facebook et récupérer les données utilisateur
            const userData = await getService('providers').connect(provider, ctx.query);

            if (!userData.email) {
                throw new ApplicationError('Email was not available from Facebook');
            }

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email: userData.email }
            });

            let user;

            if (existingUser) {
                // L'utilisateur existe déjà
                if (existingUser.provider === 'facebook') {
                    // Déjà un utilisateur Facebook, pas de modification nécessaire
                    user = existingUser;
                } else {
                    // Utilisateur existant avec un autre provider - lier le compte Facebook
                    user = await strapi.query('plugin::users-permissions.user').update({
                        where: { id: existingUser.id },
                        data: {
                            provider: 'facebook',
                            facebook_id: userData.id || userData.facebook_id
                        }
                    });
                }
            } else {
                // Nouvel utilisateur, créer avec les données Facebook
                const pluginStore = await strapi.store({
                    type: 'plugin',
                    name: 'users-permissions',
                });

                const settings = await pluginStore.get({ key: 'advanced' });

                // Récupérer le rôle par défaut
                const defaultRole = await strapi
                    .query('plugin::users-permissions.role')
                    .findOne({ where: { type: settings.default_role } });

                // Créer l'utilisateur
                user = await strapi.query('plugin::users-permissions.user').create({
                    data: {
                        provider: 'facebook',
                        facebook_id: userData.id,
                        username: userData.username || `facebook_${userData.id}`,
                        email: userData.email,
                        password: null,
                        confirmed: true,
                        blocked: false,
                        role: defaultRole.id,
                        firstname: userData.firstname || userData.name?.split(' ')[0] || '',
                        lastname: userData.lastname || (userData.name?.split(' ').slice(1).join(' ') || '')
                    },
                });
            }

            // Générer le JWT
            const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // Configurer la redirection vers le frontend
            const advancedSettings = await store.get({ key: 'advanced' });
            const providersConfig = await store.get({ key: 'grant' });
            const redirectTo = providersConfig?.facebook?.redirectUri ||
                advancedSettings?.oauth?.redirectUrl ||
                process.env.FRONTEND_URL ||
                'https://www.vgomcreation.fr';

            // Créer l'URL de redirection avec le token
            const redirectUrl = new URL('/connect/facebook/redirect', redirectTo);
            redirectUrl.searchParams.set('access_token', jwt);
            redirectUrl.searchParams.set('id', user.id);

            // Rediriger vers le frontend
            ctx.redirect(redirectUrl.toString());

        } catch (error) {
            strapi.log.error('Facebook authentication error:', error);
            ctx.body = { error: error.message || 'Authentication failed' };
            ctx.status = 500;
        }
    }
};