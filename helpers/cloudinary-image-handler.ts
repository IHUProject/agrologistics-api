import fs from 'fs';
import { v2 as Cloudinary, UploadApiResponse } from 'cloudinary';
import { ConflictError } from '../errors/conflict';
import { UploadedFile } from 'express-fileupload';

export const cloudinaryUpload = async (files: UploadedFile[]) => {
  try {
    const storeURLs: string[] = [];

    for (const i in files) {
      const result: UploadApiResponse = await Cloudinary.uploader.upload(
        files[i].tempFilePath,
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
};
