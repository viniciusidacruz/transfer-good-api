import fastify from "fastify";
import { ZodError } from "zod";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "@/env";
import { Api } from "../api";
import { FastifyTypedInstance } from "@/infra/api/fastify/fastify-instance";
import { Route } from "./routes/route";

export class ApiFastify implements Api {
  private app: FastifyTypedInstance;

  private constructor(routes: Route[]) {
    this.app = fastify().withTypeProvider<ZodTypeProvider>();

    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);

    this.app.setErrorHandler((error, request, reply) => {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          message: "Validation error.",
          issues: error.format(),
        });
      }

      if (env.NODE_ENV !== "production") {
        console.error(error);
      } else {
        // TODO: Here we should log to external tool
      }

      return reply.status(500).send({
        statusCode: 500,
        message: "Internal server error.",
      });
    });

    this.app.register(fastifyCors, { origin: "*" });

    this.app.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Transfer Good API",
          version: "1.0.0",
        },
      },
      transform: jsonSchemaTransform,
    });

    this.app.register(fastifySwaggerUi, {
      routePrefix: "/docs",
    });

    this.addRoutes(routes);
  }

  public static create(routes: Route[]) {
    return new ApiFastify(routes);
  }

  private addRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      const path = route.getPath();
      const method = route.getMethod();
      const handler = route.getHandler();

      this.app[method](path, handler);
    });
  }

  public start(port: number): void {
    this.app.listen({ port: port, host: "0.0.0.0" }).then(() => {
      console.log(`Server listening on port ${port}`);
      this.listRoutes();
    });
  }

  private listRoutes(): void {
    console.log(this.app.printRoutes());
  }
}
