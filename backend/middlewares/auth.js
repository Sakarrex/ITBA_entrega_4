import jwt from 'jsonwebtoken';

const crearErrorNoAutorizado = () => {
  const error = new Error('Token de autenticación no válido o ausente');
  error.status = 401;
  return error;
};

export default function requireAuth(request, response, next) {
  const authorization = request.get('authorization');
  const coincidencia = authorization?.match(/^Bearer\s+(.+)$/i);

  if (!coincidencia) {
    return next(crearErrorNoAutorizado());
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('Falta la variable de entorno JWT_SECRET'));
  }

  try {
    const payload = jwt.verify(coincidencia[1], secret);

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      !['cliente', 'admin'].includes(payload.rol)
    ) {
      return next(crearErrorNoAutorizado());
    }

    request.usuario = { sub: payload.sub, rol: payload.rol };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(crearErrorNoAutorizado());
    }

    return next(error);
  }
}
