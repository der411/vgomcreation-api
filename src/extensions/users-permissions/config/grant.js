// ./config/grant.js
module.exports = {
    defaults: {
        transport: 'state', // transport des données via l'état
        state: true,
    },
    google: {
        enabled: true,
        key: '<GOOGLE_CLIENT_ID>',
        secret: '<GOOGLE_CLIENT_SECRET>',
        scope: ['openid', 'profile', 'email'],
        response: ['tokens', 'profile'], // Obtenir les tokens et le profil
        callback: '/api/connect/google/callback', // Définir l'URL de callback
    },
};
