import z from "zod";
import { FastifyReply, FastifyRequest } from "fastify";

import { AuthenticateUsecase } from "@/usecases/user/authenticate/authenticate.usecase";
import {
  AuthenticateInputDTO,
  AuthenticateOutputDTO,
} from "@/usecases/user/authenticate/authenticate.types";
import { InvalidCredentialsError } from "@/usecases/user/authenticate/authentication.error";

import { HttpMethod, Route } from "../route";
import { AuthenticateResponseDTO } from "./authenticate.fastify.route.types";

export class AuthenticateRoute implements Route {
  private constructor(
    private readonly path: string,
    private readonly method: HttpMethod,
    private readonly authenticateService: AuthenticateUsecase
  ) {}

  public static create(authenticateService: AuthenticateUsecase) {
    return new AuthenticateRoute(
      "/session",
      HttpMethod.POST,
      authenticateService
    );
  }

  public getHandler() {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const input = await this.validateRequest(request);

      try {
        const output: AuthenticateOutputDTO =
          await this.authenticateService.execute(input);

        const token = await reply.jwtSign(
          {},
          {
            sign: {
              sub: output.id,
            },
          }
        );

        const response = this.present({ token, user: output });

        reply.status(200).send(response);
      } catch (err) {
        if (err instanceof InvalidCredentialsError) {
          return reply.status(400).send({ message: err.message });
        }

        return reply.status(500).send();
      }
    };
  }

  private present(input: AuthenticateResponseDTO): AuthenticateResponseDTO {
    const response = {
      token: input.token,
      user: {
        id: input.user.id,
        name: input.user.name,
        email: input.user.email,
      },
    };

    return response;
  }

  public getPath(): string {
    return this.path;
  }

  public getMethod(): HttpMethod {
    return this.method;
  }

  private async validateRequest(
    request: FastifyRequest
  ): Promise<AuthenticateInputDTO> {
    const schema = z.object({
      email: z
        .string({ required_error: "E-mail is required" })
        .email({ message: "E-mail invalid" }),
      password: z.string({ required_error: "Password is required" }),
    });

    const { email, password } = schema.parse(request.body);

    return {
      email,
      password,
    };
  }
}
