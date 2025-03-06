import { User } from "../entity/user.entity";

export interface UserGateway {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}
