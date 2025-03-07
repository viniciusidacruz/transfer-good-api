import fastify from "fastify";
import { ZodError } from "zod";
import fastifyCors from "@fastify/cors";
import { fastifyJwt } from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import { env } from "@/env";
import { FastifyTypedInstance } from "@/infra/api/fastify/fastify-instance";

import { Api } from "../api";
import { Route } from "./routes/route";
import { verifyJWT } from "./middlewares/verify-jwt";

export class ApiFastify implements Api {
  private app: FastifyTypedInstance;

  private constructor(routes: Route[]) {
    this.app = fastify().withTypeProvider<ZodTypeProvider>();

    this.setupErrorHandler();
    this.setupCompilers();
    this.setupPlugins();

    this.addRoutes(routes);
  }

  public static create(routes: Route[]) {
    return new ApiFastify(routes);
  }

  private setupCompilers(): void {
    this.app.setValidatorCompiler(validatorCompiler);
    this.app.setSerializerCompiler(serializerCompiler);
  }

  private setupPlugins(): void {
    this.app.register(fastifyCors, { origin: "*" });
    this.app.register(fastifyCookie);

    this.app.register(fastifyJwt, {
      secret: env.JWT_SECRET_KEY,
      cookie: { cookieName: "refreshToken", signed: false },
      sign: { expiresIn: "10m" },
    });

    this.app.register(fastifySwagger, {
      openapi: {
        info: { title: "Transfer Good API", version: "1.0.0" },
      },
      transform: jsonSchemaTransform,
    });

    this.app.register(fastifySwaggerUi, { routePrefix: "/docs" });
  }

  private setupErrorHandler(): void {
    this.app.setErrorHandler((error, _, reply) => {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          message: "Validation error",
          issues: error.format(),
        });
      }

      if (env.NODE_ENV !== "production") {
        this.app.log.error(error);
      } else {
        // TODO: Integrar com ferramenta de logging externa
      }

      return reply.status(500).send({
        statusCode: 500,
        message: "Internal server error",
      });
    });
  }

  private addRoutes(routes: Route[]): void {
    routes.forEach((route) => {
      const url = route.getPath();
      const method = route.getMethod();
      const handler = route.getHandler();
      const isPrivate = route.isPrivate || false;

      this.app.route({
        method,
        url,
        handler,
        onRequest: isPrivate ? [verifyJWT] : [],
      });
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
