module.exports = ({ env }) => ({
    upload: {
      config: {
        provider: 'local',
        providerOptions: {
          sizeLimit: 10000000, // Limite de taille en octets (10 Mo ici)
        },
        actionOptions: {
          upload: {
            path: env('UPLOAD_PATH', '/data/uploads'),
          },
        },
      },
    },
  });
  