# Ofimática 9°

> Aprende Word y Excel haciendo, practicando y superando retos.

Plataforma educativa e interactiva para estudiantes de grado 9° (14–16 años) que tienen dificultades con Microsoft Word y Excel. Cada tema sigue el ciclo:

**📚 Aprende → 🎯 Practica → 🧠 Reto → 🏆 Recompensa**

## Cómo usarla

No necesita instalación ni servidor: **abre `index.html` en el navegador**.
También funciona publicada en cualquier hosting estático (GitHub Pages, Netlify...).

El progreso se guarda automáticamente en `localStorage`. Desde **Perfil** se puede descargar una copia (JSON) y cargarla en otro computador.

**Cuentas de estudiantes (opcional):** con Firebase los estudiantes se registran (correo o Google) y su progreso se guarda en la nube. Incluye un **panel del docente** (`#/docente`, demo en `#/docente/demo`). Sigue la guía **[FIREBASE.md](FIREBASE.md)**: solo hay que crear el proyecto y pegar la configuración en `js/core/firebase-config.js`.

## Qué incluye

| Sección | Contenido |
|---|---|
| **Inicio** | Presentación, nivel, XP, % de progreso, retos, insignias, los dos módulos y el siguiente paso recomendado |
| **Diagnóstico** | 14 preguntas (autoevaluación + comprobación). Da el nivel (Básico / Intermedio / Avanzado) y recomienda el nivel de inicio en Word y en Excel |
| **Word** (4 niveles, 23 temas) | Conociendo Word · Dar formato · Documentos · Word para el colegio (portada, hoja de vida, exposición, carta, informe, tabla, trabajo académico) |
| **Excel** (5 niveles, 29 temas) | Conociendo Excel · Organización · Fórmulas básicas (SUMA, PROMEDIO, MAX, MIN, CONTAR, %, operaciones) · Excel para el colegio · Gráficos |
| **Retos** ⚔️ | 10 desafíos (simulador, cuestionarios y contrarreloj) con XP, puntos e insignia propia |
| **Laboratorio** 🧪 | Mini Word y mini Excel libres, con misiones que se completan solas |
| **Proyectos finales** 🏆 | Informe escolar completo (Word) y sistema de calificaciones (Excel). Al entregar ambos: *"¡Has completado el curso de Ofimática 9°!"* y certificado imprimible |
| **Progreso** | Nivel, XP, precisión, rachas, avance por nivel, insignias e historial |
| **Perfil** | Nombre, avatar, curso, copia de seguridad y reinicio |

### Simuladores ("Aprende haciendo")

- **Mini Word**: pestañas Inicio / Insertar / Disposición; deshacer y rehacer, cortar/copiar/pegar, fuente, tamaño, N K S, color, alineación, listas, interlineado, sangrías, estilos de título, portada, imágenes (con tamaño), tablas, encabezado, pie, número de página, salto de página, márgenes y orientación.
- **Mini Excel**: celdas editables, barra de fórmulas, cuadro de nombres, selección de rangos (arrastre o Shift+clic), formato (negrita, alineación, relleno, bordes, moneda, %, decimales), ordenar, autoajustar columnas y gráficos (barras, circular, líneas) que se actualizan con los datos.
- Motor de fórmulas propio en español (y alias en inglés): `+ - * / ^ %`, `SUMA`, `PROMEDIO`, `MAX`, `MIN`, `CONTAR`, `CONTARA`, `CONTAR.SI`, `SI`, `REDONDEAR`, `ABS`. Separador `;` (también acepta `,`) y números en formato colombiano (`5.000`, `3,5`, `$ 8.000`, `20%`).

### Retroalimentación pedagógica

- Equivocarse está permitido: 1.er error → pista, 2.º → repaso del concepto, 3.º → solución explicada.
- Los validadores de Excel explican el error concreto: falta el `=`, función mal escrita (`¿Quisiste escribir SUMA?`), rango incompleto, número escrito a mano en vez de fórmula, `#¡DIV/0!`, etc.
- Las tareas muestran una lista de requisitos que se marca sola mientras el estudiante trabaja.

### Gamificación

Niveles: Principiante → Aprendiz → Explorador → Experto → Maestro de Ofimática. Se gana XP al leer lecciones, acertar (más si es a la primera), superar retos, completar temas, misiones del laboratorio, el diagnóstico y los proyectos. Cada recompensa se entrega una sola vez.

## Arquitectura

HTML5 + CSS3 + JavaScript puro, **sin librerías ni proceso de compilación**. Los scripts son clásicos (no módulos ES) para que funcione abriendo el archivo directamente; todo vive en el espacio de nombres `window.O9`.

```
index.html
assets/favicon.svg
css/
  base.css          variables de diseño (colores, sombras), reset, animaciones
  layout.css        barra superior, navegación inferior móvil, rejillas, responsive
  components.css    botones, tarjetas, barras, modales, ejercicios, bloques
  simulators.css    mini Word, mini Excel y tareas
  views.css         estilos propios de cada pantalla
js/
  core/             ← núcleo
    namespace.js    espacio de nombres O9
    utils.js        DOM, formato, eventos
    storage.js      localStorage (estado único, migración, exportar/importar)
    progress.js     avance en temas, niveles, módulos, retos y proyectos
    gamification.js XP, niveles, puntos, rachas e insignias
    router.js       navegación por hash (#/ruta)
  data/             ← contenido (solo datos, sin lógica)
    gamification-data.js  niveles, reglas de XP, insignias, avatares
    word-lessons.js       módulo Word
    excel-lessons.js      módulo Excel
    challenges.js         retos
    diagnostic.js         diagnóstico inicial
    lab.js                misiones del laboratorio
    projects.js           proyectos finales
  engine/           ← motores
    formula-engine.js     tokenizador, analizador y evaluador de fórmulas + modelo de hoja
    charts.js             gráficos SVG (barras, circular, líneas)
    word-checks.js        validadores de documentos Word
    excel-checks.js       validadores de hojas Excel con mensajes pedagógicos
  components/       ← interfaz reutilizable
    ui.js           notificaciones, modales, barras, confeti, indicador de XP
    blocks.js       bloques de "Aprende" (anatomía interactiva, mini hojas, gráficos, ordenar/filtrar...)
    exercises.js    preguntas: opción múltiple, V/F, completar, fórmulas, ordenar, relacionar
    word-sim.js     simulador de Word
    excel-sim.js    simulador de Excel
    tasks.js        simulador + requisitos que se validan en vivo
  views/            ← pantallas
    home, module, lesson, challenges, progress, profile, diagnostic, lab, projects
  app.js            arranque
```

### Cómo agregar contenido

- **Un tema nuevo**: añade un objeto en `js/data/word-lessons.js` o `excel-lessons.js` dentro del nivel correspondiente (`learn`, `practice`, `challenge`). Aparece automáticamente en el módulo, el progreso y las insignias.
- **Un reto nuevo**: añade un objeto a `js/data/challenges.js`; su insignia se crea sola.
- **Un requisito nuevo** para tareas: agrega un validador en `js/engine/word-checks.js` o `excel-checks.js` y úsalo por su nombre en los datos.

La tipografía (Nunito) se carga de Google Fonts; sin internet se usan las fuentes del sistema.
