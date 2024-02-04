import axios from 'axios';
import { ImgurResponse } from '../../interfaces/interfaces';

export class ImageService {
  public async handleSingleImage(file: Express.Multer.File | undefined) {
    if (!file) {
      return;
    }

    const encodedImage = file.buffer.toString('base64');

    const imgurResponse: ImgurResponse = await axios.post(
      process.env.IMGUR_URL as string,
      {
        image: encodedImage,
        type: 'base64',
      },
      {
        headers: {
          Authorization: `Client-ID ${process.env.CLIENT_ID}`,
        },
      }
    );

    return imgurResponse.data.data;
  }

  public async handleMultipleImages(files: Express.Multer.File[] | undefined) {
    if (!files || !files.length) {
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const encodedImage = file.buffer.toString('base64');

      const imgurResponse: ImgurResponse = await axios.post(
        process.env.IMGUR_URL as string,
        {
          image: encodedImage,
          type: 'base64',
        },
        {
          headers: {
            Authorization: `Client-ID ${process.env.CLIENT_ID}`,
          },
        }
      );
      return imgurResponse.data.data;
    });

    return Promise.all(uploadPromises);
  }

  public async deleteSingleImage(deletehash: string) {
    await axios.delete(`${process.env.IMGUR_URL}/${deletehash}`, {
      headers: {
        Authorization: `Client-ID ${process.env.CLIENT_ID}`,
      },
    });
  }
}
