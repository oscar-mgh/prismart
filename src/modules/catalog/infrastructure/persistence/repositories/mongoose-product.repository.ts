import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page } from 'src/modules/shared/pagination/page.model';
import { Product } from '../../../domain/entities/product.entity';
import { ProductCriteria, ProductRepositoryPort } from '../../../domain/ports/product-repository.port';
import { ProductDocument } from '../entities/product.schema';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class MongooseProductRepository implements ProductRepositoryPort {
  constructor(
    @InjectModel(ProductDocument.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async findByCriteria({ ids, skus, category, isActive }: ProductCriteria): Promise<Product[]> {
    const query: any = {};
    const filter = { active: !!isActive };

    if (ids) query._id = { $in: ids };
    if (skus) query.sku = { $in: skus };
    if (category) query.category = category;

    const products = await this.productModel.find({ ...query, ...filter }).exec();
    return products.map((doc) => ProductMapper.toDomain(doc));
  }

  async saveMany(products: Product[]): Promise<void> {
    const bulkOps = products.map((product) => ({
      updateOne: {
        filter: { _id: product.id.getValue() },
        update: { $set: ProductMapper.toPersistence(product) as any },
      },
    }));

    await this.productModel.bulkWrite(bulkOps as any);
  }

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
}
