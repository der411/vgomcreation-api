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

            // Vérifiez si l'utilisateur a confirmé son email
            if (!user.confirmed) {
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
            ctx.redirect('http://localhost:3000/email-confirmation-success');

        } catch (err) {
            ctx.redirect('http://localhost:3000/login');
        }
    };

    return plugin;
};