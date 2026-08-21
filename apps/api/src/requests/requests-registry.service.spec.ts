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
    createPayloadType: CreateEventDto,
    updatePayloadType: UpdateEventDto,
  } as unknown as EventsService;

  const mockServicesService = {
    createPayloadType: CreateServiceDto,
    updatePayloadType: UpdateServiceDto,
  } as unknown as ServicesService;

  const registry = new RequestRegistry(mockEventsService, mockServicesService);

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
