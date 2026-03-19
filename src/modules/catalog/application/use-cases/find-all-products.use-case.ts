import { Injectable } from '@nestjs/common';
import { Page } from '../../../shared/pagination/page.model';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { ReviewIntegrationPort } from '../../domain/ports/review-integration.port';
import { ProductWithRating } from '../types/product-with-rating';
import { FindAllProductsQuery } from './queries/find-all-products.query';

const BEST_RATED_SORT = 'best_rated';

@Injectable()
export class FindAllProductsUseCase {
  constructor(
    private readonly productRepository: ProductRepositoryPort,
    private readonly reviewIntegration: ReviewIntegrationPort,
  ) {}

  async execute(query: FindAllProductsQuery): Promise<Page<ProductWithRating>> {
    const { page, limit, sortBy } = query;
    const { totalElements, data } = await this.productRepository.findAll(page, limit, sortBy);
    const totalPages = Math.ceil(totalElements / limit);

    const productIds = data.map((p) => p.id.getValue());
    const ratingsMap = await this.reviewIntegration.getAverageRatings(productIds);

    let enrichedProducts: ProductWithRating[] = data.map((product) => ({
      product,
      averageRating: ratingsMap.get(product.id.getValue()) ?? null,
    }));

    if (sortBy === BEST_RATED_SORT) {
      enrichedProducts = enrichedProducts.sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      );
    }

    return {
      totalPages,
      totalElements,
      data: enrichedProducts,
      page,
    };
  }
}
