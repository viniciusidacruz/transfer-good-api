import { Usecase } from "@/usecases/usecase";
import { User } from "@/domain/user/entity/user.entity";
import { UserGateway } from "@/domain/user/gateway/user.gateway";

import { CreateUserInputDTO, CreateUserOutputDTO } from "./create-user.types";
import { AlreadyExistsEmailError } from "./create-user.error";

export class CreateUserUseCase
  implements Usecase<CreateUserInputDTO, CreateUserOutputDTO>
{
  private constructor(private readonly userGateway: UserGateway) {}

  public static create(userGateway: UserGateway): CreateUserUseCase {
    return new CreateUserUseCase(userGateway);
  }

  public async execute({
    email,
    name,
    password,
  }: CreateUserInputDTO): Promise<CreateUserOutputDTO> {
    const existingUser = await this.userGateway.findByEmail(email);

    if (existingUser) {
      throw new AlreadyExistsEmailError();
    }

    const user = User.create(name, email, password);

    await this.userGateway.save(user);

    const output = this.presentOutput(user);

    return output;
  }

  private presentOutput(user: User): CreateUserOutputDTO {
    const output: CreateUserOutputDTO = {
      id: user.id,
    };

    return output;
  }
}
