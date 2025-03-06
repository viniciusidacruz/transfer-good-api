import { UserProps } from "./user.types";

export class User {
  private constructor(private props: UserProps) {
    this.validate();
  }

  public static create(name: string, email: string, password: string): User {
    return new User({
      id: crypto.randomUUID().toString(),
      email,
      name,
      password,
    });
  }

  public static with(props: UserProps): User {
    return new User(props);
  }

  private validate() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (this.props.name.trim() === "") {
      throw new Error("Name cannot be empty");
    }

    if (this.props.password.trim() === "") {
      throw new Error("Password cannot be empty");
    }

    if (this.props.email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    if (!this.props.email.includes("@")) {
      throw new Error("Email must contain an '@' symbol");
    }

    if (this.props.email.length > 255) {
      throw new Error("Email cannot exceed 255 characters");
    }

    if (this.props.password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    if (!emailRegex.test(this.props.email)) {
      throw new Error("Invalid email format");
    }
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get email(): string {
    return this.props.email;
  }

  public get password(): string {
    return this.props.password;
  }

  public updatePassword(newPassword: string): void {
    this.props.password = newPassword;
    this.validate();
  }

  public changeEmail(newEmail: string): void {
    this.props.email = newEmail;
    this.validate();
  }
}
