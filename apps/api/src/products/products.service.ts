import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Association } from "@/associations/entities/association.entity";
import { PaginatedResponseDto, paginate } from "@/common/pagination";
import { buildOrderClause } from "@/common/sorting";
import { Requestable } from "@/requests/interfaces/requestable.interface";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductFilterDto } from "./dto/product-filter.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService
  implements Requestable<CreateProductDto, Product, UpdateProductDto>
{
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Association)
    private associationRepository: Repository<Association>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    activeAssociationId: string,
  ): Promise<Product> {
    const product = this.productRepository.create(createProductDto);

    product.createdBy = await this.associationRepository.findOneByOrFail({
      id: activeAssociationId,
    });

    return this.productRepository.save(product);
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOneOrFail({
      where: { id },
      relations: ["createdBy"],
    });

    this.productRepository.merge(product, updateProductDto);

    return this.productRepository.save(product);
  }

  findAll(filters: ProductFilterDto): Promise<PaginatedResponseDto<Product>> {
    const { createdById, isArchived } = filters;

    return paginate(this.productRepository, filters, {
      where: {
        ...(createdById && { createdBy: { id: createdById } }),
        ...(isArchived !== undefined && { isArchived }),
      },
      relations: ["createdBy"],
      order: buildOrderClause(filters),
    });
  }

  findOne(id: string): Promise<Product> {
    return this.productRepository.findOneOrFail({
      where: { id },
      relations: ["createdBy"],
    });
  }

  async remove(id: string): Promise<Product> {
    const product = await this.productRepository.findOneOrFail({
      where: { id },
      relations: ["createdBy"],
    });

    await this.productRepository.delete(id);
    return product;
  }

  createFromRequest(
    payload: CreateProductDto,
    associationId: string,
  ): Promise<Product> {
    return this.create(payload, associationId);
  }

  updateFromRequest(id: string, payload: UpdateProductDto): Promise<Product> {
    return this.update(id, payload);
  }

  removeFromRequest(id: string): Promise<Product> {
    return this.remove(id);
  }
}
