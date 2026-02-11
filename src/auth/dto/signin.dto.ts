import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInDto {
  @IsEmail(undefined, { message: "Invalid email format." })
  /**
   * The user e-mail.
   * @example 'cr7@gmail.com'
   */
  email: string;

  @IsNotEmpty({ message: "Password cannot be empty." })
  /**
   * The user password.
   * @example 'Password#123'
   */
  password: string;
}
