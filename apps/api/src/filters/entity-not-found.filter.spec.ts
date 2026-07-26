import { ArgumentsHost, HttpStatus } from "@nestjs/common";
import { Response } from "express";
import { EntityNotFoundError } from "typeorm";
import { EntityNotFoundFilter } from "./entity-not-found.filter";

describe("EntityNotFoundFilter", () => {
  let filter: EntityNotFoundFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockResponse: Partial<Response> & {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    filter = new EntityNotFoundFilter();
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

  it("should return 404 with entity name and id", () => {
    const message =
      'Could not find any entity of type "User" matching: { "id": 1 }';
    const exception = { message } as EntityNotFoundError;

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: "User with id 1 not found",
      error: "Not Found",
    });
  });

  it("should handle different entity names and IDs", () => {
    const message =
      'Could not find any entity of type "Course" matching: { "id": 123 }';
    const exception = { message } as EntityNotFoundError;

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: "Course with id 123 not found",
      error: "Not Found",
    });
  });

  it('should return 404 with default "Resource" and "specified" id if message does not match', () => {
    const exception = {
      message: "Something went wrong",
    } as EntityNotFoundError;

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: "Resource with id specified not found",
      error: "Not Found",
    });
  });

  it("should handle non-numeric IDs correctly", () => {
    const message =
      'Could not find any entity of type "User" matching: { "id": "abc" }';
    const exception = { message } as EntityNotFoundError;

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: "User with id abc not found",
      error: "Not Found",
    });
  });
});
