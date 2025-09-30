const swaggerUi = require('swagger-ui-express');
const { createSpecs } = require('./swaggerOptions');

const swaggerSetup = (app, config) => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (config.swagger?.enabled && nodeEnv !== 'production') {
    const specs = createSpecs();
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: "API Documentation"
    }));

    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    return true;
  }

  return false;
};

module.exports = { swaggerSetup };
