import express from 'express';
import {
  uploadImage,
  listFoods,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/adminFoods.controller.js';

export default function createAdminFoodsRouter({ pool, upload }) {
  const router = express.Router();

  // Subir imagen (usa multer upload pasado desde server.js)
  router.post('/upload-image', upload.single('image'), (req, res) => uploadImage(req, res, { pool }));

  // Listar alimentos
  router.get('/', (req, res) => listFoods(req, res, { pool }));

  // Crear alimento
  router.post('/', (req, res) => createFood(req, res, { pool }));

  // Actualizar alimento
  router.put('/:id', (req, res) => updateFood(req, res, { pool }));

  // Eliminar alimento
  router.delete('/:id', (req, res) => deleteFood(req, res, { pool }));

  return router;
}
