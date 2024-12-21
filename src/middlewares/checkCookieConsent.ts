import { Context, Next } from 'koa';

const checkCookieConsent = async (ctx: Context, next: Next): Promise<void> => {
    const cookieConsent = ctx.cookies.get('cookieConsent'); // Lire le cookie "cookieConsent"

    if (cookieConsent === 'true' || ctx.path.startsWith('/public')) {
        // Autoriser l'accès si le consentement est donné ou si la route est publique
        await next();
    } else if (ctx.path === '/api/cookie-consent') {
        // Autoriser l'accès à la route spécifique de gestion des cookies
        await next();
    } else {
        // Bloquer l'accès si aucune autorisation n'a été donnée
        ctx.status = 403;
        ctx.body = { message: 'Consentement aux cookies requis' };
    }
};

export default checkCookieConsent;
