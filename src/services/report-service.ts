import { StatusCodes } from 'http-status-codes';
import { QueryOptions, UpdateQuery } from 'mongoose';
import Report, { IReport, IReportDocument } from '../models/report-model';
import AppError from '../utils/app-error';

const populatedUserFields =
  'email username firstName lastName profilePhoto isBanned';

export const createNewReport = async (input: Partial<IReport>) => {
  const report = await Report.create(input);
  return report;
};

export const findAllReport = async (
  queryString: Record<string, unknown> = {},
) => {
  const query = Report.find()
    .populate('submittedBy', populatedUserFields)
    .sort('-createdAt');

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
  const total = await Report.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  query.skip(skip).limit(limit);

  const reports = await query;
  return { reports, total, totalPages, page, results: reports.length };
};

export const findReportById = async (id: string) => {
  const report = await Report.findById(id).populate(
    'submittedBy',
    populatedUserFields,
  );
  return report;
};

export const deleteReportById = async (id: string) => {
  const report = await Report.findByIdAndDelete(id);
  return report;
};

export const updateReportById = async (
  id: string,
  update: UpdateQuery<IReportDocument>,
  options?: QueryOptions,
) => {
  const report = await Report.findByIdAndUpdate(id, update, options);
  return report;
};
