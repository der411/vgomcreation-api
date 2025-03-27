module.exports = {
    async googleLogin(ctx) {
        try {
            const { response } = ctx.session.grant;
            if (!response) return ctx.badRequest('No response from Google');

            const { access_token, profile } = response;

            // Vérifier si l'utilisateur existe déjà
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email: profile.email },
            });

            // Créer l'utilisateur s'il n'existe pas
            if (!user) {
                user = await strapi.plugins['users-permissions'].services.user.add({
                    username: profile.name,
                    email: profile.email,
                    provider: 'google',
                    password: Math.random().toString(36).slice(-8),
                });
            }

            // Générer un token JWT
            const token = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            return ctx.send({ jwt: token, user });
        } catch (error) {
            console.error(error);
            return ctx.internalServerError('Something went wrong');
        }
    },
};
