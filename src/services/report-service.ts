import { QueryOptions, UpdateQuery } from 'mongoose';
import Report, { IReport, IReportDocument } from '../models/report-model';

const populatedUserFields =
  'email username firstName lastName profilePhoto isBanned';

export const createNewReport = async (input: Partial<IReport>) => {
  const report = await Report.create(input);
  return report;
};

export const findAllReport = async () => {
  const reports = await Report.find().populate(
    'submittedBy',
    populatedUserFields,
  );
  return reports;
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
