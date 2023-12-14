import axios from 'axios';
// import { getImgurToken } from '../helpers/imgur-token';
import { ImgurResponse } from '../interfaces/interfaces';

export class ImageService {
  public async handleSingleImage(file: Express.Multer.File) {
    const encodedImage = file.buffer.toString('base64');
    const imgurResponse: ImgurResponse = await axios.post(
      'https://api.imgur.com/3/image',
      {
        image: encodedImage,
        type: 'base64',
      },
      {
        headers: {
          Authorization: 'Client-ID b346aa38b14f95b',
        },
      }
    );

    return imgurResponse.data.data;
  }

  public async deleteSingleImage(deletehash: string) {
    await axios.delete(`https://api.imgur.com/3/image/${deletehash}`, {
      headers: {
        Authorization: 'Client-ID b346aa38b14f95b',
      },
    });
  }
}
