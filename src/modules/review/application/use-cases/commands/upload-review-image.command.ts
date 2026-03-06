import 'multer';

export interface UploadReviewImageCommand {
  reviewId: string;
  file: Express.Multer.File;
}
