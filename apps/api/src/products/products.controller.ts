import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { PaginatedResponseDto } from "@/common/pagination";
import {
  CreateProductDecorator,
  DeleteProductDecorator,
  GetAllProductsDecorator,
  GetOneProductDecorator,
  UpdateProductDecorator,
} from "./decorators/products.decorators";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductFilterDto } from "./dto/product-filter.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @GetAllProductsDecorator()
  @Get()
  findAll(
    @Query() filters: ProductFilterDto,
  ): Promise<PaginatedResponseDto<Product>> {
    return this.productsService.findAll(filters);
  }

  @GetOneProductDecorator()
  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @CreateProductDecorator()
  @Post()
  create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: { activeAssociationId: string },
  ): Promise<Product> {
    return this.productsService.create(
      createProductDto,
      req.activeAssociationId,
    );
  }

  @UpdateProductDecorator()
  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @DeleteProductDecorator()
  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.remove(id);
  }
}
