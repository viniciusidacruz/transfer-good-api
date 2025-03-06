import z from "zod";
import { hash } from "bcryptjs";
import { FastifyReply, FastifyRequest } from "fastify";

import { CreateUserUseCase } from "@/usecases/user/create/create-user.usecase";
import { AlreadyExistsEmailError } from "@/usecases/user/create/create-user.error";
import {
  CreateUserInputDTO,
  CreateUserOutputDTO,
} from "@/usecases/user/create/create-user.types";

import { HttpMethod, Route } from "../route";
import { CreateUserResponseDTO } from "./create-user.fastify.route.types";

export class CreateUserRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly createUserService: CreateUserUseCase
  ) {}

  public static create(createUserService: CreateUserUseCase) {
    return new CreateUserRoute("/users", HttpMethod.POST, createUserService);
  }

  public getHandler() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const input = await this.validateRequest(request);

      try {
        const output: CreateUserOutputDTO =
          await this.createUserService.execute(input);

        const response = this.present(output);

        reply.status(201).send(response);
      } catch (err) {
        if (err instanceof AlreadyExistsEmailError) {
          return reply.status(409).send({ message: err.message });
        }

        return reply.status(500).send();
      }
    };
  }

  public getPath(): string {
    return this.path;
  }

  public getMethod(): HttpMethod {
    return this.method;
  }

  private present(input: CreateUserResponseDTO): CreateUserResponseDTO {
    const response = {
      id: input.id,
    };

    return response;
  }

  private async validateRequest(
    request: FastifyRequest
  ): Promise<CreateUserInputDTO> {
    const schema = z.object({
      email: z.string().email(),
      name: z.string(),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" }),
    });

    const { email, name, password } = schema.parse(request.body);

    const password_hash = await hash(password, 6);

    return {
      email,
      name,
      password: password_hash,
    };
  }
}
