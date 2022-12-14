import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  createNewTag,
  deleteOneTag,
  findAllTags,
  findOneTag,
  saveTag,
} from '../services/tag-service';
import AppError from '../utils/app-error';

/**
 * Create a tag
 * @route POST /api/tags
 * @access admin
 */
export const createTag = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { description } = req.body;
  const name = req.body.name as string;
  const tag = await createNewTag({
    name: name.toLowerCase(),
    description,
    createdBy: user._id,
    lastUpdatedBy: user._id,
  });
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New tag created successfully',
    data: { tag: { id: tag._id } },
  });
};

/**
 * Get all tags
 * @route GET /api/tags
 * @access public
 */
export const getAllTags = async (req: Request, res: Response) => {
  const { tags, total, totalPages, page, results } = await findAllTags(
    req.query,
  );
  res.status(StatusCodes.OK).json({
    status: 'success',
    total,
    totalPages,
    page,
    results,
    data: { tags },
  });
};

/**
 * Get a single tag by tag name
 * @route GET /api/tags/:tagName
 * @access public
 */
export const getSingleTag = async (req: Request, res: Response) => {
  const { tagName } = req.params;
  const tag = await findOneTag({ name: tagName });
  if (!tag) {
    throw new AppError(StatusCodes.NOT_FOUND, `No tag with name: ${tagName}`);
  }
  res.status(StatusCodes.OK).json({ status: 'success', data: { tag } });
};

/**
 * Update a tag by tag name
 * @route PATCH /api/tags/:tagName
 * @access admin
 */
export const updateTag = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { tagName } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Nothing to update');
  }

  const tag = await findOneTag({ name: tagName });
  if (!tag) {
    throw new AppError(StatusCodes.NOT_FOUND, `No tag with name: ${tagName}`);
  }

  tag.name = name || tag.name;
  tag.description = description || tag.description;
  tag.lastUpdatedBy = user._id;
  await saveTag(tag);

  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Update tag successfully' });
};

/**
 * Delete a tag by tag name
 * @route DELETE /api/tag/:tagName
 * @access admin
 */
export const deleteTag = async (req: Request, res: Response) => {
  const { tagName } = req.params;
  const tag = await deleteOneTag({ name: tagName });
  if (!tag) {
    throw new AppError(StatusCodes.NOT_FOUND, `No tag with name: ${tagName}`);
  }
  res
    .status(StatusCodes.OK)
    .json({ status: 'success', message: 'Delete tag successfully' });
};
