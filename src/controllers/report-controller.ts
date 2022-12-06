import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { findPostById } from '../services/post-service';
import {
  createNewReport,
  deleteReportById,
  findAllReport,
  findReportById,
  updateReportById,
} from '../services/report-service';
import AppError from '../utils/app-error';

/**
 * Create/Submit a report
 * @route POST /api/reports
 * @access user
 */
export const createReport = async (req: Request, res: Response) => {
  const { user } = res.locals;
  const { postId, reason } = req.body;
  const post = await findPostById(postId);
  if (!post) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      `Cannot find any post with ID: ${postId}`,
    );
  }
  const report = await createNewReport({
    post: post._id,
    submittedBy: user._id,
    reason,
  });
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    message: 'New report created successfully',
    data: { report: { id: report._id } },
  });
};

/**
 * Get all reports
 * @route GET /api/reports
 * @access admin
 */
export const getAllReports = async (req: Request, res: Response) => {
  const { reports, total, totalPages, page, perPage } = await findAllReport(
    req.query,
  );
  res.status(StatusCodes.OK).json({
    status: 'success',
    total,
    totalPages,
    page,
    perPage,
    data: { reports },
  });
};

/**
 * Get a single report.
 * @route GET /api/reports/:reportId
 * @access admin
 */
export const getSingleReport = async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = await findReportById(reportId);
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, `No report with ID: ${reportId}`);
  }
  res.status(StatusCodes.OK).json({ status: 'success', data: { report } });
};

/**
 * Delete a report.
 * @route DELETE /api/reports/:reportId
 * @access admin
 */
export const deleteReport = async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = await deleteReportById(reportId);
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, `No report with ID: ${reportId}`);
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    message: 'Delete report successfully',
  });
};

/**
 * Toggle report status (solve <=> unsolved).
 * @route PATCH /api/reports/:reportId/status
 * @access admin
 */
export const toggleReportStatus = async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const report = await findReportById(reportId);
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, `No report with ID: ${reportId}`);
  }
  let message = '';
  if (report.status === 'unsolved') {
    await updateReportById(reportId, { $set: { status: 'solve' } });
    message = 'Mark report as solved';
  } else {
    await updateReportById(reportId, { $set: { status: 'unsolved' } });
    message = 'Mark report as unsolved';
  }
  res.status(StatusCodes.OK).json({
    status: 'success',
    message,
  });
};
