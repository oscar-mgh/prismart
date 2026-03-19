import { Injectable } from '@nestjs/common';
import { Page } from 'src/modules/shared/pagination/page.model';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ReviewIntegrationPort } from '../../domain/ports/review-integration.port';
import { ProductWithRating } from '../types/product-with-rating';
import { FindByCriteriaQuery } from './queries/find-by-criteria.query';

@Injectable()
export class FindByCriteriaUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly reviewIntegration: ReviewIntegrationPort,
  ) {}

  async execute(query: FindByCriteriaQuery): Promise<Page<ProductWithRating>> {
    const { data, page, totalPages, totalElements } =
      await this.productRepository.findByCriteria(query);

    const productIds = data.map((p) => p.id.getValue());
    const ratingsMap = await this.reviewIntegration.getAverageRatings(productIds);

    const enrichedProducts: ProductWithRating[] = data.map((product) => ({
      product,
      averageRating: ratingsMap.get(product.id.getValue()) ?? null,
    }));

    return {
      data: enrichedProducts,
      page: page ?? 1,
      totalPages: totalPages ?? 1,
      totalElements: totalElements ?? enrichedProducts.length,
    };
  }
}
