import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { TestModel } from '../models/Test.model';
import { logger } from '../utils';
import { getAllTestsSchema } from '../validations/test.validation';

/**
 * Test Controller
 * Handles all CRUD operations for Test model
 */

export class TestController {
  /**
   * Create a new test record
   * @route POST /api/v1/tests
   */
  async createTest(req: Request, res: Response) {
    try {
      const { firstName, lastName } = req.body;
      // Check if a test with the same firstName and lastName already exists
      const existingTest = await TestModel.findOne({ firstName, lastName });
      if (existingTest) {
        logger.error('Test already exists', { existingTest });
        return ResponseUtil.error(res, 'Test already exists', 400);
      }

      const test = await TestModel.create({ firstName, lastName });
      logger.info('Test created successfully', { test });
      return ResponseUtil.success(res, test);
    } catch (error) {
      logger.error('Error creating test', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all test records
   * @route GET /api/v1/tests
   */
  async getAllTests(req: Request, res: Response) {
    try {
      const queryData = {
        page: parseInt(req.query['page'] as string) || 1,
        limit: parseInt(req.query['limit'] as string) || 10,
        search: (req.query['search'] as string) || undefined,
        sortBy: (req.query['sortBy'] as string) || 'createdAt',
        sortOrder: (req.query['sortOrder'] as string) || 'desc',
      };

      const queryValidation = getAllTestsSchema.safeParse({
        query: queryData,
      });
      if (!queryValidation.success) {
        logger.warn('Invalid query parameters for getAllTests', {
          errors: queryValidation.error.issues,
        });

        const validationErrors = queryValidation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));

        ResponseUtil.badRequest(
          res,
          'Invalid query parameters',
          validationErrors
        );
        return;
      }

      const { page, limit, search, sortBy, sortOrder } =
        queryValidation.data.query;

      // Build search query
      const searchQuery: any = {};
      if (search) {
        searchQuery.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [tests, totalCount] = await Promise.all([
        TestModel.find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        TestModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
      logger.info('Tests fetched successfully', { tests });
      return ResponseUtil.success(
        res,
        tests,
        'Tests fetched successfully',
        200,
        {
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage,
          },
        }
      );
    } catch (error) {
      logger.error('Error getting all tests', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single test record by ID
   * @route GET /api/v1/tests/:id
   */
  async getTestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const test = await TestModel.findById(id);
      if (!test) {
        logger.error('Test not found', { id });
        return ResponseUtil.error(res, 'Test not found', 404);
      }
      logger.info('Test fetched successfully', { test });
      return ResponseUtil.success(res, test);
    } catch (error) {
      logger.error('Error getting test by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a test record by ID
   * @route PUT /api/v1/tests/:id
   */
  async updateTest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName } = req.body;
      const test = await TestModel.findByIdAndUpdate(
        id,
        { firstName, lastName },
        { new: true }
      );
      if (!test) {
        logger.error('Test not found', { id });
        return ResponseUtil.error(res, 'Test not found', 404);
      }
      logger.info('Test updated successfully', { test });
      return ResponseUtil.success(res, test);
    } catch (error) {
      logger.error('Error updating test', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a test record by ID
   * @route DELETE /api/v1/tests/:id
   */
  async deleteTest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const test = await TestModel.findByIdAndDelete(id);
      if (!test) {
        logger.error('Test not found', { id });
        return ResponseUtil.error(res, 'Test not found', 404);
      }
      logger.info('Test deleted successfully', { test });
      return ResponseUtil.success(res, test);
    } catch (error) {
      logger.error('Error deleting test', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
