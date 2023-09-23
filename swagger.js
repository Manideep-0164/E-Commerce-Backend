const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description:
        "Comprehensive API documentation for the E-Commerce platform, providing endpoints for user authentication, product management, shopping cart operations, orders, and more.",
    },
    servers: [
      {
        url: "http://localhost:1010",
        description: "Local server",
      },
      {
        url: "https://red-light-bee.cyclic.cloud",
        description: "Deployed server",
      },
    ],
  },
  apis: ["./swagger.yaml"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
