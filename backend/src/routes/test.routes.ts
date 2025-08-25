import { Router } from 'express';
import { TestController } from '../controllers';
import { validate } from '../middleware';
import {
  createTestSchema,
  deleteTestSchema,
  getAllTestsSchema,
  getTestByIdSchema,
  updateTestSchema,
} from '../validations/test.validation';

const router: Router = Router();
const testController: TestController = new TestController();

/**
 * @route   GET /api/v1/tests
 * @desc    Get all test records with pagination and search
 * @access  Public (can be changed to protected later)
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get('/', validate(getAllTestsSchema), (req, res) => {
  void testController.getAllTests(req, res);
});

/**
 * @route   GET /api/v1/tests/:id
 * @desc    Get a single test record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.get('/:id', validate(getTestByIdSchema), (req, res) => {
  void testController.getTestById(req, res);
});

/**
 * @route   POST /api/v1/tests
 * @desc    Create a new test record
 * @access  Public (can be changed to protected later)
 * @body    firstName, lastName
 */
router.post('/', validate(createTestSchema), (req, res) => {
  void testController.createTest(req, res);
});

/**
 * @route   PUT /api/v1/tests/:id
 * @desc    Update a test record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 * @body    firstName?, lastName? (at least one required)
 */
router.put('/:id', validate(updateTestSchema), (req, res) => {
  void testController.updateTest(req, res);
});

/**
 * @route   DELETE /api/v1/tests/:id
 * @desc    Delete a test record by ID
 * @access  Public (can be changed to protected later)
 * @param   id - MongoDB ObjectId
 */
router.delete('/:id', validate(deleteTestSchema), (req, res) => {
  void testController.deleteTest(req, res);
});

export const testRoutes = router;
