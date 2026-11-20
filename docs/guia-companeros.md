# Guía para integrantes del equipo

Esta guía te lleva de cero a tu primer cambio unido al proyecto. Léela completa una vez.

## 1. Una sola vez: preparar tu computadora

1. Instala **Node.js (versión LTS)** desde nodejs.org, **Git** desde git-scm.com y **Visual Studio Code**.
2. Crea una cuenta de **GitHub** (si no tienes) y mándale tu nombre de usuario a Fernando. Te llegará una **invitación al repositorio** por correo: acéptala.
3. Configura Git con tu nombre y correo (los mismos de GitHub):
   ```bash
   git config --global user.name "Tu Nombre"
   git config --global user.email "tu-correo@ejemplo.com"
   ```
4. Pídele a Fernando, **por mensaje privado**, los dos valores para tu `.env.local`: la *Project URL* y la *Publishable key* de Supabase.

## 2. Descargar el proyecto y arrancarlo

```bash
git clone https://github.com/<usuario>/ruta-esmeralda.git
cd ruta-esmeralda
npm install
```

Crea el archivo `.env.local` copiando el ejemplo (en PowerShell: `Copy-Item .env.example .env.local`) y pega tus dos valores:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Inicia el servidor y abre http://localhost:3000:

```bash
npm run dev
```

Crea tu propia cuenta en `/registro` para probar con sesión iniciada. **La base de datos es una sola y la usamos entre todos**: no borres ni modifiques datos que no sean tuyos.

## 3. El ciclo de cada tarea

```bash
git checkout master
git pull                                   # trae lo último
git checkout -b feature/favoritos-pagina   # tu rama (usa el nombre de tu tarea)

# ... trabajas (con o sin IA) ...

npm run lint                               # debe terminar sin errores
npm run build                              # debe terminar sin errores
git add .
git commit -m "feat: página de favoritos"
git push -u origin feature/favoritos-pagina
```

Después, en GitHub aparece el botón **Compare & pull request**: ábrelo, llena la plantilla (con capturas) y pide revisión a Fernando. **Nadie sube directo a `master`**: todo entra por Pull Request.

Mientras trabajas, trae los cambios de los demás de vez en cuando, para que no se acumulen choques:

```bash
git fetch origin
git merge origin/master
```

Si Git marca un **conflicto**, VS Code te muestra las dos versiones: elige la correcta (o combina las dos), guarda, y haz `git add .` y `git commit`. Si no entiendes un conflicto, no adivines: pregunta.

## 4. Reglas para no estorbarnos

**Cada quien trabaja en su carpeta.** Estos son los archivos de cada módulo:

| Módulo | Archivos propios |
|---|---|
| Favoritos | `src/app/(usuario)/favoritos/`, `src/components/favoritos/`, funciones **nuevas** en `src/services/favoritos.js`, y un cambio pequeño y aditivo en `BotonFavorito.js` / `TarjetaLugar.js` (se explica en su prompt) |
| Perfil | `src/app/(usuario)/perfil/`, `src/components/perfil/`, `src/services/perfil.js`, y un cambio puntual en `Header.js` para mostrar la foto (se explica en su prompt) |

**Archivos compartidos** (los usa todo el proyecto): `components/ui/*`, `components/layout/*`, `components/lugares/*`, `services/sesion.js`, `services/lugares.js`, `lib/*`, `globals.css`, `package.json`. Solo se tocan para **agregar** algo pequeño que tu tarea necesite (sin cambiar lo que ya hacen), y lo avisas en la descripción del Pull Request.

Además:

- **`.env.local` jamás se sube** y la llave `service_role`/secret jamás se usa.
- **No instales dependencias** sin preguntar (cambian `package.json` y provocan conflictos).
- **Base de datos:** si tu tarea necesita una tabla o columna nueva, no la crees a mano en Supabase. Escribe un archivo `supabase/migrations/004_lo-que-sea.sql` en tu rama, explícalo en el Pull Request y Fernando lo ejecuta.
- **Textos de la interfaz en español.** Reutiliza `Button`, `Card`, `Input`, `Modal` y los colores `esmeralda-*`.
- **Commits pequeños y frecuentes**, con mensajes claros.
- En VS Code, **no arrastres carpetas** sobre otras con el mismo nombre eligiendo "Reemplazar": borra lo que había dentro.

## 5. Trabajar con IA

1. Abre la carpeta del proyecto en tu herramienta de IA (Claude Code, Cursor, Copilot, etc.).
2. Pégale el mensaje de arranque de tu módulo (está al inicio de `docs/prompt-favoritos.md` o `docs/prompt-perfil.md`). Muchas herramientas leen `AGENTS.md` solas; si la tuya no, dile que lo lea.
3. **Pídele primero un plan** y revísalo antes de dejar que escriba código.
4. **Tú eres responsable de lo que se sube.** Corre `npm run lint` y `npm run build`, prueba en el navegador y lee los cambios (`git diff`) antes de hacer commit.
5. Si la IA quiere modificar archivos fuera de tu módulo, detente y consulta.
6. Si te pierdes, pídele que te explique lo que hizo en palabras sencillas.

## 6. Errores comunes

| Síntoma | Qué hacer |
|---|---|
| `Module not found: Can't resolve '@/...'` | Falta un archivo o está en otra carpeta. Corre `git status` y `git pull`, y luego `npm install`. |
| La app dice que falta la URL o la llave de Supabase | Revisa `.env.local` (nombres exactos, sin espacios) y reinicia `npm run dev`. |
| `/` o cualquier página da 404 de repente | Detén el servidor, borra la carpeta `.next` y vuelve a correr `npm run dev`. |
| `/perfil` o `/favoritos` te mandan a iniciar sesión | Es normal sin sesión: entra o crea tu cuenta. |
| Git: "tus cambios locales se sobrescribirían" | Haz commit de tus cambios antes de `git pull` (o pregunta por `git stash`). |
| El mapa sale en blanco | Revisa tu conexión a internet: los mosaicos se descargan de OpenStreetMap. |

## 7. Dónde mirar primero

- `AGENTS.md` y `README.md`: reglas y estructura.
- `src/app/(usuario)/explorar/page.js` y `src/components/explorar/ExplorarVista.js`: un ejemplo completo de página con datos reales.
- `src/components/lugares/TarjetaLugar.js` y `BotonFavorito.js`: piezas que vas a reutilizar.
- `supabase/migrations/001_esquema_inicial.sql`: todas las tablas y permisos.
