import { Model } from 'mongoose';
import { createSearchQuery } from '../../helpers/create-search-query';
import { IPopulate } from '../../interfaces/interfaces';

export class DataLayerService<T> {
  model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getMany(
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

  async getOne(
    id: string,
    selectOptions = '',
    populateOptions: Array<IPopulate> = []
  ) {
    return await this.model
      .findById(id)
      .select(selectOptions)
      .populate(populateOptions);
  }

  async create(data: Partial<T>) {
    return await this.model.create(data);
  }

  async update(
    id: string,
    data: Partial<T>,
    select: string,
    populateOptions: Array<IPopulate> = []
  ) {
    const options = { new: true, runValidators: true };
    return await this.model
      .findByIdAndUpdate(id, data, options)
      .select(select)
      .populate(populateOptions);
  }

  async delete(id: string) {
    return await this.model.findByIdAndDelete(id).select('-createdAt');
  }
}
