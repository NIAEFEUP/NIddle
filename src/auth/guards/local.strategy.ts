import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "../../users/entities/user.entity";
import { AuthService } from "../auth.service";
import { SignInDto } from "../dto/signin.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(email: string, password: string): Promise<User> {
    const signInDto: SignInDto = { email, password };
    const user = await this.authService.validateUser(signInDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
