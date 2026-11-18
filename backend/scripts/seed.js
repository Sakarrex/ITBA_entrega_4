import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'node:url';
import { PRODUCTOS } from '../data/productos.js';
import User from '../models/user.js';

dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
});

const seedProducts = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Falta definir MONGODB_URI en el archivo .env');
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Falta definir ADMIN_EMAIL y ADMIN_PASSWORD en el archivo .env'
    );
  }

  const connection = mongoose.createConnection(uri);

  try {
    await connection.asPromise();

    const operations = PRODUCTOS.map((producto) => {
      const datos = { ...producto, activo: true };
      delete datos._id;

      return {
        updateOne: {
          filter: { nombre: datos.nombre },
          update: { $set: datos },
          upsert: true,
        },
      };
    });

    const result = await connection
      .collection('productos')
      .bulkWrite(operations);

    const Usuario = connection.model(User.modelName, User.schema);
    const passwordHasheada = await bcrypt.hash(adminPassword, 12);
    const nombreAdmin =
      process.env.ADMIN_NAME?.trim() || adminEmail.split('@')[0];

    await Usuario.findOneAndUpdate(
      { email: adminEmail },
      {
        $set: {
          nombre: nombreAdmin,
          email: adminEmail,
          password: passwordHasheada,
          rol: 'admin',
          activo: true,
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(
      `Productos: ${result.upsertedCount} insertados, ${result.modifiedCount} actualizados.`
    );
    console.log(`Usuario admin configurado: ${adminEmail}`);
  } catch (error) {
    console.error('No se pudo completar el seed:', error);
    process.exitCode = 1;
  } finally {
    await connection.close();
  }
};

await seedProducts();
