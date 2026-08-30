import { ArgumentsHost, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { QueryFailedError } from "typeorm";
import { QueryFailedErrorFilter } from "./query-failed-error.filter";

describe("QueryFailedErrorFilter", () => {
  let filter: QueryFailedErrorFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockResponse: Partial<Response> & {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    filter = new QueryFailedErrorFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  it("should return 409 naming the violated field for a unique violation (23505)", () => {
    const exception = new QueryFailedError(
      "INSERT INTO ...",
      undefined,
      Object.assign(new Error("duplicate key value"), {
        code: "23505",
        detail: "Key (email)=(admin@example.com) already exists.",
      }),
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: "A record with this email already exists",
      error: "Conflict",
    });
  });

  it("should name whichever field violated the constraint, not just email", () => {
    const exception = new QueryFailedError(
      "INSERT INTO ...",
      undefined,
      Object.assign(new Error("duplicate key value"), {
        code: "23505",
        detail: "Key (acronym)=(CC) already exists.",
      }),
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: "A record with this acronym already exists",
      error: "Conflict",
    });
  });

  it('should fall back to "value" when the detail message has no parseable field', () => {
    const exception = new QueryFailedError(
      "INSERT INTO ...",
      undefined,
      Object.assign(new Error("duplicate key value"), {
        code: "23505",
        detail: undefined,
      }),
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: "A record with this value already exists",
      error: "Conflict",
    });
  });

  it("should return 500 for a non-unique-violation driver error code", () => {
    const exception = new QueryFailedError(
      "INSERT INTO ...",
      undefined,
      Object.assign(new Error("not-null constraint"), {
        code: "23502",
        detail: "null value in column violates not-null constraint",
      }),
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  });

  it("should return 500 when there is no driver error code at all", () => {
    const exception = new QueryFailedError(
      "INSERT INTO ...",
      undefined,
      new Error("unknown error"),
    );

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
      error: "Internal Server Error",
    });
  });
});
