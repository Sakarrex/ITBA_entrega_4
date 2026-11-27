import {
  crearPedido,
  listarPedidosDeUsuario,
} from '../services/pedidos.service.js';

export async function postCrearPedido(req, res, next) {
  try {
    const usuarioId = req.usuario._id || req.usuario.id || req.usuario.sub;
    const pedido = await crearPedido(usuarioId, req.body.items);

    return res.status(201).json({
      success: true,
      data: pedido,
      message: 'Pedido creado correctamente',
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMisPedidos(req, res, next) {
  try {
    const usuarioId = req.usuario._id || req.usuario.id || req.usuario.sub;
    const pedidos = await listarPedidosDeUsuario(usuarioId);

    return res.status(200).json({
      success: true,
      data: pedidos,
      message: 'Pedidos obtenidos correctamente',
    });
  } catch (err) {
    return next(err);
  }
}