export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    domain: env('ADMIN_SSO_DOMAIN', '.vgomcreation.fr'),
    providers: [
      {
        uid: 'google',
        name: 'Google',
        icon: 'https://cdn2.iconfinder.com/data/icons/social-icons-33/128/Google-512.png',
        redirectUri: env('GOOGLE_REDIRECT_URI', 'https://vgomcreation.com/connect/google/redirect'),
        clientId: env('GOOGLE_CLIENT_ID'),
        clientSecret: env('GOOGLE_CLIENT_SECRET'),
        scope: ['email', 'profile']
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
  url: env('ADMIN_URL', 'https://votredomaine.com/admin'),
});