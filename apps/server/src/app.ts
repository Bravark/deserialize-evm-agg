// app.ts
import express, { Express, Router } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { pageNotFoundExceptionHandler } from "./errors/notFoundExceptionHandler";
import { errorConverter, errorHandler } from "./middleware/errorMiddleware";
import { initAndGetCache } from ".";
import { swaggerOptions } from "./swagger/swagger.config";



export async function setupApp(routes: Router[]): Promise<Express> {
  (BigInt.prototype as any).toJSON = function () {
    const int = Number.parseInt(this.toString());
    return int ?? this.toString();
  };

  const app = express();


  const client = await initAndGetCache()


  // Apply rate limiting to all requests
  // app.use(limiter);// done on the reverse proxy level

  // Middleware setup
  app.use(cors());
  app.use(express.json());

  // Swagger documentation setup
  const swaggerSpec = swaggerJsdoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'EVM Aggregator API Documentation',
  }));

  // Expose Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Route setup
  app.use(...routes);



  // 404 error route
  // app.use("*", pageNotFoundExceptionHandler);
  // console.log('routes: ', routes);

  //Error handlers
  app.use(errorConverter);
  app.use(errorHandler);

  return app;
}
