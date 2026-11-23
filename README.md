# Notas de Cursos

App web instalable (PWA) para tomar notas de clase en el celular: una nota por sesión de cada curso, tareas con fecha límite y un aviso diario a las 6:00 a. m. Gratis: GitHub Pages + Supabase.

- **Sitio:** https://alexmaster113.github.io/notas-cursos
- **Cambios:** [CHANGELOG.md](CHANGELOG.md)

## Estructura
- `index.html`, `css/app.css` y `js/` (scripts clásicos que comparten variables globales, cargados en orden): `core` (estado y navegación), `ui` (hojas y avisos), `hoy`, `notas`, `tareas`, `ajustes`, `adjuntos`, `sync` (Supabase y avisos), `app` (arranque).
- `sw.js`: funciona sin internet y recibe los avisos.
- `supabase/schema.sql` y `supabase/functions/push/`: base de datos y función de avisos.

## Publicar una versión
1. Sube `VERSION` en `js/core.js` y la versión de caché `C` en `sw.js`.
2. Agrega la entrada en `CHANGELOG.md`.
3. `git commit`, `git tag vX.Y.Z` y `git push --follow-tags`.
