import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { ServiceRequestModel } from '../models/ServiceRequest.model';
import { logger } from '../utils';
import { serviceRequestValidationSchemas } from '../validations/serviceRequest.validation';
import { ServiceStatus } from '../types/models';

/**
 * Service Request Controller
 * Handles all CRUD operations and service request management for ServiceRequest model
 */

export class ServiceRequestController {
  /**
   * Create a new service request
   * @route POST /api/v1/service-requests
   */
  async createServiceRequest(req: Request, res: Response) {
    try {
      const serviceRequestData = req.body;

      const serviceRequest =
        await ServiceRequestModel.create(serviceRequestData);
      logger.info('Service request created successfully', { serviceRequest });
      return ResponseUtil.success(
        res,
        serviceRequest,
        'Service request created successfully',
        201
      );
    } catch (error) {
      logger.error('Error creating service request', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get all service requests with pagination, search, and filtering
   * @route GET /api/v1/service-requests
   */
  async getAllServiceRequests(req: Request, res: Response) {
    try {
      const queryData = {
        page: Number(req.query['page']) || 1,
        limit: Number(req.query['limit']) || 10,
        status: (req.query['status'] as string) || undefined,
        priority: (req.query['priority'] as string) || undefined,
        serviceType: (req.query['serviceType'] as string) || undefined,
        guestId: (req.query['guestId'] as string) || undefined,
        roomId: (req.query['roomId'] as string) || undefined,
        assignedTo: (req.query['assignedTo'] as string) || undefined,
        startDate: req.query['startDate']
          ? new Date(req.query['startDate'] as string)
          : undefined,
        endDate: req.query['endDate']
          ? new Date(req.query['endDate'] as string)
          : undefined,
        sortBy: (req.query['sortBy'] as string) || 'requestedDate',
        sortOrder: (req.query['sortOrder'] as string) || 'asc',
      };

      const queryValidation =
        serviceRequestValidationSchemas.serviceRequestFilter.safeParse(
          queryData
        );

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
        priority,
        serviceType,
        guestId,
        roomId,
        assignedTo,
        startDate,
        endDate,
      } = validatedData;

      // Build query filters
      const searchQuery: any = {};

      if (req.query.search) {
        const searchTerm = req.query.search as string;
        searchQuery.$or = [
          { description: { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
          { notes: { $regex: searchTerm, $options: 'i' } },
        ];
      }

      if (status) {
        searchQuery.status = status;
      }

      if (priority) {
        searchQuery.priority = priority;
      }

      if (serviceType) {
        searchQuery.serviceType = serviceType;
      }

      if (guestId) {
        searchQuery.guestId = guestId;
      }

      if (roomId) {
        searchQuery.roomId = roomId;
      }

      if (assignedTo) {
        searchQuery.assignedStaffId = assignedTo;
      }

      if (req.query.isOverdue === 'true') {
        // This will be handled by the virtual field in the model
        searchQuery.$expr = { $eq: ['$isOverdue', true] };
      }

      if (startDate || endDate) {
        searchQuery.requestedDate = {};
        if (startDate) {
          searchQuery.requestedDate.$gte = startDate;
        }
        if (endDate) {
          searchQuery.requestedDate.$lte = endDate;
        }
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      // Execute queries in parallel
      const [serviceRequests, totalCount] = await Promise.all([
        ServiceRequestModel.find(searchQuery)
          .populate('guestId', 'firstName lastName email phone')
          .populate('roomId', 'roomNumber roomType')
          .populate('assignedStaffId', 'firstName lastName email')
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        ServiceRequestModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      logger.info('Service requests fetched successfully', {
        count: serviceRequests.length,
      });
      return ResponseUtil.success(
        res,
        serviceRequests,
        'Service requests fetched successfully',
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
      logger.error('Error getting all service requests', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get a single service request by ID
   * @route GET /api/v1/service-requests/:id
   */
  async getServiceRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const serviceRequest = await ServiceRequestModel.findById(id)
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email');

      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      logger.info('Service request fetched successfully', {
        serviceRequestId: serviceRequest._id,
      });
      return ResponseUtil.success(
        res,
        serviceRequest,
        'Service request fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting service request by id', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update a service request by ID
   * @route PUT /api/v1/service-requests/:id
   */
  async updateServiceRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const serviceRequest = await ServiceRequestModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email');

      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      logger.info('Service request updated successfully', {
        serviceRequestId: serviceRequest._id,
      });
      return ResponseUtil.success(
        res,
        serviceRequest,
        'Service request updated successfully'
      );
    } catch (error) {
      logger.error('Error updating service request', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Delete a service request by ID
   * @route DELETE /api/v1/service-requests/:id
   */
  async deleteServiceRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const serviceRequest = await ServiceRequestModel.findByIdAndDelete(id);

      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      logger.info('Service request deleted successfully', {
        serviceRequestId: serviceRequest._id,
      });
      return ResponseUtil.success(
        res,
        serviceRequest,
        'Service request deleted successfully'
      );
    } catch (error) {
      logger.error('Error deleting service request', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Assign a service request to staff
   * @route POST /api/v1/service-requests/:id/assign
   */
  async assignServiceRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const assignmentData = req.body;

      const serviceRequest = await ServiceRequestModel.findById(id);
      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      if (serviceRequest.status === ServiceStatus.COMPLETED) {
        logger.error('Cannot assign completed service request', {
          serviceRequestId: id,
        });
        return ResponseUtil.error(
          res,
          'Cannot assign completed service request',
          400
        );
      }

      // Update service request with assignment information
      const updatedServiceRequest = await ServiceRequestModel.findByIdAndUpdate(
        id,
        {
          assignedStaffId: assignmentData.assignedTo,
          status: ServiceStatus.IN_PROGRESS,
          scheduledDate: assignmentData.scheduledDate,
          notes: assignmentData.notes,
        },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Service request assigned successfully', {
        serviceRequestId: id,
        assignedTo: assignmentData.assignedTo,
      });
      return ResponseUtil.success(
        res,
        updatedServiceRequest,
        'Service request assigned successfully'
      );
    } catch (error) {
      logger.error('Error assigning service request', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Update service request status
   * @route PATCH /api/v1/service-requests/:id/status
   */
  async updateServiceRequestStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const statusData = req.body;

      const serviceRequest = await ServiceRequestModel.findById(id);
      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      const updateFields: any = {
        status: statusData.status,
        notes: statusData.notes,
      };

      // Set timestamps based on status
      if (statusData.status === ServiceStatus.IN_PROGRESS) {
        updateFields.actualStartTime = new Date();
      } else if (statusData.status === ServiceStatus.COMPLETED) {
        updateFields.completedDate = new Date();
        updateFields.actualEndTime = new Date();
      }

      const updatedServiceRequest = await ServiceRequestModel.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Service request status updated successfully', {
        serviceRequestId: id,
        status: statusData.status,
      });
      return ResponseUtil.success(
        res,
        updatedServiceRequest,
        'Service request status updated successfully'
      );
    } catch (error) {
      logger.error('Error updating service request status', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Complete a service request
   * @route POST /api/v1/service-requests/:id/complete
   */
  async completeServiceRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const completionData = req.body;

      const serviceRequest = await ServiceRequestModel.findById(id);
      if (!serviceRequest) {
        logger.error('Service request not found', { id });
        return ResponseUtil.error(res, 'Service request not found', 404);
      }

      if (serviceRequest.status === ServiceStatus.COMPLETED) {
        logger.error('Service request already completed', {
          serviceRequestId: id,
        });
        return ResponseUtil.error(
          res,
          'Service request is already completed',
          400
        );
      }

      // Update service request with completion information
      const updatedServiceRequest = await ServiceRequestModel.findByIdAndUpdate(
        id,
        {
          status: ServiceStatus.COMPLETED,
          completedDate: new Date(),
          actualEndTime: completionData.actualEndTime || new Date(),
          cost: completionData.actualCost,
          notes: completionData.completionNotes,
        },
        { new: true, runValidators: true }
      )
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email');

      logger.info('Service request completed successfully', {
        serviceRequestId: id,
        actualCost: completionData.actualCost,
      });
      return ResponseUtil.success(
        res,
        updatedServiceRequest,
        'Service request completed successfully'
      );
    } catch (error) {
      logger.error('Error completing service request', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get service requests by guest ID
   * @route GET /api/v1/service-requests/guest/:guestId
   */
  async getServiceRequestsByGuest(req: Request, res: Response) {
    try {
      const { guestId } = req.params;
      const serviceRequests = await ServiceRequestModel.find({ guestId })
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      logger.info('Service requests fetched by guest successfully', {
        guestId,
        count: serviceRequests.length,
      });
      return ResponseUtil.success(
        res,
        serviceRequests,
        'Service requests fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting service requests by guest', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get service requests by room ID
   * @route GET /api/v1/service-requests/room/:roomId
   */
  async getServiceRequestsByRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const serviceRequests = await ServiceRequestModel.find({ roomId })
        .populate('guestId', 'firstName lastName email phone')
        .populate('assignedStaffId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      logger.info('Service requests fetched by room successfully', {
        roomId,
        count: serviceRequests.length,
      });
      return ResponseUtil.success(
        res,
        serviceRequests,
        'Service requests fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting service requests by room', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get service requests by assigned staff ID
   * @route GET /api/v1/service-requests/staff/:staffId
   */
  async getServiceRequestsByStaff(req: Request, res: Response) {
    try {
      const { staffId } = req.params;
      const serviceRequests = await ServiceRequestModel.find({
        assignedStaffId: staffId,
      })
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .sort({ createdAt: -1 });

      logger.info('Service requests fetched by staff successfully', {
        staffId,
        count: serviceRequests.length,
      });
      return ResponseUtil.success(
        res,
        serviceRequests,
        'Service requests fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting service requests by staff', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get overdue service requests
   * @route GET /api/v1/service-requests/overdue
   */
  async getOverdueServiceRequests(req: Request, res: Response) {
    try {
      const serviceRequests = await ServiceRequestModel.find({
        $expr: { $eq: ['$isOverdue', true] },
      })
        .populate('guestId', 'firstName lastName email phone')
        .populate('roomId', 'roomNumber roomType')
        .populate('assignedStaffId', 'firstName lastName email')
        .sort({ requestedDate: 1 });

      logger.info('Overdue service requests fetched successfully', {
        count: serviceRequests.length,
      });
      return ResponseUtil.success(
        res,
        serviceRequests,
        'Overdue service requests fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting overdue service requests', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }

  /**
   * Get service request statistics
   * @route GET /api/v1/service-requests/statistics
   */
  async getServiceRequestStatistics(req: Request, res: Response) {
    try {
      const [statusStats, priorityStats, serviceTypeStats, overdueCount] =
        await Promise.all([
          ServiceRequestModel.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ]),
          ServiceRequestModel.aggregate([
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 },
              },
            },
          ]),
          ServiceRequestModel.aggregate([
            {
              $group: {
                _id: '$serviceType',
                count: { $sum: 1 },
                avgCompletionTime: { $avg: '$completionTime' },
              },
            },
          ]),
          ServiceRequestModel.countDocuments({
            $expr: { $eq: ['$isOverdue', true] },
          }),
        ]);

      const totalRequests = await ServiceRequestModel.countDocuments();
      const completedRequests = await ServiceRequestModel.countDocuments({
        status: ServiceStatus.COMPLETED,
      });
      const completionRate =
        totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

      const statistics = {
        total: totalRequests,
        completed: completedRequests,
        overdue: overdueCount,
        completionRate: Math.round(completionRate * 100) / 100,
        byStatus: statusStats,
        byPriority: priorityStats,
        byServiceType: serviceTypeStats,
      };

      logger.info('Service request statistics fetched successfully');
      return ResponseUtil.success(
        res,
        statistics,
        'Service request statistics fetched successfully'
      );
    } catch (error) {
      logger.error('Error getting service request statistics', { error });
      return ResponseUtil.error(res, 'Internal server error', 500);
    }
  }
}
