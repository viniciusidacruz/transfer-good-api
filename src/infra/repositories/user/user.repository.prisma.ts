import { PrismaClient } from "@prisma/client";

import { UserGateway } from "@/domain/user/gateway/user.gateway";
import { User } from "@/domain/user/entity/user.entity";

export class UserRepositoryPrisma implements UserGateway {
  private constructor(private readonly prismaClient: PrismaClient) {}

  public static create(prismaClient: PrismaClient): UserRepositoryPrisma {
    return new UserRepositoryPrisma(prismaClient);
  }

  public async save(user: User): Promise<void> {
    const data = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
    };

    await this.prismaClient.user.create({ data });
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaClient.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return User.with(user);
  }

  public async findById(id: string): Promise<User | null> {
    const user = await this.prismaClient.user.findUnique({ where: { id } });

    if (!user) {
      return null;
    }

    return User.with(user);
  }
}
