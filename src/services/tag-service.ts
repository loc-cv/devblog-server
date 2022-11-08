import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Tag, { ITag, ITagDocument } from '../models/tag-model';

const populatedUserFields = 'email username firstName lastName profilePhoto';

export const createNewTag = async (input: Partial<ITag>) => {
  const tag = await Tag.create(input);
  return tag;
};

export const findAllTags = async (options?: {
  page?: number;
  limit?: number;
}) => {
  const query = Tag.find()
    .sort('-createdAt')
    .populate('createdBy', populatedUserFields)
    .populate('lastUpdatedBy', populatedUserFields);

  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const skip = (page - 1) * limit;
  query.skip(skip).limit(limit);

  const tags = await query;
  return tags;
};

export const findOneTag = async (
  filter: FilterQuery<ITagDocument>,
  options?: QueryOptions,
) => {
  const tag = await Tag.findOne(filter, {}, options)
    .populate('createdBy', populatedUserFields)
    .populate('lastUpdatedBy', populatedUserFields);
  return tag;
};

export const updateOneTag = async (
  filter: FilterQuery<ITagDocument>,
  update: UpdateQuery<ITagDocument>,
  options?: QueryOptions,
) => {
  const tag = await Tag.findOneAndUpdate(filter, update, options)
    .populate('createdBy', populatedUserFields)
    .populate('lastUpdatedBy', populatedUserFields);
  return tag;
};

export const deleteOneTag = async (
  filter: FilterQuery<ITagDocument>,
  options?: QueryOptions,
) => {
  const tag = await Tag.findOneAndDelete(filter, options);
  return tag;
};
