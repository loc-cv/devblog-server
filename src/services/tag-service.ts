import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Tag, { ITag, ITagDocument } from '../models/tag-model';

const populatedUserFields = 'email username firstName lastName profilePhoto';

export const createNewTag = async (input: Partial<ITag>) => {
  const tag = await Tag.create(input);
  return tag;
};

export const findAllTags = async () => {
  const tags = await Tag.find()
    .populate('createdBy', populatedUserFields)
    .populate('lastUpdatedBy', populatedUserFields);
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
