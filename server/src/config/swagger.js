const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const API_PREFIX = process.env.API_PREFIX || "/api";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recipe API",
      version: "1.0.0",
      description: "რეცეპტების API დოკუმენტაცია",
    },
    servers: [
      {
        url: `${BASE_URL}${API_PREFIX}`,
      },
    ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  const docsRoute = process.env.SWAGGER_ROUTE || "/api-docs";

  app.use(docsRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  console.log(`📚 Swagger running at ${BASE_URL}${docsRoute}`);
};

module.exports = swaggerDocs;
