import fs from 'fs';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { ConflictError } from '../errors/conflict';
import { UploadedFile } from 'express-fileupload';
import { BadRequestError, NotFoundError } from '../errors';

export class ImageService {
  public async cloudinaryUpload(images: UploadedFile[]) {
    try {
      const storeURLs: string[] = [];

      for (const image of images) {
        const result: UploadApiResponse = await Cloudinary.uploader.upload(
          image.tempFilePath,
          {
            use_filename: true,
          }
        );
        storeURLs.push(result.secure_url);
      }

      fs.rmSync('tmp', { recursive: true });
      return storeURLs;
    } catch (error) {
      fs.rmSync('tmp', { recursive: true });
      throw new ConflictError('Something went wrong, try again!');
    }
  }

  public async handleSingleImage(image: UploadedFile[]) {
    if (!Array.isArray(image)) {
      image = [image];
    }
    if (image.length > 1) {
      throw new BadRequestError('You allowed to upload only 1 image');
    }

    if (
      image[0].mimetype !== 'image/png' &&
      image[0].mimetype !== 'image/jpeg' &&
      image[0].mimetype !== 'image/jpg'
    ) {
      fs.rmSync('tmp', { recursive: true });
      throw new ConflictError('This file type is not valid!');
    }

    return (await this.cloudinaryUpload(image)).join('');
  }

  public async deleteImages(images: string[]) {
    for (const image of images) {
      const publicId = image.split('/').slice(-1)[0].split('.')[0];
      const res: { result: string } = await Cloudinary.uploader.destroy(
        publicId
      );
      if (res.result === 'not found') {
        throw new NotFoundError('Old image did not found in the cloud!');
      }
    }
  }
}
