/**
 * CONTENIDO DEL MÓDULO EXCEL
 * Misma estructura que word-lessons.js: módulo → niveles → temas.
 *
 * Los temas de fórmulas (Nivel 3) siguen siempre este orden:
 *   1. Explicación sencilla  2. Ejemplo  3. Ejercicio  4. Resultado esperado  5. Retroalimentación
 * La retroalimentación la genera el validador (engine/excel-checks.js) según el error:
 * falta el "=", función mal escrita, rango incompleto, número escrito a mano, etc.
 */
(function (O9) {
  'use strict';

  const P = (html) => ({ type: 'p', html });
  const TIP = (html, label) => ({ type: 'tip', html, label });
  const WARN = (html, label) => ({ type: 'warn', html, label });
  const EX = (html, label) => ({ type: 'example', html, label });
  const KEY = (html) => ({ type: 'key', html });
  const H = (text) => ({ type: 'h', text });
  const STEPS = (items, title) => ({ type: 'steps', items, title });
  const KEYS = (items, title) => ({ type: 'keys', items, title });
  const EXPECTED = (html) => ({ type: 'key', html: '<b>🎯 Resultado esperado:</b> ' + html });

  /**
   * Convierte una tabla (arreglo de filas) en opciones para el simulador de Excel.
   * Las celdas con datos quedan bloqueadas para que el estudiante no las borre por error.
   * opts: { extraRows, extraCols, unlock:[refs], formats, targets, charts, lock }
   */
  function sheet(rows, opts = {}) {
    const L = 'ABCDEFGHIJKL';
    const data = {}, locked = [];
    const unlock = new Set(opts.unlock || []);
    rows.forEach((r, ri) => r.forEach((v, ci) => {
      if (v === null || v === undefined || v === '') return;
      const ref = L[ci] + (ri + 1);
      data[ref] = String(v);
      if (opts.lock !== false && !unlock.has(ref)) locked.push(ref);
    }));
    return {
      rows: Math.max(rows.length + (opts.extraRows == null ? 2 : opts.extraRows), opts.minRows || 6),
      cols: Math.max(...rows.map((r) => r.length)) + (opts.extraCols == null ? 1 : opts.extraCols),
      data, locked,
      formats: Object.assign({ 'A1:H1': { bold: true } }, opts.formats || {}),
      targets: opts.targets || [],
      charts: !!opts.charts,
      colWidths: opts.colWidths
    };
  }

  const products = [['Producto', 'Precio'], ['Producto A', 5000], ['Producto B', 8000], ['Producto C', 3000], ['Producto D', 7000], ['Producto E', 2000]];

  O9.data.modules = O9.data.modules || {};
  O9.data.modules.excel = {
    id: 'excel',
    name: 'Excel',
    icon: '📊',
    tagline: 'Aprende a organizar datos, utilizar fórmulas y crear gráficos.',
    description: 'Celdas, rangos, formato, fórmulas como SUMA y PROMEDIO, notas, presupuestos, encuestas y gráficos.',
    levels: [
      /* ============================================================
       * NIVEL 1 — CONOCIENDO EXCEL
       * ============================================================ */
      {
        id: 'x1', num: 1, icon: '🧭', title: 'Conociendo Excel',
        desc: 'Qué es Excel, filas, columnas, celdas, rangos, hojas, libros, escribir datos y guardar.',
        topics: [
          {
            id: 'x1-1', icon: '📗', title: '¿Qué es Excel? Libros y hojas', minutes: 6,
            summary: 'Excel es una <b>hoja de cálculo</b>: una cuadrícula para organizar datos y hacer cálculos automáticos. Un archivo de Excel se llama <b>libro</b> (.xlsx) y cada pestaña de abajo es una <b>hoja</b>.',
            learn: [
              P('<b>Microsoft Excel</b> es una <b>hoja de cálculo</b>: una cuadrícula gigante donde organizas datos y Excel hace las cuentas por ti.'),
              { type: 'compare', beforeLabel: '📝 Word', afterLabel: '📊 Excel',
                before: 'Para <b>textos</b>: trabajos, cartas, informes, hojas de vida.',
                after: 'Para <b>datos y números</b>: notas, presupuestos, listas, encuestas, gráficos.' },
              EX('Calcular tu promedio del periodo, llevar las cuentas del paseo de curso, organizar los resultados de una encuesta o la lista de asistencia.'),
              H('Las partes de la ventana de Excel'),
              { type: 'anatomy', app: 'excel' },
              KEY('<b>Libro</b> = el archivo completo (termina en <b>.xlsx</b>). <b>Hoja</b> = cada pestaña de abajo (Hoja1, Hoja2...). Un libro puede tener muchas hojas, como un cuaderno con muchas páginas.')
            ],
            practice: [
              { type: 'mcq', q: '¿Para cuál tarea es mejor usar Excel?', options: ['Calcular el promedio de notas de todo el curso', 'Escribir un cuento', 'Hacer una carta al rector', 'Diseñar una portada'], answer: 0,
                why: [null, 'Para escribir textos largos es mejor Word.', 'Las cartas se hacen en Word.', 'Las portadas se hacen en Word.'] },
              { type: 'match', q: 'Relaciona cada concepto:', pairs: [['Libro', 'El archivo completo de Excel'], ['Hoja', 'Cada pestaña dentro del libro'], ['Celda', 'El cruce de una columna y una fila'], ['Barra de fórmulas', 'Muestra lo que hay realmente en la celda']] }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: 'Tienes un archivo con las notas de 4 materias, cada materia en una pestaña diferente. ¿Qué tienes?', options: ['1 libro con 4 hojas', '4 libros con 1 hoja', '4 libros con 4 hojas', '1 hoja con 4 libros'], answer: 0 },
                { type: 'mcq', q: '¿Cómo termina el nombre de un archivo de Excel?', options: ['.xlsx', '.docx', '.pptx', '.mp3'], answer: 0, why: [null, '.docx es de Word.', '.pptx es de PowerPoint.', '.mp3 es de música.'] },
                { type: 'mcq', q: 'Seleccionaste una celda y en ella se ve <b>25.000</b>, pero quieres saber si es un número escrito o una fórmula. ¿Dónde miras?', options: ['En la barra de fórmulas', 'En la barra de título', 'En las pestañas de hojas', 'En el zoom'], answer: 0 }
              ]
            }
          },
          {
            id: 'x1-2', icon: '🔠', title: 'Filas, columnas y celdas', minutes: 7,
            summary: 'Las <b>columnas</b> son verticales y tienen <b>letras</b> (A, B, C...). Las <b>filas</b> son horizontales y tienen <b>números</b> (1, 2, 3...). Una <b>celda</b> se nombra con letra + número: <b>B3</b> = columna B, fila 3.',
            learn: [
              P('⬇️ Las <b>columnas</b> son verticales y se nombran con <b>letras</b>: A, B, C...'),
              P('➡️ Las <b>filas</b> son horizontales y se nombran con <b>números</b>: 1, 2, 3...'),
              P('🔲 Una <b>celda</b> es el cuadrito donde se cruzan. Su nombre es <b>letra de la columna + número de la fila</b>.'),
              { type: 'sheet', rows: [['Nombre', 'Matemáticas', 'Inglés'], ['Ana', 4.5, 3.9], ['Luis', 3.8, 4.2], ['Sara', 4.1, 4.7]], hl: ['B3'], caption: 'La celda resaltada es <b>B3</b>: columna B (Matemáticas), fila 3 (Luis). Contiene 3,8.' },
              TIP('Es como jugar <b>batalla naval</b>: primero la letra, después el número. Se escribe <b>B3</b>, nunca 3B.'),
              { type: 'reveal', q: '¿Cuál es el nombre de la celda donde está la nota de Inglés de Sara?', a: '<b>C4</b>: columna C (Inglés) y fila 4 (Sara).' },
              { type: 'sim', app: 'excel', caption: 'haz clic en diferentes celdas y mira cómo cambia el nombre en el <b>cuadro de nombres</b> (arriba a la izquierda). Haz clic en una letra para seleccionar toda la columna.', options: { rows: 6, cols: 5, toolbar: false } }
            ],
            practice: [
              { type: 'fill', q: '¿Cómo se llama la celda que está en la <b>columna C</b> y la <b>fila 4</b>?', accept: ['C4'], placeholder: 'Ejemplo: A1', explain: 'Primero la letra de la columna y después el número de la fila.' },
              { type: 'mcq', q: 'Mira la tabla. ¿En qué celda está la palabra <b>"Inglés"</b>?', table: { rows: [['Nombre', 'Matemáticas', 'Inglés'], ['Ana', 4.5, 3.9], ['Luis', 3.8, 4.2]] }, options: ['C1', 'B1', '1C', 'C3'], answer: 0,
                why: [null, 'B1 contiene "Matemáticas".', 'Se escribe primero la letra: C1.', 'En C3 está la nota 4,2.'] },
              { type: 'tf', q: 'Las filas se identifican con letras.', answer: false, explain: 'Filas = números. Columnas = letras.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Escribe <b>Ana</b> en la celda <b>A2</b> y su nota <b>4,5</b> en <b>B2</b>.', 'Escribe <b>Luis</b> en <b>A3</b> y su nota <b>3,8</b> en <b>B3</b>.', 'Pulsa <kbd>Enter</kbd> después de escribir cada dato.'],
                sim: sheet([['Nombre', 'Nota']], { extraRows: 4, extraCols: 2 }),
                checks: [
                  { type: 'text', cell: 'A2', text: 'Ana', label: '"Ana" en A2', hint: 'Columna A, fila 2.' },
                  { type: 'value', cell: 'B2', value: 4.5, label: '4,5 en B2', hint: 'Columna B, fila 2. Escribe 4,5' },
                  { type: 'text', cell: 'A3', text: 'Luis', label: '"Luis" en A3', hint: 'Columna A, fila 3.' },
                  { type: 'value', cell: 'B3', value: 3.8, label: '3,8 en B3', hint: 'Columna B, fila 3.' }
                ],
                success: '¡Ya sabes ubicar cualquier celda! Esto es la base de todas las fórmulas.'
              }
            }
          },
          {
            id: 'x1-3', icon: '🟩', title: 'Rangos: grupos de celdas', minutes: 6,
            summary: 'Un <b>rango</b> es un grupo de celdas seguidas. Se escribe <b>primera celda : última celda</b>. Ejemplo: <b>B2:B6</b> son las 5 celdas de B2 a B6. <b>A1:C3</b> es un bloque de 9 celdas.',
            learn: [
              P('Un <b>rango</b> es un <b>grupo de celdas seguidas</b>. Se escribe con la primera celda, <b>dos puntos (:)</b> y la última celda.'),
              { type: 'sheet', rows: products, range: 'B2:B6', caption: 'El rango <b>B2:B6</b> (en azul) son las 5 celdas de precios: B2, B3, B4, B5 y B6.' },
              P('También puede ser un bloque: <b>A1:C3</b> incluye 3 columnas × 3 filas = <b>9 celdas</b>.'),
              STEPS(['<b>Arrastrando</b>: clic en la primera celda y, sin soltar, llega hasta la última.', '<b>Shift + clic</b>: clic en la primera celda, mantén <kbd>Shift</kbd> y haz clic en la última.', 'Clic en la <b>letra</b> de una columna o el <b>número</b> de una fila para seleccionarla completa.'], 'Cómo seleccionar un rango'),
              KEY('Los rangos son súper importantes: las fórmulas como <code>=SUMA(B2:B6)</code> los usan para saber qué celdas calcular.'),
              { type: 'reveal', q: '¿Cuántas celdas tiene el rango A1:A10?', a: '<b>10 celdas</b>: A1, A2, A3... hasta A10.' }
            ],
            practice: [
              { type: 'fill', q: 'Escribe el rango que va desde la celda <b>C2</b> hasta la <b>C8</b>.', accept: ['C2:C8'], placeholder: 'Ejemplo: A1:A5', hint: 'Primera celda, dos puntos, última celda.' },
              { type: 'mcq', q: '¿Cuántas celdas tiene el rango <b>A1:B3</b>?', options: ['6', '3', '2', '5'], answer: 0, explain: '2 columnas (A y B) × 3 filas (1, 2 y 3) = 6 celdas.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Selecciona el rango <b>A1:D1</b> (arrastra desde A1 hasta D1) y pulsa <b>N</b> (negrita).', 'Selecciona el rango <b>A2:A5</b> y dale un <b>color de relleno</b> 🎨.'],
                sim: sheet([['Estudiante', 'Matemáticas', 'Español', 'Ciencias'], ['Ana', 4.5, 4.0, 3.8], ['Luis', 3.2, 4.1, 4.4], ['Sara', 4.8, 4.6, 4.9], ['Pedro', 3.9, 3.5, 4.0]], { formats: {} }),
                checks: [
                  { type: 'format', range: 'A1:D1', prop: 'bold', mode: 'all', label: 'A1:D1 en negrita', hint: 'Arrastra de A1 a D1 y pulsa N.' },
                  { type: 'format', range: 'A2:A5', prop: 'fill', mode: 'all', label: 'A2:A5 con color de relleno', hint: 'Arrastra de A2 a A5 y elige un color en 🎨.' }
                ]
              }
            }
          },
          {
            id: 'x1-4', icon: '✍️', title: 'Introducir y modificar información', minutes: 7,
            summary: 'Haz clic en una celda, escribe y pulsa <kbd>Enter</kbd> (baja) o <kbd>Tab</kbd> (derecha). Para corregir, escribe encima o edita en la barra de fórmulas. Los <b>números</b> se alinean a la derecha; si un número queda a la izquierda, Excel lo tomó como texto.',
            learn: [
              STEPS(['Haz clic en la celda.', 'Escribe el dato.', 'Pulsa <kbd>Enter</kbd> para bajar o <kbd>Tab</kbd> para ir a la derecha.'], 'Escribir un dato'),
              STEPS(['<b>Reemplazar</b>: selecciona la celda y escribe encima.', '<b>Corregir una parte</b>: doble clic en la celda (o <kbd>F2</kbd>) o edita en la barra de fórmulas.', '<b>Borrar</b>: selecciona y pulsa <kbd>Supr</kbd>.', '<b>Cancelar</b> lo que estás escribiendo: <kbd>Esc</kbd>.'], 'Modificar un dato'),
              KEYS([[['Enter'], 'Confirmar y bajar'], [['Tab'], 'Confirmar e ir a la derecha'], [['F2'], 'Editar la celda'], [['Supr'], 'Borrar'], [['Esc'], 'Cancelar']]),
              TIP('Excel pone los <b>textos a la izquierda</b> y los <b>números a la derecha</b>. Si un número se ve a la izquierda, ¡Excel lo está tomando como texto y no podrá sumarlo!'),
              WARN('No escribas unidades junto al número: <b>"15 kg"</b> o <b>"3 unidades"</b> es texto. Escribe solo <b>15</b> y pon "kg" en el título de la columna: <b>Peso (kg)</b>.')
            ],
            practice: [
              { type: 'mcq', q: 'Escribiste un dato en una celda. ¿Qué tecla pulsas para confirmarlo y bajar a la siguiente fila?', options: ['Enter', 'Esc', 'Supr', 'F12'], answer: 0 },
              { type: 'mcq', q: 'En una celda escribiste <b>"15 kg"</b>. ¿Excel puede sumarlo con otros pesos?', options: ['No, porque lo toma como texto', 'Sí, sin problema', 'Solo si está en negrita', 'Solo los lunes'], answer: 0 },
              { type: 'tf', q: 'Normalmente Excel alinea los números a la derecha de la celda.', answer: true }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['En <b>B2</b> dice "3 unidades": cámbialo por el número <b>3</b>.', 'En <b>B4</b> falta la cantidad: escribe <b>2</b>.', 'Cambia <b>Cuaderno</b> por <b>Cuadernos</b> en A3.'],
                sim: sheet([['Producto', 'Cantidad'], ['Lápiz', '3 unidades'], ['Cuaderno', 5], ['Borrador', '']], { unlock: ['B2', 'A3', 'B4'], extraRows: 2 }),
                checks: [
                  { type: 'value', cell: 'B2', value: 3, label: 'B2 es el número 3', hint: 'Selecciona B2 y escribe solo 3.' },
                  { type: 'value', cell: 'B4', value: 2, label: 'B4 tiene el número 2', hint: 'Clic en B4, escribe 2 y Enter.' },
                  { type: 'text', cell: 'A3', text: 'Cuadernos', label: 'A3 dice "Cuadernos"', hint: 'Doble clic en A3 y agrega la "s".' }
                ]
              }
            }
          },
          {
            id: 'x1-5', icon: '💾', title: 'Guardar archivos y organizar hojas', minutes: 5,
            summary: 'Guarda con <kbd>Ctrl</kbd>+<kbd>G</kbd> (inglés <kbd>Ctrl</kbd>+<kbd>S</kbd>). La primera vez usa <b>Guardar como</b>, elige carpeta y un nombre claro. Para entregar sin cambios, exporta a <b>PDF</b>. Doble clic en una pestaña cambia el nombre de la hoja.',
            learn: [
              STEPS(['<b>Archivo → Guardar como</b>.', 'Elige la carpeta.', 'Nombre claro: <code>Notas_9B_Periodo1</code>.', 'Tipo: <b>Libro de Excel (.xlsx)</b>. Pulsa Guardar.'], 'Guardar por primera vez'),
              KEYS([[['Ctrl', 'G'], 'Guardar (inglés Ctrl+S)'], [['F12'], 'Guardar como']]),
              TIP('Si trabajas en <b>OneDrive</b> o <b>Excel en línea</b>, se activa el <b>Autoguardado</b> y se guarda solo.'),
              H('Organizar las hojas'),
              STEPS(['<b>Agregar</b> una hoja: botón <b>⊕</b> junto a las pestañas.', '<b>Cambiar el nombre</b>: doble clic en la pestaña y escribe (ej. "Periodo 1").', '<b>Moverla</b>: arrastra la pestaña.']),
              EX('Un libro <b>Notas_9B.xlsx</b> con 4 hojas: "Periodo 1", "Periodo 2", "Periodo 3" y "Periodo 4".')
            ],
            practice: [
              { type: 'mcq', q: 'El profe pide la tabla de notas para <b>verla e imprimirla</b>, sin que se pueda modificar. ¿Cómo la guardas?', options: ['Guardar como → PDF', 'Guardar como → .docx', 'No guardarla', 'Tomarle una foto al monitor'], answer: 0 },
              { type: 'tf', q: 'Para cambiar el nombre de una hoja haces doble clic en su pestaña.', answer: true }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: '¿Cuál es el mejor nombre para tu archivo de presupuesto del paseo?', options: ['Presupuesto_Paseo_9B', 'Libro1', 'nuevo', 'xxxx'], answer: 0 },
                { type: 'order', q: 'Ordena los pasos para guardar un libro por primera vez:', items: ['Archivo → Guardar como', 'Elegir la carpeta', 'Escribir un nombre claro', 'Pulsar Guardar'] },
                { type: 'mcq', q: 'Quieres tener las notas de cada periodo en el mismo archivo pero separadas. ¿Qué haces?', options: ['Una hoja para cada periodo dentro del mismo libro', 'Un libro diferente para cada nota', 'Todo en una sola columna', 'Usar Word'], answer: 0 }
              ]
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 2 — ORGANIZACIÓN
       * ============================================================ */
      {
        id: 'x2', num: 2, icon: '🗂️', title: 'Organización',
        desc: 'Formato de celdas, bordes, colores, alineación, combinar, ajustar columnas, ordenar y filtrar.',
        topics: [
          {
            id: 'x2-1', icon: '💲', title: 'Formato de celdas (moneda, %, decimales)', minutes: 7,
            summary: 'El <b>formato de número</b> cambia cómo <b>se ve</b> un valor, no el valor. <b>Moneda ($)</b> para dinero, <b>Porcentaje (%)</b> para proporciones y <b>decimales</b> para notas. No escribas el $ a mano en cada celda.',
            learn: [
              P('Excel puede mostrar el mismo número de formas diferentes. El valor no cambia: solo su <b>apariencia</b>.'),
              { type: 'sheet', rows: [['Formato', 'Se ve así', 'Valor real'], ['General', '0,25', '0,25'], ['Moneda', '$ 25.000', '25000'], ['Porcentaje', '25%', '0,25'], ['Un decimal', '4,0', '4']], header: true, caption: 'El 25% y el 0,25 son el mismo número, solo que con distinto formato.' },
              { type: 'ribbon', app: 'excel', tab: 'Inicio', buttons: [{ i: 'General ▾', l: 'Formato de número' }, { i: '$', l: 'Moneda', hl: true }, { i: '%', l: 'Porcentaje', hl: true }, { i: ',0', l: 'Aumentar decimales' }, { i: '.00', l: 'Disminuir decimales' }], caption: 'Grupo <b>Número</b> de la pestaña Inicio.' },
              STEPS(['Selecciona las celdas (por ejemplo, los precios).', 'Pulsa <b>$</b> para moneda o <b>%</b> para porcentaje.', 'Ajusta los decimales si hace falta.']),
              WARN('No escribas "$" o "pesos" a mano en cada celda: aplica el formato. Así Excel sigue sabiendo que son números.')
            ],
            practice: [
              { type: 'mcq', q: 'Escribiste <b>0,15</b> en una celda y le aplicaste formato porcentaje. ¿Qué se ve?', options: ['15%', '0,15%', '1,5%', '150%'], answer: 0, explain: '0,15 = 15 de cada 100 = 15%.' },
              { type: 'mcq', q: '¿Qué formato usas para una columna de <b>precios</b>?', options: ['Moneda', 'Porcentaje', 'Fecha', 'Texto'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Selecciona los precios <b>B2:B5</b> y aplica formato <b>moneda ($)</b>.', 'Selecciona los descuentos <b>C2:C5</b> y aplica formato <b>porcentaje (%)</b>.'],
                sim: sheet([['Útil escolar', 'Precio', 'Descuento'], ['Morral', 85000, 0.1], ['Calculadora', 42000, 0.15], ['Colores x24', 18000, 0.05], ['Cuaderno', 7500, 0.2]], { colWidths: { A: 130 } }),
                checks: [
                  { type: 'format', range: 'B2:B5', prop: 'num', value: 'currency', mode: 'all', label: 'Precios con formato moneda', hint: 'Selecciona B2:B5 y pulsa $.' },
                  { type: 'format', range: 'C2:C5', prop: 'num', value: 'percent', mode: 'all', label: 'Descuentos con formato porcentaje', hint: 'Selecciona C2:C5 y pulsa %.' }
                ]
              }
            }
          },
          {
            id: 'x2-2', icon: '🔲', title: 'Bordes y colores', minutes: 6,
            summary: 'Las líneas grises de Excel <b>no se imprimen</b>: para que tu tabla tenga líneas usa <b>Bordes → Todos los bordes</b>. Usa un <b>color de relleno</b> suave y negrita en los encabezados.',
            learn: [
              WARN('¡Las líneas grises de la cuadrícula <b>no salen al imprimir</b>! Si quieres que la tabla tenga líneas, tienes que ponerle <b>bordes</b>.', 'Sorpresa'),
              { type: 'compare', beforeLabel: 'Sin formato', afterLabel: 'Con bordes y colores',
                before: '<table style="font-size:.85rem;border-collapse:collapse"><tr><td>Materia</td><td>Nota</td></tr><tr><td>Inglés</td><td>4,2</td></tr><tr><td>Arte</td><td>4,8</td></tr></table>',
                after: '<table style="font-size:.85rem;border-collapse:collapse"><tr><td style="border:1px solid #333;background:#1e3a8a;color:#fff;font-weight:800;padding:2px 8px">Materia</td><td style="border:1px solid #333;background:#1e3a8a;color:#fff;font-weight:800;padding:2px 8px">Nota</td></tr><tr><td style="border:1px solid #333;padding:2px 8px">Inglés</td><td style="border:1px solid #333;padding:2px 8px">4,2</td></tr><tr><td style="border:1px solid #333;padding:2px 8px;background:#eff6ff">Arte</td><td style="border:1px solid #333;padding:2px 8px;background:#eff6ff">4,8</td></tr></table>' },
              { type: 'ribbon', app: 'excel', tab: 'Inicio', buttons: [{ i: '<b>N</b>', l: 'Negrita' }, { i: '▦', l: 'Bordes', hl: true }, { i: '🎨', l: 'Color de relleno', hl: true }, { i: 'A', l: 'Color de fuente' }, { i: '▤', l: 'Dar formato como tabla' }] },
              STEPS(['Selecciona toda la tabla.', 'Abre <b>Bordes ▾</b> y elige <b>Todos los bordes</b>.', 'Selecciona la fila de encabezados: <b>negrita</b> y un <b>color de relleno</b>.']),
              TIP('<b>Dar formato como tabla</b> aplica colores, bordes y filtros de una sola vez.')
            ],
            practice: [
              { type: 'tf', q: 'Las líneas grises de la cuadrícula de Excel aparecen cuando imprimes.', answer: false, explain: 'Por eso hay que poner bordes.' },
              { type: 'mcq', q: '¿Qué opción de bordes pone líneas en todas las celdas seleccionadas?', options: ['Todos los bordes', 'Borde inferior', 'Sin borde', 'Borde grueso de cuadro'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Selecciona toda la tabla <b>A1:C5</b> y pulsa <b>▦ Bordes</b>.', 'Selecciona los encabezados <b>A1:C1</b> y ponles un <b>color de relleno</b> 🎨.', 'Los encabezados también deben estar en <b>negrita</b>.'],
                sim: sheet([['Materia', 'Periodo 1', 'Periodo 2'], ['Matemáticas', 3.8, 4.1], ['Español', 4.2, 4.4], ['Inglés', 3.5, 3.9], ['Tecnología', 4.9, 4.7]], { formats: { 'A1:C1': {} }, colWidths: { A: 120 } }),
                checks: [
                  { type: 'format', range: 'A1:C5', prop: 'border', mode: 'all', label: 'Toda la tabla con bordes', hint: 'Arrastra de A1 a C5 y pulsa Bordes.' },
                  { type: 'format', range: 'A1:C1', prop: 'fill', mode: 'all', label: 'Encabezados con color de relleno', hint: 'Selecciona A1:C1 y elige un color.' },
                  { type: 'format', range: 'A1:C1', prop: 'bold', mode: 'all', label: 'Encabezados en negrita', hint: 'Selecciona A1:C1 y pulsa N.' }
                ]
              }
            }
          },
          {
            id: 'x2-3', icon: '⬌', title: 'Alineación y combinar celdas', minutes: 6,
            summary: 'Puedes alinear el contenido a la <b>izquierda</b>, al <b>centro</b> o a la <b>derecha</b>. <b>Combinar y centrar</b> une varias celdas en una sola; se usa para títulos que abarcan toda la tabla.',
            learn: [
              P('La <b>alineación</b> funciona como en Word: izquierda, centro o derecha. Los encabezados se ven bien <b>centrados</b>.'),
              { type: 'compare', beforeLabel: 'Sin combinar', afterLabel: 'Combinar y centrar A1:C1',
                before: '<table class="mini-sheet" style="min-width:0"><tr><td class="bold">Notas 9B</td><td></td><td></td></tr><tr><td>Nombre</td><td>P1</td><td>P2</td></tr></table>',
                after: '<table class="mini-sheet" style="min-width:0"><tr><td class="bold" colspan="3" style="text-align:center;background:#ede9fe">Notas 9B</td></tr><tr><td>Nombre</td><td>P1</td><td>P2</td></tr></table>' },
              STEPS(['Selecciona las celdas del título (por ejemplo, A1:C1).', 'Pulsa <b>Combinar y centrar</b> (pestaña Inicio, grupo Alineación).', 'Para separarlas, vuelve a pulsar el botón.'], 'Combinar y centrar'),
              WARN('Solo combina celdas de <b>títulos</b>. Si combinas celdas dentro de los datos, después no podrás ordenar ni filtrar bien.'),
              TIP('<b>Ajustar texto</b> hace que un texto largo ocupe varios renglones dentro de la misma celda.')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres que el título "Notas 9B" quede centrado sobre las columnas A, B y C. ¿Qué usas?', options: ['Combinar y centrar A1:C1', 'Escribir el título en B1 con espacios', 'Escribir el título tres veces', 'Poner el título en negrita'], answer: 0 },
              { type: 'tf', q: 'Es buena idea combinar celdas en medio de los datos de una tabla.', answer: false, explain: 'Luego no podrás ordenar ni filtrar correctamente.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Selecciona los encabezados <b>A1:D1</b> y pulsa <b>↔ Centrar</b>.', 'Selecciona las notas <b>B2:D4</b> y céntralas también.'],
                sim: sheet([['Estudiante', 'Taller', 'Quiz', 'Examen'], ['Juliana', 4.5, 3.8, 4.0], ['Esteban', 3.9, 4.4, 3.6], ['Manuela', 4.8, 4.9, 4.6]], {}),
                checks: [
                  { type: 'format', range: 'A1:D1', prop: 'align', value: 'center', mode: 'all', label: 'Encabezados centrados', hint: 'Selecciona A1:D1 y pulsa ↔.' },
                  { type: 'format', range: 'B2:D4', prop: 'align', value: 'center', mode: 'all', label: 'Notas centradas', hint: 'Selecciona B2:D4 y pulsa ↔.' }
                ]
              }
            }
          },
          {
            id: 'x2-4', icon: '↔️', title: 'Ajustar el ancho de las columnas', minutes: 5,
            summary: 'Si un texto se corta o un número aparece como <b>#####</b>, la columna es muy angosta. <b>Doble clic en el borde derecho</b> de la letra de la columna la ajusta al contenido más largo.',
            learn: [
              P('Cuando la columna es angosta, el texto largo <b>se corta</b> y los números se ven como <b>#####</b>. ¡El dato no se perdió! Solo no cabe.'),
              STEPS(['Lleva el mouse al <b>borde derecho</b> de la letra de la columna (entre A y B, por ejemplo).', 'Cuando aparezca la flecha doble ↔, haz <b>doble clic</b>: la columna se ajusta sola al texto más largo.', 'O arrastra el borde para darle el ancho que quieras.'], 'Autoajustar'),
              TIP('Selecciona varias columnas y haz doble clic en uno de sus bordes: ¡se ajustan todas a la vez!'),
              KEY('<b>#####</b> no es un error de la fórmula: significa "la columna es muy angosta para este número".')
            ],
            practice: [
              { type: 'mcq', q: 'Una celda muestra <b>#####</b>. ¿Qué significa?', options: ['La columna es muy angosta para mostrar el número', 'El número se borró', 'La fórmula está mal escrita', 'El archivo está dañado'], answer: 0 },
              { type: 'mcq', q: '¿Cuál es la forma más rápida de ajustar una columna a su contenido?', options: ['Doble clic en el borde derecho de la letra de la columna', 'Escribir el texto más corto', 'Cambiar la letra a tamaño 6', 'Combinar celdas'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Los nombres de los colegios no se ven completos.', 'Selecciona las columnas <b>A y B</b> (arrastra desde A1 hasta B1 o haz clic en las letras) y pulsa <b>↔ Ajustar</b>.'],
                sim: sheet([['Colegio', 'Ciudad', 'Estudiantes'], ['Institución Educativa Nuestra Señora del Carmen', 'Barranquilla', 1250], ['Colegio Técnico Industrial José Elías Puyana', 'Floridablanca', 2100], ['Escuela Normal Superior María Auxiliadora', 'Villavicencio', 980]], {}),
                checks: [
                  { type: 'action', action: 'autofit', label: 'Ajustaste el ancho de las columnas', hint: 'Selecciona las columnas y pulsa ↔ Ajustar.' }
                ]
              }
            }
          },
          {
            id: 'x2-5', icon: '🔤', title: 'Ordenar información', minutes: 7,
            summary: 'En <b>Datos → Ordenar</b> puedes ordenar de la A a la Z o de menor a mayor. <b>Selecciona toda la tabla</b> (sin los títulos o indicando que tiene encabezados), para que cada nombre siga con sus datos.',
            learn: [
              P('Ordenar pone los datos en orden <b>alfabético</b> (A→Z, Z→A) o <b>numérico</b> (menor a mayor, mayor a menor).'),
              { type: 'datatable', columns: ['Estudiante', 'Nota final'], rows: [['Valentina', 4.2], ['Andrés', 3.5], ['Sofía', 4.8], ['Camilo', 2.9], ['Mariana', 3.9]], caption: '👆 Toca los encabezados para ordenar. Toca dos veces para invertir el orden.' },
              STEPS(['Selecciona la tabla <b>completa</b> (todas sus columnas).', 'Ve a <b>Datos → Ordenar</b>.', 'Elige por qué columna ordenar y en qué sentido.', 'Acepta.']),
              WARN('Si seleccionas <b>solo una columna</b>, se ordenan los nombres pero las notas se quedan quietas: ¡cada estudiante terminaría con la nota de otro! Selecciona siempre toda la tabla.', 'Error muy común')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres ver primero las notas más altas. ¿Cómo ordenas la columna de notas?', options: ['De mayor a menor', 'De menor a mayor', 'De la A a la Z', 'No se puede'], answer: 0 },
              { type: 'mcq', q: 'Ordenaste solo la columna de nombres y ahora Camilo tiene la nota de Sofía. ¿Qué pasó?', options: ['Solo seleccioné una columna en vez de toda la tabla', 'Excel se dañó', 'Las notas estaban en negrita', 'Faltó guardar'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Selecciona <b>A2:B7</b> (nombres <b>y</b> notas, sin los títulos).', 'Pulsa <b>A→Z</b> para ordenar alfabéticamente por nombre.', 'Revisa que cada estudiante siga con su nota.'],
                sim: sheet([['Estudiante', 'Nota final'], ['Valentina', 4.2], ['Andrés', 3.5], ['Sofía', 4.8], ['Camilo', 2.9], ['Mariana', 3.9], ['Daniel', 4.0]], { lock: false }),
                checks: [
                  { type: 'sorted', range: 'A2:A7', dir: 1, label: 'Nombres en orden alfabético', hint: 'Selecciona A2:B7 y pulsa A→Z.' },
                  { type: 'rowPairs', cols: ['A', 'B'], from: 2, to: 7, pairs: [['Valentina', 4.2], ['Andrés', 3.5], ['Sofía', 4.8], ['Camilo', 2.9], ['Mariana', 3.9], ['Daniel', 4.0]], label: 'Cada estudiante sigue con su nota', hint: 'Pulsa ↺ Reiniciar y selecciona las dos columnas antes de ordenar.' }
                ]
              }
            }
          },
          {
            id: 'x2-6', icon: '🔽', title: 'Filtros', minutes: 6,
            summary: 'Con <b>Datos → Filtro</b> aparecen flechitas en los encabezados. Sirven para <b>mostrar solo las filas</b> que cumplen una condición. Las demás se ocultan, no se borran.',
            learn: [
              P('Un <b>filtro</b> muestra solo las filas que te interesan. Las otras se <b>ocultan</b> (no se borran).'),
              { type: 'datatable', columns: ['Estudiante', 'Curso', 'Deporte'], filter: 1, sort: false,
                rows: [['Ana', '9A', 'Fútbol'], ['Luis', '9B', 'Baloncesto'], ['Sara', '9A', 'Voleibol'], ['Pedro', '9B', 'Fútbol'], ['Camila', '9A', 'Fútbol'], ['Juan', '9B', 'Natación'], ['Laura', '9A', 'Baloncesto']],
                caption: '👆 Usa el filtro para ver solo un curso.' },
              STEPS(['Haz clic dentro de la tabla.', 'Ve a <b>Datos → Filtro</b> (aparecen flechitas ▾).', 'Clic en la flechita de la columna y marca solo lo que quieres ver.', 'Para quitarlo: <b>Borrar filtro</b> o vuelve a pulsar Filtro.']),
              EX('De una lista de 200 estudiantes, ver solo los de <b>9B</b>; o solo los que tienen nota <b>menor que 3</b> para organizar refuerzos.')
            ],
            practice: [
              { type: 'tf', q: 'Al aplicar un filtro, las filas que no cumplen la condición se borran.', answer: false, explain: 'Solo se ocultan. Al quitar el filtro vuelven a aparecer.' },
              { type: 'mcq', q: '¿En qué pestaña está el botón Filtro?', options: ['Datos', 'Insertar', 'Revisar', 'Vista'], answer: 0 }
            ],
            challenge: {
              questions: [
                { type: 'fill', mode: 'number', q: 'Usa el filtro de <b>Deporte</b> en la tabla. ¿Cuántos estudiantes eligieron <b>Fútbol</b>?', accept: [4],
                  blocks: [{ type: 'datatable', columns: ['Estudiante', 'Curso', 'Deporte'], filter: 2, sort: false, rows: [['Ana', '9A', 'Fútbol'], ['Luis', '9B', 'Baloncesto'], ['Sara', '9A', 'Voleibol'], ['Pedro', '9B', 'Fútbol'], ['Camila', '9A', 'Fútbol'], ['Juan', '9B', 'Natación'], ['Laura', '9A', 'Baloncesto'], ['Tomás', '9B', 'Fútbol'], ['Isabela', '9A', 'Voleibol']] }] },
                { type: 'fill', mode: 'number', q: 'Ahora filtra por <b>Curso</b>. ¿Cuántos estudiantes hay en <b>9B</b>?', accept: [4],
                  blocks: [{ type: 'datatable', columns: ['Estudiante', 'Curso', 'Deporte'], filter: 1, sort: false, rows: [['Ana', '9A', 'Fútbol'], ['Luis', '9B', 'Baloncesto'], ['Sara', '9A', 'Voleibol'], ['Pedro', '9B', 'Fútbol'], ['Camila', '9A', 'Fútbol'], ['Juan', '9B', 'Natación'], ['Laura', '9A', 'Baloncesto'], ['Tomás', '9B', 'Fútbol'], ['Isabela', '9A', 'Voleibol']] }] },
                { type: 'mcq', q: 'Tienes la lista de todo el colegio y solo quieres ver a quienes tienen nota menor que 3. ¿Qué usas?', options: ['Un filtro', 'Borrar las demás filas', 'Copiar a mano esos nombres', 'Cambiar el color de la letra'], answer: 0 }
              ]
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 3 — FÓRMULAS BÁSICAS
       * ============================================================ */
      {
        id: 'x3', num: 3, icon: '🧮', title: 'Fórmulas básicas',
        desc: 'Operaciones matemáticas, SUMA, PROMEDIO, MAX, MIN, CONTAR y porcentajes.',
        topics: [
          {
            id: 'x3-1', icon: '➕', title: 'Operaciones matemáticas básicas', minutes: 8,
            summary: 'Toda fórmula empieza con <b>=</b>. Operadores: <b>+</b> suma, <b>-</b> resta, <b>*</b> multiplicación, <b>/</b> división, <b>^</b> potencia. Usa <b>celdas</b> (=A2*B2) en vez de números, así el resultado se actualiza solo.',
            learn: [
              KEY('Toda fórmula de Excel <b>empieza con el signo igual (=)</b>. Si no lo pones, Excel cree que es texto.'),
              { type: 'sheet', header: true, rows: [['Operación', 'Símbolo', 'Ejemplo', 'Resultado'], ['Suma', '+', ' =8+2', '=8+2'], ['Resta', '-', ' =8-2', '=8-2'], ['Multiplicación', '*', ' =8*2', '=8*2'], ['División', '/', ' =8/2', '=8/2'], ['Potencia', '^', ' =8^2', '=8^2']], caption: 'En el teclado, la multiplicación es el asterisco <b>*</b> (no la x) y la división es la barra <b>/</b>.' },
              H('Mejor con celdas que con números'),
              P('En vez de escribir <code>=3*2500</code>, escribe <code>=B2*C2</code>. Si cambia la cantidad o el precio, ¡el total se recalcula solo!'),
              { type: 'sheet', rows: [['Producto', 'Cantidad', 'Precio', 'Total'], ['Empanada', 3, 2500, '=B2*C2'], ['Jugo', 2, 3000, '=B3*C3']], hl: ['D2', 'D3'], caption: 'Pulsa "Ver fórmulas" para ver qué hay dentro de la columna Total.' },
              TIP('Excel respeta el orden de las operaciones: primero <b>paréntesis</b>, luego <b>* y /</b>, y al final <b>+ y -</b>. <code>=2+3*4</code> da 14, pero <code>=(2+3)*4</code> da 20.')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué símbolo se usa para <b>multiplicar</b> en Excel?', options: ['*', 'x', '×', '#'], answer: 0 },
              { type: 'fill', mode: 'formula', q: 'En <b>A1</b> hay 12 y en <b>B1</b> hay 8. Escribe la fórmula que los <b>suma</b> usando las celdas.', sheet: [[12, 8]], expect: 20, accept: ['=A1+B1', '=B1+A1'], hint: 'Empieza con = y usa los nombres de las celdas.' },
              { type: 'mcq', q: '¿Cuánto da <code>=2+3*4</code>?', options: ['14', '20', '24', '9'], answer: 0, explain: 'Primero la multiplicación (3*4=12) y después la suma (2+12=14).' }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'La tienda escolar',
                instructions: ['En <b>D2</b> calcula el total de empanadas: <code>=B2*C2</code>', 'Haz lo mismo en <b>D3</b> y <b>D4</b> (cambiando el número de fila).', 'En <b>D5</b> suma los tres totales: <code>=D2+D3+D4</code>'],
                sim: sheet([['Producto', 'Cantidad', 'Precio', 'Total'], ['Empanada', 3, 2500, ''], ['Jugo', 2, 3000, ''], ['Galleta', 4, 1500, ''], ['', '', 'Total a pagar', '']], { targets: ['D2', 'D3', 'D4', 'D5'], formats: { 'C2:D5': { num: 'currency' }, C5: { bold: true, num: '' } } }),
                checks: [
                  { type: 'cell', cell: 'D2', value: 7500, label: 'D2 = 7.500 con fórmula', hint: '=B2*C2' },
                  { type: 'cell', cell: 'D3', value: 6000, label: 'D3 = 6.000 con fórmula', hint: '=B3*C3' },
                  { type: 'cell', cell: 'D4', value: 6000, label: 'D4 = 6.000 con fórmula', hint: '=B4*C4' },
                  { type: 'cell', cell: 'D5', value: 19500, label: 'D5 = 19.500 con fórmula', hint: '=D2+D3+D4' }
                ],
                expected: '<p>D2 = <b>$ 7.500</b>, D3 = <b>$ 6.000</b>, D4 = <b>$ 6.000</b> y D5 = <b>$ 19.500</b>.</p><p>Fórmulas: <code>=B2*C2</code>, <code>=B3*C3</code>, <code>=B4*C4</code>, <code>=D2+D3+D4</code>.</p>'
              }
            }
          },
          {
            id: 'x3-2', icon: 'Σ', title: 'La función SUMA', minutes: 8,
            summary: '<code>=SUMA(B2:B6)</code> suma todas las celdas del rango B2 a B6. Es más rápida que sumar una por una y funciona con 5 o con 500 celdas.',
            learn: [
              P('<b>1. Explicación sencilla:</b> la función <b>SUMA</b> suma todos los números de un rango. En vez de escribir <code>=B2+B3+B4+B5+B6</code>, escribes <code>=SUMA(B2:B6)</code>.'),
              { type: 'formula', parts: [['=', 'Toda fórmula empieza con igual.'], ['SUMA', 'El nombre de la función.'], ['(', 'Abre paréntesis.'], ['B2:B6', 'El rango: desde B2 hasta B6.'], [')', 'Cierra paréntesis.']] },
              P('<b>2. Ejemplo:</b> imagina que tienes 5 productos:'),
              { type: 'sheet', rows: products.concat([['Total', '=SUMA(B2:B6)']]), hl: ['B7'], range: 'B2:B6', caption: 'La fórmula en B7 suma el rango B2:B6. Pulsa "Ver fórmulas".' },
              EXPECTED('5.000 + 8.000 + 3.000 + 7.000 + 2.000 = <b>25.000</b>'),
              TIP('En Excel en inglés la función se llama <code>SUM</code>. Botón rápido: <b>Σ Autosuma</b> en la pestaña Inicio.'),
              WARN('Errores comunes: olvidar el <b>=</b>, escribir <b>SUMAR</b> en vez de SUMA (aparece <b>#¿NOMBRE?</b>) o dejar celdas por fuera del rango.')
            ],
            practice: [
              { type: 'mcq', q: 'Imagina que tienes 5 productos (Producto A: $5.000, B: $8.000, C: $3.000, D: $7.000, E: $2.000). ¿Qué fórmula usarías para conocer el <b>total</b>?',
                table: { rows: products },
                options: ['<code>=SUMA(B2:B6)</code>', '<code>=PROMEDIO(B2:B6)</code>', '<code>=B2:B6</code>', '<code>SUMA(B2:B6)</code>'], answer: 0,
                why: [null, 'PROMEDIO calcula el valor promedio (5.000), no el total.', 'Un rango solo, sin función, da error. Excel no sabe qué hacer con esas celdas.', '¡Casi! Pero le falta el signo <b>=</b> al inicio. Sin él, Excel lo toma como texto.'],
                explain: 'SUMA suma todas las celdas del rango B2:B6: el total es 25.000.' },
              { type: 'fill', mode: 'formula', q: 'Escribe la fórmula que suma las notas de las celdas <b>C2 a C9</b>.', accept: ['=SUMA(C2:C9)'], hint: '=SUMA( rango )', explain: 'Rango: primera celda, dos puntos, última celda.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Haz clic en la celda <b>B7</b> (resaltada en amarillo).', 'Escribe la fórmula que suma todos los precios.', 'Pulsa <kbd>Enter</kbd> y pulsa <b>Comprobar</b>.'],
                sim: sheet(products.concat([['Total', '']]), { targets: ['B7'], formats: { 'B2:B7': { num: 'currency' }, A7: { bold: true } } }),
                checks: [{ type: 'cell', cell: 'B7', value: 25000, fn: 'SUMA', range: 'B2:B6', label: 'B7 suma los precios con SUMA', hint: '=SUMA(B2:B6)' }],
                expected: '<p>En B7: <code>=SUMA(B2:B6)</code></p><p>Resultado: <b>$ 25.000</b></p>',
                success: '¡Perfecto! Si cambias un precio, el total se actualiza solo. Esa es la magia de las fórmulas.'
              }
            }
          },
          {
            id: 'x3-3', icon: '⚖️', title: 'La función PROMEDIO', minutes: 8,
            summary: '<code>=PROMEDIO(B2:B6)</code> suma los números del rango y divide entre la cantidad de números. Sirve para calcular tu nota promedio. Las celdas vacías no cuentan, pero un 0 sí.',
            learn: [
              P('<b>1. Explicación sencilla:</b> el <b>promedio</b> es sumar todos los valores y dividir entre cuántos hay. La función <b>PROMEDIO</b> lo hace por ti.'),
              { type: 'formula', parts: [['=', 'Empieza con igual.'], ['PROMEDIO', 'Nombre de la función (en inglés: AVERAGE).'], ['(B2:B5)', 'El rango de notas.']] },
              P('<b>2. Ejemplo:</b> las notas de Mateo en Matemáticas:'),
              { type: 'sheet', rows: [['Actividad', 'Nota'], ['Taller', 4.0], ['Quiz', 3.5], ['Exposición', 4.5], ['Examen', 3.0], ['Promedio', '=PROMEDIO(B2:B5)']], hl: ['B6'], range: 'B2:B5' },
              EXPECTED('(4,0 + 3,5 + 4,5 + 3,0) ÷ 4 = 15 ÷ 4 = <b>3,75</b>'),
              WARN('Una celda <b>vacía</b> no cuenta para el promedio, pero una celda con <b>0</b> sí cuenta (y baja el promedio). Por ejemplo, si no entregaste un taller y el profe pone 0, afecta tu nota.'),
              TIP('Si ves muchos decimales, usa el botón <b>Disminuir decimales</b> o la función <code>=REDONDEAR(PROMEDIO(B2:B5);1)</code>.')
            ],
            practice: [
              { type: 'mcq', q: 'Las notas de Sara son 4, 3 y 5. ¿Cuál es su promedio?', options: ['4', '12', '3', '5'], answer: 0, explain: '(4 + 3 + 5) ÷ 3 = 12 ÷ 3 = 4.' },
              { type: 'fill', mode: 'formula', q: 'Las notas están en <b>B2:B5</b>. Escribe la fórmula del promedio.', sheet: [['Nota'], [4], [3.5], [4.5], [3]], expect: 3.75, requireFn: 'PROMEDIO', accept: ['=PROMEDIO(B2:B5)'], hint: '=PROMEDIO( rango )', showSheet: false },
              { type: 'tf', q: 'Una celda vacía cuenta como 0 en el PROMEDIO.', answer: false, explain: 'Las celdas vacías se ignoran; un 0 escrito sí cuenta.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['En <b>B7</b> calcula el <b>promedio</b> de las notas de Ana.', 'Usa la función PROMEDIO con el rango correcto.'],
                sim: sheet([['Materia', 'Nota de Ana'], ['Matemáticas', 4.0], ['Español', 3.5], ['Ciencias', 4.5], ['Inglés', 3.0], ['Sociales', 4.2], ['Promedio', '']], { targets: ['B7'], formats: { A7: { bold: true } }, colWidths: { A: 110, B: 110 } }),
                checks: [{ type: 'cell', cell: 'B7', value: 3.84, fn: 'PROMEDIO', range: 'B2:B6', label: 'B7 calcula el promedio con PROMEDIO', hint: '=PROMEDIO(B2:B6)' }],
                expected: '<p>En B7: <code>=PROMEDIO(B2:B6)</code></p><p>(4,0 + 3,5 + 4,5 + 3,0 + 4,2) ÷ 5 = <b>3,84</b></p>'
              }
            }
          },
          {
            id: 'x3-4', icon: '🔝', title: 'La función MAX', minutes: 6,
            summary: '<code>=MAX(B2:B8)</code> encuentra el <b>número más alto</b> del rango: la nota más alta, el precio más caro, la temperatura máxima.',
            learn: [
              P('<b>1. Explicación sencilla:</b> <b>MAX</b> busca el <b>valor más grande</b> de un rango. Imagina que tienes 500 notas: MAX te dice la más alta en un segundo.'),
              { type: 'formula', parts: [['=', 'Empieza con igual.'], ['MAX', 'Máximo: el mayor valor.'], ['(B2:B6)', 'El rango donde buscar.']] },
              P('<b>2. Ejemplo:</b> ¿quién sacó la nota más alta del quiz?'),
              { type: 'sheet', rows: [['Estudiante', 'Quiz'], ['Ana', 3.8], ['Luis', 4.6], ['Sara', 4.1], ['Pedro', 2.9], ['Nota más alta', '=MAX(B2:B5)']], hl: ['B6'], range: 'B2:B5' },
              EXPECTED('Entre 3,8 · 4,6 · 4,1 · 2,9 el mayor es <b>4,6</b>.'),
              TIP('MAX te dice el <b>valor</b>, no el nombre. Para saber quién fue, busca ese valor en la tabla (o ordena de mayor a menor).')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué fórmula te da la <b>nota más alta</b> del rango C2:C30?', options: ['<code>=MAX(C2:C30)</code>', '<code>=MIN(C2:C30)</code>', '<code>=SUMA(C2:C30)</code>', '<code>=MAXIMO C2:C30</code>'], answer: 0,
                why: [null, 'MIN da la más baja.', 'SUMA las suma todas.', 'Está mal escrita: falta paréntesis y la función se llama MAX.'] },
              { type: 'fill', mode: 'formula', q: 'Escribe la fórmula para encontrar el precio más caro del rango <b>B2:B10</b>.', accept: ['=MAX(B2:B10)'], hint: '=MAX( rango )' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['En <b>B9</b> calcula la <b>temperatura más alta</b> de la semana.'],
                sim: sheet([['Día', 'Temperatura (°C)'], ['Lunes', 24], ['Martes', 27], ['Miércoles', 22], ['Jueves', 29], ['Viernes', 25], ['Sábado', 30], ['Domingo', 26], ['Máxima', '']], { targets: ['B9'], formats: { A9: { bold: true } }, colWidths: { B: 140 } }),
                checks: [{ type: 'cell', cell: 'B9', value: 30, fn: 'MAX', range: 'B2:B8', label: 'B9 muestra la máxima con MAX', hint: '=MAX(B2:B8)' }],
                expected: '<p>En B9: <code>=MAX(B2:B8)</code> → <b>30</b> (el sábado).</p>'
              }
            }
          },
          {
            id: 'x3-5', icon: '🔻', title: 'La función MIN', minutes: 6,
            summary: '<code>=MIN(B2:B8)</code> encuentra el <b>número más bajo</b> del rango: el precio más barato, la nota más baja, el menor gasto.',
            learn: [
              P('<b>1. Explicación sencilla:</b> <b>MIN</b> es lo contrario de MAX: busca el <b>valor más pequeño</b> de un rango.'),
              { type: 'formula', parts: [['=', 'Empieza con igual.'], ['MIN', 'Mínimo: el menor valor.'], ['(B2:B6)', 'El rango donde buscar.']] },
              P('<b>2. Ejemplo:</b> comparar precios de un balón en varias tiendas:'),
              { type: 'sheet', rows: [['Tienda', 'Precio'], ['Tienda A', 65000], ['Tienda B', 58000], ['Tienda C', 72000], ['Tienda D', 61000], ['Más barato', '=MIN(B2:B5)']], hl: ['B6'], range: 'B2:B5' },
              EXPECTED('El precio más bajo es <b>58.000</b> (Tienda B).'),
              EX('¿Cuál fue la nota más baja del curso? ¿Cuál fue el día que menos gastaste? ¿Cuál es el celular más económico?')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres saber cuál fue el <b>menor gasto</b> de la semana (C2:C8). ¿Qué fórmula usas?', options: ['<code>=MIN(C2:C8)</code>', '<code>=MAX(C2:C8)</code>', '<code>=CONTAR(C2:C8)</code>', '<code>=MIN C2:C8</code>'], answer: 0 },
              { type: 'fill', mode: 'formula', q: 'Escribe la fórmula para la nota más baja del rango <b>D2:D25</b>.', accept: ['=MIN(D2:D25)'] }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Quieres comprar el celular más económico.', 'En <b>B7</b> usa MIN para encontrar el precio más bajo.'],
                sim: sheet([['Celular', 'Precio'], ['Modelo X1', 650000], ['Modelo Z5', 480000], ['Modelo Pro', 920000], ['Modelo Lite', 530000], ['Modelo Go', 399000], ['Más económico', '']], { targets: ['B7'], formats: { 'B2:B7': { num: 'currency' }, A7: { bold: true } }, colWidths: { A: 120, B: 110 } }),
                checks: [{ type: 'cell', cell: 'B7', value: 399000, fn: 'MIN', range: 'B2:B6', label: 'B7 muestra el menor precio con MIN', hint: '=MIN(B2:B6)' }],
                expected: '<p>En B7: <code>=MIN(B2:B6)</code> → <b>$ 399.000</b> (Modelo Go).</p>'
              }
            }
          },
          {
            id: 'x3-6', icon: '🔢', title: 'La función CONTAR', minutes: 7,
            summary: '<code>=CONTAR(B2:B9)</code> cuenta <b>cuántas celdas tienen números</b> en un rango (ignora textos y vacías). <code>CONTARA</code> cuenta todas las celdas que no están vacías.',
            learn: [
              P('<b>1. Explicación sencilla:</b> <b>CONTAR</b> no suma: dice <b>cuántas celdas tienen números</b>. Las celdas con texto o vacías no las cuenta.'),
              { type: 'formula', parts: [['=', 'Empieza con igual.'], ['CONTAR', 'Cuenta celdas con números (inglés: COUNT).'], ['(B2:B7)', 'El rango.']] },
              P('<b>2. Ejemplo:</b> ¿cuántos estudiantes entregaron el taller (tienen nota)?'),
              { type: 'sheet', rows: [['Estudiante', 'Taller'], ['Ana', 4.5], ['Luis', 'No entregó'], ['Sara', 3.8], ['Pedro', ''], ['Camila', 4.0], ['Entregaron', '=CONTAR(B2:B6)']], hl: ['B7'], range: 'B2:B6' },
              EXPECTED('Hay números en B2, B4 y B6 → <b>3</b>. "No entregó" es texto y B5 está vacía: no cuentan.'),
              { type: 'compare', beforeLabel: 'CONTAR', afterLabel: 'CONTARA', before: 'Cuenta solo celdas con <b>números</b>.', after: 'Cuenta todas las celdas <b>no vacías</b> (números y textos).' },
              WARN('No confundas: <b>SUMA</b> suma los valores (4,5 + 3,8 + 4,0 = 12,3). <b>CONTAR</b> dice cuántos hay (3).')
            ],
            practice: [
              { type: 'mcq', q: 'En B2:B6 hay: 4, "hola", 5, (vacía), 3. ¿Cuánto da <code>=CONTAR(B2:B6)</code>?', options: ['3', '5', '12', '4'], answer: 0, why: [null, 'CONTAR no cuenta textos ni vacías.', '12 sería la SUMA.', '"hola" es texto, no cuenta.'] },
              { type: 'mcq', q: '¿Qué función usarías para saber <b>cuántos estudiantes</b> tienen nota registrada?', options: ['CONTAR', 'SUMA', 'MAX', 'PROMEDIO'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['Algunos estudiantes no entregaron el proyecto.', 'En <b>B10</b> usa CONTAR para saber <b>cuántos sí lo entregaron</b> (tienen nota).'],
                sim: sheet([['Estudiante', 'Proyecto'], ['Ana', 4.5], ['Luis', 'No entregó'], ['Sara', 3.8], ['Pedro', ''], ['Camila', 4.0], ['Juan', 2.9], ['Valentina', 'No entregó'], ['Mateo', 4.7], ['Entregaron', '']], { targets: ['B10'], formats: { A10: { bold: true } }, colWidths: { B: 110 } }),
                checks: [{ type: 'cell', cell: 'B10', value: 5, fn: 'CONTAR', range: 'B2:B9', label: 'B10 cuenta las entregas con CONTAR', hint: '=CONTAR(B2:B9)' }],
                expected: '<p>En B10: <code>=CONTAR(B2:B9)</code> → <b>5</b> estudiantes (Ana, Sara, Camila, Juan y Mateo).</p>'
              }
            }
          },
          {
            id: 'x3-7', icon: '％', title: 'Porcentajes', minutes: 9,
            summary: 'Porcentaje de un total: <code>=parte/total</code> y aplicas formato <b>%</b>. Porcentaje de un valor (descuento): <code>=precio*20%</code>. Precio final: <code>=precio-descuento</code>.',
            learn: [
              P('<b>1. Explicación sencilla:</b> un porcentaje dice "cuántos de cada 100". En Excel hay dos casos muy comunes:'),
              H('Caso 1: ¿qué porcentaje es una parte del total?'),
              { type: 'sheet', rows: [['Dato', 'Valor'], ['Estudiantes del curso', 30], ['Aprobaron', 18], ['% de aprobación', '=B3/B2']], hl: ['B4'], caption: 'La fórmula <code>=B3/B2</code> da 0,6. Con formato <b>%</b> se ve como <b>60%</b>.' },
              EXPECTED('18 ÷ 30 = 0,6 → con formato porcentaje: <b>60%</b>'),
              H('Caso 2: calcular el porcentaje de un valor (descuentos)'),
              { type: 'sheet', rows: [['Dato', 'Valor'], ['Precio del buzo', 80000], ['Descuento', '15%'], ['Valor del descuento', '=B2*B3'], ['Precio final', '=B2-B4']], hl: ['B4', 'B5'] },
              EXPECTED('80.000 × 15% = <b>12.000</b> de descuento → precio final <b>68.000</b>'),
              TIP('Puedes escribir el porcentaje directo en la fórmula: <code>=B2*15%</code> es lo mismo que <code>=B2*0,15</code>.'),
              WARN('Si ves <b>0,6</b> en vez de <b>60%</b>, la fórmula está bien: solo falta aplicar el <b>formato porcentaje</b>.')
            ],
            practice: [
              { type: 'mcq', q: 'De 40 estudiantes, 10 prefieren el voleibol. ¿Qué fórmula calcula el porcentaje (10 en B2, 40 en B3)?', options: ['<code>=B2/B3</code>', '<code>=B3/B2</code>', '<code>=B2*B3</code>', '<code>=B2-B3</code>'], answer: 0, why: [null, 'Al revés da 4 (400%). La parte va arriba: parte/total.', 'Multiplicar da 400.', 'Restar no da un porcentaje.'], explain: '10 ÷ 40 = 0,25 → 25%.' },
              { type: 'fill', mode: 'formula', q: 'Un morral cuesta el valor de <b>B2</b> (60.000) y tiene <b>20%</b> de descuento. Escribe la fórmula del <b>valor del descuento</b>.', sheet: [[''], [60000]], expect: 12000, accept: ['=B2*20%', '=B2*0.2', '=B2*0,2', '=20%*B2'], showSheet: false, hint: '=B2*20%' }
            ],
            challenge: {
              task: {
                type: 'excel',
                instructions: ['En <b>B4</b> calcula el porcentaje de aprobación (<code>=B3/B2</code>) y aplícale formato <b>%</b>.', 'En <b>B7</b> calcula el valor del descuento del buzo (<code>=B5*B6</code>).', 'En <b>B8</b> calcula el precio final (precio − descuento).'],
                sim: sheet([['Concepto', 'Valor'], ['Estudiantes del curso', 32], ['Aprobaron', 24], ['% de aprobación', ''], ['Precio del buzo', 85000], ['Descuento', '20%'], ['Valor del descuento', ''], ['Precio final', '']], { targets: ['B4', 'B7', 'B8'], formats: { 'B5': { num: 'currency' }, 'B7:B8': { num: 'currency' } }, colWidths: { A: 160 } }),
                checks: [
                  { type: 'cell', cell: 'B4', value: 0.75, label: 'B4 = 24 ÷ 32 con fórmula', hint: '=B3/B2' },
                  { type: 'format', range: 'B4', prop: 'num', value: 'percent', mode: 'all', includeEmpty: true, label: 'B4 con formato porcentaje (75%)', hint: 'Selecciona B4 y pulsa %.' },
                  { type: 'cell', cell: 'B7', value: 17000, label: 'B7 = descuento de 17.000', hint: '=B5*B6' },
                  { type: 'cell', cell: 'B8', value: 68000, label: 'B8 = precio final de 68.000', hint: '=B5-B7' }
                ],
                expected: '<p>B4: <code>=B3/B2</code> → <b>75%</b></p><p>B7: <code>=B5*B6</code> → <b>$ 17.000</b></p><p>B8: <code>=B5-B7</code> → <b>$ 68.000</b></p>'
              }
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 4 — EXCEL PARA EL COLEGIO
       * ============================================================ */
      {
        id: 'x4', num: 4, icon: '🎒', title: 'Excel para el colegio',
        desc: 'Listas de estudiantes, notas y promedios, presupuestos, gastos, asistencia y encuestas.',
        topics: [
          {
            id: 'x4-1', icon: '📇', title: 'Crear una lista de estudiantes', minutes: 8,
            summary: 'Una buena lista tiene <b>encabezados</b> en la fila 1 (en negrita), <b>una persona por fila</b>, un dato por columna (apellidos y nombres separados) y está <b>ordenada</b> por apellido.',
            learn: [
              STEPS(['Fila 1: encabezados → <b>N.º, Apellidos, Nombres, Edad</b>.', 'Desde la fila 2: una persona por fila.', 'Un solo dato por celda (apellidos en una columna, nombres en otra).', 'Encabezados en negrita, con color y bordes.', 'Ordena por <b>Apellidos</b> de la A a la Z.'], 'Cómo hacerla bien'),
              { type: 'sheet', rows: [['N.º', 'Apellidos', 'Nombres', 'Edad'], [1, 'Álvarez Ruiz', 'Camila', 14], [2, 'Benítez Mora', 'Santiago', 15], [3, 'Castro López', 'Isabella', 14]] },
              TIP('Separar apellidos y nombres te permite ordenar por apellido, como en las listas oficiales del colegio.'),
              WARN('No dejes filas vacías en medio de la lista: Excel pensará que la tabla terminó ahí al ordenar o filtrar.')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué va en la primera fila de la lista?', options: ['Los encabezados (N.º, Apellidos, Nombres...)', 'El primer estudiante', 'El total', 'Nada'], answer: 0 },
              { type: 'tf', q: 'Es mejor escribir "Camila Álvarez Ruiz, 14 años" todo en una sola celda.', answer: false, explain: 'Un dato por celda: así puedes ordenar, filtrar y calcular.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Tu lista de estudiantes',
                instructions: ['Escribe en la fila 1: <b>N.º</b>, <b>Apellidos</b>, <b>Nombres</b>, <b>Edad</b>.', 'Agrega <b>5 estudiantes</b> (filas 2 a 6).', 'Pon los encabezados en <b>negrita</b>.', 'Ordena la lista por apellido: selecciona <b>B2:D6</b> y pulsa <b>A→Z</b>.'],
                sim: { rows: 9, cols: 5, formats: {} },
                checks: [
                  { type: 'text', cell: 'B1', text: 'Apellido', label: 'B1 dice "Apellidos"' },
                  { type: 'text', cell: 'C1', text: 'Nombre', label: 'C1 dice "Nombres"' },
                  { type: 'text', cell: 'D1', text: 'Edad', label: 'D1 dice "Edad"' },
                  { type: 'countText', range: 'B2:B6', min: 5, label: '5 apellidos (B2:B6)', hint: 'Escribe un apellido en cada fila.' },
                  { type: 'countText', range: 'C2:C6', min: 5, label: '5 nombres (C2:C6)' },
                  { type: 'countNumbers', range: 'D2:D6', min: 5, label: '5 edades en números (D2:D6)', hint: 'Solo el número, sin "años".' },
                  { type: 'format', range: 'A1:D1', prop: 'bold', mode: 'all', label: 'Encabezados en negrita', hint: 'Selecciona A1:D1 y pulsa N.' },
                  { type: 'sorted', range: 'B2:B6', dir: 1, label: 'Ordenada por apellido (A→Z)', hint: 'Selecciona B2:D6 y pulsa A→Z.' }
                ]
              }
            }
          },
          {
            id: 'x4-2', icon: '📝', title: 'Calcular notas y promedios', minutes: 10,
            summary: 'Para el promedio de cada estudiante escribe <code>=PROMEDIO(B2:D2)</code> en su fila (el rango va de lado a lado). El promedio del curso se calcula con el PROMEDIO de la columna de promedios.',
            learn: [
              P('En una planilla de notas, cada fila es un estudiante y cada columna una nota. El promedio de cada estudiante usa un rango <b>horizontal</b>.'),
              { type: 'sheet', rows: [['Estudiante', 'Nota 1', 'Nota 2', 'Nota 3', 'Promedio'], ['Ana', 4.0, 3.5, 4.5, '=PROMEDIO(B2:D2)'], ['Bruno', 3.0, 3.2, 2.8, '=PROMEDIO(B3:D3)'], ['Promedio del curso', '', '', '', '=PROMEDIO(E2:E3)']], hl: ['E2', 'E3', 'E5'], caption: 'Pulsa "Ver fórmulas": en la fila 2 el rango es B2:D2, en la fila 3 es B3:D3.' },
              TIP('En Excel real, escribe la fórmula en E2 y <b>arrastra el cuadrito verde</b> de la esquina hacia abajo: se copia a las demás filas cambiando el número solo. ¡En segundos tienes los promedios de 40 estudiantes!', 'Controlador de relleno'),
              { type: 'sheet', rows: [['Promedio', 'Resultado'], [3.4, '=SI(A2>=3;"Aprobó";"Reprobó")'], [2.7, '=SI(A3>=3;"Aprobó";"Reprobó")']], caption: '<b>Bonus:</b> la función <b>SI</b> escribe "Aprobó" o "Reprobó" según la nota. (En Colombia se aprueba con 3,0).' }
            ],
            practice: [
              { type: 'mcq', q: 'Las notas de Carla están en B4, C4 y D4. ¿Cuál fórmula calcula su promedio?', options: ['<code>=PROMEDIO(B4:D4)</code>', '<code>=PROMEDIO(B2:B4)</code>', '<code>=SUMA(B4:D4)</code>', '<code>=B4+C4+D4/3</code>'], answer: 0,
                why: [null, 'Ese rango es vertical: toma notas de otros estudiantes.', 'SUMA da el total, no el promedio.', 'Por el orden de operaciones, solo divide D4 entre 3. Faltan paréntesis: =(B4+C4+D4)/3'] },
              { type: 'fill', mode: 'formula', q: 'Escribe el promedio de la fila 6, con las notas de <b>B6 a D6</b>.', accept: ['=PROMEDIO(B6:D6)'] }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Planilla de notas',
                instructions: ['En <b>E2</b> escribe <code>=PROMEDIO(B2:D2)</code>.', 'Haz lo mismo para cada estudiante (E3 hasta E7), cambiando el número de fila.', 'En <b>E8</b> calcula el promedio del curso usando los promedios E2:E7.'],
                sim: sheet([['Estudiante', 'Nota 1', 'Nota 2', 'Nota 3', 'Promedio'], ['Ana', 4.0, 3.5, 4.5, ''], ['Bruno', 3.0, 3.2, 2.8, ''], ['Carla', 4.8, 4.5, 5.0, ''], ['Diego', 2.5, 3.0, 3.5, ''], ['Elena', 3.9, 4.1, 4.0, ''], ['Felipe', 3.6, 3.4, 3.8, ''], ['Promedio del curso', '', '', '', '']], { targets: ['E2:E8'], formats: { 'E2:E8': { num: 'decimal' }, A8: { bold: true } }, colWidths: { A: 150 } }),
                checks: [
                  { type: 'rowFormula', range: 'E2:E7', fn: 'PROMEDIO', cols: 'B:D', label: 'Promedio de cada estudiante (E2:E7)', hint: 'Fila 2: =PROMEDIO(B2:D2), fila 3: =PROMEDIO(B3:D3)...' },
                  { type: 'cell', cell: 'E8', value: 3.7278, fn: 'PROMEDIO', range: 'E2:E7', label: 'Promedio del curso en E8', hint: '=PROMEDIO(E2:E7)' }
                ],
                expected: '<p>Promedios: Ana 4,0 · Bruno 3,0 · Carla 4,8 · Diego 3,0 · Elena 4,0 · Felipe 3,6</p><p>Promedio del curso (E8): <code>=PROMEDIO(E2:E7)</code> → <b>3,7</b></p>'
              }
            }
          },
          {
            id: 'x4-3', icon: '🚌', title: 'Crear un presupuesto', minutes: 9,
            summary: 'Un presupuesto compara lo que <b>tienes</b> (ingresos) con lo que vas a <b>gastar</b>. Total de gastos: <code>=SUMA(...)</code>. Saldo: <code>=ingresos - gastos</code>. Si el saldo es negativo, ¡falta plata!',
            learn: [
              P('Un <b>presupuesto</b> te ayuda a planear: ¿nos alcanza el dinero para el paseo?, ¿cuánto hay que ahorrar?'),
              { type: 'sheet', rows: [['Concepto', 'Valor'], ['Bus', 200000], ['Almuerzos', 150000], ['Total gastos', '=SUMA(B2:B3)'], ['Dinero recogido', 400000], ['Saldo', '=B5-B4']], hl: ['B4', 'B6'] },
              EXPECTED('Total gastos = 350.000 · Saldo = 400.000 − 350.000 = <b>50.000</b> (¡sobra dinero!)'),
              KEY('<b>Saldo = lo que tengo − lo que gasto.</b> Si da negativo, hay que conseguir más dinero o reducir gastos.'),
              TIP('Aplica formato <b>moneda</b> a todos los valores y resalta el saldo con color.')
            ],
            practice: [
              { type: 'mcq', q: 'Tienes $300.000 (B8) y los gastos suman $340.000 (B6). ¿Qué fórmula calcula el saldo?', options: ['<code>=B8-B6</code>', '<code>=B6-B8</code>', '<code>=B8+B6</code>', '<code>=SUMA(B6:B8)</code>'], answer: 0, explain: 'Lo que tienes menos lo que gastas: 300.000 − 340.000 = −40.000. ¡Faltan $40.000!' },
              { type: 'tf', q: 'Si el saldo da negativo, significa que el dinero no alcanza.', answer: true }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'El paseo de fin de año',
                instructions: ['En <b>B6</b> calcula el <b>total de gastos</b> con SUMA.', 'En <b>B8</b> calcula el <b>saldo</b>: dinero recogido − total de gastos.'],
                sim: sheet([['Concepto', 'Valor'], ['Transporte', 180000], ['Entradas', 120000], ['Almuerzo', 150000], ['Refrigerios', 60000], ['Total gastos', ''], ['Dinero recogido', 550000], ['Saldo', '']], { targets: ['B6', 'B8'], formats: { 'B2:B8': { num: 'currency' }, A6: { bold: true }, A8: { bold: true } }, colWidths: { A: 140, B: 110 } }),
                checks: [
                  { type: 'cell', cell: 'B6', value: 510000, fn: 'SUMA', range: 'B2:B5', label: 'Total de gastos con SUMA (B6)', hint: '=SUMA(B2:B5)' },
                  { type: 'cell', cell: 'B8', value: 40000, label: 'Saldo en B8', hint: '=B7-B6' }
                ],
                expected: '<p>B6: <code>=SUMA(B2:B5)</code> → <b>$ 510.000</b></p><p>B8: <code>=B7-B6</code> → <b>$ 40.000</b> (¡alcanza y sobra!)</p>'
              }
            }
          },
          {
            id: 'x4-4', icon: '🧾', title: 'Registrar gastos', minutes: 8,
            summary: 'Registra cada gasto en una fila (día, concepto, valor). Luego analiza: <b>total</b> con SUMA, <b>gasto mayor</b> con MAX y <b>promedio</b> con PROMEDIO. Así descubres en qué se te va el dinero.',
            learn: [
              P('Anotar tus gastos te ayuda a <b>ahorrar</b>: descubres en qué se va el dinero.'),
              { type: 'sheet', rows: [['Día', 'Concepto', 'Valor'], ['Lunes', 'Bus', 2800], ['Martes', 'Onces', 5000], ['Miércoles', 'Recarga', 10000], ['', 'Total', '=SUMA(C2:C4)'], ['', 'Mayor gasto', '=MAX(C2:C4)'], ['', 'Promedio', '=PROMEDIO(C2:C4)']], hl: ['C5', 'C6', 'C7'] },
              KEY('Con 3 funciones ya puedes analizar tus gastos: <b>SUMA</b> (cuánto gasté), <b>MAX</b> (el gasto más grande) y <b>PROMEDIO</b> (cuánto gasto normalmente).'),
              TIP('Agrega una columna <b>Categoría</b> (transporte, comida, diversión) y usa filtros para ver cuánto gastas en cada cosa.')
            ],
            practice: [
              { type: 'match', q: '¿Qué función responde cada pregunta?', pairs: [['¿Cuánto gasté en total?', 'SUMA'], ['¿Cuál fue mi gasto más grande?', 'MAX'], ['¿Cuánto gasto en promedio al día?', 'PROMEDIO'], ['¿Cuál fue el gasto más pequeño?', 'MIN']] }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Mis gastos de la semana',
                instructions: ['En <b>C8</b> calcula el total gastado (SUMA).', 'En <b>C9</b> el gasto mayor (MAX).', 'En <b>C10</b> el promedio diario (PROMEDIO).'],
                sim: sheet([['Día', 'Concepto', 'Valor'], ['Lunes', 'Bus', 2800], ['Martes', 'Onces', 5000], ['Miércoles', 'Fotocopias', 3500], ['Jueves', 'Cine', 12000], ['Viernes', 'Helado', 4500], ['', '', ''], ['', 'Total', ''], ['', 'Gasto mayor', ''], ['', 'Promedio diario', '']], { targets: ['C8', 'C9', 'C10'], formats: { 'C2:C10': { num: 'currency' }, 'B8:B10': { bold: true } }, colWidths: { B: 120 } }),
                checks: [
                  { type: 'cell', cell: 'C8', value: 27800, fn: 'SUMA', range: 'C2:C6', label: 'Total con SUMA', hint: '=SUMA(C2:C6)' },
                  { type: 'cell', cell: 'C9', value: 12000, fn: 'MAX', range: 'C2:C6', label: 'Gasto mayor con MAX', hint: '=MAX(C2:C6)' },
                  { type: 'cell', cell: 'C10', value: 5560, fn: 'PROMEDIO', range: 'C2:C6', label: 'Promedio con PROMEDIO', hint: '=PROMEDIO(C2:C6)' }
                ],
                expected: '<p>Total: <b>$ 27.800</b> · Mayor: <b>$ 12.000</b> (el cine) · Promedio: <b>$ 5.560</b></p>'
              }
            }
          },
          {
            id: 'x4-5', icon: '✅', title: 'Tabla de asistencia', minutes: 8,
            summary: 'Marca <b>1</b> si el estudiante asistió y <b>0</b> si faltó. Total de asistencias: <code>=SUMA(B2:F2)</code>. Porcentaje de asistencia: <code>=G2/5</code> con formato %.',
            learn: [
              P('Usar <b>1</b> (asistió) y <b>0</b> (faltó) en vez de "sí/no" permite que Excel haga las cuentas.'),
              { type: 'sheet', rows: [['Estudiante', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Total', '% asist.'], ['Ana', 1, 1, 1, 1, 1, '=SUMA(B2:F2)', '=G2/5'], ['Luis', 1, 0, 1, 1, 0, '=SUMA(B3:F3)', '=G3/5']], hl: ['G2', 'H2'] },
              EXPECTED('Ana: 5 asistencias → 5/5 = 100%. Luis: 3 asistencias → 3/5 = <b>60%</b>'),
              TIP('Si usas "X" para marcar asistencia, cuenta con <code>=CONTARA(B2:F2)</code> (cuenta las celdas no vacías).')
            ],
            practice: [
              { type: 'mcq', q: 'Luis asistió 4 de 5 días (total en G3). ¿Qué fórmula da su porcentaje?', options: ['<code>=G3/5</code>', '<code>=5/G3</code>', '<code>=G3*5</code>', '<code>=G3-5</code>'], answer: 0, explain: '4 ÷ 5 = 0,8 → 80%.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Asistencia de la semana',
                instructions: ['En <b>G2</b> escribe <code>=SUMA(B2:F2)</code> y haz lo mismo para cada estudiante (G3 a G6).', 'En <b>H2</b> calcula el porcentaje de Ana: <code>=G2/5</code>, y aplícale formato <b>%</b>.'],
                sim: sheet([['Estudiante', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Total', '% asist.'], ['Ana', 1, 1, 1, 1, 1, '', ''], ['Luis', 1, 0, 1, 1, 0, '', ''], ['Sara', 1, 1, 0, 1, 1, '', ''], ['Pedro', 0, 1, 1, 1, 1, '', ''], ['Camila', 1, 1, 1, 0, 0, '', '']], { targets: ['G2:G6', 'H2'], extraCols: 0 }),
                checks: [
                  { type: 'rowFormula', range: 'G2:G6', fn: 'SUMA', cols: 'B:F', label: 'Total de asistencias de cada estudiante (G2:G6)', hint: '=SUMA(B2:F2), =SUMA(B3:F3)...' },
                  { type: 'cell', cell: 'H2', value: 1, label: 'Porcentaje de Ana en H2', hint: '=G2/5' },
                  { type: 'format', range: 'H2', prop: 'num', value: 'percent', mode: 'all', includeEmpty: true, label: 'H2 con formato %', hint: 'Selecciona H2 y pulsa %.' }
                ],
                expected: '<p>Totales: Ana 5 · Luis 3 · Sara 4 · Pedro 4 · Camila 3</p><p>H2: <code>=G2/5</code> → <b>100%</b></p>'
              }
            }
          },
          {
            id: 'x4-6', icon: '🗳️', title: 'Resultados de una encuesta y porcentajes', minutes: 10,
            summary: 'Organiza las respuestas por opción (votos), calcula el <b>total</b> con SUMA y el <b>porcentaje</b> de cada opción con <code>=votos/total</code> y formato %. Los porcentajes deben sumar 100%.',
            learn: [
              P('Después de una encuesta, organiza los resultados: cada opción en una fila con su número de <b>votos</b>.'),
              { type: 'sheet', rows: [['Deporte favorito', 'Votos', 'Porcentaje'], ['Fútbol', 12, '=B2/B5'], ['Baloncesto', 5, '=B3/B5'], ['Voleibol', 3, '=B4/B5'], ['Total', '=SUMA(B2:B4)', '=SUMA(C2:C4)']], hl: ['C2', 'C3', 'C4'], caption: 'Con formato %: 60% · 25% · 15%. La suma de los porcentajes siempre da 100%.' },
              TIP('En Excel real, si vas a arrastrar la fórmula, fija el total con <b>$</b>: <code>=B2/$B$5</code>. El $ "congela" la celda para que no cambie al copiar.', 'Referencia absoluta ($)'),
              TIP('Si tienes las respuestas una por una (Fútbol, Fútbol, Voleibol...), cuenta cada opción con <code>=CONTAR.SI(A2:A31;"Fútbol")</code>.', 'Bonus: CONTAR.SI')
            ],
            practice: [
              { type: 'mcq', q: 'De 50 encuestados, 20 eligieron "Música". ¿Qué porcentaje es?', options: ['40%', '20%', '50%', '70%'], answer: 0, explain: '20 ÷ 50 = 0,4 = 40%.' },
              { type: 'tf', q: 'Los porcentajes de todas las opciones de una encuesta deben sumar 100%.', answer: true }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Encuesta: deporte favorito del 9°',
                instructions: ['En <b>B6</b> calcula el total de votos con SUMA.', 'En <b>C2</b> calcula el porcentaje de Fútbol: <code>=B2/B6</code>. Repite en C3, C4 y C5.', 'Aplica formato <b>%</b> a <b>C2:C5</b>.'],
                sim: sheet([['Deporte', 'Votos', 'Porcentaje'], ['Fútbol', 14, ''], ['Baloncesto', 8, ''], ['Voleibol', 5, ''], ['Natación', 3, ''], ['Total', '', '']], { targets: ['B6', 'C2:C5'], formats: { A6: { bold: true } }, colWidths: { A: 120, C: 110 } }),
                checks: [
                  { type: 'cell', cell: 'B6', value: 30, fn: 'SUMA', range: 'B2:B5', label: 'Total de votos con SUMA (B6)', hint: '=SUMA(B2:B5)' },
                  { type: 'cell', cell: 'C2', value: 14 / 30, label: 'Porcentaje de Fútbol (C2)', hint: '=B2/B6' },
                  { type: 'cell', cell: 'C3', value: 8 / 30, label: 'Porcentaje de Baloncesto (C3)', hint: '=B3/B6' },
                  { type: 'cell', cell: 'C4', value: 5 / 30, label: 'Porcentaje de Voleibol (C4)', hint: '=B4/B6' },
                  { type: 'cell', cell: 'C5', value: 3 / 30, label: 'Porcentaje de Natación (C5)', hint: '=B5/B6' },
                  { type: 'format', range: 'C2:C5', prop: 'num', value: 'percent', mode: 'all', label: 'Formato % en C2:C5', hint: 'Selecciona C2:C5 y pulsa %.' }
                ],
                expected: '<p>Total: <b>30</b> votos. Porcentajes: Fútbol <b>46,7%</b> · Baloncesto <b>26,7%</b> · Voleibol <b>16,7%</b> · Natación <b>10%</b></p>'
              }
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 5 — GRÁFICOS
       * ============================================================ */
      {
        id: 'x5', num: 5, icon: '📈', title: 'Gráficos',
        desc: 'Gráficos de barras, circulares y de líneas: cuándo usar cada uno y cómo interpretarlos.',
        topics: [
          {
            id: 'x5-1', icon: '📊', title: 'Gráfico de barras', minutes: 7,
            summary: 'El gráfico de <b>barras</b> (o columnas) sirve para <b>comparar cantidades</b> entre categorías: votos por candidato, notas por materia, ventas por producto. La barra más alta es el valor mayor.',
            learn: [
              P('El gráfico de <b>barras</b> sirve para <b>comparar</b>: ¿quién tiene más?, ¿quién tiene menos?'),
              { type: 'chart', chart: 'bar', title: 'Votos para personero', labels: ['Laura', 'Andrés', 'Sofía', 'Voto en blanco'], values: [45, 32, 51, 8], caption: 'De un vistazo se ve que Sofía ganó y que Laura quedó de segunda.' },
              STEPS(['Selecciona los datos: la columna de <b>nombres</b> y la de <b>valores</b> (con sus títulos).', 'Ve a <b>Insertar → Gráficos → Columna o barra</b>.', 'Cambia el <b>título</b> del gráfico por uno que explique qué muestra.'], 'Cómo crearlo'),
              TIP('Siempre ponle un <b>título claro</b> al gráfico: "Votos para personero 2026" dice mucho más que "Gráfico 1".')
            ],
            practice: [
              { type: 'mcq', q: '¿Para qué es ideal el gráfico de barras?', options: ['Comparar cantidades entre categorías', 'Mostrar cambios a lo largo del tiempo', 'Mostrar partes de un todo', 'Escribir textos'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Fruta favorita del curso',
                instructions: ['Selecciona <b>A1:B6</b> (arrastrando).', 'Pulsa <b>📊 Gráfico</b>, elige <b>Barras</b> y escribe un título.', 'Pulsa <b>Insertar</b>.'],
                sim: sheet([['Fruta', 'Votos'], ['Mango', 12], ['Fresa', 9], ['Banano', 6], ['Manzana', 4], ['Uva', 7]], { charts: true, extraRows: 1 }),
                checks: [{ type: 'chart', chartType: 'bar', label: 'Gráfico de barras insertado', hint: 'Selecciona A1:B6 → 📊 Gráfico → Barras → Insertar.' }],
                success: '¡Tu primer gráfico! Se ve clarito que el mango es la fruta favorita.'
              }
            }
          },
          {
            id: 'x5-2', icon: '🥧', title: 'Gráfico circular', minutes: 7,
            summary: 'El gráfico <b>circular</b> (de torta o pastel) muestra las <b>partes de un todo</b> en porcentaje. Úsalo con pocas categorías (máximo 5 o 6) que juntas sumen el 100%.',
            learn: [
              P('El gráfico <b>circular</b> muestra cómo se <b>reparte un total</b>: cada porción es un porcentaje del 100%.'),
              { type: 'chart', chart: 'pie', title: '¿En qué usamos el dinero del curso?', labels: ['Paseo', 'Decoración', 'Refrigerios', 'Fotocopias'], values: [50, 20, 20, 10] },
              KEY('Úsalo cuando los datos son <b>partes de un todo</b> (100%) y hay <b>pocas categorías</b>.'),
              WARN('Con muchas categorías (10 o más) las porciones quedan tan pequeñas que no se entiende. En ese caso usa barras.')
            ],
            practice: [
              { type: 'mcq', q: '¿Cuál de estos datos es mejor mostrar en un gráfico circular?', options: ['Cómo se reparte tu día en 24 horas (dormir, colegio, etc.)', 'La temperatura de cada mes del año', 'La estatura de 30 estudiantes', 'Las notas de 4 periodos'], answer: 0, explain: 'Las 24 horas son un todo que se reparte en partes.' }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: '¿Cómo uso mis 24 horas?',
                instructions: ['Selecciona <b>A1:B7</b>.', 'Inserta un gráfico <b>Circular</b> 🥧 con un título.'],
                sim: sheet([['Actividad', 'Horas'], ['Dormir', 8], ['Colegio', 7], ['Tareas', 2], ['Celular', 3], ['Deporte', 1], ['Otros', 3]], { charts: true, extraRows: 1 }),
                checks: [{ type: 'chart', chartType: 'pie', label: 'Gráfico circular insertado', hint: 'Selecciona A1:B7 → 📊 Gráfico → Circular → Insertar.' }],
                success: '¡Muy bien! ¿Cuánto porcentaje de tu día se va en el celular? 😉'
              }
            }
          },
          {
            id: 'x5-3', icon: '📈', title: 'Gráfico de líneas', minutes: 7,
            summary: 'El gráfico de <b>líneas</b> muestra cómo <b>cambia algo a lo largo del tiempo</b> (días, meses, periodos). Sirve para ver si algo sube, baja o se mantiene: la <b>tendencia</b>.',
            learn: [
              P('El gráfico de <b>líneas</b> muestra la <b>evolución en el tiempo</b>: ¿mejoró?, ¿empeoró?'),
              { type: 'chart', chart: 'line', title: 'Mis notas de Matemáticas', labels: ['Periodo 1', 'Periodo 2', 'Periodo 3', 'Periodo 4'], values: [3.1, 3.5, 3.4, 4.2], caption: 'La línea sube: las notas mejoraron durante el año (con una pequeña bajada en el periodo 3).' },
              KEY('Si en la parte de abajo hay <b>tiempo</b> (días, meses, años, periodos), probablemente necesitas un gráfico de <b>líneas</b>.'),
              EX('Temperatura durante la semana, ahorro mes a mes, número de seguidores, crecimiento de una planta.')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres mostrar cómo creció tu planta de frijol cada día durante 2 semanas. ¿Qué gráfico usas?', options: ['Líneas', 'Circular', 'Ninguno', 'Barras apiladas de colores'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'excel',
                heading: 'Ahorro para el paseo',
                instructions: ['Selecciona <b>A1:B6</b>.', 'Inserta un gráfico de <b>Líneas</b> 📈 con el título "Ahorro por mes".'],
                sim: sheet([['Mes', 'Ahorro'], ['Febrero', 20000], ['Marzo', 35000], ['Abril', 30000], ['Mayo', 50000], ['Junio', 65000]], { charts: true, extraRows: 1, formats: { 'B2:B6': { num: 'currency' } } }),
                checks: [{ type: 'chart', chartType: 'line', label: 'Gráfico de líneas insertado', hint: 'Selecciona A1:B6 → 📊 Gráfico → Líneas → Insertar.' }]
              }
            }
          },
          {
            id: 'x5-4', icon: '🤔', title: '¿Qué gráfico uso?', minutes: 6,
            summary: '<b>Barras</b> → comparar categorías. <b>Circular</b> → partes de un todo (100%). <b>Líneas</b> → cambios en el tiempo. Pregúntate: ¿comparo, reparto o sigo en el tiempo?',
            learn: [
              P('Antes de hacer un gráfico, hazte esta pregunta: <b>¿qué quiero mostrar?</b>'),
              P(`<div class="grid grid-3" style="gap:10px">
                <div class="card center"><div style="font-size:2rem">📊</div><b>Barras</b><p class="muted" style="margin:0">¿Quién tiene más o menos? <b>Comparar</b> categorías.</p></div>
                <div class="card center"><div style="font-size:2rem">🥧</div><b>Circular</b><p class="muted" style="margin:0">¿Cómo se <b>reparte</b> un total? Partes del 100%.</p></div>
                <div class="card center"><div style="font-size:2rem">📈</div><b>Líneas</b><p class="muted" style="margin:0">¿Cómo <b>cambia</b> en el tiempo? Tendencias.</p></div></div>`),
              TIP('Truco rápido: si los datos son <b>fechas o periodos</b> → líneas. Si suman <b>100%</b> → circular. Si son <b>nombres o categorías</b> para comparar → barras.')
            ],
            practice: [
              { type: 'mcq', q: 'Resultados de la elección de personero (votos por candidato). ¿Qué gráfico?', options: ['📊 Barras', '📈 Líneas', 'Ninguno'], answer: 0 },
              { type: 'mcq', q: 'Número de estudiantes que llegaron tarde cada mes del año. ¿Qué gráfico?', options: ['📈 Líneas', '🥧 Circular', 'Ninguno'], answer: 0 }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: 'Porcentaje del presupuesto del colegio destinado a cada área (deportes 30%, biblioteca 25%, tecnología 45%). ¿Qué gráfico?', options: ['🥧 Circular', '📈 Líneas', '📊 Barras'], answer: 0, fixed: true, explain: 'Son partes de un todo que suman 100%.' },
                { type: 'mcq', q: 'Tu peso en el control médico de cada año desde que tenías 10 años. ¿Qué gráfico?', options: ['📊 Barras', '🥧 Circular', '📈 Líneas'], answer: 2, fixed: true, explain: 'Es un cambio a lo largo del tiempo.' },
                { type: 'mcq', q: 'Cantidad de libros leídos por cada curso de 9° (9A, 9B, 9C, 9D). ¿Qué gráfico?', options: ['📈 Líneas', '📊 Barras', '🥧 Circular'], answer: 1, fixed: true, explain: 'Comparas cantidades entre categorías (cursos).' },
                { type: 'mcq', q: 'Mira este gráfico. ¿Es una buena elección?', chart: { chart: 'pie', title: 'Temperatura por mes', labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'], values: [18, 19, 19, 20, 19, 18, 17, 18] },
                  options: ['No: la temperatura por mes se muestra mejor con líneas', 'Sí, es perfecto', 'Sí, porque tiene muchos colores'], answer: 0, fixed: true, explain: 'La temperatura no es "parte de un todo" y cambia en el tiempo: líneas.' }
              ]
            }
          },
          {
            id: 'x5-5', icon: '🔍', title: 'Interpretar datos y gráficos', minutes: 8,
            summary: 'Para leer un gráfico: 1) lee el <b>título</b> y los <b>ejes</b>, 2) busca el valor <b>mayor</b> y el <b>menor</b>, 3) mira la <b>tendencia</b> (sube, baja, se mantiene), 4) compara y saca una <b>conclusión</b>.',
            learn: [
              STEPS(['Lee el <b>título</b>: ¿de qué trata?', 'Mira los <b>ejes</b> o la leyenda: ¿qué se mide y en qué unidades?', 'Encuentra el valor <b>más alto</b> y el <b>más bajo</b>.', 'Observa la <b>tendencia</b>: ¿sube, baja o se mantiene?', 'Escribe una <b>conclusión</b> en una frase.'], 'Cómo leer un gráfico'),
              { type: 'chart', chart: 'bar', title: 'Libros leídos por curso en el año', labels: ['9A', '9B', '9C', '9D'], values: [120, 85, 140, 60] },
              EX('Conclusión: "El 9C fue el curso que más leyó (140 libros) y el 9D el que menos (60). El 9C leyó más del doble que el 9D."', 'Ejemplo de conclusión'),
              WARN('Revisa dónde empieza el eje vertical: si no empieza en 0, las diferencias pueden parecer más grandes de lo que son.')
            ],
            practice: [
              { type: 'mcq', q: 'Según el gráfico, ¿qué curso leyó menos libros?', chart: { chart: 'bar', title: 'Libros leídos por curso', labels: ['9A', '9B', '9C', '9D'], values: [120, 85, 140, 60] }, options: ['9D', '9B', '9A', '9C'], answer: 0 },
              { type: 'fill', mode: 'number', q: 'Según el mismo gráfico, ¿cuántos libros más leyó el 9C que el 9A?', chart: { chart: 'bar', title: 'Libros leídos por curso', labels: ['9A', '9B', '9C', '9D'], values: [120, 85, 140, 60] }, accept: [20], hint: 'Resta: 140 − 120.' }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: '¿Qué tendencia muestra el gráfico?', chart: { chart: 'line', title: 'Estudiantes que llegan en bicicleta', labels: ['Ene', 'Mar', 'May', 'Jul', 'Sep', 'Nov'], values: [12, 18, 25, 31, 40, 46] }, options: ['Aumenta con el tiempo', 'Disminuye con el tiempo', 'Se mantiene igual', 'No se puede saber'], answer: 0 },
                { type: 'mcq', q: 'Según el gráfico, ¿qué medio de transporte usa la mayoría?', chart: { chart: 'pie', title: '¿Cómo llegan al colegio?', labels: ['Caminando', 'Bus', 'Bicicleta', 'Carro'], values: [45, 30, 15, 10] }, options: ['Caminando', 'Bus', 'Bicicleta', 'Carro'], answer: 0 },
                { type: 'fill', mode: 'number', q: 'En el mismo gráfico, ¿qué porcentaje de estudiantes llega en bus o en bicicleta (sumados)?', chart: { chart: 'pie', title: '¿Cómo llegan al colegio?', labels: ['Caminando', 'Bus', 'Bicicleta', 'Carro'], values: [45, 30, 15, 10] }, accept: [45], hint: '30% + 15%', explain: '30% + 15% = 45%.' },
                { type: 'mcq', q: '¿Cuál es la mejor conclusión?', chart: { chart: 'bar', title: 'Horas de estudio semanal', labels: ['Luis', 'Ana', 'Sara', 'Pedro'], values: [4, 10, 7, 2] },
                  options: ['Ana es quien más estudia (10 h) y Pedro quien menos (2 h)', 'Todos estudian lo mismo', 'Pedro estudia más que Luis', 'Sara estudia 10 horas'], answer: 0 }
              ]
            }
          }
        ]
      }
    ]
  };
})(window.O9);
