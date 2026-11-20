# Módulo Perfil — prompt para tu asistente de IA

## Mensaje de arranque (pégalo tal cual en tu herramienta de IA)

> Estoy en el proyecto Ruta Esmeralda, que ya tengo abierto en esta carpeta. Lee `AGENTS.md`, `README.md` y `docs/prompt-perfil.md`, y haz lo que pide ese documento. **Antes de escribir código**, resúmeme tu plan en 5 puntos o menos, dime qué archivos vas a crear o modificar, y espera a que yo lo apruebe.

---

## Contexto (para la IA)

Ruta Esmeralda es una PWA turística de Villahermosa, Tabasco. Stack: Next.js (App Router, **JavaScript**, sin TypeScript) + Tailwind CSS 4 + Supabase (Postgres, Auth, Storage). La interfaz y los comentarios van en **español**. Lee `AGENTS.md`: ahí están las reglas del proyecto y son obligatorias. La versión de Next es nueva (16): `params`, `searchParams` y `cookies()` son asíncronos y se usa `await`; antes de usar una API de Next que no conozcas, consulta `node_modules/next/dist/docs/`.

El estudiante que te usa es responsable de este módulo y **no conoce todo el proyecto**: explícale en español sencillo lo que haces y por qué.

## Tu tarea: la pantalla Perfil (`/perfil`)

Hoy `/perfil` es una página provisional que solo muestra nombre, correo y rol. Construye el perfil completo de la persona.

### Ya existe (no lo rehagas)

- La ruta `/perfil` **ya exige sesión** (lo hace `src/lib/supabase/proxy.js`). No agregues otra protección.
- `getSesion()` (`src/services/sesion.js`) devuelve `{ id, correo, nombre, rol, avatarUrl, tipoEstancia }`. **No cambies lo que devuelve** (solo se pueden agregar campos).
- `cerrarSesion` en `src/services/auth.js` (Server Action). Úsala tal cual para "Cerrar sesión".
- `src/lib/storage.js`: `subirImagen`, `eliminarImagenes`, `rutaDesdeUrl`, `validarImagen`, `BUCKETS`. Para fotos de perfil: bucket `avatares`, máximo 2 MB, JPG/PNG/WebP.
- `BotonEliminarResena` (`src/components/lugares/BotonEliminarResena.js`), `Estrellas`, `Button`, `Card`, `Input`, `Modal`, `estiloCategoria()` y `getCategorias()`.
- Ejemplos de Server Actions con formularios: `src/services/auth.js` y `src/components/auth/LoginForm.js` (patrón `useActionState`).

### Qué debes construir

La página tiene varias secciones. Constrúyelas en este orden, una por una, comprobando que cada una funciona antes de pasar a la siguiente:

1. **Datos personales.** Muestra el correo (solo lectura) y el rol como etiqueta. Permite editar **nombre** y **tipo de estancia** (`turista` o `nuevo_habitante`; las dos opciones con etiquetas claras en español, y "sin definir" si es `null`). Hazlo con una **Server Action** en `src/services/perfil.js` (patrón de `services/auth.js`): valida (nombre no vacío, máximo 60 caracteres, tipo válido), actualiza la tabla `perfiles` con el cliente de servidor y llama a `revalidatePath("/", "layout")` para que el Header se actualice. Muestra mensajes de éxito y de error.

   ```js
   const { error } = await supabase.from("perfiles").update({ nombre, tipo_estancia }).eq("id", sesion.id);
   ```

   ⚠️ La base **solo permite editar estas 3 columnas del propio perfil**: `nombre`, `avatar_url` y `tipo_estancia`. Intentar cambiar `rol` da error a propósito: nadie puede cambiarse el rol.

2. **Foto de perfil.** Componente cliente (`"use client"`) en `src/components/perfil/` que elige una imagen, la valida con `validarImagen(archivo, "avatares")`, la sube con `subirImagen({ bucket: BUCKETS.avatares, carpeta: sesion.id, archivo })`, guarda la URL con el cliente de navegador (`createClient` de `@/lib/supabase/client`):

   ```js
   await supabase.from("perfiles").update({ avatar_url: url }).eq("id", sesion.id);
   ```

   y después borra la foto anterior (`rutaDesdeUrl(urlAnterior, BUCKETS.avatares)` + `eliminarImagenes`) y llama a `router.refresh()`. **No uses `upsert`**: no hay permiso de reemplazar archivos; siempre sube uno nuevo y borra el viejo. Si no hay foto, muestra la inicial del nombre en un círculo verde (como en el Header).

3. **Mis intereses.** Botones de categorías (los de las 7 categorías de `getCategorias()`, con el color de `estiloCategoria`) que la persona activa o desactiva. Se guardan en la tabla `perfil_intereses`. Se hace desde el navegador (cliente de `@/lib/supabase/client`) con actualización inmediata en pantalla (y se revierte si falla):

   ```js
   // activar
   await supabase.from("perfil_intereses").insert({ usuario_id: sesion.id, categoria_id });
   // desactivar
   await supabase.from("perfil_intereses").delete().eq("usuario_id", sesion.id).eq("categoria_id", categoria_id);
   ```

   ⚠️ A diferencia de favoritos y reseñas, en `perfil_intereses` **hay que enviar `usuario_id` explícitamente** (no se llena solo). Para leerlos: `supabase.from("perfil_intereses").select("categoria_id")` (RLS ya limita a los propios). Agrega `getInteresesIds()` en `src/services/perfil.js`.

4. **Mis reseñas.** Lista de las reseñas que escribió la persona: nombre del lugar (enlace a `/lugar/<slug>`), estrellas, fecha, comentario, fotos y el botón de eliminar (reutiliza `BotonEliminarResena` con `resenaId` y `fotos` = lista de URLs). Esta consulta ya está probada y funciona; agrégala como `getMisResenas()` en `src/services/perfil.js`:

   ```js
   const { data, error } = await supabase
     .from("resenas")
     .select("id, calificacion, comentario, created_at, lugar_id, lugares(nombre, slug), resena_fotos(id, url)")
     .eq("usuario_id", sesion.id)
     .order("created_at", { ascending: false });
   ```

   Si `lugares` viniera vacío (un lugar que ya no está publicado), no rompas la página. Estado vacío amable con botón a `/explorar`.

5. **Cambiar contraseña.** Formulario (Server Action) con contraseña nueva y confirmación, mínimo 8 caracteres, que usa `supabase.auth.updateUser({ password })` con el cliente de servidor. Traduce los errores a mensajes en español claros.

6. **Accesos y sesión.** Si el rol es `admin`, un botón al panel `/admin`; si es `establecimiento`, a `/establecimiento`. Botón "Cerrar sesión" con `cerrarSesion`.

7. **Foto en el Header.** En `src/components/layout/Header.js`, si `sesion.avatarUrl` existe, muestra esa foto (con `next/image`, 32×32, redonda) en lugar de la inicial. Es el **único** cambio permitido en ese archivo, y debe mencionarse en el Pull Request. (`next.config.mjs` ya permite imágenes del Storage de Supabase.)

### Archivos que puedes crear o modificar

- Crear: `src/components/perfil/*` (formularios y vistas), `src/services/perfil.js`.
- Reemplazar: `src/app/(usuario)/perfil/page.js`.
- Modificar (solo lo indicado): `src/components/layout/Header.js` (foto).
- **No toques** nada más sin preguntar: `ui/*`, `sesion.js`, `auth.js`, `lugares.js`, `storage.js`, `package.json`, migraciones ni `next.config.mjs`. Si necesitas una función nueva de storage, pregúntalo.

### Datos y permisos que debes conocer

- `perfiles`: la persona solo ve y edita **su propia fila**, y solo las columnas `nombre`, `avatar_url`, `tipo_estancia`. Para mostrar nombres de otras personas existe la vista `perfiles_publicos`.
- `perfil_intereses`: `usuario_id` + `categoria_id` (clave compuesta: no se puede repetir un interés; el código de error de duplicado es `23505`). Solo se ven y editan los propios.
- Bucket `avatares`: se sube y se borra **solo dentro de la carpeta propia** (`<id-de-la-persona>/archivo`).
- Si necesitas algo que la base no ofrece, **no la modifiques**: propón un archivo nuevo en `supabase/migrations/` y pregunta.

## Criterios de aceptación

- [ ] Se puede cambiar el nombre y el tipo de estancia, y el Header muestra el nombre nuevo sin cerrar sesión.
- [ ] Se puede subir una foto de perfil (JPG/PNG/WebP, máx. 2 MB); aparece en el perfil y en el Header; al cambiarla, la anterior se borra del Storage.
- [ ] Un archivo no válido (PDF, o de más de 2 MB) muestra un mensaje claro y no sube nada.
- [ ] Los intereses se activan y desactivan al instante y se conservan al recargar.
- [ ] "Mis reseñas" lista las reseñas propias con su lugar y permite eliminar (con confirmación).
- [ ] Cambiar contraseña funciona; las contraseñas que no coinciden o son cortas dan mensajes claros.
- [ ] Un usuario normal no ve botones de admin ni de establecimiento.
- [ ] Se ve bien en celular (390 px) y en escritorio (1280 px); campos con etiquetas y botones accesibles por teclado.
- [ ] `npm run lint` y `npm run build` terminan sin errores; sin `console.log` olvidados.

## Cómo probarlo a mano

1. Crea tu cuenta en `/registro` e inicia sesión; entra a `/perfil`.
2. Cambia el nombre y el tipo de estancia; revisa el Header.
3. Sube una foto; cámbiala por otra (la vieja debe desaparecer de Supabase → Storage → `avatares`).
4. Activa y desactiva intereses; recarga.
5. Escribe una reseña en cualquier lugar (`/lugar/...`) y verifica que aparece en "Mis reseñas"; elimínala desde ahí.
6. Cambia tu contraseña, cierra sesión y entra con la nueva.

## Entrega

Trabaja en una rama `feature/perfil-completo` (o varias ramas pequeñas: `feature/perfil-datos`, `feature/perfil-avatar`, …), haz commits pequeños en español (`feat: ...`), corre lint y build, y abre un Pull Request con capturas (celular y escritorio). Menciona qué archivos compartidos tocaste (por ejemplo, `Header.js`).
