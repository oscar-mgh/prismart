import 'multer';

export interface UploadProductImageCommand {
  productId: string;
  file: Express.Multer.File;
}
