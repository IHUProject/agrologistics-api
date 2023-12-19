import { Model } from 'mongoose';
import { createSearchQuery } from '../../helpers/create-search-query';
import { IPopulate } from '../../interfaces/interfaces';
import { BadRequestError } from '../../errors';

export class DataLayerService<T> {
  public model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async getMany(
    page: string,
    select: string,
    searchString = '',
    searchFields = [''],
    populateOptions: Array<IPopulate> = [],
    limit = 5
  ) {
    const skip = (Number(page) - 1) * limit;
    const searchQuery = createSearchQuery(searchString, searchFields);

    return await this.model
      .find(searchQuery)
      .skip(skip)
      .limit(limit)
      .select(select)
      .populate(populateOptions);
  }

  public async getOne(
    id: string,
    selectOptions = '',
    populateOptions: Array<IPopulate> = []
  ) {
    return await this.model
      .findById(id)
      .select(selectOptions)
      .populate(populateOptions);
  }

  public async create(data: Partial<T>) {
    return await this.model.create(data);
  }

  public async update(
    id: string,
    data: Partial<T>,
    select: string,
    populateOptions: Array<IPopulate> = []
  ) {
    const options = { new: true, runValidators: true };
    await this.validateData(data);
    return await this.model
      .findByIdAndUpdate(id, data, options)
      .select(select)
      .populate(populateOptions);
  }

  public async delete(id: string) {
    return await this.model.findByIdAndDelete(id).select('-createdAt');
  }

  public async validateData(data: Partial<T>): Promise<void> {
    const schemaPaths = Object.keys(this.model.schema.paths);

    const invalidKeys = Object.keys(data).filter((key) => {
      if (key === 'image' || key === 'logo') {
        key = `${key}.link`;
      }

      return !schemaPaths.includes(key);
    });

    if (invalidKeys.length) {
      throw new BadRequestError(
        `Invalid properties in data: ${invalidKeys.join(', ')}`
      );
    }
  }
}
