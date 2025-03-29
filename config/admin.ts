import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from "passport-google-oauth2";

export default ({ env }) => ({
    auth: {
        secret: env('ADMIN_JWT_SECRET'),
        domain: env('ADMIN_SSO_DOMAIN', '.onrender.com'),
        providers: [
            {
                uid: "google",
                displayName: "Google",
                icon: "https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png",
                createStrategy: (strapi) =>
                    new GoogleStrategy(
                        {
                            clientID: env("GOOGLE_CLIENT_ID"),
                            clientSecret: env("GOOGLE_CLIENT_SECRET"),
                            scope: [
                                "https://www.googleapis.com/auth/userinfo.email",
                                "https://www.googleapis.com/auth/userinfo.profile",
                            ],
                            callbackURL:
                                strapi.admin.services.passport.getStrategyCallbackURL("google"),
                            passReqToCallback: true, // Cette option est nécessaire pour StrategyOptionsWithRequest
                        } as StrategyOptionsWithRequest,
                        (request, accessToken, refreshToken, profile, done) => {
                            done(null, {
                                email: profile.email,
                                firstname: profile.given_name,
                                lastname: profile.family_name,
                            });
                        }
                    ),
            },
        ],
    },
    apiToken: {
        salt: env('API_TOKEN_SALT'),
    },
    transfer: {
        token: {
            salt: env('TRANSFER_TOKEN_SALT'),
        },
    },
    flags: {
        nps: env.bool('FLAG_NPS', true),
        promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    url: env('ADMIN_URL', 'https://vgomcreation-api.onrender.com/admin'),
});