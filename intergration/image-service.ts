import axios from 'axios'
import { IDataImgur, ImgurResponse } from '../types/interfaces'

export class ImageService {
  public async handleSingleImage(file: Express.Multer.File | undefined) {
    if (!file) {
      return
    }

    const encodedImage = file.buffer.toString('base64')
    console.log(process.env.IMGUR_URL, process.env.CLIENT_ID)

    const imgurResponse: ImgurResponse = await axios.post(
      process.env.IMGUR_URL as string,
      {
        image: encodedImage,
        type: 'base64'
      },
      {
        headers: {
          Authorization: `Client-ID ${process.env.CLIENT_ID}`
        }
      }
    )

    return imgurResponse.data.data
  }

  public async handleMultipleImages(
    files: Express.Multer.File[] | undefined
  ) {
    if (!files || !files.length) {
      return
    }

    const images: IDataImgur[] = []

    for (const file of files) {
      const image = await this.handleSingleImage(file)
      if (image) {
        images.push(image)
      }
    }

    return images
  }

  public async deleteSingleImage(deletehash: string) {
    await axios.delete(`${process.env.IMGUR_URL}/${deletehash}`, {
      headers: {
        Authorization: `Client-ID ${process.env.CLIENT_ID}`
      }
    })
  }
}
