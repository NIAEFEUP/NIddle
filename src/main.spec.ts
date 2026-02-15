const mockApp = {
  useGlobalPipes: jest.fn(),
  useGlobalFilters: jest.fn(),
  listen: jest.fn(),
};

const mockNestFactory = {
  create: jest.fn().mockResolvedValue(mockApp),
};

const mockDocumentBuilderInstance = {
  setTitle: jest.fn().mockReturnThis(),
  setDescription: jest.fn().mockReturnThis(),
  addServer: jest.fn().mockReturnThis(),
  addBearerAuth: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({}),
};

const mockSwaggerModule = {
  createDocument: jest.fn(),
  setup: jest.fn(),
};

jest.mock("@nestjs/core", () => ({
  NestFactory: mockNestFactory,
}));

jest.mock("@nestjs/swagger", () => ({
  SwaggerModule: mockSwaggerModule,
  DocumentBuilder: jest.fn(() => mockDocumentBuilderInstance),
}));

jest.mock("./app.module", () => ({
  AppModule: class MockAppModule {},
}));

jest.mock("./filters/entity-not-found.filter", () => ({
  EntityNotFoundFilter: class MockFilter {},
}));

jest.mock("@nestjs/common", () => {
  const actual = jest.requireActual("@nestjs/common");
  return {
    ...actual,
    ValidationPipe: jest.fn(),
  };
});

describe("Main (bootstrap)", () => {
  let exitSpy: jest.SpyInstance;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNestFactory.create.mockResolvedValue(mockApp);

    exitSpy = jest
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
  });

  it("should bootstrap the application successfully", async () => {
    await jest.isolateModules(async () => {
      require("./main");
    });

    expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
      "docs",
      mockApp,
      expect.any(Function),
    );

    const documentFactory = mockSwaggerModule.setup.mock.calls[0][2];

    documentFactory();

    expect(mockSwaggerModule.createDocument).toHaveBeenCalled();
  });

  it("should use PORT from environment variable if defined", async () => {
    process.env.PORT = "8080";

    await jest.isolateModules(async () => {
      require("./main");
    });

    expect(mockApp.listen).toHaveBeenCalledWith("8080");

    delete process.env.PORT;
  });

  it("should catch errors and exit process(1)", async () => {
    const error = new Error("Test Bootstrap Error");
    mockNestFactory.create.mockRejectedValueOnce(error);

    await jest.isolateModules(async () => {
      require("./main");
    });

    await new Promise((resolve) => setImmediate(resolve));

    expect(consoleSpy).toHaveBeenCalledWith(
      "Fatal error during bootstrap:",
      error,
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
