import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page } from 'src/modules/shared/pagination/page.model';
import { Review } from '../../../domain/entities/review.entity';
import { ReviewRepositoryPort } from '../../../domain/ports/review-repository.port';
import { ReviewDocument } from '../entities/review.schema';
import { ReviewMapper } from '../mappers/review.mapper';

@Injectable()
export class MongooseReviewRepository implements ReviewRepositoryPort {
  constructor(
    @InjectModel(ReviewDocument.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async save(review: Review): Promise<Review> {
    try {
      const persistence = ReviewMapper.toPersistence(review);
      const doc = await this.reviewModel
        .findOneAndUpdate(
          { _id: persistence._id },
          { $set: persistence },
          { upsert: true, new: true },
        )
        .exec();
      return ReviewMapper.toDomain(doc);
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('You have already reviewed this product');
      }
      throw error;
    }
  }

  async saveMany(reviews: Review[]): Promise<void> {
    const bulkOps = reviews.map((review) => ({
      updateOne: {
        filter: { _id: review.id.getValue() },
        update: { $set: ReviewMapper.toPersistence(review) as any },
        upsert: true,
      },
    }));

    await this.reviewModel.bulkWrite(bulkOps as any);
  }

  async findById(id: string): Promise<Review | null> {
    const doc = await this.reviewModel.findById(id).exec();
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async findByProductId(productId: string, page: number, limit: number): Promise<Page<Review>> {
    const skip = (page - 1) * limit;
    const filter = { productId };

    const [docs, totalElements] = await Promise.all([
      this.reviewModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);

    return {
      data: docs.map((doc) => ReviewMapper.toDomain(doc)),
      page,
      totalPages: Math.ceil(totalElements / limit),
      totalElements,
    };
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    const doc = await this.reviewModel.findOne({ userId, productId }).exec();
    return doc ? ReviewMapper.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).exec();
  }

  async getAverageRating(productId: string): Promise<number | null> {
    const result = await this.reviewModel
      .aggregate([
        { $match: { productId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ])
      .exec();

    if (!result.length || result[0].avgRating === null) {
      return null;
    }

    return Math.round(result[0].avgRating * 10) / 10;
  }

  async getAverageRatings(productIds: string[]): Promise<Map<string, number | null>> {
    const result = await this.reviewModel
      .aggregate([
        { $match: { productId: { $in: productIds } } },
        { $group: { _id: '$productId', avgRating: { $avg: '$rating' } } },
      ])
      .exec();

    const ratingsMap = new Map<string, number | null>();

    for (const productId of productIds) {
      ratingsMap.set(productId, null);
    }

    for (const item of result) {
      const rounded = Math.round(item.avgRating * 10) / 10;
      ratingsMap.set(item._id, rounded);
    }

    return ratingsMap;
  }
}
