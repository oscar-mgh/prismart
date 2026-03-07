import { Product } from 'src/modules/catalog/domain/entities/product.entity';
import { ProductDiscount } from 'src/modules/catalog/domain/value-objects/product-discount.vo';
import { Sku } from 'src/modules/catalog/domain/value-objects/sku.vo';
import { ProductDocument } from 'src/modules/catalog/infrastructure/persistence/entities/product.schema';
import { Id } from 'src/modules/shared/domain/value-objects/id.vo';
import { ProductResponseDto } from '../../http/dtos/product-response.dto';
import { ProductPersistenceDto } from '../dtos/product-persistence.dto';

export class ProductMapper {
  static toDomain(raw: ProductDocument): Product {
    const discount = raw.discount
      ? new ProductDiscount(raw.discount.code, raw.discount.percentage, raw.discount.expirationDate)
      : undefined;

    return new Product(
      Id.fromString(raw._id.toString()),
      Id.fromString(raw.storeId.toString()),
      new Sku(raw.sku),
      raw.name,
      raw.description,
      raw.price,
      raw.stock,
      raw.category,
      raw.active,
      raw.purchaseCount ?? 0,
      discount,
      raw.productImage,
      (raw as any).createdAt ? new Date((raw as any).createdAt) : new Date(),
      (raw as any).updatedAt ? new Date((raw as any).updatedAt) : null,
    );
  }

  static toPersistence(domain: Product): ProductPersistenceDto {
    const discount = domain.getDiscount();

    return {
      _id: domain.id.getValue(),
      storeId: domain.storeId.toString(),
      sku: domain.getSku().getValue(),
      name: domain.getName(),
      description: domain.getDescription(),
      price: domain.getPrice(),
      stock: domain.getStock(),
      active: domain.isActive(),
      category: domain.getCategory(),
      purchaseCount: domain.getPurchaseCount(),
      productImage: domain.getProductImage(),
      createdAt: domain.getCreatedAt(),
      updatedAt: domain.getUpdatedAt(),
      discount: discount
        ? {
            code: discount.getCode(),
            percentage: discount.getPercentage(),
            isExpired: discount.isExpired(),
            expirationDate: discount.getExpirationDate(),
          }
        : null,
    };
  }

  static toResponse(product: Product, averageRating?: number | null): ProductResponseDto {
    const discount = product.getDiscount();
    const finalPrice = product.getFinalPrice();

    return {
      id: product.id.getValue(),
      storeId: product.storeId.toString(),
      name: product.getName(),
      description: product.getDescription(),
      sku: product.getSku().getValue(),
      price: product.getPrice(),
      finalPrice: finalPrice || product.getPrice(),
      stock: product.getStock(),
      category: product.getCategory(),
      purchaseCount: product.getPurchaseCount(),
      productImage: product.getProductImage() ?? null,
      averageRating: averageRating ?? null,
      discount: discount
        ? {
            code: discount.getCode(),
            percentage: discount.getPercentage(),
            isExpired: discount.isExpired(),
            expiresAt: discount.getExpirationDate(),
          }
        : null!,
    };
  }
}
