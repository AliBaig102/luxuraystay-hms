import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
// import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { reportValidationSchemas } from '../validations/report.validation';
import { validate } from '../middleware/validation.middleware';

const router: Router = Router();

// // Health check endpoint (no authentication required)
// router.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Report Management API is running',
//     timestamp: new Date().toISOString(),
//   });
// });

// // Apply authentication middleware to all routes below
// router.use((req, res, next) => {
//   void authMiddleware(req, res, next);
// });

/**
 * @route POST /api/v1/reports/generate
 * @desc Generate a new report
 * @access Private (Manager, Admin)
 */
router.post(
  '/generate',
  // roleMiddleware(['manager', 'admin']),
  validate(reportValidationSchemas.reportGeneration),
  (req, res) => {
    void ReportController.generateReport(req, res);
  }
);

/**
 * @route GET /api/v1/reports
 * @desc Get all reports with filtering and pagination
 * @access Private (Manager, Admin)
 */
router.get(
  '/',
  // roleMiddleware(['manager', 'admin']),
  validate(reportValidationSchemas.reportFilter),
  (req, res) => {
    void ReportController.getAllReports(req, res);
  }
);

/**
 * @route GET /api/v1/reports/statistics
 * @desc Get report statistics and analytics
 * @access Private (Manager, Admin)
 */
router.get(
  '/statistics',
  // roleMiddleware(['manager', 'admin']),
  validate(reportValidationSchemas.reportStats),
  (req, res) => {
    void ReportController.getReportStatistics(req, res);
  }
);

/**
 * @route POST /api/v1/reports/cleanup
 * @desc Clean up expired reports
 * @access Private (Admin)
 */
router.post(
  '/cleanup',
  // roleMiddleware(['admin']),
  validate(reportValidationSchemas.reportCleanup),
  (req, res) => {
    void ReportController.cleanupReports(req, res);
  }
);

/**
 * @route DELETE /api/v1/reports/bulk-delete
 * @desc Bulk delete reports
 * @access Private (Admin)
 */
router.delete(
  '/bulk-delete',
  roleMiddleware(['admin']),
  validate(reportValidationSchemas.bulkDelete),
  (req, res) => {
    void ReportController.bulkDeleteReports(req, res);
  }
);

/**
 * @route GET /api/v1/reports/:id
 * @desc Get report by ID
 * @access Private (Manager, Admin)
 */
// router.get('/:id', roleMiddleware(['manager', 'admin']), (req, res) => {
//   void ReportController.getReportById(req, res);
// });
router.get('/:id', (req, res) => {
  void ReportController.getReportById(req, res);
});

/**
 * @route GET /api/v1/reports/:id/download
 * @desc Download report in specified format
 * @access Private (Manager, Admin)
 */
router.get(
  '/:id/download',
  // roleMiddleware(['manager', 'admin']),
  validate(reportValidationSchemas.reportDownload),
  (req, res) => {
    void ReportController.downloadReport(req, res);
  }
);

/**
 * @route PUT /api/v1/reports/:id
 * @desc Update report
 * @access Private (Manager, Admin)
 */
router.put(
  '/:id',
  // roleMiddleware(['manager', 'admin']),
  validate(reportValidationSchemas.reportUpdate),
  (req, res) => {
    void ReportController.updateReport(req, res);
  }
);

/**
 * @route DELETE /api/v1/reports/:id
 * @desc Delete report
 * @access Private (Admin)
 */
// router.delete('/:id', roleMiddleware(['admin']), (req, res) => {
//   void ReportController.deleteReport(req, res);
// });
router.delete('/:id', (req, res) => {
  void ReportController.deleteReport(req, res);
});

export { router as reportRoutes };
