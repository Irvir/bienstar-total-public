import express from 'express';
import { verifyCaptcha, checkEmail, registrar, login, getMe, googleLogin } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

export default function createAuthRouter({ pool }) {
  const router = express.Router();

  router.post('/verify-captcha', (req, res) => verifyCaptcha(req, res, { pool }));
  router.post('/checkEmail', (req, res) => checkEmail(req, res, { pool }));
  router.post('/registrar', (req, res) => registrar(req, res, { pool }));
  router.post('/login', (req, res) => login(req, res, { pool }));
  // Endpoint para autenticación con Google (Firebase)
  router.post('/google', (req, res) => googleLogin(req, res, { pool }));
  router.get('/me', authenticate, (req, res) => getMe(req, res, { pool }));

  return router;
}
