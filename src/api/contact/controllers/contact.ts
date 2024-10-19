import { factories } from '@strapi/strapi';
import { Context } from 'koa';

export default factories.createCoreController('api::contact.contact', ({ strapi }) => ({
    async create(ctx: Context) {
        console.log(ctx.request.body); // Affiche le corps de la requête pour vérifier les données envoyées

        const { prenom, nom, email, message } = ctx.request.body;

        // Vérifier que les champs requis sont présents
        if (!prenom || !nom || !email || !message) {
            return ctx.badRequest('All fields are required.');
        }

        // Créer l'entrée dans la collection Contact
        const response = await strapi.service('api::contact.contact').create({
            data: { prenom, nom, email, message },
        });

        return ctx.send(response);
    },
}));
