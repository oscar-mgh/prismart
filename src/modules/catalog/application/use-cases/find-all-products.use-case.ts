import { Injectable } from '@nestjs/common';
import { Page } from '../../../shared/pagination/page.model';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { FindAllProductsQuery } from './queries/find-all-products.query';

@Injectable()
export class FindAllProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(query: FindAllProductsQuery): Promise<Page<Product>> {
    const { page, limit } = query;
    const { totalElements, data } = await this.productRepository.findAll(page, limit);
    const totalPages = Math.ceil(totalElements / limit);

    return {
      totalPages,
      totalElements,
      data,
      page,
    };
  }
}
