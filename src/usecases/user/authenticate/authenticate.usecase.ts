import { Usecase } from "@/usecases/usecase";
import {
  AuthenticateInputDTO,
  AuthenticateOutputDTO,
} from "./authenticate.types";
import { UserGateway } from "@/domain/user/gateway/user.gateway";
import { InvalidCredentialsError } from "./authentication.error";
import { compare } from "bcryptjs";

export class AuthenticateUsecase
  implements Usecase<AuthenticateInputDTO, AuthenticateOutputDTO>
{
  private constructor(private readonly userGateway: UserGateway) {}

  public static create(userGateway: UserGateway): AuthenticateUsecase {
    return new AuthenticateUsecase(userGateway);
  }

  public async execute({
    email,
    password,
  }: AuthenticateInputDTO): Promise<AuthenticateOutputDTO> {
    const user = await this.userGateway.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const doesPasswordMatch = await compare(password, user.password);

    if (!doesPasswordMatch) {
      throw new InvalidCredentialsError();
    }

    const output: AuthenticateOutputDTO = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    return output;
  }
}
