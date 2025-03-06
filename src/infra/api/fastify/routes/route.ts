import { FastifyReply, FastifyRequest } from "fastify";

export type HttpMethod = "get" | "post";

export const HttpMethod = {
  GET: "get" as HttpMethod,
  POST: "post" as HttpMethod,
};

export interface Route {
  getHandler(): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  getPath(): string;
  getMethod(): HttpMethod;
}
