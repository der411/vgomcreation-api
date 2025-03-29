
/*module.exports = {
    async connect(ctx) {
        try {
            // Redirige vers l'URL de connexion Google via Grant
            const grant = strapi.plugins['grant'].services.grant;
            await grant('google', ctx);
        } catch (error) {
            console.error('Erreur lors de la redirection vers Google', error);
            return ctx.badRequest('Erreur de connexion');
        }
    },

    async callback(ctx) {
        try {
            const { response } = ctx.state.grant;
            if (!response) return ctx.badRequest('No response from Google');

            const { access_token, profile } = response;

            // Recherche l'utilisateur dans Strapi
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email: profile.email },
            });

            // Si l'utilisateur n'existe pas, on le crée
            if (!user) {
                user = await strapi.plugins['users-permissions'].services.user.add({
                    username: profile.name,
                    email: profile.email,
                    provider: 'google',
                    password: Math.random().toString(36).slice(-8),
                });
            }

            // Génération du JWT
            const token = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // Retourne le JWT et les informations utilisateur
            return ctx.send({ jwt: token, user });
        } catch (error) {
            console.error('Erreur dans le callback Google', error);
            return ctx.internalServerError('Une erreur est survenue');
        }
    },
};
*/