import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import {
  RequestAction,
  RequestStatus,
  RequestType,
} from "@/requests/entities/request.entity";
import { REQUEST_SORT_FIELDS, RequestFilterDto } from "./request-filter.dto";

describe("RequestFilterDto", () => {
  const validUuid1 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const validUuid2 = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

  it("accepts valid UUID strings for requestedBy and targetAssociationId", async () => {
    const dto = plainToInstance(RequestFilterDto, {
      requestedBy: validUuid1,
      targetAssociationId: validUuid2,
      type: RequestType.EVENT,
      action: RequestAction.CREATE,
      status: RequestStatus.PENDING,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.requestedBy).toBe(validUuid1);
    expect(dto.targetAssociationId).toBe(validUuid2);
  });

  it("rejects an invalid UUID requestedBy or targetAssociationId", async () => {
    const dto = plainToInstance(RequestFilterDto, {
      requestedBy: "abc",
      targetAssociationId: "def",
    });

    const errors = await validate(dto);

    expect(errors.some((e) => e.property === "requestedBy")).toBe(true);
    expect(errors.some((e) => e.property === "targetAssociationId")).toBe(true);
  });

  it("is valid when no filters are provided", async () => {
    const dto = plainToInstance(RequestFilterDto, {});

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  describe("sortBy / sortOrder", () => {
    it.each(
      REQUEST_SORT_FIELDS,
    )("accepts %s as a valid sortBy value", async (sortBy) => {
      const dto = plainToInstance(RequestFilterDto, { sortBy });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it("rejects a sortBy value that isn't whitelisted", async () => {
      const dto = plainToInstance(RequestFilterDto, { sortBy: "invalidField" });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === "sortBy")).toBe(true);
    });

    it.each([
      "ASC",
      "DESC",
    ])("accepts %s as a valid sortOrder", async (sortOrder) => {
      const dto = plainToInstance(RequestFilterDto, {
        sortBy: "createdAt",
        sortOrder,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
