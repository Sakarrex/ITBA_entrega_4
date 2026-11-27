import * as yup from 'yup';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const pedidoSchema = yup
  .object({
    items: yup
      .array()
      .of(
        yup
          .object({
            productoId: yup
              .string()
              .trim()
              .matches(objectIdRegex, 'El productoId debe ser un ObjectId válido')
              .required('El productoId es obligatorio'),
            cantidad: yup
              .number()
              .integer('La cantidad debe ser un número entero')
              .min(1, 'La cantidad mínima es 1')
              .max(99, 'La cantidad máxima es 99')
              .required('La cantidad es obligatoria'),
          })
          .noUnknown(true)
      )
      .min(1, 'Debe enviar al menos un producto')
      .max(50, 'No se pueden enviar más de 50 ítems por pedido')
      .required('Los ítems son obligatorios'),
  })
  .noUnknown(true);