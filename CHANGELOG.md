# Registro de cambios

Todas las versiones de Notas de Cursos. Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versiones `MAYOR.MENOR.PARCHE`. El número visible está en `js/core.js` (`VERSION`) y se muestra al final de Ajustes.

## [2.5.0] - 2026-11-23
### Agregado
- **Botón Aa** en la barra de abajo de la nota: seleccionas el texto, tocas Aa y se despliegan 3 filas de opciones que se quedan abiertas hasta volver a tocar Aa:
  - Tamaño de la línea: Título, Subtítulo, Normal y Pequeño (se aplica a la línea completa para que los renglones sigan alineados).
  - Negrita, cursiva, subrayado, tachado y quitar formato.
  - Sombreado amarillo, verde, rosa o celeste, y quitar sombreado.
- Los botones se marcan según el formato donde está el cursor, para saber qué está aplicado.
- Si al tocar un botón el celular quita la selección, la app usa la última selección que había en la nota.

### Corregido (revisión ECC del editor)
- Las notas con formato se guardan con un marcador interno: una nota vieja de texto plano que empiece por "<" (p. ej. apuntes de HTML) ya no se confunde con formato ni pierde texto.
- Seleccionar una línea en Android ya no cambia también el tamaño de la línea siguiente; "Quitar sombreado" solo quita el del texto seleccionado.
- Al pegar: si el contenido copiado no trae texto con formato útil, se pega el texto plano; títulos y tablas de otras páginas entran en líneas propias, y el texto de íconos SVG ya no se cuela.
- Se conservan los espacios al inicio de las líneas de las notas viejas; el editor ya no puede quedarse sin guardar si falla un comando de formato.

## [2.4.0] - 2026-11-23
### Agregado
- **Editor con formato**: la nota deja de ser texto plano y se guarda como HTML limpio (solo etiquetas permitidas; lo demás se quita, también al pegar texto de otras páginas).
- **Renglones que se adaptan al tamaño**: cada línea dibuja sus renglones según su tamaño de letra (Título 42 px, Subtítulo 36 px, normal 30 px, pequeño 24 px).
- **Sangría ⇥ / ⇤** para ordenar ideas por niveles, con una línea guía a la izquierda; en viñetas crea sub-viñetas. Con teclado de PC funciona con Tab y Shift+Tab.
- **Viñetas reales** (•) que se pueden anidar; la casilla ☐ se pone al inicio de la línea.
- El editor ya sabe mostrar y guardar títulos, negrita, cursiva, subrayado, tachado y sombreado, para que la v2.5.0 (botón Aa) pueda fallar sin romper las notas.

### Cambiado
- Las notas viejas en texto plano se convierten solas al abrirlas; la búsqueda, la vista previa y "ya tiene notas" usan el texto sin formato.
- "Guardado ✓" pasa a la fila de la fecha; los botones de abajo se reparten el ancho.

## [2.3.1] - 2026-11-23
### Agregado
- Este registro de cambios, un `README.md` y tags de git para cada versión anterior.
- El número de versión al final de Ajustes.

## [2.3.0] - 2026-11-04
### Agregado
- Botón **"+ Sesión"** en la nota, junto a la fecha: crea la siguiente sesión del curso con la fecha de hoy (para cuando la profesora adelanta una clase). Las sesiones anteriores no se renumeran, la próxima semana sigue desde la nueva y se puede deshacer.

### Corregido
- El service worker pregunta siempre al servidor si hay versión nueva; antes el navegador podía mostrar archivos viejos un tiempo después de actualizar.

## [2.2.0] - 2026-11-04
### Agregado
- **"Enviar avisos de tareas ahora"** en Ajustes → Avisos: manda en ese momento los mismos avisos del aviso diario de las 6:00 a. m., solo de las tareas del usuario.

## [2.1.0] - 2026-11-03
Revisión completa con ECC (código, seguridad, base de datos, accesibilidad) y Lighthouse (100/100/100 en móvil).

### Corregido
- La búsqueda de notas nunca funcionó (también fallaba en la v1).
- Se perdían cambios si fallaba la red al sincronizar; la sincronización podía saltarse cambios hechos en otro dispositivo.
- "Deshacer" dejaba de funcionar a los pocos segundos; "Nuevo ciclo" escondía la hoja del nombre.
- Al volver a la app otro día se abría la sesión del día anterior.

### Cambiado
- Contraste WCAG AA en tarjetas, etiquetas y botones; botones táctiles de 44 px; las hojas se cierran con Atrás o Escape.
- Importar una copia valida los datos; los adjuntos que no son foto o PDF se descargan en vez de abrirse.
- Función de avisos más estricta (solo servicios de push reales, máximo 5 dispositivos) y claves de avisos nuevas creadas en el servidor.
- El esquema de Supabase y la función de avisos quedan versionados en `supabase/`.

## [2.0.0] - 2026-11-03
### Cambiado
- Código separado en `css/` y `js/` (antes era un solo `index.html`).
- Diseño nuevo tipo cuaderno: íconos, color del curso como lomo, editor con renglones, modo oscuro, ventanas propias y avisos con "Deshacer".
- Pestaña **Hoy** como panel: curso del día, semana y tareas próximas.
- Nuevo hogar: GitHub `alexmaster113/notas-cursos` y el proyecto de Supabase `yxvdpqzpiqkkcucdyywt` (con avisos rehechos).

## [1.0.0] - 2026-11-02
Primera versión (repositorio `alexmaster11/notas-cursos`): notas por sesión con carpetas por curso, sesiones automáticas cada semana, tareas con colores y "Posponer 3 días", aviso diario a las 6:00 a. m., Nuevo ciclo, Papelera, exportar e importar, y adjuntos guardados en el celular.
