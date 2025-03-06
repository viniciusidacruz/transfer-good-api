export class AlreadyExistsEmailError extends Error {
  constructor() {
    super("E-mail already exists");
  }
}
