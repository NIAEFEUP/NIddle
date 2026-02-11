import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { AuthController } from "./auth.controller";
import { AuthModule } from "./auth.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./guards/jwt.strategy";
import { LocalStrategy } from "./guards/local.strategy";

describe("AuthModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [User],
          synchronize: true,
        }),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              JWT_SECRET: "test_secret",
            }),
          ],
        }),
        AuthModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve AuthService", () => {
    const service = module.get<AuthService>(AuthService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AuthService);
  });

  it("should resolve AuthController", () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AuthController);
  });

  it("should resolve LocalStrategy", () => {
    const strategy = module.get<LocalStrategy>(LocalStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(LocalStrategy);
  });

  it("should resolve JwtStrategy", () => {
    const strategy = module.get<JwtStrategy>(JwtStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(JwtStrategy);
  });
});
