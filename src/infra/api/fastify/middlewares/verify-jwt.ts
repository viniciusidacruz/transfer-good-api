import { FastifyReply, FastifyRequest } from "fastify";

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ statusCode: 401, message: "Unauthorized" });
  }
}
