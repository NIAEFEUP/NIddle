import { applyDecorators, Type } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PaginatedResponseDto } from "@/common/pagination/dto/paginated-response.dto";
import { PaginationMetaDto } from "@/common/pagination/dto/pagination-meta.dto";

export function ApiPaginatedResponse<TModel extends Type<any>>(
  model: TModel,
  description?: string,
) {
  return applyDecorators(
    ApiExtraModels(PaginatedResponseDto, PaginationMetaDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDto) },
          {
            properties: {
              data: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
              meta: {
                $ref: getSchemaPath(PaginationMetaDto),
              },
            },
          },
        ],
      },
    }),
  );
}
