import { prisma } from "./packages/prisma";
import { CreateUserUseCase } from "./usecases/user/create/create-user.usecase";
import { UserRepositoryPrisma } from "./infra/repositories/user/user.repository.prisma";
import { CreateUserRoute } from "./infra/api/fastify/routes/user/create-user.fastify.route";
import { ApiFastify } from "./infra/api/fastify/api.fastify";
import { env } from "./env";
import { AuthenticateRoute } from "./infra/api/fastify/routes/user/authenticate.fastify.route";
import { AuthenticateUsecase } from "./usecases/user/authenticate/authenticate.usecase";
import { RefreshTokenRoute } from "./infra/api/fastify/routes/user/refresh-token.fastify.route";

function server() {
  const userRepository = UserRepositoryPrisma.create(prisma);

  const createUserUseCase = CreateUserUseCase.create(userRepository);
  const authenticateUseCase = AuthenticateUsecase.create(userRepository);

  const createUserRoute = CreateUserRoute.create(createUserUseCase);
  const authenticateRoute = AuthenticateRoute.create(authenticateUseCase);
  const refreshTokenRoute = RefreshTokenRoute.create(authenticateUseCase);

  const api = ApiFastify.create([
    createUserRoute,
    authenticateRoute,
    refreshTokenRoute,
  ]);

  api.start(env.PORT);
}

server();
