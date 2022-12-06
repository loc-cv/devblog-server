import { StatusCodes } from 'http-status-codes';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import Tag, { ITag, ITagDocument } from '../models/tag-model';
import AppError from '../utils/app-error';

const populatedUserFields = 'email username firstName lastName profilePhoto';

export const createNewTag = async (input: Partial<ITag>) => {
  const tag = await Tag.create(input);
  return tag;
};

export const findAllTags = async (
  queryString: Record<string, unknown> = {},
) => {
  const query = Tag.find()
    .sort('-createdAt')
    .populate('createdBy', populatedUserFields)
    .populate('lastUpdatedBy', populatedUserFields);

  const page =
    (typeof queryString.page === 'string' && parseInt(queryString.page, 10)) ||
    1;
  const limit =
    (typeof queryString.limit === 'string' &&
      parseInt(queryString.limit, 10)) ||
    10;
  if (page < 0 || limit < 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please provide positive values for page and limit',
    );
  }
  const skip = (page - 1) * limit;
  // Count total results and pages before paginating
  const total = await Tag.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  query.skip(skip).limit(limit);

  const tags = await query;
  return { tags, total, totalPages, page, results: tags.length };
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

export const saveTag = async (tag: ITagDocument) => {
  await tag.save({ validateModifiedOnly: true });
};
