import { Context, Next } from 'koa';

export default (config: Record<string, unknown>, { strapi }: { strapi: any }) => {
    return async (ctx: Context, next: Next): Promise<void> => {
        const cookieConsent = ctx.cookies.get('cookieConsent');

        if (cookieConsent === 'true' || ctx.path.startsWith('/public')) {
            // Consentement accepté ou accès à une ressource publique
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
};
