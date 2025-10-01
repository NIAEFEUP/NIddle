import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string.' })
  @MinLength(5, {
    message:
      'Name is too short. Minimal length is $constraint1 characters, but actual is $value.',
  })
  @MaxLength(100, {
    message:
      'Name is too long. Maximal length is $constraint1 characters, but actual is $value.',
  })
  /**
   * The user name.
   * @example 'Cristiano Ronaldo dos Santos Aveiro'
   */
  name: string;

  @IsEmail(undefined, { message: 'Invalid email format.' })
  /**
   * The user e-mail.
   * @example 'cr7@gmail.com'
   */
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password is too weak. It must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol.',
    },
  )
  /**
   * The user password.
   * @example 'Password123!'
   */
  password: string;
}
