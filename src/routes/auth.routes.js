import express from 'express';
import { verifyCaptcha, checkEmail, registrar, login } from '../controllers/auth.controller.js';

export default function createAuthRouter({ pool }) {
  const router = express.Router();

  router.post('/verify-captcha', (req, res) => verifyCaptcha(req, res, { pool }));
  router.post('/checkEmail', (req, res) => checkEmail(req, res, { pool }));
  router.post('/registrar', (req, res) => registrar(req, res, { pool }));
  router.post('/login', (req, res) => login(req, res, { pool }));

  return router;
}
