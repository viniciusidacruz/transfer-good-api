import z from "zod";

import { FastifyTypedInstance } from "@/interfaces/fastify-instance";

export async function appRoutes(app: FastifyTypedInstance) {
  app.post(
    "/users",
    {
      schema: {
        tags: ["Users"],
        description: "Create a new user",
        body: z.object({
          email: z.string().email(),
        }),
        response: {
          201: z.null().describe("User created"),
        },
      },
    },
    async (req, reply) => {
      reply.send(null);
    }
  );
}
