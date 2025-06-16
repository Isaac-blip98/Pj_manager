import { UploadApiResponse } from 'cloudinary';
export declare class CloudinaryService {
    upload(file: Express.Multer.File): Promise<UploadApiResponse>;
}
