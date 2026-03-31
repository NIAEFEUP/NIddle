import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Course } from "@/courses/entities/course.entity";
import { Faculty } from "@/faculties/entities/faculty.entity";
import { User } from "@/users/entities/user.entity";
import { AssociationsController } from "./associations.controller";
import { AssociationsModule } from "./associations.module";
import { AssociationsService } from "./associations.service";
import { Association } from "./entities/association.entity";

describe("AssociationsModule", () => {
  it("should compile the module", async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AssociationsModule],
    })
      .overrideProvider(getRepositoryToken(Association))
      .useValue({})
      .overrideProvider(getRepositoryToken(Faculty))
      .useValue({})
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Course))
      .useValue({})
      .compile();

    expect(module).toBeDefined();
    expect(module.get(AssociationsController)).toBeDefined();
    expect(module.get(AssociationsService)).toBeDefined();
  });
});
