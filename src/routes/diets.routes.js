import express from 'express';
import * as dietsController from '../controllers/diets.controller.js';
import { authenticate } from '../middleware/auth.js';

export default function createDietsRouter({ pool } = {}) {
  const router = express.Router();

  // 🌐 Rutas públicas
  router.get('/get-diet', (req, res) => dietsController.getDiet(req, res, { pool }));
  router.get('/api/calendario/:fecha', (req, res) => dietsController.getCalendar(req, res, { pool }));
  router.post('/ensure-diet', (req, res) => dietsController.ensureDiet(req, res, { pool }));
  router.post('/save-diet', (req, res) => dietsController.saveDiet(req, res, { pool }));
  router.post('/clear-day', (req, res) => dietsController.clearDay(req, res, { pool }));
  router.post('/delete-diet-item', (req, res) => dietsController.deleteDietItem(req, res, { pool }));

  return router;
}