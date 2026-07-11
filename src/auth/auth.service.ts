import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { EntityNotFoundError } from "typeorm";
import { User } from "@/users/entities/user.entity";
import { UsersService } from "@/users/users.service";
import { SignInDto } from "./dto/signin.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    let user: User | null = null;

    try {
      user = await this.usersService.findOneByEmail(signInDto.email);
    } catch (error) {
      if (!(error instanceof EntityNotFoundError)) {
        throw error;
      }
    }

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordMatching = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(signInDto: SignInDto): Promise<User | null> {
    let user: User | null = null;

    try {
      user = await this.usersService.findOneByEmail(signInDto.email);
    } catch (error) {
      if (!(error instanceof EntityNotFoundError)) {
        throw error;
      }
    }

    if (user && (await bcrypt.compare(signInDto.password, user.password))) {
      return user;
    }
    return null;
  }
}
