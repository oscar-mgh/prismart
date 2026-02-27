import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Product } from 'src/modules/catalog/domain/entities/product.entity';
import { ProductRepositoryPort } from 'src/modules/catalog/domain/ports/product-repository.port';
import { Sku } from 'src/modules/catalog/domain/value-objects/sku.vo';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { Store } from 'src/modules/store/domain/entities/store.entity';
import { StoreRepositoryPort } from 'src/modules/store/domain/ports/store-repository.port';
import { Address } from 'src/modules/store/domain/value-objects/address.vo';
import { SEED_PRODUCTS, SEED_STORE } from './seed.data';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly storeRepository: StoreRepositoryPort,
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(userId: string): Promise<{ storeId: string; storeName: string; productsCreated: number }> {
    const nameExists = await this.storeRepository.existsByName(SEED_STORE.name);
    if (nameExists) {
      throw new ConflictException(`Seed store "${SEED_STORE.name}" already exists. Delete it first to re-seed.`);
    }

    this.logger.log('Creating seed store...');

    const storeId = Id.create();
    const address = new Address(SEED_STORE.address);

    const store = new Store(storeId, SEED_STORE.name, [new Id(userId)], address, true, new Date(), new Date());

    await this.storeRepository.save(store);
    this.logger.log(`Store created: ${storeId.toString()}`);

    this.logger.log('Creating seed products...');

    const products = SEED_PRODUCTS.map(
      (p) =>
        new Product(Id.create(), storeId, new Sku(p.sku), p.name, p.description, p.price, p.stock, p.category, true, Math.floor(Math.random() * 25) + 3),
    );

    await this.productRepository.saveMany(products);
    this.logger.log(`${products.length} products created for store ${storeId.toString()}`);

    return {
      storeId: storeId.toString(),
      storeName: SEED_STORE.name,
      productsCreated: products.length,
    };
  }
}
