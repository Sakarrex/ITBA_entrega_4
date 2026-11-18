# Trabajo integrador Fullstack Developer 2026 - ITBA

Repositorio para el trabajo integrador grupal del grupo 6 Comisión 1 TT. Consiste en una página de e-commerce para una mueblería ficticia: Hermanos Jota.

Esta es la **Tercera entrega**: A la aplicación de react creada en la entrega 2 se le añadieron: Almacenamiento de datos en base de datos MongoDB loca (Corriendo dentro de docker para compatibilidad), Axios para las llamadas de la API Backend y React hook form y Yup para la validación de modelos.

Integrantes:

- Contreras Valentin Ramiro
- Dorado Escudero Facundo
- García Fontana Sebastián José
- Ramírez Lautaro Agustín
- Retamozo Sequeira Jorge Nicolas

## Ejecución

Se necesita Node.js y npm instalados. Para clonar el repositorio e instalar las
dependencias de la raíz, el backend y el cliente, además de levantar MongoDB,
se necesita Docker Desktop (con el motor de Docker iniciado). Antes de ejecutar
la instalación, crear el archivo local de variables de entorno:

```bash
git clone https://github.com/Sakarrex/ITBA_entrega_3.git
cd ITBA_entrega_3
cp .env.example .env
npm run install:all
```

En PowerShell, usar `Copy-Item .env.example .env` en lugar de `cp`. El archivo
`.env` contiene credenciales locales de desarrollo y no se sube al repositorio;
`.env.example` sí está versionado. Cambiar las credenciales locales si fuera
necesario y mantener sincronizados `MONGO_ROOT_USERNAME`,
`MONGO_ROOT_PASSWORD` y `MONGODB_URI`.

`npm run install:all` instala las dependencias y ejecuta `docker compose up -d
--wait` para iniciar el contenedor MongoDB. Para operar la base por separado:

```bash
npm run db:up
npm run db:down
```

`db:down` detiene y elimina el contenedor, pero conserva los datos del volumen
Docker `mongodb_data`.

El catálogo actual está definido en `backend/data/productos.js`. El seed copia
el catálogo a MongoDB y crea o actualiza el administrador usando `ADMIN_EMAIL`
y `ADMIN_PASSWORD` del archivo `.env`:

```bash
npm run db:seed
```

El seed inserta o actualiza los productos por nombre y el usuario administrador
por email. La contraseña del administrador se guarda hasheada con bcrypt. Se
puede ejecutar más de una vez; no elimina productos ajenos al catálogo fuente.
El registro de usuarios públicos asigna el rol `cliente`; el rol `admin` se
asigna al usuario configurado por el seed.

Para iniciar el backend y el cliente juntos:

```bash
npm run dev
```

El frontend queda disponible normalmente en `http://localhost:5173` y el
backend en `http://localhost:3000`. Vite redirige las llamadas a `/api` al
backend durante el desarrollo.

También se puede iniciar cada parte por separado, desde la raíz:

```bash
# Frontend
npm run dev --prefix client

# Backend
npm run dev --prefix backend
```

Para comprobar que el backend responde:

```bash
curl http://localhost:3000/api/health
```

En Windows también se puede usar `curl.exe`:

```powershell
curl.exe http://localhost:3000/api/health
```

Para ejecutar el lint del monorepo y generar el build del frontend:

```bash
npm run lint
npm run build --prefix client
```

El backend usa el puerto `3000` por defecto. Para cambiarlo, definir la
variable de entorno `PORT` antes de iniciar el backend. Por ejemplo, en
PowerShell:

```powershell
$env:PORT=4000; npm run dev --prefix backend
```

Si se cambia el puerto, también hay que actualizar el `proxy` en
`client/vite.config.js`. Para ejecutar el backend sin recarga automática,
usar `npm start --prefix backend`.

La primera entrega sigue desplegada en https://muebleria-hermanos.netlify.app/

## Funcionalidades

- Catálogo de productos cargado desde la API, con estados de carga y error
- Carrusel de productos destacados en la página de inicio
- Vista de detalle de cada producto con material, medidas, acabado y stock
- Carrito de compras: agregar productos, modificar cantidades, quitar productos, vaciar el carrito y ver el total
- Contador del carrito en la barra de navegación
- El carrito se conserva al recargar la página (persistencia en `localStorage`)
- Formulario de contacto con campos controlados, validación en frontend y mensaje de éxito (el envío es simulado, no se guarda en el backend)
- Diseño responsive para distintos tamaños de pantalla

## Tecnologías utilizadas

- React 19 y Vite
- React Router DOM
- Node.js y Express 5
- dotenv
- Helmet y CORS
- MongoDB 8 en Docker Compose
- Mongoose 8.24.7 o superior para el script de seed
- Yup y React Hook Form
- Axios para las llamadas HTTP del cliente
- CSS3
- ESLint para análisis estático y linting
- Prettier para el formato del código
- Husky para ejecutar verificaciones automáticas en los commits
- Git y GitHub para control de versiones

## Seguridad de dependencias

Antes de actualizar paquetes o desplegar, revisar las dependencias de producción:

```bash
npm audit --omit=dev --prefix backend
npm audit --omit=dev --prefix client
```

Las vulnerabilidades conocidas deben corregirse en las dependencias runtime.
Las correcciones actuales mantienen Mongoose en la línea `8.24.x`, `qs` en
`6.16.1` o superior y Zod en `4.6.6` o superior. Backend y cliente utilizan
overrides o rangos de versión para evitar que los lockfiles vuelvan a resolver
las versiones inseguras transitivas conocidas.

## API

Todas las respuestas tienen el formato `{ success, data, message }`.

| Método | Ruta                 | Acceso                     | Descripción                          |
| ------ | -------------------- | -------------------------- | ------------------------------------ |
| POST   | `/api/auth/registro` | Público                    | Registra un cliente (`201`)          |
| POST   | `/api/auth/login`    | Público                    | Inicia sesión y entrega un JWT       |
| GET    | `/api/auth/perfil`   | JWT válido                 | Devuelve el perfil del usuario       |
| GET    | `/api/productos`     | Público                    | Lista los productos                  |
| GET    | `/api/productos/:id` | Público                    | Producto por id (`404` si no existe) |
| POST   | `/api/productos`     | JWT válido con rol `admin` | Crea un producto                     |
| PUT    | `/api/productos/:id` | JWT válido con rol `admin` | Actualiza un producto                |
| DELETE | `/api/productos/:id` | JWT válido con rol `admin` | Desactiva un producto                |

El login responde con el token en `data.token` y el usuario en `data.usuario`.
En las rutas protegidas se envía `Authorization: Bearer <token>`. El JWT incluye
el id del usuario como `sub` y su `rol`; su duración se configura con
`JWT_EXPIRES_IN` (el ejemplo de entorno configura `1d`). Las contraseñas se
guardan hasheadas con bcrypt. El registro no inicia sesión automáticamente.
Los errores de autenticación y autorización usan `401` y `403`,
respectivamente; un email ya registrado devuelve `409`.

El middleware global de CORS atiende los preflight `OPTIONS` antes de las rutas.
Los ejemplos manuales de autenticación y autorización están en
`backend/requests/auth.http`; usan `AUTH_TEST_EMAIL`, `AUTH_TEST_PASSWORD` y
`JWT_EXPIRED_TOKEN` para los casos de prueba.

## Estructura del proyecto

- `backend/server.js`: punto de entrada del servidor Express
- `backend/controllers/`: lógica de cada endpoint
- `backend/middlewares/`: middlewares del servidor, incluido el manejador centralizado de errores
- `backend/data/`: datos locales de los productos
- `backend/models/product.js`: esquema de Mongoose para documentos de productos en la colección `productos`
- `backend/scripts/seed.js`: carga el catálogo y crea o actualiza el administrador
- `backend/models/user.js`: esquema de usuario y contraseña no seleccionada por defecto
- `backend/services/auth.service.js`: registro, login y firma de JWT
- `backend/routes/auth.routes.js`: rutas de registro, login y perfil
- `backend/requests/auth.http`: ejemplos de pruebas manuales de autenticación
- `compose.yaml`: servicio MongoDB y volumen persistente de desarrollo
- `.env.example`: plantilla de configuración local (copiar a `.env`)
- `client/src/App.jsx`: estado global (productos y carrito) y definición de rutas
- `client/src/shared/components/`: componentes reutilizables (`navbar/`, `footer/` y `product-card/`)
- `client/src/pages/`: vistas principales
  - `home-page/home-page.jsx`: inicio con carrusel de destacados
  - `product-list/products-page.jsx`: catálogo completo
  - `product-list/components/ProductList.jsx`: lista de productos
  - `product-detail/product-detail-page.jsx`: detalle de un producto (`/productos/:productoId`)
  - `product-detail/components/ProductDetail.jsx`: detalle y especificaciones del producto
  - `cart-page/cart-page.jsx`: revisión del carrito, gestión de cantidades y total de compra
  - `contact-page/contact-page.jsx`: formulario de contacto
- `client/src/services/`: llamadas a la API centralizadas con `fetch`

## Decisiones técnicas

- **Estado en `App.jsx`:** productos y carrito se comparten con las páginas mediante el contexto del `Outlet` de React Router, sin agregar librerías de estado.
- **Persistencia del carrito:** al iniciar, el carrito se lee de `localStorage` (clave `muebleria_carrito`) y un `useEffect` lo guarda cada vez que cambia. Si los datos guardados están dañados, el carrito empieza vacío.
- **Llamadas a la API en `services/`:** los componentes no conocen las URLs ni el formato de respuesta.
- **Proxy de Vite:** el cliente llama a rutas relativas (`/api/...`) y Vite las reenvía al backend, evitando problemas de CORS en desarrollo.
- **Modelo de productos:** Mongoose define la estructura y validaciones de los documentos en `backend/models/product.js`; los servicios de producto usan ese modelo para consultar y modificar MongoDB.
- **Url de imagen en formulario de objetos:** Los formularios para crear y editar productos se colocan la url dentro del pryecto. Esto no es lo ideal desde el punto de vista del usuario, ya que se tendira que almacenar en un servicio de 3ros las imagenes para mejor disponibilidad. Pero por motivos de tiempo y simpleza se deja esta modalidad para la entrega.
