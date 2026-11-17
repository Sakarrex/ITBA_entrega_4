import { Router } from 'express';
import {
  iniciarSesion,
  obtenerPerfil,
  registrar,
} from '../controllers/auth.controller.js';
import requireAuth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { loginSchema, registroSchema } from '../validators/auth.js';

const router = Router();

router.post('/registro', validate(registroSchema), registrar);
router.post('/login', validate(loginSchema), iniciarSesion);
router.get('/perfil', requireAuth, obtenerPerfil);

export default router;
