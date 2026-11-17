import * as yup from 'yup';

export const registroSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  email: yup
    .string()
    .trim()
    .email('El email no es válido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      'La contraseña debe contener al menos una letra y un número'
    )
    .required('La contraseña es obligatoria'),
});

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('El email no es válido')
    .required('El email es obligatorio'),
  password: yup.string().required('La contraseña es obligatoria'),
});
