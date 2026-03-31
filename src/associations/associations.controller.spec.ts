import { Test, TestingModule } from "@nestjs/testing";
import { AssociationsController } from "./associations.controller";
import { AssociationsService } from "./associations.service";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";

describe("AssociationsController", () => {
  let controller: AssociationsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssociationsController],
      providers: [
        {
          provide: AssociationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AssociationsController>(AssociationsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("creates an association", async () => {
    const createDto: CreateAssociationDto = {
      name: "Chess Club",
      facultyId: 1,
      userId: 1,
    };
    const expected = { id: 1, ...createDto };
    service.create.mockResolvedValue(expected);

    const result = await controller.create(createDto);

    expect(service.create).toHaveBeenCalledWith(createDto);
    expect(result).toBe(expected);
  });

  it("finds all associations without faculty filter", async () => {
    const expected = [{ id: 1, name: "Chess Club" }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toBe(expected);
  });

  it("finds all associations for a faculty", async () => {
    const expected = [{ id: 2, name: "Robotics" }];
    service.findAll.mockResolvedValue(expected);

    const result = await controller.findAll("12");

    expect(service.findAll).toHaveBeenCalledWith(12);
    expect(result).toBe(expected);
  });

  it("finds one association by id", async () => {
    const expected = { id: 3, name: "Drama" };
    service.findOne.mockResolvedValue(expected);

    const result = await controller.findOne("3");

    expect(service.findOne).toHaveBeenCalledWith(3);
    expect(result).toBe(expected);
  });

  it("updates an association", async () => {
    const updateDto: UpdateAssociationDto = { name: "Drama Club" };
    const expected = { id: 3, name: "Drama Club" };
    service.update.mockResolvedValue(expected);

    const result = await controller.update("3", updateDto);

    expect(service.update).toHaveBeenCalledWith(3, updateDto);
    expect(result).toBe(expected);
  });

  it("removes an association", async () => {
    const expected = { id: 3, name: "Drama" };
    service.remove.mockResolvedValue(expected);

    const result = await controller.remove("3");

    expect(service.remove).toHaveBeenCalledWith(3);
    expect(result).toBe(expected);
  });
});
