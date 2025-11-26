import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import * as weightLogsController from '../controllers/weightLogs.controller.js';
import { authenticate } from '../middleware/auth.js';

export default function createUsersRouter({ pool } = {}) {
  const router = express.Router();

  router.get('/', (req, res) => usersController.getUsers(req, res, { pool }));
  router.post('/', (req, res) => usersController.createUser(req, res, { pool }));
  // generic patch for a few fields
  router.patch('/:id', authenticate, (req, res) => usersController.patchUserFields(req, res, { pool }));

  // transactional patch for complex updates (alergias etc)
  router.patch('/transactional/:id', authenticate, (req, res) => usersController.patchUserTransactional(req, res, { pool }));

  router.post('/:id/deactivate', authenticate, (req, res) => usersController.deactivateUser(req, res, { pool }));
  router.post('/:id/activate', authenticate, (req, res) => usersController.activateUser(req, res, { pool }));
  router.delete('/:id', authenticate, (req, res) => usersController.deleteUser(req, res, { pool }));
  router.get('/:id/weights', authenticate, (req, res) => weightLogsController.listWeightLogs(req, res, { pool }));
  router.post('/:id/weights', authenticate, (req, res) => weightLogsController.createWeightLog(req, res, { pool }));
  router.patch('/:id/weights/:weightId', authenticate, (req, res) => weightLogsController.updateWeightLog(req, res, { pool }));
  router.delete('/:id/weights/:weightId', authenticate, (req, res) => weightLogsController.deleteWeightLog(req, res, { pool }));
  router.get('/:id', authenticate, (req, res) => usersController.getUserById(req, res, { pool }));

  return router;
}
