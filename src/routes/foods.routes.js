import express from 'express';
import { searchFoods, getFoodById } from '../controllers/foods.controller.js';

export default function createFoodsRouter({ pool } = {}) {
  const router = express.Router();

  // Búsqueda pública de alimentos: GET /food-search?q=
  router.get('/food-search', (req, res) => searchFoods(req, res, { pool }));

  // Obtener detalle de alimento: GET /food/:id
  router.get('/food/:id', (req, res) => getFoodById(req, res, { pool }));

  return router;
}
