import { types } from "util";

export type CreateUserInputDTO = {
  name: string;
  email: string;
  password: string;
};

export type CreateUserOutputDTO = {
  id: string;
};
