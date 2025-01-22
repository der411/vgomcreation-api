'use strict';

const https = require('https');
const FormData = require('form-data');

module.exports = {
    init: (providerOptions = {}, settings = {}) => {
        const { key, domain } = providerOptions;

        return {
            send: async (options) => {
                console.log('Tentative d\'envoi d\'email avec les options:', JSON.stringify(options, null, 2));

                const { to, from, subject, text, html } = options;

                return new Promise((resolve, reject) => {
                    const form = new FormData();
                    form.append('from', from || 'VGOM Creation <postmaster@mg.vgomcreation.fr>');
                    form.append('to', to);
                    form.append('subject', subject);
                    form.append('text', text);
                    if (html) {
                        form.append('html', html);
                    }

                    console.log('Envoi à Mailgun avec les paramètres:', {
                        host: 'api.eu.mailgun.net',
                        path: `/v3/${domain}/messages`,
                        auth: `api:${key.substring(0, 5)}...` // On ne log pas la clé complète
                    });

                    const req = https.request({
                        method: 'POST',
                        host: 'api.eu.mailgun.net',
                        path: `/v3/${domain}/messages`,
                        auth: `api:${key}`,
                        headers: form.getHeaders(),
                    }, (res) => {
                        let data = '';

                        res.on('data', (chunk) => {
                            data += chunk;
                        });

                        res.on('end', () => {
                            console.log('Réponse Mailgun:', data);
                            if (res.statusCode >= 200 && res.statusCode < 300) {
                                resolve(JSON.parse(data));
                            } else {
                                reject(new Error(`HTTP error! status: ${res.statusCode}, response: ${data}`));
                            }
                        });
                    });

                    req.on('error', (error) => {
                        console.error('Erreur lors de l\'envoi:', error);
                        reject(error);
                    });

                    form.pipe(req);
                });
            }
        };
    }
};