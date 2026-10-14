import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getTestDatabaseOptions } from "@/test/test-database";
import { AppController } from "./app.controller";
import { AppModule } from "./app.module";
import { DatabaseModule } from "./database/database.module";

describe("AppModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: "test_secret",
            }),
          ],
          isGlobal: true,
        }),
        AppModule,
      ],
    })
      .overrideModule(DatabaseModule)
      .useModule(TypeOrmModule.forRoot(getTestDatabaseOptions()))
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve AppController", () => {
    const controller = module.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });
});
