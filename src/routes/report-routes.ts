import express from 'express';
import {
  createReport,
  deleteReport,
  getAllReports,
  getSingleReport,
  toggleReportStatus,
} from '../controllers/report-controller';
import { deserializeUser } from '../middlewares/deserialize-user';
import { requireAuth } from '../middlewares/require-auth';
import { restrictTo } from '../middlewares/restrict-to';
import { validate } from '../middlewares/validate';
import { newReportInputSchema } from '../schemas/report-schema';

const router = express.Router();

// User routes
router.use(deserializeUser, requireAuth);
router.post('/', validate(newReportInputSchema), createReport);

// Admin routes
router.use(restrictTo('admin'));
router.get('/', getAllReports);
router.route('/:reportId').get(getSingleReport).delete(deleteReport);
router.patch('/:reportId/status', toggleReportStatus);

export default router;
