export interface AuthenticateInputDTO {
  email: string;
  password: string;
}

export interface AuthenticateOutputDTO {
  id: string;
  name: string;
  email: string;
}
