import express from 'express';
import * as usersController from '../controllers/users.controller.js';

export default function createUsersRouter({ pool } = {}) {
  const router = express.Router();

  router.get('/', (req, res) => usersController.getUsers(req, res, { pool }));
  router.post('/', (req, res) => usersController.createUser(req, res, { pool }));
  // generic patch for a few fields
  router.patch('/:id', (req, res) => usersController.patchUserFields(req, res, { pool }));

  // transactional patch for complex updates (alergias etc)
  router.patch('/transactional/:id', (req, res) => usersController.patchUserTransactional(req, res, { pool }));

  router.post('/:id/deactivate', (req, res) => usersController.deactivateUser(req, res, { pool }));
  router.post('/:id/activate', (req, res) => usersController.activateUser(req, res, { pool }));
  router.delete('/:id', (req, res) => usersController.deleteUser(req, res, { pool }));
  router.get('/:id', (req, res) => usersController.getUserById(req, res, { pool }));

  return router;
}
