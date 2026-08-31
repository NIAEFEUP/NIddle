import { SortOrder } from "@/common/sorting/enums/sort-order.enum";
import { buildOrderClause } from "./sort.util";

describe("buildOrderClause", () => {
  it("should return default tiebreaker when sortBy is not provided", () => {
    const result = buildOrderClause({});
    expect(result).toEqual({ id: "ASC" });
  });

  it("should return default tiebreaker when sortDto is undefined", () => {
    const result = buildOrderClause();
    expect(result).toEqual({ id: "ASC" });
  });

  it("should return default ASC order when sortOrder is omitted", () => {
    const result = buildOrderClause({ sortBy: "name" });
    expect(result).toEqual({ name: "ASC", id: "ASC" });
    expect(Object.keys(result)).toEqual(["name", "id"]);
  });

  it("should return custom sortOrder with id tiebreaker", () => {
    const result = buildOrderClause({
      sortBy: "name",
      sortOrder: SortOrder.DESC,
    });
    expect(result).toEqual({ name: "DESC", id: "ASC" });
    expect(Object.keys(result)).toEqual(["name", "id"]);
  });

  it("should override tiebreaker key when sorting by that same key", () => {
    const result = buildOrderClause({
      sortBy: "id",
      sortOrder: SortOrder.DESC,
    });
    expect(result).toEqual({ id: "DESC" });
    expect(Object.keys(result)).toEqual(["id"]);
  });

  it("should support custom default tiebreaker", () => {
    const result = buildOrderClause(
      { sortBy: "name", sortOrder: SortOrder.ASC },
      { createdAt: "DESC", id: "ASC" },
    );
    expect(result).toEqual({ name: "ASC", createdAt: "DESC", id: "ASC" });
    expect(Object.keys(result)).toEqual(["name", "createdAt", "id"]);
  });
});
