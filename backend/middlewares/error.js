const obtenerStatus = (err) => {
  if (err.statusCode) return err.statusCode;
  if (err.status) return err.status;
  if (err.name === 'ValidationError' || err.name === 'CastError') return 400;
  if (err.code === 11000) return 409;
  return 500;
};

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = obtenerStatus(err);
  const esProduccion = process.env.NODE_ENV === 'production';

  if (esProduccion) {
    console.error(`[${statusCode}] ${err.message}`);
  } else {
  console.error(err.message, err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    data: null,
    message:
      statusCode >= 500 && esProduccion
        ? 'Ha ocurrido un error en el servidor.'
        : err.message || 'Ha ocurrido un error en el servidor.',
    stack: esProduccion ? null : err.stack,
  });
};

export default errorMiddleware;
