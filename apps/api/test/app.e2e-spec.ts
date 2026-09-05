import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "@/app.module";
import { DatabaseModule } from "@/database/database.module";
import { getTestDatabaseOptions } from "@/test/test-database";

describe("AppController (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TypeOrmModule.forRoot(getTestDatabaseOptions()))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty("status", "online");
        expect(res.body).toHaveProperty(
          "message",
          "Welcome to the NIddle API!",
        );
      });
  });
});
