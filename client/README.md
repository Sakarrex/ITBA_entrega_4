# Cliente Muebleria Jota

Aplicacion frontend construida con React 19, Vite y React Router DOM.

Para ejecutar el cliente desde la raiz del monorepo:

```bash
npm run dev --prefix client
npm run build --prefix client
npm run lint --prefix client
```

Las llamadas HTTP se centralizan en `src/services/` y los formularios usan
React Hook Form con Yup. La dependencia Zod se mantiene en `4.6.6` o superior
mediante el override definido en `package.json`.
