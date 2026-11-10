import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Association } from "@/associations/entities/association.entity";
import { Course } from "@/courses/entities/course.entity";
import { Event } from "@/events/entities/event.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { Request } from "@/requests/entities/request.entity";
import { Schedule } from "@/services/entity/schedule.entity";
import { Service } from "@/services/entity/service.entity";
import { User } from "@/users/entities/user.entity";
import { Product } from "./entities/product.entity";
import { ProductsController } from "./products.controller";
import { ProductsModule } from "./products.module";
import { ProductsService } from "./products.service";

describe("ProductsModule", () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [
            Association,
            Course,
            Faculty,
            Event,
            Service,
            Schedule,
            User,
            Request,
            Product,
          ],
          synchronize: true,
        }),
        ProductsModule,
      ],
    }).compile();
  });

  it("should compile the module", () => {
    expect(module).toBeDefined();
  });

  it("should resolve ProductsService", () => {
    const service = module.get<ProductsService>(ProductsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ProductsService);
  });

  it("should resolve ProductsController", () => {
    const controller = module.get<ProductsController>(ProductsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ProductsController);
  });
});
