import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTestDatabaseOptions } from "@/test/test-database";
import { UsersController } from "./users.controller";
import { UsersModule } from "./users.module";
import { UsersService } from "./users.service";

describe("UsersModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(getTestDatabaseOptions()), UsersModule],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve UsersService", () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(UsersService);
  });

  it("should resolve UsersController", () => {
    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(UsersController);
  });
});
