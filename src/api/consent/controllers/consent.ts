import { Context } from 'koa';
interface CookieConsentRequestBody {
    consent: boolean;
}

const setConsent = async (ctx: Context): Promise<void> => {
    const { consent } = ctx.request.body as CookieConsentRequestBody;

    if (typeof consent === 'boolean') {
        ctx.cookies.set('cookieConsent', String(consent), {
            httpOnly: false, // Accessible par JavaScript
            secure: ctx.app.env === 'production',
            sameSite: 'lax', // Politique SameSite
            maxAge: 1000 * 60 * 60 * 24 * 365, // 1 an
        });

        ctx.send({ message: 'Consentement mis à jour', consent });
    } else {
        ctx.badRequest('Le consentement doit être un booléen');
    }
};

const getConsent = async (ctx: Context): Promise<void> => {
    const consent = ctx.cookies.get('cookieConsent') === 'true';
    ctx.send({ consent });
};

export default {
    setConsent,
    getConsent,
};
