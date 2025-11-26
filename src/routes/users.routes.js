import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import * as weightLogsController from '../controllers/weightLogs.controller.js';
import { authenticate } from '../middleware/auth.js';
import authorizeAdminFactory from '../middleware/authorizeAdmin.js';
import authorizeSelfOrAdminFactory from '../middleware/authorizeSelfOrAdmin.js';

export default function createUsersRouter({ pool } = {}) {
  const router = express.Router();
  const adminOnly = [authenticate, authorizeAdminFactory(pool)];
  const selfOrAdmin = [authenticate, authorizeSelfOrAdminFactory(pool)];

  // Admin: listar y crear usuarios
  router.get('/', adminOnly, (req, res) => usersController.getUsers(req, res, { pool }));
  router.post('/', adminOnly, (req, res) => usersController.createUser(req, res, { pool }));

  // Propio usuario (no requiere enviar :id)
  router.get('/me', authenticate, (req, res) => {
    req.params.id = req.user.id;
    usersController.getUserById(req, res, { pool });
  });
  router.patch('/me', authenticate, (req, res) => {
    req.params.id = req.user.id;
    usersController.patchUserFields(req, res, { pool });
  });

  // Patch genérico por id (self-or-admin)
  router.patch('/:id', selfOrAdmin, (req, res) => usersController.patchUserFields(req, res, { pool }));

  // Patch transaccional (alergias, etc.) - self-or-admin
  router.patch('/transactional/:id', selfOrAdmin, (req, res) => usersController.patchUserTransactional(req, res, { pool }));

  // Acciones de administración (solo admin)
  router.post('/:id/deactivate', adminOnly, (req, res) => usersController.deactivateUser(req, res, { pool }));
  router.post('/:id/activate', adminOnly, (req, res) => usersController.activateUser(req, res, { pool }));
  router.delete('/:id', adminOnly, (req, res) => usersController.deleteUser(req, res, { pool }));

  // Registro de pesos (propio o admin)
  router.get('/:id/weights', selfOrAdmin, (req, res) => weightLogsController.listWeightLogs(req, res, { pool }));
  router.post('/:id/weights', selfOrAdmin, (req, res) => weightLogsController.createWeightLog(req, res, { pool }));
  router.patch('/:id/weights/:weightId', selfOrAdmin, (req, res) => weightLogsController.updateWeightLog(req, res, { pool }));
  router.delete('/:id/weights/:weightId', selfOrAdmin, (req, res) => weightLogsController.deleteWeightLog(req, res, { pool }));

  // Obtener usuario por id (self-or-admin)
  router.get('/:id', selfOrAdmin, (req, res) => usersController.getUserById(req, res, { pool }));

  return router;
}