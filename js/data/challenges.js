/**
 * RETOS ⚔️
 * Desafíos independientes de las lecciones. Cada uno entrega XP, puntos e
 * insignia propia, y cuenta para el progreso del curso.
 *
 * kind:
 *   'task'  → actividad en el simulador con requisitos (ver components/tasks.js)
 *   'quiz'  → serie de preguntas (se supera con minScore aciertos)
 *   'timed' → preguntas contra el reloj tomadas de un banco (pool)
 */
(function (O9) {
  'use strict';

  const L = 'ABCDEFGH';
  /** Tabla → datos del simulador (versión corta del ayudante de excel-lessons). */
  function sheetData(rows, lockAll = true) {
    const data = {}, locked = [];
    rows.forEach((r, ri) => r.forEach((v, ci) => {
      if (v === '' || v == null) return;
      const ref = L[ci] + (ri + 1);
      data[ref] = String(v);
      if (lockAll) locked.push(ref);
    }));
    return { data, locked };
  }

  const fiesta = sheetData([['Artículo', 'Cantidad', 'Precio unitario', 'Subtotal'], ['Gaseosas', 6, 4500, ''], ['Pizzas', 4, 32000, ''], ['Bombas', 2, 8000, ''], ['Parlante (alquiler)', 1, 25000, ''], ['', '', 'Total', ''], ['', '', 'Dinero recogido', 190000], ['', '', 'Saldo', '']]);
  const ventas = sheetData([['Día', 'Empanadas vendidas'], ['Lunes', 34], ['Martes', 28], ['Miércoles', 41], ['Jueves', 19], ['Viernes', 38], ['', ''], ['Total vendidas', ''], ['Mejor día (máx.)', ''], ['Peor día (mín.)', ''], ['Promedio diario', ''], ['Días registrados', '']]);
  const encuesta = sheetData([['Red social favorita', 'Votos', 'Porcentaje'], ['TikTok', 15, ''], ['Instagram', 9, ''], ['WhatsApp', 4, ''], ['YouTube', 12, ''], ['Total', '', '']]);

  O9.data.challenges = [
    {
      id: 'reto-word-completo', module: 'word', kind: 'task', icon: '📄', difficulty: 2,
      title: 'Documento completo', xp: 80, points: 60,
      desc: 'Crea un documento con título, imagen, tabla y lista. ¡Todo lo básico de Word en un solo reto!',
      badge: { id: 'b-doc-completo', icon: '📄', name: 'Documentalista' },
      task: {
        type: 'word',
        heading: 'Documento completo',
        instructions: ['Elige un tema: tu animal favorito, un país, un deporte...', 'Escribe un <b>título</b> (estilo Título 1 o negrita grande).', 'Escribe un párrafo corto sobre el tema.', 'Inserta una <b>imagen</b>.', 'Inserta una <b>tabla</b> de al menos 2 × 2 con datos.', 'Agrega una <b>lista</b> de al menos 3 elementos.'],
        sim: { tabs: ['inicio', 'insertar', 'disposicion'], showHF: false, tall: true, placeholder: 'Empieza por el título...' },
        checks: [
          { id: 'hasHeading', label: 'Título destacado', hint: 'Estilos → Título 1, o negrita con tamaño 14+.' },
          { id: 'minWords', n: 40, label: 'Al menos 40 palabras', hint: 'Escribe un poco más sobre tu tema.' },
          { id: 'hasImage', label: 'Una imagen', hint: 'Insertar → Imagen.' },
          { id: 'hasTable', rows: 2, cols: 2, filled: 4, label: 'Una tabla 2 × 2 (o más) con datos', hint: 'Insertar → Tabla, y llena las celdas.' },
          { id: 'hasList', min: 3, label: 'Una lista con 3 elementos o más', hint: 'Escribe 3 líneas, selecciónalas y pulsa Viñetas o Numeración.' }
        ]
      }
    },
    {
      id: 'reto-word-formato', module: 'word', kind: 'task', icon: '🎨', difficulty: 2,
      title: 'Formato express', xp: 70, points: 50,
      desc: 'Un texto sin formato te espera. Aplica todo lo aprendido para dejarlo profesional.',
      badge: { id: 'b-formato', icon: '💅', name: 'Estilista de textos' },
      task: {
        type: 'word',
        heading: 'Deja el texto profesional',
        instructions: ['Título: <b>centrado</b>, en <b>negrita</b> y tamaño <b>18 o más</b>.', 'Párrafos: <b>justificados</b> e interlineado <b>1,5</b>.', 'Pon en <i>cursiva</i> el título del libro <i>El principito</i>.', 'Pon en <b>color</b> la palabra <b>imaginación</b>.'],
        sim: { tabs: ['inicio'], html: '<p>Reseña de un libro</p><p>El principito es una novela corta escrita por Antoine de Saint-Exupéry en 1943. Cuenta la historia de un pequeño príncipe que viaja por diferentes planetas y conoce personajes muy curiosos.</p><p>Me gustó porque habla de la amistad, de la importancia de la imaginación y de ver las cosas con el corazón. Lo recomiendo para todas las edades.</p>' },
        checks: [
          { id: 'titleStyle', align: 'center', strong: true, minSize: 18, label: 'Título centrado, negrita y 18+', hint: 'Selecciona "Reseña de un libro": Centrar, N y tamaño 18.' },
          { id: 'textStyle', text: 'es una novela corta', align: 'justify', label: 'Primer párrafo justificado' },
          { id: 'textStyle', text: 'Me gustó porque', align: 'justify', label: 'Segundo párrafo justificado' },
          { id: 'lineSpacing', value: '1.5', label: 'Interlineado 1,5', hint: 'Selecciona los párrafos y usa ↕ Interl.' },
          { id: 'textStyle', text: 'El principito', italic: true, label: '"El principito" en cursiva' },
          { id: 'textStyle', text: 'imaginación', color: true, label: '"imaginación" con color' }
        ]
      }
    },
    {
      id: 'reto-carta', module: 'word', kind: 'quiz', icon: '✉️', difficulty: 1, minScore: 3,
      title: 'Rompecabezas de la carta', xp: 50, points: 40,
      desc: 'Una carta formal se desarmó. Ordénala y detecta los errores de estilo.',
      badge: { id: 'b-carta', icon: '📮', name: 'Cartero experto' },
      questions: [
        { type: 'order', q: 'Ordena las partes de esta carta:', items: ['Tunja, 3 de junio de 2026', 'Señor Carlos Mejía, Coordinador académico', 'Respetado coordinador:', 'Le escribimos para solicitar un espacio para ensayar la obra de teatro...', 'Atentamente,', 'Mariana Díaz – Representante 9°A'] },
        { type: 'mcq', q: '¿Qué saludo NO es adecuado para una carta al coordinador?', options: ['¡Quiubo, profe!', 'Respetado coordinador:', 'Cordial saludo.', 'Estimado señor Mejía:'], answer: 0 },
        { type: 'mcq', q: '¿Cómo se alinea normalmente el cuerpo de una carta formal?', options: ['Justificado', 'Centrado', 'A la derecha', 'Cada renglón diferente'], answer: 0 },
        { type: 'tf', q: 'La firma va al final de la carta, después de la despedida.', answer: true }
      ]
    },
    {
      id: 'reto-excel-promedios', module: 'excel', kind: 'task', icon: '🎓', difficulty: 3,
      title: '10 estudiantes, 10 promedios', xp: 120, points: 90,
      desc: 'Crea una tabla con 10 estudiantes y calcula automáticamente su promedio.',
      badge: { id: 'b-promedios', icon: '🎓', name: 'Profe por un día' },
      task: {
        type: 'excel',
        heading: 'Planilla de 10 estudiantes',
        instructions: ['Escribe los nombres de <b>10 estudiantes</b> en A2:A11.', 'Escribe 3 notas para cada uno en <b>B, C y D</b> (de 1,0 a 5,0).', 'En <b>E2</b> escribe <code>=PROMEDIO(B2:D2)</code> y repite en cada fila hasta E11.', 'Pon los encabezados en negrita.'],
        sim: { rows: 13, cols: 6, data: { A1: 'Estudiante', B1: 'Nota 1', C1: 'Nota 2', D1: 'Nota 3', E1: 'Promedio' }, formats: { 'E2:E11': { num: 'decimal' } }, targets: ['E2:E11'] },
        checks: [
          { type: 'countText', range: 'A2:A11', min: 10, label: '10 estudiantes (A2:A11)', hint: 'Un nombre por fila.' },
          { type: 'countNumbers', range: 'B2:D11', min: 30, label: '30 notas (3 por estudiante)', hint: 'Llena B, C y D en cada fila.' },
          { type: 'rowFormula', range: 'E2:E11', fn: 'PROMEDIO', cols: 'B:D', label: 'Promedio automático de los 10', hint: '=PROMEDIO(B2:D2) en E2, =PROMEDIO(B3:D3) en E3...' },
          { type: 'format', range: 'A1:E1', prop: 'bold', mode: 'all', label: 'Encabezados en negrita', hint: 'Selecciona A1:E1 y pulsa N.' }
        ]
      }
    },
    {
      id: 'reto-excel-fiesta', module: 'excel', kind: 'task', icon: '🎉', difficulty: 3,
      title: 'Presupuesto de la fiesta', xp: 100, points: 80,
      desc: 'Organiza la fiesta de fin de año: calcula subtotales, total y si alcanza la plata.',
      badge: { id: 'b-fiesta', icon: '🎉', name: 'Tesorero del curso' },
      task: {
        type: 'excel',
        heading: 'Fiesta de fin de año',
        instructions: ['En <b>D2:D5</b> calcula cada subtotal: cantidad × precio (<code>=B2*C2</code>...).', 'En <b>D6</b> suma los subtotales con SUMA.', 'En <b>D8</b> calcula el saldo: dinero recogido − total.', 'Aplica formato <b>moneda</b> a C2:D8.'],
        sim: Object.assign({ rows: 9, cols: 5, targets: ['D2:D6', 'D8'], formats: { 'A1:D1': { bold: true }, 'C6:C8': { bold: true } }, colWidths: { A: 140, C: 130 } }, fiesta),
        checks: [
          { type: 'cell', cell: 'D2', value: 27000, label: 'Subtotal gaseosas (D2)', hint: '=B2*C2' },
          { type: 'cell', cell: 'D3', value: 128000, label: 'Subtotal pizzas (D3)', hint: '=B3*C3' },
          { type: 'cell', cell: 'D4', value: 16000, label: 'Subtotal bombas (D4)', hint: '=B4*C4' },
          { type: 'cell', cell: 'D5', value: 25000, label: 'Subtotal parlante (D5)', hint: '=B5*C5' },
          { type: 'cell', cell: 'D6', value: 196000, fn: 'SUMA', range: 'D2:D5', label: 'Total con SUMA (D6)', hint: '=SUMA(D2:D5)' },
          { type: 'cell', cell: 'D8', value: -6000, label: 'Saldo (D8)', hint: '=D7-D6. ¿Alcanza el dinero?' },
          { type: 'format', range: 'D2:D8', prop: 'num', value: 'currency', mode: 'all', label: 'Formato moneda en los valores', hint: 'Selecciona C2:D8 y pulsa $.' }
        ],
        expected: '<p>Subtotales: 27.000 · 128.000 · 16.000 · 25.000. Total: <b>$ 196.000</b>.</p><p>Saldo: 190.000 − 196.000 = <b>−$ 6.000</b>. ¡Faltan 6.000 pesos! Toca recoger un poquito más o comprar una pizza menos.</p>',
        success: 'El saldo es negativo: faltan $6.000. ¡Gracias a Excel lo descubriste antes de la fiesta!'
      }
    },
    {
      id: 'reto-excel-detective', module: 'excel', kind: 'task', icon: '🕵️', difficulty: 2,
      title: 'Detective de datos', xp: 90, points: 70,
      desc: 'Analiza las ventas de empanadas de la tienda escolar con 5 funciones diferentes.',
      badge: { id: 'b-detective', icon: '🕵️', name: 'Detective de datos' },
      task: {
        type: 'excel',
        heading: 'Ventas de la tienda escolar',
        instructions: ['B8: total vendido (SUMA).', 'B9: el mejor día (MAX).', 'B10: el peor día (MIN).', 'B11: el promedio diario (PROMEDIO).', 'B12: cuántos días hay registrados (CONTAR).'],
        sim: Object.assign({ rows: 13, cols: 3, targets: ['B8:B12'], formats: { 'A1:B1': { bold: true }, 'A8:A12': { bold: true } }, colWidths: { A: 150, B: 170 } }, ventas),
        checks: [
          { type: 'cell', cell: 'B8', value: 160, fn: 'SUMA', range: 'B2:B6', label: 'Total vendido con SUMA', hint: '=SUMA(B2:B6)' },
          { type: 'cell', cell: 'B9', value: 41, fn: 'MAX', range: 'B2:B6', label: 'Mejor día con MAX', hint: '=MAX(B2:B6)' },
          { type: 'cell', cell: 'B10', value: 19, fn: 'MIN', range: 'B2:B6', label: 'Peor día con MIN', hint: '=MIN(B2:B6)' },
          { type: 'cell', cell: 'B11', value: 32, fn: 'PROMEDIO', range: 'B2:B6', label: 'Promedio con PROMEDIO', hint: '=PROMEDIO(B2:B6)' },
          { type: 'cell', cell: 'B12', value: 5, fn: 'CONTAR', range: 'B2:B6', label: 'Días con CONTAR', hint: '=CONTAR(B2:B6)' }
        ],
        expected: '<p>Total <b>160</b> · Máx. <b>41</b> (miércoles) · Mín. <b>19</b> (jueves) · Promedio <b>32</b> · Días <b>5</b></p>'
      }
    },
    {
      id: 'reto-encuesta', module: 'excel', kind: 'task', icon: '🗳️', difficulty: 3,
      title: 'Encuesta con gráfico', xp: 110, points: 80,
      desc: 'Calcula los porcentajes de una encuesta y preséntalos en el gráfico adecuado.',
      badge: { id: 'b-encuesta', icon: '📣', name: 'Encuestador' },
      task: {
        type: 'excel',
        heading: 'Red social favorita del 9°',
        instructions: ['B6: total de votos con SUMA.', 'C2:C5: porcentaje de cada red (<code>=B2/B6</code>...) con formato %.', 'Inserta un gráfico <b>circular</b> con las redes (A2:A5) y los votos (B2:B5).'],
        sim: Object.assign({ rows: 8, cols: 4, charts: true, targets: ['B6', 'C2:C5'], formats: { 'A1:C1': { bold: true }, A6: { bold: true } }, colWidths: { A: 160 }, chartTitle: 'Red social favorita' }, encuesta),
        checks: [
          { type: 'cell', cell: 'B6', value: 40, fn: 'SUMA', range: 'B2:B5', label: 'Total de votos (B6)', hint: '=SUMA(B2:B5)' },
          { type: 'cell', cell: 'C2', value: 0.375, label: 'Porcentaje de TikTok', hint: '=B2/B6' },
          { type: 'cell', cell: 'C3', value: 0.225, label: 'Porcentaje de Instagram', hint: '=B3/B6' },
          { type: 'cell', cell: 'C4', value: 0.1, label: 'Porcentaje de WhatsApp', hint: '=B4/B6' },
          { type: 'cell', cell: 'C5', value: 0.3, label: 'Porcentaje de YouTube', hint: '=B5/B6' },
          { type: 'format', range: 'C2:C5', prop: 'num', value: 'percent', mode: 'all', label: 'Formato % en C2:C5' },
          { type: 'chart', chartType: 'pie', label: 'Gráfico circular', hint: 'Selecciona A1:B5 → 📊 Gráfico → Circular.' }
        ]
      }
    },
    {
      id: 'reto-graficos', module: 'excel', kind: 'quiz', icon: '📈', difficulty: 2, minScore: 4,
      title: '¿Qué gráfico uso?', xp: 60, points: 50,
      desc: 'Cinco situaciones reales. Elige el gráfico perfecto para cada una.',
      badge: { id: 'b-graficos', icon: '📈', name: 'Ojo de analista' },
      questions: [
        { type: 'mcq', q: 'Cantidad de estudiantes inscritos en cada club (teatro, música, robótica, ajedrez).', options: ['📊 Barras', '📈 Líneas', '🥧 Circular'], answer: 0, fixed: true },
        { type: 'mcq', q: 'Cómo gastaste tu mesada del mes (porcentaje en comida, transporte, ahorro, diversión).', options: ['📊 Barras', '📈 Líneas', '🥧 Circular'], answer: 2, fixed: true },
        { type: 'mcq', q: 'El número de pasos que caminaste cada día del mes.', options: ['📊 Barras', '📈 Líneas', '🥧 Circular'], answer: 1, fixed: true },
        { type: 'mcq', q: 'Las notas de Matemáticas del curso en los 4 periodos del año.', options: ['📊 Barras', '📈 Líneas', '🥧 Circular'], answer: 1, fixed: true },
        { type: 'mcq', q: 'La estatura de 5 jugadores del equipo de baloncesto.', options: ['📊 Barras', '📈 Líneas', '🥧 Circular'], answer: 0, fixed: true }
      ]
    },
    {
      id: 'reto-atajos', module: 'mixto', kind: 'quiz', icon: '⌨️', difficulty: 1, minScore: 2,
      title: 'Maestro de los atajos', xp: 50, points: 40,
      desc: 'Los atajos de teclado te hacen el doble de rápido. ¿Los conoces?',
      badge: { id: 'b-atajos', icon: '⌨️', name: 'Dedos rápidos' },
      questions: [
        { type: 'match', q: 'Relaciona cada atajo con su acción:', pairs: [['Ctrl + C', 'Copiar'], ['Ctrl + V', 'Pegar'], ['Ctrl + X', 'Cortar'], ['Ctrl + Z', 'Deshacer'], ['Ctrl + Y', 'Rehacer']] },
        { type: 'match', q: 'Atajos de Word en español:', pairs: [['Ctrl + G', 'Guardar'], ['Ctrl + N', 'Negrita'], ['Ctrl + K', 'Cursiva'], ['Ctrl + Enter', 'Salto de página']] },
        { type: 'mcq', q: 'En Excel, ¿qué tecla confirma un dato y pasa a la celda de la derecha?', options: ['Tab', 'Enter', 'Esc', 'F12'], answer: 0 }
      ]
    },
    {
      id: 'contrarreloj', module: 'mixto', kind: 'timed', icon: '⏱️', difficulty: 3, seconds: 90, minScore: 7,
      title: 'Contrarreloj', xp: 100, points: 100,
      desc: '90 segundos. Responde todas las preguntas que puedas de Word y Excel. ¡Necesitas 7 aciertos!',
      badge: { id: 'speed', icon: '⚡', name: 'Veloz' },
      pool: [
        { type: 'mcq', q: '¿Con qué signo empieza toda fórmula?', options: ['=', '+', '#', '@'], answer: 0 },
        { type: 'mcq', q: '¿Qué función suma un rango?', options: ['SUMA', 'CONTAR', 'MAX', 'MIN'], answer: 0 },
        { type: 'mcq', q: 'Alineación para el título de una portada:', options: ['Centrar', 'Derecha', 'Justificar', 'Izquierda'], answer: 0 },
        { type: 'mcq', q: 'Atajo para deshacer:', options: ['Ctrl + Z', 'Ctrl + C', 'Ctrl + P', 'Ctrl + G'], answer: 0 },
        { type: 'mcq', q: 'Las columnas en Excel se nombran con...', options: ['Letras', 'Números', 'Colores', 'Símbolos'], answer: 0 },
        { type: 'mcq', q: '¿Cuántas celdas hay en A1:A5?', options: ['5', '1', '6', '10'], answer: 0 },
        { type: 'mcq', q: 'Gráfico para partes de un todo:', options: ['Circular', 'Líneas', 'Barras', 'Ninguno'], answer: 0 },
        { type: 'mcq', q: 'Gráfico para cambios en el tiempo:', options: ['Líneas', 'Circular', 'Barras', 'Tabla'], answer: 0 },
        { type: 'mcq', q: '¿En qué pestaña de Word está "Imágenes"?', options: ['Insertar', 'Inicio', 'Vista', 'Revisar'], answer: 0 },
        { type: 'mcq', q: '<code>=PROMEDIO(4;2;3)</code> da...', options: ['3', '9', '4', '2'], answer: 0 },
        { type: 'mcq', q: '<code>=MAX(7;12;3)</code> da...', options: ['12', '3', '22', '7'], answer: 0 },
        { type: 'mcq', q: '0,25 con formato porcentaje se ve como...', options: ['25%', '0,25%', '2,5%', '250%'], answer: 0 },
        { type: 'mcq', q: 'Para pasar a una hoja nueva en Word usas...', options: ['Salto de página', 'Muchos Enter', 'Espacios', 'Tab'], answer: 0 },
        { type: 'mcq', q: 'La extensión de los archivos de Word es...', options: ['.docx', '.xlsx', '.pptx', '.pdf'], answer: 0 },
        { type: 'mcq', q: '"#####" en una celda significa...', options: ['La columna es angosta', 'Error de fórmula', 'Archivo dañado', 'Celda vacía'], answer: 0 },
        { type: 'mcq', q: 'El nombre de la celda en la columna D, fila 7 es...', options: ['D7', '7D', 'D-7', 'DD7'], answer: 0 },
        { type: 'mcq', q: 'Formato para títulos de libros:', options: ['Cursiva', 'Subrayado', 'Tachado', 'Mayúsculas'], answer: 0 },
        { type: 'mcq', q: '¿Qué muestra el encabezado?', options: ['Texto arriba en todas las páginas', 'El título solo en la hoja 1', 'Las notas al pie', 'El índice'], answer: 0 },
        { type: 'mcq', q: '<code>=CONTAR(A1:A4)</code> con 5, "hola", 3 y vacía da...', options: ['2', '3', '4', '8'], answer: 0 },
        { type: 'mcq', q: 'Multiplicar en Excel se escribe con...', options: ['*', 'x', '×', '/'], answer: 0 }
      ]
    }
  ];

  /* Cada reto aporta su propia insignia a la lista general */
  O9.data.challenges.forEach((c) => {
    if (c.badge && !O9.data.badges.some((b) => b.id === c.badge.id)) {
      O9.data.badges.push({ id: c.badge.id, icon: c.badge.icon, name: c.badge.name, desc: `Supera el reto "${c.title}".`, rule: { type: 'challenge', id: c.id } });
    }
  });
})(window.O9);
