import Pedido from '../models/pedido.js';
import Product from '../models/product.js';

function crearError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function consolidarItems(items) {
  const mapa = new Map();

  for (const item of items) {
    const clave = String(item.productoId);
    const actual = mapa.get(clave) || 0;
    mapa.set(clave, actual + item.cantidad);
  }

  return Array.from(mapa.entries()).map(([productoId, cantidad]) => ({
    productoId,
    cantidad,
  }));
}

async function revertirStock(descontados) {
  for (const { productoId, cantidad } of descontados) {
    try {
      await Product.updateOne(
        { _id: productoId },
        { $inc: { stock: cantidad } }
      );
    } catch {
      // Intento de compensación ante fallo parcial
    }
  }
}

export async function crearPedido(usuarioId, items) {
  const itemsConsolidados = consolidarItems(items);
  const ids = itemsConsolidados.map((item) => item.productoId);

  const productosDb = await Product.find({
    _id: { $in: ids },
    activo: { $ne: false },
  });

  const porId = new Map(productosDb.map((prod) => [String(prod._id), prod]));

  for (const item of itemsConsolidados) {
    if (!porId.has(item.productoId)) {
      throw crearError(404, `Producto no encontrado: ${item.productoId}`);
    }
  }

  for (const item of itemsConsolidados) {
    const prod = porId.get(item.productoId);
    if (prod.stock < item.cantidad) {
      throw crearError(409, `Stock insuficiente para ${prod.nombre}`);
    }
  }

  const descontados = [];
  const itemsSnapshot = [];
  let total = 0;

  try {
    for (const item of itemsConsolidados) {
      const prod = porId.get(item.productoId);

      const actualizado = await Product.findOneAndUpdate(
        { _id: prod._id, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );

      if (!actualizado) {
        throw crearError(409, `Stock insuficiente para ${prod.nombre}`);
      }

      descontados.push({ productoId: prod._id, cantidad: item.cantidad });

      const precioUnitario = Number(prod.precio);
      const subtotal = Number((precioUnitario * item.cantidad).toFixed(2));
      total = Number((total + subtotal).toFixed(2));

      itemsSnapshot.push({
        producto: prod._id,
        nombre: prod.nombre,
        precioUnitario,
        cantidad: item.cantidad,
        subtotal,
      });
    }

    const pedido = await Pedido.create({
      usuario: usuarioId,
      items: itemsSnapshot,
      total,
      estado: 'confirmado',
    });

    return pedido;
  } catch (err) {
    if (descontados.length > 0) {
      await revertirStock(descontados);
    }
    throw err;
  }
}

export async function listarPedidosDeUsuario(usuarioId) {
  return Pedido.find({ usuario: usuarioId }).sort({ createdAt: -1 });
}