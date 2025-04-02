const facebookController = require('./controllers/facebook');
const facebookRoutes = require('./routes/facebook');

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
        if (!idToken) {
            return ctx.badRequest("Missing idToken");
        }

        // Vérifie l'authenticité du token Google
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const username = payload.name || email.split('@')[0];

        // Vérifie si l'utilisateur existe déjà
        let user = await strapi.query("plugin::users-permissions.user").findOne({
            where: { email },
        });

        if (!user) {
            // Crée un nouvel utilisateur Google
            user = await strapi.query("plugin::users-permissions.user").create({
                data: {
                    email,
                    username,
                    provider: 'google',
                    confirmed: true, // Google vérifie déjà l'email
                    password: Math.random().toString(36).slice(-8), // Générer un mot de passe aléatoire
                },
            });
        }

        // Génère un JWT pour l'utilisateur
        const token = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });

        ctx.send({
            jwt: token,
            user,
        });
    } catch (err) {
        console.error("Google Login Error:", err.message);
        ctx.badRequest("Google authentication failed");
    }
};

plugin.controllers.auth.googleCallback = async (ctx) => {
    const provider = 'google';

    try {
        const params = ctx.query;
        const user = await strapi.plugins['users-permissions'].services.providers.callback(
            provider,
            params
        );

        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id,
        });

        // Rediriger vers votre frontend avec le token JWT
        const clientURL = process.env.CLIENT_URL || 'http://localhost:3000';
        return ctx.redirect(`${clientURL}/connect/google/redirect?access_token=${access_token}`);

    } catch (error) {
        ctx.throw(400, error.message);
    }
};

plugin.controllers.auth.googleAuth = async (ctx) => {
    const { query } = ctx;
    const provider = 'google';

    try {
        await strapi.plugins['users-permissions'].services.providers.connect(
            provider,
            query
        );
    } catch (error) {
        ctx.throw(400, error.message);
    }
};

    // Ajout du contrôleur Facebook comme un nouveau contrôleur séparé
    plugin.controllers.facebook = facebookController;

    // Ajout des routes Facebook
    plugin.routes['content-api'].routes.push(...facebookRoutes);

return plugin;
};