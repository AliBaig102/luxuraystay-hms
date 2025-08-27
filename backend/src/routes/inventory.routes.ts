/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { UserRole } from '../types/models';

const router: Router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Inventory Item Management Routes
// Only managers and admins can create, update, and delete inventory items
router.post(
  '/items',
  roleMiddleware([UserRole.MANAGER, UserRole.ADMIN]),
  InventoryController.createItem
);

router.get(
  '/items',
  roleMiddleware([
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.HOUSEKEEPING,
    UserRole.MAINTENANCE,
  ]),
  InventoryController.getAllItems
);

router.get(
  '/items/search',
  roleMiddleware([
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.HOUSEKEEPING,
    UserRole.MAINTENANCE,
  ]),
  InventoryController.searchItems
);

router.get(
  '/items/:id',
  roleMiddleware([
    UserRole.MANAGER,
    UserRole.ADMIN,
    UserRole.HOUSEKEEPING,
    UserRole.MAINTENANCE,
  ]),
  InventoryController.getItemById
);

router.put(
  '/items/:id',
  roleMiddleware([UserRole.MANAGER, UserRole.ADMIN]),
  InventoryController.updateItem
);

router.delete(
  '/items/:id',
  roleMiddleware([UserRole.ADMIN]),
  InventoryController.deleteItem
);

// Inventory Statistics and Reports
// Only managers and admins can view statistics
router.get(
  '/stats',
  roleMiddleware([UserRole.MANAGER, UserRole.ADMIN]),
  InventoryController.getInventoryStats
);

router.get(
  '/alerts/low-stock',
  roleMiddleware([UserRole.MANAGER, UserRole.ADMIN, UserRole.HOUSEKEEPING]),
  InventoryController.getLowStockAlerts
);

export { router as inventoryRoutes };
