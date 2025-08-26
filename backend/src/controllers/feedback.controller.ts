import { Request, Response } from 'express';
import { FeedbackModel } from '../models/Feedback.model';
import { feedbackValidationSchemas } from '../validations/feedback.validation';
import { ResponseUtil } from '../utils/response';
import { Types } from 'mongoose';

export class FeedbackController {
  /**
   * Create a new feedback
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = feedbackValidationSchemas.feedback.parse(req.body);

      const feedback = new FeedbackModel(validatedData);
      await feedback.save();

      ResponseUtil.success(res, feedback, 'Feedback created successfully', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else if (error.name === 'ValidationError') {
        ResponseUtil.error(
          res,
          'Database validation failed',
          400,
          error.errors
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to create feedback',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Get all feedback with optional filtering
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        ...filters
      } = req.query;

      // Validate filters
      const validatedFilters =
        feedbackValidationSchemas.feedbackFilter.parse(filters);

      // Build query
      const query: any = {};

      if (validatedFilters.guestId) {
        query.guestId = validatedFilters.guestId;
      }
      if (validatedFilters.reservationId) {
        query.reservationId = validatedFilters.reservationId;
      }
      if (validatedFilters.roomId) {
        query.roomId = validatedFilters.roomId;
      }
      if (validatedFilters.category) {
        query.category = validatedFilters.category;
      }
      if (validatedFilters.rating) {
        query.rating = validatedFilters.rating;
      }
      if (validatedFilters.isAnonymous !== undefined) {
        query.isAnonymous = validatedFilters.isAnonymous;
      }
      if (validatedFilters.hasResponse !== undefined) {
        if (validatedFilters.hasResponse) {
          query.response = { $exists: true, $ne: null };
        } else {
          query.$or = [
            { response: { $exists: false } },
            { response: null },
            { response: '' },
          ];
        }
      }
      if (validatedFilters.dateFrom || validatedFilters.dateTo) {
        query.createdAt = {};
        if (validatedFilters.dateFrom) {
          query.createdAt.$gte = new Date(validatedFilters.dateFrom);
        }
        if (validatedFilters.dateTo) {
          query.createdAt.$lte = new Date(validatedFilters.dateTo);
        }
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [feedback, total] = await Promise.all([
        FeedbackModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('guestId', 'firstName lastName email')
          .populate('reservationId', 'checkInDate checkOutDate')
          .populate('roomId', 'roomNumber roomType')
          .populate('respondedBy', 'firstName lastName')
          .lean(),
        FeedbackModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      ResponseUtil.success(
        res,
        {
          feedback,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
        'Feedback retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Invalid filter parameters', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          'Failed to retrieve feedback',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Search feedback
   */
  static async search(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = feedbackValidationSchemas.feedbackSearch.parse(
        req.query
      );
      const { query, category, rating, page = 1, limit = 10 } = validatedData;

      // Build search query
      const searchQuery: any = {};

      if (query) {
        searchQuery.$or = [{ comment: { $regex: query, $options: 'i' } }];
      }

      if (category) {
        searchQuery.category = category;
      }
      if (rating) {
        searchQuery.rating = rating;
      }

      // Calculate pagination
      const pageNum = Math.max(1, page);
      const limitNum = Math.min(100, Math.max(1, limit));
      const skip = (pageNum - 1) * limitNum;

      // Execute search
      const [feedback, total] = await Promise.all([
        FeedbackModel.find(searchQuery)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('guestId', 'firstName lastName email')
          .populate('reservationId', 'checkInDate checkOutDate')
          .populate('roomId', 'roomNumber roomType')
          .populate('respondedBy', 'firstName lastName')
          .lean(),
        FeedbackModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      ResponseUtil.success(
        res,
        {
          feedback,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalItems: total,
            itemsPerPage: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
          },
        },
        'Feedback search completed successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Invalid search parameters', 400, error.errors);
      } else {
        ResponseUtil.error(
          res,
          'Failed to search feedback',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Get feedback statistics
   */
  static async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalFeedback,
        averageRating,
        categoryStats,
        ratingDistribution,
        recentFeedback,
      ] = await Promise.all([
        // Total feedback count
        FeedbackModel.countDocuments(),

        // Average rating
        FeedbackModel.aggregate([
          {
            $group: {
              _id: null,
              averageRating: { $avg: '$rating' },
            },
          },
        ]),

        // Feedback by category
        FeedbackModel.aggregate([
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              averageRating: { $avg: '$rating' },
            },
          },
          { $sort: { count: -1 } },
        ]),

        // Rating distribution
        FeedbackModel.aggregate([
          {
            $group: {
              _id: '$rating',
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // Recent feedback (last 7 days)
        FeedbackModel.countDocuments({
          createdAt: {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      // Response rate calculation
      const [totalWithResponse, totalWithoutResponse] = await Promise.all([
        FeedbackModel.countDocuments({
          response: { $exists: true, $ne: null, $not: { $eq: '' } },
        }),
        FeedbackModel.countDocuments({
          $or: [
            { response: { $exists: false } },
            { response: null },
            { response: '' },
          ],
        }),
      ]);

      const responseRate =
        totalFeedback > 0 ? (totalWithResponse / totalFeedback) * 100 : 0;

      ResponseUtil.success(
        res,
        {
          overview: {
            totalFeedback,
            averageRating: averageRating[0]?.averageRating || 0,
            responseRate: Math.round(responseRate * 100) / 100,
            recentFeedback,
          },
          categoryBreakdown: categoryStats,
          ratingDistribution,
          responseStats: {
            totalWithResponse,
            totalWithoutResponse,
            responseRate: Math.round(responseRate * 100) / 100,
          },
        },
        'Feedback statistics retrieved successfully'
      );
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to retrieve feedback statistics',
        500,
        error.message
      );
    }
  }

  /**
   * Get feedback by ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid feedback ID', 400);
        return;
      }

      const feedback = await FeedbackModel.findById(id)
        .populate('guestId', 'firstName lastName email phone')
        .populate('reservationId', 'checkInDate checkOutDate totalAmount')
        .populate('roomId', 'roomNumber roomType floor')
        .populate('respondedBy', 'firstName lastName email')
        .lean();

      if (!feedback) {
        ResponseUtil.error(res, 'Feedback not found', 404);
        return;
      }

      ResponseUtil.success(res, feedback, 'Feedback retrieved successfully');
    } catch (error: any) {
      ResponseUtil.error(
        res,
        'Failed to retrieve feedback',
        500,
        error.message
      );
    }
  }

  /**
   * Update feedback
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = feedbackValidationSchemas.feedbackUpdate.parse(
        req.body
      );

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid feedback ID', 400);
        return;
      }

      const feedback = await FeedbackModel.findByIdAndUpdate(
        id,
        { ...validatedData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email')
        .populate('reservationId', 'checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('respondedBy', 'firstName lastName')
        .lean();

      if (!feedback) {
        ResponseUtil.error(res, 'Feedback not found', 404);
        return;
      }

      ResponseUtil.success(res, feedback, 'Feedback updated successfully');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else if (error.name === 'ValidationError') {
        ResponseUtil.error(
          res,
          'Database validation failed',
          400,
          error.errors
        );
      } else {
        ResponseUtil.error(
          res,
          'Failed to update feedback',
          500,
          error.message
        );
      }
    }
  }

  /**
   * Delete feedback
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid feedback ID', 400);
        return;
      }

      const feedback = await FeedbackModel.findByIdAndDelete(id);

      if (!feedback) {
        ResponseUtil.error(res, 'Feedback not found', 404);
        return;
      }

      ResponseUtil.success(res, null, 'Feedback deleted successfully');
    } catch (error: any) {
      ResponseUtil.error(res, 'Failed to delete feedback', 500, error.message);
    }
  }

  /**
   * Add response to feedback
   */
  static async addResponse(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = feedbackValidationSchemas.feedbackResponse.parse(
        req.body
      );

      if (!Types.ObjectId.isValid(id)) {
        ResponseUtil.error(res, 'Invalid feedback ID', 400);
        return;
      }

      const updateData = {
        response: validatedData.response,
        respondedBy: validatedData.responseBy,
        responseDate: new Date(),
        status: 'responded' as const,
        updatedAt: new Date(),
      };

      const feedback = await FeedbackModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('guestId', 'firstName lastName email')
        .populate('reservationId', 'checkInDate checkOutDate')
        .populate('roomId', 'roomNumber roomType')
        .populate('respondedBy', 'firstName lastName')
        .lean();

      if (!feedback) {
        ResponseUtil.error(res, 'Feedback not found', 404);
        return;
      }

      ResponseUtil.success(res, feedback, 'Response added successfully');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        ResponseUtil.error(res, 'Validation failed', 400, error.errors);
      } else if (error.name === 'ValidationError') {
        ResponseUtil.error(
          res,
          'Database validation failed',
          400,
          error.errors
        );
      } else {
        ResponseUtil.error(res, 'Failed to add response', 500, error.message);
      }
    }
  }
}
