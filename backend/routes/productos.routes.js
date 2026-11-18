import { Router } from 'express';
import requireAuth, { soloRol } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { idParamSchema, productoSchema } from '../validators/producto.js';
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productos.controller.js';

const router = Router();

const soloAdmin = [requireAuth, soloRol('admin')];

router.get('/', obtenerProductos);
router.get('/:id', validate(idParamSchema, 'params'), obtenerProductoPorId);
router.post('/', ...soloAdmin, validate(productoSchema), crearProducto);
router.put(
  '/:id',
  ...soloAdmin,
  validate(idParamSchema, 'params'),
  validate(productoSchema),
  actualizarProducto
);
router.delete(
  '/:id',
  ...soloAdmin,
  validate(idParamSchema, 'params'),
  eliminarProducto
);

export default router;
