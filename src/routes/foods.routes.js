import express from 'express';
import { searchFoods, getFoodById, createFood, updateFood, deleteFood } from '../controllers/foods.controller.js';
import authorizeAdminFactory from '../middleware/authorizeAdmin.js';
import { authenticate } from '../middleware/auth.js';

export default function createFoodsRouter({ pool } = {}) {
  const router = express.Router();
  
  // Middleware para inyectar el pool en los controladores
  const withPool = (handler) => (req, res) => handler(req, res, { pool });
  
  // Middleware de autenticación y autorización
  const authMiddleware = [authenticate, authorizeAdminFactory(pool)];
  
  // Rutas públicas (no requieren autenticación)
  router.get('/alimentos', withPool(searchFoods));
  router.get('/alimentos/:id', withPool(getFoodById));
  
  // Rutas protegidas (requieren ser admin)
  router.post('/alimentos', authMiddleware, withPool(createFood));
  router.put('/alimentos/:id', authMiddleware, withPool(updateFood));
  router.delete('/alimentos/:id', authMiddleware, withPool(deleteFood));

  return router;
}
