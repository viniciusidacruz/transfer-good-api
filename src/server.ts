import { prisma } from "./packages/prisma";
import { CreateUserUseCase } from "./usecases/user/create/create-user.usecase";
import { UserRepositoryPrisma } from "./infra/repositories/user/user.repository.prisma";
import { CreateUserRoute } from "./infra/api/fastify/routes/user/create-user.fastify.route";
import { ApiFastify } from "./infra/api/fastify/api.fastify";
import { env } from "./env";

function server() {
  const repository = UserRepositoryPrisma.create(prisma);

  const createUserUseCase = CreateUserUseCase.create(repository);

  const createUserRoute = CreateUserRoute.create(createUserUseCase);

  const api = ApiFastify.create([createUserRoute]);

  api.start(env.PORT);
}

server();
