import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const COSTO_BCRYPT = 12;

const crearError = (mensaje, status) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

export async function registrarUsuario({ nombre, email, password }) {
  const passwordHasheada = await bcrypt.hash(password, COSTO_BCRYPT);

  try {
    const usuario = await User.create({
      nombre,
      email: email.trim().toLowerCase(),
      password: passwordHasheada,
    });

    return usuario.toJSON();
  } catch (error) {
    if (error.code === 11000) {
      throw crearError('El email ya está registrado', 409);
    }

    throw error;
  }
}

export async function autenticar({ email, password }) {
  const usuario = await User.findOne({
    email: email.trim().toLowerCase(),
    activo: true,
  }).select('+password');

  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw crearError('Email o contraseña incorrectos', 401);
  }

  const datosUsuario = usuario.toObject();
  delete datosUsuario.password;
  return datosUsuario;
}

export function buscarUsuarioPorId(id) {
  return User.findOne({ _id: id, activo: true }).lean();
}

export function firmarToken(usuario) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }

  return jwt.sign({ sub: usuario._id.toString(), rol: usuario.rol }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}
