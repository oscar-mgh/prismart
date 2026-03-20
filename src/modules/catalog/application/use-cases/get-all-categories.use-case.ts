import { Injectable } from '@nestjs/common';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(): Promise<string[]> {
    return this.productRepository.findAllCategories();
  }
}
