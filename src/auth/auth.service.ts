import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/create-user.dto';
import { SignInDto } from './signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    let existingUser: User | null = null;

    try {
      existingUser = await this.usersService.findOneByEmail(
        createUserDto.email,
      );
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (existingUser) {
      throw new ConflictException('Email is already in use.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUserDto = { ...createUserDto, password: hashedPassword };

    const newUser = await this.usersService.create(newUserDto);
    return newUser;
  }

  async signIn(signInDto: SignInDto) {
    let user: User | null = null;

    try {
      user = await this.usersService.findOneByEmail(signInDto.email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async validateUser(signInDto: SignInDto): Promise<User | null> {
    let user: User | null = null;

    try {
      user = await this.usersService.findOneByEmail(signInDto.email);
    } catch (error) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
    }

    if (user && (await bcrypt.compare(signInDto.password, user.password))) {
      return user;
    }
    return null;
  }
}
