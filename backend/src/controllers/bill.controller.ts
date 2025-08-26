import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { BillModel } from '../models/Bill.model';
import { logger } from '../utils';
import { billValidationSchemas } from '../validations/bill.validation';
import { PaymentStatus } from '../types/models';

/**
 * Bill Controller
 * Handles all CRUD operations and billing management for Bill model
 */

export class BillController {
  /**
   * Create a new bill
   * @route POST /api/v1/bills
   */
  async createBill(req: Request, res: Response) {
    try {
      const billData = req.body;

      // Check if a bill already exists for this reservation
      if (billData.reservationId) {
        const existingBill = await BillModel.findOne({
          reservationId: billData.reservationId,
        });
        if (existingBill) {
          logger.error('Bill already exists for this reservation', {
            reservationId: billData.reservationId,
          });
          return ResponseUtil.error(
            res,
            'Bill already exists for this reservation',
            400
          );
        }
      }

      const bill = await BillModel.create(billData);
      logger.info('Bill created successfully', { bill });
      return ResponseUtil.success(res, bill, 'Bill created successfully', 201);
    } catch (error) {
      logger.error('Error creating bill', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all bills with pagination, search, and filtering
   * @route GET /api/v1/bills
   */
  async getAllBills(req: Request, res: Response) {
    try {
      const queryData = {
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 10,
        status: (req.query['status'] as string) || undefined,
        paymentMethod: (req.query['paymentMethod'] as string) || undefined,
        startDate: req.query['dateFrom']
          ? new Date(req.query['dateFrom'] as string)
          : undefined,
        endDate: req.query['dateTo']
          ? new Date(req.query['dateTo'] as string)
          : undefined,
        sortBy: (req.query['sortBy'] as string) || 'dueDate',
        sortOrder: (req.query['sortOrder'] as string) || 'asc',
      };
      const queryValidation =
        billValidationSchemas.billFilter.safeParse(queryData);

      if (!queryValidation.success) {
        const validationErrors = queryValidation.error.issues.map(
          (issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })
        );

        return ResponseUtil.error(
          res,
          'Invalid query parameters',
          400,
          validationErrors
        );
      }

      const validatedData = queryValidation.data;
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        paymentMethod,
        startDate,
        endDate,
      } = validatedData;

      // Build query filters
      const searchQuery: any = {};

      if (req.query.search) {
        const searchTerm = req.query.search as string;
        searchQuery.$or = [{ notes: { $regex: searchTerm, $options: 'i' } }];
      }

      if (status) {
        searchQuery.status = status;
      }

      if (paymentMethod) {
        searchQuery.paymentMethod = paymentMethod;
      }

      if (req.query.isOverdue === 'true') {
        searchQuery.dueDate = { $lt: new Date() };
        searchQuery.status = { $ne: PaymentStatus.PAID };
      }

      if (startDate || endDate) {
        searchQuery.createdAt = {};
        if (startDate) {
          searchQuery.createdAt.$gte = startDate;
        }
        if (endDate) {
          searchQuery.createdAt.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [bills, totalCount] = await Promise.all([
        BillModel.find(searchQuery)
          .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
          .populate('guestId', 'firstName lastName email phone')
          .populate('roomId', 'roomNumber roomType')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        BillModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Bills fetched successfully', { count: bills.length });
      return ResponseUtil.success(
        res,
        bills,
        'Bills fetched successfully',
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
      logger.error('Error getting all bills', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single bill by ID
   * @route GET /api/v1/bills/:id
   */
  async getBillById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bill = await BillModel.findById(id);

      if (!bill) {
        logger.error('Bill not found', { id });
        return ResponseUtil.error(res, 'Bill not found', 404);
      }

      logger.info('Bill fetched successfully', { billId: bill._id });
      return ResponseUtil.success(res, bill, 'Bill fetched successfully');
    } catch (error) {
      logger.error('Error getting bill by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a bill by ID
   * @route PUT /api/v1/bills/:id
   */
  async updateBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const bill = await BillModel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType');

      if (!bill) {
        logger.error('Bill not found', { id });
        return ResponseUtil.error(res, 'Bill not found', 404);
      }

      logger.info('Bill updated successfully', { billId: bill._id });
      return ResponseUtil.success(res, bill, 'Bill updated successfully');
    } catch (error) {
      logger.error('Error updating bill', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a bill by ID
   * @route DELETE /api/v1/bills/:id
   */
  async deleteBill(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bill = await BillModel.findByIdAndDelete(id);

      if (!bill) {
        logger.error('Bill not found', { id });
        return ResponseUtil.error(res, 'Bill not found', 404);
      }

      logger.info('Bill deleted successfully', { billId: bill._id });
      return ResponseUtil.success(res, bill, 'Bill deleted successfully');
    } catch (error) {
      logger.error('Error deleting bill', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Process payment for a bill
   * @route POST /api/v1/bills/:id/payment
   */
  async processPayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const paymentData = req.body;

      const bill = await BillModel.findById(id);
      if (!bill) {
        logger.error('Bill not found', { id });
        return ResponseUtil.error(res, 'Bill not found', 404);
      }

      if (bill.status === PaymentStatus.PAID) {
        logger.error('Bill already paid', { billId: id });
        return ResponseUtil.error(res, 'Bill is already paid', 400);
      }

      // Update bill with payment information
      const updatedBill = await BillModel.findByIdAndUpdate(
        id,
        {
          status: PaymentStatus.PAID,
          paidDate: new Date(),
          paymentMethod: paymentData.paymentMethod,
        },
        { new: true, runValidators: true }
      )
        .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType');

      logger.info('Payment processed successfully', {
        billId: id,
        paymentMethod: paymentData.paymentMethod,
      });
      return ResponseUtil.success(
        res,
        updatedBill,
        'Payment processed successfully'
      );
    } catch (error) {
      logger.error('Error processing payment', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Process refund for a bill
   * @route POST /api/v1/bills/:id/refund
   */
  async processRefund(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const refundData = req.body;

      const bill = await BillModel.findById(id);
      if (!bill) {
        logger.error('Bill not found', { id });
        return ResponseUtil.error(res, 'Bill not found', 404);
      }

      if (bill.status !== PaymentStatus.PAID) {
        logger.error('Cannot refund unpaid bill', {
          billId: id,
          status: bill.status,
        });
        return ResponseUtil.error(res, 'Cannot refund unpaid bill', 400);
      }

      // Update bill with refund information
      const updatedBill = await BillModel.findByIdAndUpdate(
        id,
        {
          status: PaymentStatus.CANCELLED,
          refundAmount: refundData.refundAmount,
          refundReason: refundData.refundReason,
          refundDate: new Date(),
        },
        { new: true, runValidators: true }
      )
        .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType');

      logger.info('Refund processed successfully', {
        billId: id,
        refundAmount: refundData.refundAmount,
        refundReason: refundData.refundReason,
      });
      return ResponseUtil.success(
        res,
        updatedBill,
        'Refund processed successfully'
      );
    } catch (error) {
      logger.error('Error processing refund', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get bills by guest ID
   * @route GET /api/v1/bills/guest/:guestId
   */
  async getBillsByGuest(req: Request, res: Response) {
    try {
      const { guestId } = req.params;
      const bills = await BillModel.find({ guestId })
        .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
        .populate('roomId', 'roomNumber roomType')
        .sort({ createdAt: -1 });

      logger.info('Bills fetched by guest successfully', {
        guestId,
        count: bills.length,
      });
      return ResponseUtil.success(res, bills, 'Bills fetched successfully');
    } catch (error) {
      logger.error('Error getting bills by guest', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get bills by reservation ID
   * @route GET /api/v1/bills/reservation/:reservationId
   */
  async getBillsByReservation(req: Request, res: Response) {
    try {
      const { reservationId } = req.params;
      const bills = await BillModel.find({ reservationId })
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .sort({ createdAt: -1 });

      logger.info('Bills fetched by reservation successfully', {
        reservationId,
        count: bills.length,
      });
      return ResponseUtil.success(res, bills, 'Bills fetched successfully');
    } catch (error) {
      logger.error('Error getting bills by reservation', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get overdue bills
   * @route GET /api/v1/bills/overdue
   */
  async getOverdueBills(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const bills = await BillModel.find({
        dueDate: { $lt: currentDate },
        status: { $ne: PaymentStatus.PAID },
      })
        .populate('reservationId', 'checkInDate checkOutDate numberOfGuests')
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .sort({ dueDate: 1 });

      logger.info('Overdue bills fetched successfully', {
        count: bills.length,
      });
      return ResponseUtil.success(
        res,
        bills,
        'Overdue bills fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting overdue bills', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
