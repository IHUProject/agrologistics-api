import axios from 'axios';
// import { getImgurToken } from '../helpers/imgur-token';
import { ImgurResponse } from '../interfaces/interfaces';

export class ImageService {
  public async handleSingleImage(file: Express.Multer.File) {
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

  public async deleteSingleImage(deletehash: string) {
    await axios.delete(`${process.env.IMGUR_URL}/${deletehash}`, {
      headers: {
        Authorization: `Client-ID ${process.env.CLIENT_ID}`,
      },
    });
  }
}
