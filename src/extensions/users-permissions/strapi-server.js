module.exports = (plugin) => {

    const defaultAuthController = plugin.controllers.auth;
    plugin.controllers.auth = {
        ...defaultAuthController,
        async callback(ctx) {
            const { identifier, password } = ctx.request.body;

            if (!identifier || !password) {
                return ctx.badRequest("Identifiant ou mot de passe manquant");
            }

            // Recherche de l'utilisateur
            const user = await strapi.query("plugin::users-permissions.user").findOne({
                where: { email: identifier },
            });

            if (!user) {
                return ctx.badRequest("Utilisateur introuvable");
            }

            if (user.provider === 'local' && !user.confirmed) {
                return ctx.badRequest("Votre email n'est pas encore confirmé.");
            }




// Appel au contrôleur d'origine
            return defaultAuthController.callback(ctx);
        },
    };

    plugin.controllers.auth.emailConfirmation = async (ctx) => {
        const { confirmation: confirmationToken } = ctx.query;

        try {
            if (!confirmationToken) {
                throw new Error('Token not found');
            }

            const user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { confirmationToken }
            });

            if (!user) {
                throw new Error('User not found');
            }

            await strapi.query('plugin::users-permissions.user').update({
                where: { id: user.id },
                data: {
                    confirmed: true,
                    confirmationToken: null,
                },
            });

            // Permettre à la page de succès de s'afficher avant la redirection
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
            ctx.redirect(`${clientUrl}/email-confirmation-success`);


        } catch (err) {
            ctx.redirect(`${clientUrl}/login?error=email-confirmation-failed`);
        }
    };

    plugin.controllers.auth.googleLogin = async (ctx) => {
        const { idToken } = ctx.request.body;

        try {
            // Valider le token Google côté serveur
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();

            // Vérifier si l'utilisateur existe déjà
            let user = await strapi.query("plugin::users-permissions.user").findOne({
                where: { email: payload.email },
            });

            if (!user) {
                // Créer un nouvel utilisateur Google
                user = await strapi.query("plugin::users-permissions.user").create({
                    data: {
                        email: payload.email,
                        username: payload.name || payload.email.split('@')[0],
                        provider: 'google',
                        confirmed: true, // On considère que Google a vérifié l'email
                    },
                });
            }

            // Générer un JWT pour l'utilisateur
            const token = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            ctx.send({
                jwt: token,
                user,
            });
        } catch (err) {
            ctx.badRequest('Google authentication failed', { error: err.message });
        }
    };


    return plugin;
};