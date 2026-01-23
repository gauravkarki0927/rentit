import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Swagger configuration options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RentIt API',
      version: '1.0.0',
      description: 'API documentation for RentIt backend built with Node.js, Express, and MongoDB',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
      },
    ],
  },
  apis: ['./routes/*.js'], // include all route files for auto documentation
};

// Generate swagger specification
const swaggerSpec = swaggerJsdoc(options);

// Export a reusable function to plug into Express
export const swaggerDocs = (app) => {
  const port = process.env.PORT || 5000;
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📄 Swagger Docs available at: http://localhost:${port}/api-docs`);
};
