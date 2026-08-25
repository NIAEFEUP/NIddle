import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreateEventDto } from "@/events/dto/create-event.dto";
import { UpdateEventDto } from "@/events/dto/update-event.dto";
import { EventsService } from "@/events/events.service";
import { CreateServiceDto } from "@/services/dto/create-service.dto";
import { UpdateServiceDto } from "@/services/dto/update-service.dto";
import { ServicesService } from "@/services/services.service";
import { RequestType } from "./entities/request.entity";
import { RequestRegistry } from "./requests-registry.service";

describe("RequestRegistry", () => {
  const mockEventsService = {
    findOne: jest.fn(),
  } as unknown as EventsService;

  const mockServicesService = {
    findOne: jest.fn(),
  } as unknown as ServicesService;

  const registry = new RequestRegistry(mockEventsService, mockServicesService);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("returns the handler registered for a type", () => {
      expect(registry.get(RequestType.EVENT)).toBe(mockEventsService);
      expect(registry.get(RequestType.SERVICE)).toBe(mockServicesService);
    });

    it("throws InternalServerErrorException for an unregistered type", () => {
      expect(() => registry.get("Unknown" as RequestType)).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe("findTarget", () => {
    it("delegates to eventsService.findOne for an Event type", async () => {
      const mockEvent = { id: 7, name: "FEUP Week" };
      (mockEventsService.findOne as jest.Mock).mockResolvedValue(mockEvent);

      const result = await registry.findTarget(RequestType.EVENT, 7);

      expect(mockEventsService.findOne).toHaveBeenCalledWith(7);
      expect(mockServicesService.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockEvent);
    });

    it("delegates to servicesService.findOne for a Service type", async () => {
      const mockService = { id: 5, name: "Papelaria D. Beatriz" };
      (mockServicesService.findOne as jest.Mock).mockResolvedValue(mockService);

      const result = await registry.findTarget(RequestType.SERVICE, 5);

      expect(mockServicesService.findOne).toHaveBeenCalledWith(5);
      expect(mockEventsService.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockService);
    });

    it("throws InternalServerErrorException for an unrecognized type", async () => {
      await expect(
        registry.findTarget("Unknown" as RequestType, 1),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockEventsService.findOne).not.toHaveBeenCalled();
      expect(mockServicesService.findOne).not.toHaveBeenCalled();
    });
  });

  describe("attachTarget", () => {
    it("sets targetService for a Service type", () => {
      const request = { targetService: null, targetEvent: null } as any;
      const target = { id: 5, name: "Papelaria D. Beatriz" };

      registry.attachTarget(request, RequestType.SERVICE, target as any);

      expect(request.targetService).toBe(target);
      expect(request.targetEvent).toBeNull();
    });

    it("sets targetEvent for an Event type", () => {
      const request = { targetService: null, targetEvent: null } as any;
      const target = { id: 7, name: "FEUP Week" };

      registry.attachTarget(request, RequestType.EVENT, target as any);

      expect(request.targetEvent).toBe(target);
      expect(request.targetService).toBeNull();
    });
  });

  describe("getTargetId", () => {
    it("returns targetService.id for a Service type", () => {
      const request = {
        targetService: { id: 5 },
        targetEvent: null,
      } as any;

      expect(registry.getTargetId(request, RequestType.SERVICE)).toBe(5);
    });

    it("returns targetEvent.id for an Event type", () => {
      const request = {
        targetService: null,
        targetEvent: { id: 7 },
      } as any;

      expect(registry.getTargetId(request, RequestType.EVENT)).toBe(7);
    });

    it("returns undefined for an unrecognized type", () => {
      const request = { targetService: null, targetEvent: null } as any;

      expect(
        registry.getTargetId(request, "Unknown" as RequestType),
      ).toBeUndefined();
    });
  });

  describe("detachTarget", () => {
    it("nulls both targetService and targetEvent", () => {
      const request = {
        targetService: { id: 5 },
        targetEvent: { id: 7 },
      } as any;

      registry.detachTarget(request);

      expect(request.targetService).toBeNull();
      expect(request.targetEvent).toBeNull();
    });
  });

  describe("validateCreatePayload", () => {
    it("returns a validated CreateEventDto instance for a valid Event payload", async () => {
      const result = await registry.validateCreatePayload(RequestType.EVENT, {
        name: "FEUP Week",
        year: 2025,
      });

      expect(result).toBeInstanceOf(CreateEventDto);
      expect(result.name).toEqual("FEUP Week");
    });

    it("throws BadRequestException for an invalid Event payload", async () => {
      await expect(
        registry.validateCreatePayload(RequestType.EVENT, { year: 2025 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("returns a validated CreateServiceDto instance for a valid Service payload", async () => {
      const result = await registry.validateCreatePayload(RequestType.SERVICE, {
        name: "Papelaria D. Beatriz",
        location: "B-142",
        schedule: [],
      });

      expect(result).toBeInstanceOf(CreateServiceDto);
      expect(result.name).toEqual("Papelaria D. Beatriz");
    });

    it("throws BadRequestException for an invalid Service payload", async () => {
      await expect(
        registry.validateCreatePayload(RequestType.SERVICE, { name: "" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("validateUpdatePayload", () => {
    it("allows a partial Event payload", async () => {
      const result = await registry.validateUpdatePayload(RequestType.EVENT, {
        name: "FEUP Week Updated",
      });

      expect(result).toBeInstanceOf(UpdateEventDto);
      expect(result.name).toEqual("FEUP Week Updated");
    });

    it("throws BadRequestException when a provided field has the wrong shape", async () => {
      await expect(
        registry.validateUpdatePayload(RequestType.EVENT, {
          year: "not-a-number",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("allows a partial Service payload", async () => {
      const result = await registry.validateUpdatePayload(RequestType.SERVICE, {
        name: "Papelaria Editada",
      });

      expect(result).toBeInstanceOf(UpdateServiceDto);
      expect(result.name).toEqual("Papelaria Editada");
    });
  });
});
