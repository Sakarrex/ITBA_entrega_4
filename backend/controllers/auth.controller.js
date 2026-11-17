import * as authService from '../services/auth.service.js';

const enviarRespuesta = (response, status, data, message) =>
  response.status(status).json({ success: true, data, message });

export async function registrar(request, response, next) {
  try {
    const usuario = await authService.registrarUsuario(request.body);
    enviarRespuesta(response, 201, usuario, 'Usuario registrado correctamente');
  } catch (error) {
    next(error);
  }
}

export async function iniciarSesion(request, response, next) {
  try {
    const usuario = await authService.autenticar(request.body);
    const token = authService.firmarToken(usuario);

    enviarRespuesta(
      response,
      200,
      { token, usuario },
      'Sesión iniciada correctamente'
    );
  } catch (error) {
    next(error);
  }
}

export async function obtenerPerfil(request, response, next) {
  try {
    const usuario = await authService.buscarUsuarioPorId(request.usuario.sub);

    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.status = 404;
      return next(error);
    }

    enviarRespuesta(response, 200, usuario, 'Perfil obtenido correctamente');
  } catch (error) {
    next(error);
  }
}
