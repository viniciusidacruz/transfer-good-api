export interface AuthenticateResponseDTO {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PresetInput {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
