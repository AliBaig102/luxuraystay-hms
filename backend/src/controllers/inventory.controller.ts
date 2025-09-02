import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';
import { InventoryItemModel } from '../models/InventoryItem.model';
import { InventoryTransactionModel } from '../models/InventoryTransaction.model';
import { inventoryValidationSchemas } from '../validations/inventory.validation';
import { UserRole } from '../types/models';

// Extend the Request interface locally
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
  };
}

export class InventoryController {
  /**
   * Create new inventory item
   */
  static async createItem(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const itemData = req.body;

      // Check if SKU already exists
      const existingItem = await InventoryItemModel.findOne({
        sku: itemData.sku,
      });
      if (existingItem) {
        ResponseUtil.error(res, 'SKU already exists', 409);
        return;
      }

      // Calculate total value
      itemData.totalValue = itemData.quantity * itemData.unitPrice;

      const newItem = new InventoryItemModel(itemData);
      await newItem.save();

      // Create initial transaction record
      await InventoryTransactionModel.create({
        itemId: newItem._id,
        transactionType: 'in',
        quantity: itemData.quantity,
        unitPrice: itemData.unitPrice,
        totalAmount: itemData.totalValue,
        reference: 'Initial stock',
        performedBy: req.user!.id,
        notes: 'Item created',
        previousQuantity: 0,
        newQuantity: itemData.quantity,
      });

      logger.info('Inventory item created', {
        itemId: newItem._id,
        sku: newItem.sku,
        name: newItem.name,
        createdBy: req.user!.id,
      });

      ResponseUtil.success(
        res,
        {
          item: newItem,
        },
        'Inventory item created successfully'
      );
    } catch (error: any) {
      logger.error('Failed to create inventory item', {
        error: error.message,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to create inventory item', 500);
    }
  }

  /**
   * Get all inventory items with pagination and filtering
   */
  static async getAllItems(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validation =
        inventoryValidationSchemas.inventoryItemFilter.safeParse(req.query);

      if (!validation.success) {
        ResponseUtil.error(res, 'Validation failed', 400);
        return;
      }

      const {
        type,
        status,
        category,
        supplier,
        location,
        minPrice,
        maxPrice,
        minQuantity,
        maxQuantity,
        isActive,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
      } = validation.data;

      // Build filter query
      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (category) filter.category = { $regex: category, $options: 'i' };
      if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (minPrice !== undefined) filter.unitPrice = { $gte: minPrice };
      if (maxPrice !== undefined) {
        if (filter.unitPrice) {
          filter.unitPrice.$lte = maxPrice;
        } else {
          filter.unitPrice = { $lte: maxPrice };
        }
      }
      if (minQuantity !== undefined) filter.quantity = { $gte: minQuantity };
      if (maxQuantity !== undefined) {
        if (filter.quantity) {
          filter.quantity.$lte = maxQuantity;
        } else {
          filter.quantity = { $lte: maxQuantity };
        }
      }
      if (isActive !== undefined) filter.isActive = isActive;

      // Build sort query
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute query
      const [items, total] = await Promise.all([
        InventoryItemModel.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        InventoryItemModel.countDocuments(filter),
      ]);

      logger.info('Inventory items retrieved', {
        count: items.length,
        total,
        page,
        limit,
        userId: req.user?.id,
      });

      ResponseUtil.paginated(
        res,
        items,
        total,
        page,
        limit,
        'Inventory items retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Failed to retrieve inventory items', {
        error: error.message,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to retrieve inventory items', 500);
    }
  }

  /**
   * Get inventory item by ID
   */
  static async getItemById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const item = await InventoryItemModel.findById(id).lean();

      if (!item) {
        ResponseUtil.error(res, 'Inventory item not found', 404);
        return;
      }

      // Get recent transactions for this item
      const transactions = await InventoryTransactionModel.find({ itemId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('performedBy', 'firstName lastName email')
        .lean();

      logger.info('Inventory item retrieved', {
        itemId: id,
        userId: req.user?.id,
      });

      ResponseUtil.success(
        res,
        {
          item,
          recentTransactions: transactions,
        },
        'Inventory item retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Failed to retrieve inventory item', {
        error: error.message,
        itemId: req.params.id,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to retrieve inventory item', 500);
    }
  }

  /**
   * Update inventory item
   */
  static async updateItem(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const updateData = req.body;

      // Check if item exists
      const existingItem = await InventoryItemModel.findById(id);
      if (!existingItem) {
        ResponseUtil.error(res, 'Inventory item not found', 404);
        return;
      }

      // Calculate total value if quantity or unitPrice is being updated
      if (
        updateData.quantity !== undefined ||
        updateData.unitPrice !== undefined
      ) {
        const finalQuantity = updateData.quantity ?? existingItem.quantity;
        const finalUnitPrice = updateData.unitPrice ?? existingItem.unitPrice;
        updateData.totalValue = finalQuantity * finalUnitPrice;
      }

      // If quantity is being updated, create a transaction record
      if (
        updateData.quantity !== undefined &&
        updateData.quantity !== existingItem.quantity
      ) {
        const quantityDifference = updateData.quantity - existingItem.quantity;
        const transactionType =
          quantityDifference > 0 ? 'adjustment' : 'adjustment';

        await InventoryTransactionModel.create({
          itemId: id,
          transactionType,
          quantity: Math.abs(quantityDifference),
          unitPrice: updateData.unitPrice || existingItem.unitPrice,
          totalAmount:
            Math.abs(quantityDifference) *
            (updateData.unitPrice || existingItem.unitPrice),
          reference: 'Manual adjustment',
          performedBy: req.user!.id,
          notes: `Quantity adjusted from ${existingItem.quantity} to ${updateData.quantity}`,
          previousQuantity: existingItem.quantity,
          newQuantity: updateData.quantity,
        });
      }

      // Update the item
      const updatedItem = await InventoryItemModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      logger.info('Inventory item updated', {
        itemId: id,
        updatedFields: Object.keys(updateData),
        userId: req.user?.id,
      });

      ResponseUtil.success(
        res,
        {
          item: updatedItem,
        },
        'Inventory item updated successfully'
      );
    } catch (error: any) {
      logger.error('Failed to update inventory item', {
        error: error.message,
        itemId: req.params.id,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to update inventory item', 500);
    }
  }

  /**
   * Delete inventory item
   */
  static async deleteItem(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = req.params;

      const item = await InventoryItemModel.findById(id);
      if (!item) {
        ResponseUtil.error(res, 'Inventory item not found', 404);
        return;
      }

      // Check if item has any transactions
      const transactionCount = await InventoryTransactionModel.countDocuments({
        itemId: id,
      });

      if (transactionCount > 0) {
        // Soft delete - mark as inactive
        await InventoryItemModel.findByIdAndUpdate(id, { isActive: false });

        logger.info('Inventory item soft deleted', {
          itemId: id,
          userId: req.user?.id,
        });

        ResponseUtil.success(res, 'Inventory item deactivated successfully');
      } else {
        // Hard delete if no transactions
        await InventoryItemModel.findByIdAndDelete(id);

        logger.info('Inventory item hard deleted', {
          itemId: id,
          userId: req.user?.id,
        });

        ResponseUtil.success(res, 'Inventory item deleted successfully');
      }
    } catch (error: any) {
      logger.error('Failed to delete inventory item', {
        error: error.message,
        itemId: req.params.id,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to delete inventory item', 500);
    }
  }

  /**
   * Search inventory items
   */
  static async searchItems(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const validation =
        inventoryValidationSchemas.inventoryItemSearch.safeParse(req.query);

      if (!validation.success) {
        ResponseUtil.error(res, 'Validation failed', 400);
        return;
      }

      const {
        query,
        type,
        status,
        category,
        supplier,
        location,
        minPrice,
        maxPrice,
        minQuantity,
        maxQuantity,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc',
      } = validation.data;

      // Build text search query
      const textSearch = {
        $text: { $search: query },
      };

      // Build filter query
      const filter: any = {};

      if (type) filter.type = type;
      if (status) filter.status = status;
      if (category) filter.category = { $regex: category, $options: 'i' };
      if (supplier) filter.supplier = { $regex: supplier, $options: 'i' };
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (minPrice !== undefined) filter.unitPrice = { $gte: minPrice };
      if (maxPrice !== undefined) {
        if (filter.unitPrice) {
          filter.unitPrice.$lte = maxPrice;
        } else {
          filter.unitPrice = { $lte: maxPrice };
        }
      }
      if (minQuantity !== undefined) filter.quantity = { $gte: minQuantity };
      if (maxQuantity !== undefined) {
        if (filter.quantity) {
          filter.quantity.$lte = maxQuantity;
        } else {
          filter.quantity = { $lte: maxQuantity };
        }
      }

      // Combine text search with filters
      const searchQuery = { ...textSearch, ...filter };

      // Build sort query
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute search
      const [items, total] = await Promise.all([
        InventoryItemModel.find(searchQuery, { score: { $meta: 'textScore' } })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        InventoryItemModel.countDocuments(searchQuery),
      ]);

      const totalPages = Math.ceil(total / limit);

      logger.info('Inventory search performed', {
        query,
        count: items.length,
        total,
        page,
        limit,
        userId: req.user?.id,
      });

      ResponseUtil.success(
        res,
        {
          items,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        'Search completed successfully'
      );
    } catch (error: any) {
      logger.error('Failed to search inventory items', {
        error: error.message,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to search inventory items', 500);
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const [
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        itemsByType,
        itemsByStatus,
      ] = await Promise.all([
        InventoryItemModel.countDocuments({ isActive: true }),
        InventoryItemModel.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: null, total: { $sum: '$totalValue' } } },
        ]),
        InventoryItemModel.countDocuments({
          status: 'low_stock',
          isActive: true,
        }),
        InventoryItemModel.countDocuments({
          status: 'out_of_stock',
          isActive: true,
        }),
        InventoryItemModel.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              value: { $sum: '$totalValue' },
            },
          },
        ]),
        InventoryItemModel.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
      ]);

      const stats = {
        totalItems,
        totalValue: totalValue[0]?.total || 0,
        lowStockItems,
        outOfStockItems,
        itemsByType,
        itemsByStatus,
      };

      logger.info('Inventory statistics retrieved', {
        userId: req.user?.id,
      });

      ResponseUtil.success(
        res,
        {
          stats,
        },
        'Inventory statistics retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Failed to retrieve inventory statistics', {
        error: error.message,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to retrieve inventory statistics', 500);
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const lowStockItems = await InventoryItemModel.find({
        $or: [{ status: 'low_stock' }, { status: 'out_of_stock' }],
        isActive: true,
      })
        .sort({ quantity: 1 })
        .limit(50)
        .lean();

      logger.info('Low stock alerts retrieved', {
        count: lowStockItems.length,
        userId: req.user?.id,
      });

      ResponseUtil.success(
        res,
        {
          alerts: lowStockItems,
        },
        'Low stock alerts retrieved successfully'
      );
    } catch (error: any) {
      logger.error('Failed to retrieve low stock alerts', {
        error: error.message,
        userId: req.user?.id,
      });

      ResponseUtil.error(res, 'Failed to retrieve low stock alerts', 500);
    }
  }
}
