import { UnauthorizedError } from '../common/errors'
import User from '../data-access/models/User'
import { createTokenUser } from '../common/helpers/create-token-user'
import { IUser } from '../types/interfaces'
import { ImageService } from '../intergration/image-service'
import { BaseRepository } from '../data-access/base-repository'

export class AuthService extends BaseRepository<IUser> {
  private imageService: ImageService

  constructor() {
    super(User)
    this.imageService = new ImageService()
  }

  public async registerUser(
    payload: IUser,
    file: Express.Multer.File | undefined
  ) {
    await super.validateData(payload)
    const image = await this.imageService.handleSingleImage(file)
    const user = await super.create({ ...payload, image })
    return createTokenUser(user)
  }

  public async loginUser(payload: IUser) {
    const { email, password } = payload

    const user = await User.findOne({ email })
    if (!user) {
      throw new UnauthorizedError(
        'The e-mail or password are not correct!'
      )
    }

    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
      throw new UnauthorizedError(
        'The e-mail or password are not correct!'
      )
    }

    return createTokenUser(user)
  }
}
