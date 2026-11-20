# Módulo Favoritos — prompt para tu asistente de IA

## Mensaje de arranque (pégalo tal cual en tu herramienta de IA)

> Estoy en el proyecto Ruta Esmeralda, que ya tengo abierto en esta carpeta. Lee `AGENTS.md`, `README.md` y `docs/prompt-favoritos.md`, y haz lo que pide ese documento. **Antes de escribir código**, resúmeme tu plan en 5 puntos o menos, dime qué archivos vas a crear o modificar, y espera a que yo lo apruebe.

---

## Contexto (para la IA)

Ruta Esmeralda es una PWA turística de Villahermosa, Tabasco. Stack: Next.js (App Router, **JavaScript**, sin TypeScript) + Tailwind CSS 4 + Supabase (Postgres, Auth, Storage). La interfaz y los comentarios van en **español**. Lee `AGENTS.md`: ahí están las reglas del proyecto y son obligatorias. La versión de Next es nueva (16): `params`, `searchParams` y `cookies()` son asíncronos y se usa `await`; antes de usar una API de Next que no conozcas, consulta `node_modules/next/dist/docs/`.

El estudiante que te usa es responsable de este módulo y **no conoce todo el proyecto**: explícale en español sencillo lo que haces y por qué.

## Tu tarea: la pantalla Favoritos (`/favoritos`)

Hoy `/favoritos` es una página provisional. Construye la pantalla real donde cada persona ve los lugares que guardó con el corazón.

### Ya existe (no lo rehagas)

- La ruta `/favoritos` **ya exige sesión**: el `proxy` (`src/lib/supabase/proxy.js`) manda a `/login` a quien no ha iniciado sesión. No agregues otra protección.
- `BotonFavorito` (`src/components/lugares/BotonFavorito.js`): el corazón que guarda o quita un favorito en la tabla `favoritos`.
- `TarjetaLugar` (`src/components/lugares/TarjetaLugar.js`): la tarjeta de un lugar. Recibe `lugar`, `categoria`, `favorito`, `haySesion`.
- `getFavoritosIds()` en `src/services/favoritos.js`: devuelve los ids guardados. **No lo modifiques**: lo usa el inicio.
- `getSesion()` (`src/services/sesion.js`), `getCategorias()` (`src/services/categorias.js`), `estiloCategoria()` (`src/lib/categorias-estilo.js`).

### Qué debes construir

1. **Servicio `getFavoritos()`** — agrégalo al final de `src/services/favoritos.js`. Devuelve los lugares guardados por la persona, **del guardado más reciente al más antiguo**. Esta forma de consultar ya está probada y funciona:

   ```js
   export async function getFavoritos() {
     const sesion = await getSesion();
     if (!sesion) return [];

     const supabase = await createClient();
     const { data: guardados, error } = await supabase
       .from("favoritos")
       .select("lugar_id, created_at")
       .order("created_at", { ascending: false });
     if (error) throw new Error(`No se pudieron cargar los favoritos: ${error.message}`);
     if (guardados.length === 0) return [];

     const { data: lugares, error: errorLugares } = await supabase
       .from("lugares_resumen")
       .select(
         "id, nombre, slug, descripcion, categoria_id, categoria, direccion, latitud, longitud, portada_url, calificacion_promedio, total_resenas",
       )
       .in("id", guardados.map((g) => g.lugar_id));
     if (errorLugares) throw new Error(`No se pudieron cargar los lugares: ${errorLugares.message}`);

     const porId = new Map(lugares.map((l) => [l.id, l]));
     // Si un lugar guardado ya no está publicado, simplemente no aparece (no es un error).
     return guardados.filter((g) => porId.has(g.lugar_id)).map((g) => ({ ...porId.get(g.lugar_id), guardadoEn: g.created_at }));
   }
   ```

2. **Página** `src/app/(usuario)/favoritos/page.js` (Server Component): pide `getFavoritos()`, `getCategorias()` y `getSesion()` y pasa los datos a una vista. Sigue el patrón de `src/app/(usuario)/explorar/page.js` (la página pide datos; un componente de vista dibuja).
3. **Vista** `src/components/favoritos/FavoritosVista.js`:
   - Título en el estilo de las otras pantallas (`text-2xl font-extrabold uppercase tracking-tight text-esmeralda-900`): "Mis favoritos", con el conteo ("3 lugares guardados").
   - Cuadrícula de `TarjetaLugar` (2 columnas en celular, 3 en tableta, 4 en escritorio), con `favorito={true}`.
   - **Filtro por categoría** con botones como en Explorar (reutiliza `estiloCategoria`), usando `?categoria=slug` en la dirección. Solo muestra las categorías que tengan al menos un favorito.
   - **Estado vacío** amable ("Aún no tienes favoritos") con un botón a `/explorar`.
4. **Quitar un favorito desde esta pantalla** debe hacer que la tarjeta **desaparezca sin recargar a mano**. Para lograrlo, agrega una prop **opcional** `onCambio` a `BotonFavorito` (la llama con `true`/`false` cuando el cambio se guardó bien) y pásala desde `TarjetaLugar` con otra prop opcional. Es un cambio en archivos compartidos: debe ser **solo aditivo** (sin `onCambio` todo se comporta exactamente igual que hoy) y hay que mencionarlo en el Pull Request. Una forma sencilla: que la vista (Client Component) llame a `router.refresh()`; otra: mantener la lista en estado local.
5. **Opcional, si queda tiempo:** un mapa con los favoritos usando el componente `Mapa` (`src/components/mapa/Mapa.js`, props `lugares` y `categorias`).

### Archivos que puedes crear o modificar

- Crear: `src/app/(usuario)/favoritos/page.js` (reemplaza el provisional), `src/components/favoritos/FavoritosVista.js` (y los que necesites dentro de `src/components/favoritos/`).
- Modificar: `src/services/favoritos.js` (**solo agregar** funciones), y —solo aditivo— `BotonFavorito.js` y `TarjetaLugar.js`.
- **No toques** nada más sin preguntar: `Header`, `ui/*`, `sesion.js`, `lugares.js`, `package.json`, migraciones ni `next.config.mjs`.

### Datos y permisos que debes conocer

- Tabla `favoritos`: `usuario_id`, `lugar_id`, `created_at`. La persona solo puede ver, crear y borrar **sus** favoritos (RLS). `usuario_id` se llena solo desde la sesión.
- `lugares_resumen` es una vista que solo muestra lugares **publicados** y trae `categoria` y `calificacion_promedio`.
- Si necesitas algo que la base no ofrece, **no la modifiques**: propón un archivo nuevo en `supabase/migrations/` y pregunta.

## Criterios de aceptación

- [ ] `/favoritos` sin sesión redirige a `/login` (ya lo hace el proxy; compruébalo).
- [ ] Con sesión y sin favoritos, se ve el estado vacío con botón a Explorar.
- [ ] Con favoritos, se ven en orden de más reciente a más antiguo, con su portada, categoría y calificación.
- [ ] Quitar un favorito (corazón) hace desaparecer la tarjeta y baja el conteo, sin recargar a mano.
- [ ] El filtro por categoría funciona y se conserva en la dirección.
- [ ] Se ve bien en celular (390 px) y en escritorio (1280 px); los botones se pueden usar con teclado y tienen texto accesible.
- [ ] `npm run lint` y `npm run build` terminan sin errores.
- [ ] No hay `console.log` olvidados ni código comentado sobrante.

## Cómo probarlo a mano

1. Crea tu cuenta en `/registro` e inicia sesión.
2. Desde `/explorar` marca 3 o 4 lugares con el corazón.
3. Entra a `/favoritos`: verifica el orden, el conteo y el filtro por categoría.
4. Quita uno: debe desaparecer. Recarga la página: sigue sin estar.
5. Quita todos: debe aparecer el estado vacío.
6. Cierra sesión y abre `/favoritos`: debe llevarte al login y, al entrar, regresarte a `/favoritos`.

## Entrega

Trabaja en una rama `feature/favoritos-pagina`, haz commits pequeños en español (`feat: ...`), corre lint y build, y abre un Pull Request con capturas (celular y escritorio). Menciona en la descripción qué archivos compartidos tocaste.
