import 'multer';

export interface ImageUploadResult {
  url: string;
  publicId: string;
}

export abstract class ImageStoragePort {
  abstract upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<ImageUploadResult>;
}
