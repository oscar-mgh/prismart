import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Product } from 'src/modules/catalog/domain/entities/product.entity';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { Sku } from 'src/modules/catalog/domain/value-objects/sku.vo';
import { Review } from 'src/modules/review/domain/entities/review.entity';
import { ReviewRepositoryPort } from 'src/modules/review/domain/ports/review-repository.port';
import { ReviewRating } from 'src/modules/review/domain/value-objects/review-rating.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { IdGenerator } from 'src/modules/shared/infrastructure/id-generator.service';
import { Store } from 'src/modules/store/domain/entities/store.entity';
import { StoreRepositoryPort } from 'src/modules/store/domain/ports/store-repository.port';
import { Address } from 'src/modules/store/domain/value-objects/address.vo';
import { SEED_PRODUCTS, SEED_REVIEW_TEMPLATES, SEED_STORE } from './seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  private static readonly VALID_SEED_RATINGS = [3.5, 4, 4.5, 5];

  constructor(
    private readonly storeRepository: StoreRepositoryPort,
    private readonly productRepository: ProductRepositoryPort,
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(
    userId: string,
  ): Promise<{ storeId: string; storeName: string; productsCreated: number; reviewsCreated: number }> {
    const nameExists = await this.storeRepository.existsByName(SEED_STORE.name);
    if (nameExists) {
      throw new ConflictException(`Seed store "${SEED_STORE.name}" already exists. Delete it first to re-seed.`);
    }

    this.logger.log('Creating seed store...');

    const storeId = Id.fromString(IdGenerator.next().getValue());
    const address = new Address(SEED_STORE.address);

    const store = new Store(storeId, SEED_STORE.name, [Id.fromString(userId)], address, true, new Date(), new Date());

    await this.storeRepository.save(store);
    this.logger.log(`Store created: ${storeId.toString()}`);

    this.logger.log('Creating seed products...');

    const products = SEED_PRODUCTS.map(
      (p) =>
        new Product(
          Id.fromString(IdGenerator.next().getValue()),
          storeId,
          new Sku(p.sku),
          p.name,
          p.description,
          p.price,
          p.stock,
          p.category,
          true,
          Math.floor(Math.random() * 25) + 3,
        ),
    );

    await this.productRepository.saveMany(products);
    this.logger.log(`${products.length} products created for store ${storeId.toString()}`);

    this.logger.log('Creating seed reviews...');

    const reviews: Review[] = [];

    for (const product of products) {
      const reviewCount = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < reviewCount; i++) {
        const template = SEED_REVIEW_TEMPLATES[Math.floor(Math.random() * SEED_REVIEW_TEMPLATES.length)];
        const rating =
          SeedService.VALID_SEED_RATINGS[Math.floor(Math.random() * SeedService.VALID_SEED_RATINGS.length)];

        reviews.push(
          new Review(
            Id.fromString(IdGenerator.next().getValue()),
            product.id,
            Id.fromString(IdGenerator.next().getValue()),
            template.title,
            template.description,
            new ReviewRating(rating),
          ),
        );
      }
    }

    await this.reviewRepository.saveMany(reviews);
    this.logger.log(`${reviews.length} reviews created across ${products.length} products`);

    return {
      storeId: storeId.toString(),
      storeName: SEED_STORE.name,
      productsCreated: products.length,
      reviewsCreated: reviews.length,
    };
  }
}
