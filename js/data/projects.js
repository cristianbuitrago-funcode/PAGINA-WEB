/**
 * PROYECTOS FINALES
 * Integran todo lo aprendido en cada módulo. Al entregar los dos,
 * se completa el curso de Ofimática 9°.
 */
(function (O9) {
  'use strict';

  O9.data.projects = [
    {
      id: 'word', module: 'word', icon: '📑', xp: 300, points: 250,
      title: 'Proyecto final de Word',
      subtitle: 'Crear un informe escolar completo',
      desc: 'Elige un tema que te guste (un animal, un deporte, un invento, tu región...) y escribe un informe con todo lo que aprendiste.',
      recommended: ['w3', 'w4'],
      task: {
        type: 'word',
        heading: 'Informe escolar completo',
        instructions: [
          '<b>Portada</b>: título, tu nombre, grado, colegio, ciudad y año, centrados. Luego un <b>salto de página</b> (Insertar → Salto de página).',
          '<b>Título</b> del informe con estilo <b>Título 1</b>.',
          '<b>Texto</b>: introducción, desarrollo y conclusión (al menos 120 palabras, en 3 párrafos o más).',
          'Una <b>imagen</b> relacionada con el tema.',
          'Una <b>tabla</b> con datos (al menos 2 × 2).',
          '<b>Encabezado</b> con el nombre del colegio o del tema.',
          '<b>Pie de página</b> con tu nombre.',
          '<b>Numeración</b> de páginas.'
        ],
        sim: { tabs: ['inicio', 'insertar', 'disposicion'], showHF: true, tall: true, title: 'Informe final', placeholder: 'Tip: empieza con Insertar → Portada' },
        checks: [
          { id: 'coverPage', label: 'Portada (centrada, con salto de página)', hint: 'Datos centrados y luego Insertar → Salto de página.' },
          { id: 'minHeadings', tag: 'h1', n: 1, label: 'Título con estilo Título 1', hint: 'Cursor en el título → Estilos → Título 1.' },
          { id: 'minWords', n: 120, label: 'Texto: al menos 120 palabras', hint: 'Desarrolla más la introducción, el desarrollo y la conclusión.' },
          { id: 'minParagraphs', n: 3, words: 15, label: 'Al menos 3 párrafos', hint: 'Introducción, desarrollo y conclusión.' },
          { id: 'hasImage', label: 'Imagen', hint: 'Insertar → Imagen.' },
          { id: 'hasTable', rows: 2, cols: 2, filled: 4, label: 'Tabla con datos', hint: 'Insertar → Tabla y llénala.' },
          { id: 'hasHeader', label: 'Encabezado', hint: 'Insertar → Encabezado.' },
          { id: 'hasFooter', label: 'Pie de página', hint: 'Insertar → Pie.' },
          { id: 'hasPageNumbers', label: 'Numeración de páginas', hint: 'Insertar → N.º página.' }
        ],
        success: '¡Tu informe cumple todos los requisitos de un trabajo profesional!'
      }
    },
    {
      id: 'excel', module: 'excel', icon: '🏅', xp: 300, points: 250,
      title: 'Proyecto final de Excel',
      subtitle: 'Crear un sistema de calificaciones',
      desc: 'Construye la planilla de notas de un curso: estudiantes, materias, notas, promedios, nota máxima, nota mínima y un gráfico.',
      recommended: ['x3', 'x4', 'x5'],
      task: {
        type: 'excel',
        heading: 'Sistema de calificaciones',
        instructions: [
          '<b>Lista de estudiantes</b>: al menos 5 nombres en la columna A (desde A2).',
          '<b>Materias</b>: al menos 3 materias en la fila 1 (B1, C1, D1...).',
          '<b>Notas</b>: llena las notas de cada estudiante (de 1,0 a 5,0).',
          '<b>Promedio</b>: agrega una columna "Promedio" con <code>=PROMEDIO(...)</code> para cada estudiante.',
          '<b>Nota máxima</b> y <b>nota mínima</b> del curso con MAX y MIN (debajo de la tabla).',
          '<b>Gráfico</b> con los promedios de los estudiantes.',
          '<b>Formato de tabla</b>: encabezados en negrita y bordes.'
        ],
        sim: { rows: 16, cols: 8, charts: true, title: 'Calificaciones 9°', data: { A1: 'Estudiante' }, chartTitle: 'Promedio por estudiante' },
        checks: [
          { type: 'countText', range: 'A2:A15', min: 5, label: 'Lista de al menos 5 estudiantes', hint: 'Escribe los nombres en A2, A3, A4...' },
          { type: 'countText', range: 'B1:H1', min: 3, label: 'Al menos 3 materias en la fila 1', hint: 'Por ejemplo: Matemáticas, Español, Inglés.' },
          { type: 'countNumbers', range: 'B2:H15', min: 15, label: 'Al menos 15 notas', hint: '3 notas × 5 estudiantes = 15.' },
          { type: 'fnCount', fn: 'PROMEDIO', min: 5, label: 'Promedio de cada estudiante (5 o más)', hint: '=PROMEDIO(B2:D2) en la columna Promedio.' },
          { type: 'fnCount', fn: 'MAX', min: 1, label: 'Nota máxima con MAX', hint: 'Ejemplo: =MAX(E2:E6)' },
          { type: 'fnCount', fn: 'MIN', min: 1, label: 'Nota mínima con MIN', hint: 'Ejemplo: =MIN(E2:E6)' },
          { type: 'chart', label: 'Gráfico', hint: 'Selecciona nombres y promedios → 📊 Gráfico.' },
          { type: 'format', range: 'A1:H1', prop: 'bold', mode: 'any', label: 'Encabezados en negrita', hint: 'Selecciona la fila 1 y pulsa N.' },
          { type: 'format', range: 'A1:H16', prop: 'border', mode: 'any', label: 'Tabla con bordes', hint: 'Selecciona la tabla y pulsa ▦ Bordes.' }
        ],
        success: '¡Construiste un sistema de calificaciones real! Así trabajan los profes con Excel.'
      }
    }
  ];
})(window.O9);
