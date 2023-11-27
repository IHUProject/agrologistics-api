import { Request } from 'express';
import fs from 'fs';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { ConflictError } from '../errors/conflict';
import { UploadedFile } from 'express-fileupload';
import { BadRequestError } from '../errors';

export class ImageService {
  req: Request;
  constructor(req: Request) {
    this.req = req;
  }

  async cloudinaryUpload(images: UploadedFile[]) {
    try {
      const storeURLs: string[] = [];

      for (const i in images) {
        const result: UploadApiResponse = await Cloudinary.uploader.upload(
          images[i].tempFilePath,
          {
            use_filename: true,
          }
        );
        storeURLs.push(result.secure_url);
      }

      fs.rmSync('tmp', { recursive: true });
      return storeURLs;
    } catch (error) {
      console.log(error);
      fs.rmSync('tmp', { recursive: true });
      throw new ConflictError('Something went wrong, try again!');
    }
  }

  async uploadSingleImage(image: UploadedFile[]) {
    if (!Array.isArray(image)) {
      image = [image];
    }

    if (image.length > 1) {
      throw new BadRequestError(
        'You allowed to upload only 1 image for profile image'
      );
    }

    if (this.req.files && !image) {
      fs.rmSync('tmp', { recursive: true });
      throw new BadRequestError('Something went wrong, try again!');
    } else if (this.req.files && image) {
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
  }
}
