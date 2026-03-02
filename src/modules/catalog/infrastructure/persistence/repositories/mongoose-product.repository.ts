import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page } from 'src/modules/shared/pagination/page.model';
import { Product } from '../../../domain/entities/product.entity';
import { DiscountData, ProductCriteria, ProductRepositoryPort } from '../../../domain/ports/product-repository.port';
import { ProductDocument } from '../entities/product.schema';
import { ProductMapper } from '../mappers/product.mapper';
import { ProductDiscount } from 'src/modules/catalog/domain/value-objects/product-discount.vo';

@Injectable()
export class MongooseProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async save(product: Product): Promise<Product> {
    try {
      const persistance = ProductMapper.toPersistence(product);
      const doc = await this.productModel
        .findOneAndUpdate(
          { _id: persistance._id, storeId: persistance.storeId },
          { $set: persistance },
          { upsert: true, new: true },
        )
        .exec();
      return ProductMapper.toDomain(doc);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('SKU already exists in your store');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    const query: any = { _id: id, active: true };

    const doc = await this.productModel.findOne(query).exec();
    return doc ? ProductMapper.toDomain(doc) : null;
  }

  async findAll(page: number, limit: number): Promise<Page<Product>> {
    const skip = (page - 1) * limit;
    const filter = { active: true };

    const [docs, totalElements] = await Promise.all([
      this.productModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      totalPages: Math.ceil(totalElements / limit),
      data: docs.map((doc) => ProductMapper.toDomain(doc)),
      totalElements,
      page,
    };
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndUpdate({ _id: id, active: true }, { active: false }).exec();
  }

  async findByCriteria(productCriteria: ProductCriteria): Promise<Page<Product>> {
    const { page = 1, limit = 10, sortByPurchaseCount = 'desc' } = productCriteria;
    const skip = (page - 1) * limit;

    const query = this.buildCriteriaQuery(productCriteria);
    const sortOrder = sortByPurchaseCount === 'asc' ? 1 : -1;

    const [docs, totalElements] = await Promise.all([
      this.productModel.find(query).sort({ purchaseCount: sortOrder }).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return {
      data: docs.map((doc) => ProductMapper.toDomain(doc)),
      page,
      totalPages: Math.ceil(totalElements / limit),
      totalElements,
    };
  }

  async saveMany(products: Product[]): Promise<void> {
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { _id: product.id.getValue() },
        update: { $set: ProductMapper.toPersistence(product) as any },
        upsert: true,
      },
    }));

    await this.productModel.bulkWrite(bulkOps as any);
  }

  async applyDiscount(criteria: ProductCriteria, discountData: DiscountData): Promise<number> {
    const { code, percentage, expirationDate } = discountData;

    const query = this.buildCriteriaQuery(criteria);
    const products = await this.productModel.find(query).exec();
    
    for (const product of products) {
      const productDomain = ProductMapper.toDomain(product);
      const newDiscount = new ProductDiscount(code, percentage, expirationDate);
      productDomain.applyDiscount(newDiscount);
      await this.save(productDomain);
    }

    return products.length;
  }

  private buildCriteriaQuery({ ids, skus, category, active }: ProductCriteria): Record<string, any> {
    const query: Record<string, any> = {};

    if (ids?.length) query._id = { $in: ids };
    if (skus?.length) query.sku = { $in: skus };
    if (category) query.category = category;

    query.active = active ?? true;

    return query;
  }
}
