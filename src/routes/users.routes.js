import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import * as weightLogsController from '../controllers/weightLogs.controller.js';
import { authenticate } from '../middleware/auth.js';

export default function createUsersRouter({ pool } = {}) {
  const router = express.Router();

  // ═══════════════════════════════════════════
  // 🌐 RUTAS PÚBLICAS (sin token)
  // ═══════════════════════════════════════════
  
  // Pesos del usuario (el userId viene en la URL)
  router.get('/:id/weights', (req, res) => weightLogsController.listWeightLogs(req, res, { pool }));
  router.post('/:id/weights', (req, res) => weightLogsController.createWeightLog(req, res, { pool }));
  router.patch('/:id/weights/:weightId', (req, res) => weightLogsController.updateWeightLog(req, res, { pool }));
  router.delete('/:id/weights/:weightId', (req, res) => weightLogsController.deleteWeightLog(req, res, { pool }));
  
  // Ver/editar perfil propio
  router.get('/:id', (req, res) => usersController.getUserById(req, res, { pool }));
  router.patch('/:id', (req, res) => usersController.patchUserFields(req, res, { pool }));
  router.patch('/transactional/:id', (req, res) => usersController.patchUserTransactional(req, res, { pool }));

  // ═══════════════════════════════════════════
  // 🔒 RUTAS PROTEGIDAS (requieren token - admin)
  // ═══════════════════════════════════════════
  
  // Listar todos los usuarios
  router.get('/', authenticate, (req, res) => usersController.getUsers(req, res, { pool }));
  // Crear usuario
  router.post('/', authenticate, (req, res) => usersController.createUser(req, res, { pool }));
  // Desactivar/Activar cuenta
  router.post('/:id/deactivate', authenticate, (req, res) => usersController.deactivateUser(req, res, { pool }));
  router.post('/:id/activate', authenticate, (req, res) => usersController.activateUser(req, res, { pool }));
  // Eliminar usuario
  router.delete('/:id', authenticate, (req, res) => usersController.deleteUser(req, res, { pool }));

  return router;
}