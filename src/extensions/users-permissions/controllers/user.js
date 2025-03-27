// ./src/extensions/users-permissions/controllers/user.js
module.exports = {
    async googleLogin(ctx) {
        try {
            const { response } = ctx.session.grant;
            if (!response) return ctx.badRequest('No response from Google');

            const { access_token, profile } = response;

            // Recherche un utilisateur par email
            let user = await strapi.query('plugin::users-permissions.user').findOne({
                where: { email: profile.email },
            });

            // Si l'utilisateur n'existe pas, crée-le
            if (!user) {
                user = await strapi.plugins['users-permissions'].services.user.add({
                    username: profile.name,
                    email: profile.email,
                    provider: 'google',
                    password: Math.random().toString(36).slice(-8), // Mot de passe temporaire
                });
            }

            // Génère un JWT pour l'utilisateur
            const token = strapi.plugins['users-permissions'].services.jwt.issue({
                id: user.id,
            });

            // Retourne le token et les informations de l'utilisateur
            return ctx.send({ jwt: token, user });
        } catch (error) {
            console.error(error);
            return ctx.internalServerError('Something went wrong');
        }
    },
};
