import { Router } from 'express';
import requireAuth from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { pedidoSchema } from '../validators/pedido.js';
import {
  postCrearPedido,
  getMisPedidos,
} from '../controllers/pedidos.controller.js';

const router = Router();

router.post('/', requireAuth, validate(pedidoSchema), postCrearPedido);
router.get('/mis-pedidos', requireAuth, getMisPedidos);

export default router;