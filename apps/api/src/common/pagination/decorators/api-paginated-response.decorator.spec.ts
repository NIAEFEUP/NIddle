import { ApiPaginatedResponse } from "./api-paginated-response.decorator";

class TestModel {}

describe("ApiPaginatedResponse decorator", () => {
  it("creates composite decorator without errors", () => {
    const decorator = ApiPaginatedResponse(TestModel, "Paginated test models");
    expect(typeof decorator).toBe("function");
  });
});
