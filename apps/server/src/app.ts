// app.ts
import express, { Express, Router } from "express";
import cors from "cors";
import { pageNotFoundExceptionHandler } from "./errors/notFoundExceptionHandler";
import { errorConverter, errorHandler } from "./middleware/errorMiddleware";
import { initAndGetCache } from ".";



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
