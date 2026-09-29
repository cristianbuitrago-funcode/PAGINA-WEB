/**
 * CONTENIDO DEL MÓDULO WORD
 * ------------------------------------------------------------
 * Estructura:  módulo → niveles → temas
 * Cada tema sigue el ciclo 📚 Aprende → 🎯 Practica → 🧠 Reto → 🏆 Recompensa
 *
 *   {
 *     id, title, icon, minutes,
 *     summary:   idea clave (se usa también como "repaso" si el estudiante se equivoca),
 *     learn:     [bloques]            → ver js/components/blocks.js
 *     practice:  [preguntas]          → ver js/components/exercises.js
 *     challenge: { questions:[...] }  o  { task:{...} } → ver js/components/tasks.js
 *   }
 *
 * Nota: los atajos de teclado se muestran para Word en español y, entre
 * paréntesis, para Word en inglés, porque en los colegios hay de ambos.
 */
(function (O9) {
  'use strict';

  /* Pequeños ayudantes para escribir el contenido de forma más corta */
  const P = (html) => ({ type: 'p', html });
  const TIP = (html, label) => ({ type: 'tip', html, label });
  const WARN = (html, label) => ({ type: 'warn', html, label });
  const EX = (html, label) => ({ type: 'example', html, label });
  const KEY = (html) => ({ type: 'key', html });
  const H = (text) => ({ type: 'h', text });
  const STEPS = (items, title) => ({ type: 'steps', items, title });
  const KEYS = (items, title) => ({ type: 'keys', items, title });

  /** Muestra de párrafos con distintas alineaciones (bloque visual). */
  const alignDemo = `<div class="grid grid-2" style="gap:10px">
    ${[['left', 'Izquierda', 'Texto normal. Es la alineación por defecto.'],
      ['center', 'Centrar', 'Títulos y portadas'],
      ['right', 'Derecha', 'Fechas en cartas'],
      ['justify', 'Justificar', 'Los párrafos quedan con los dos bordes parejos, como en los libros y periódicos.']]
      .map(([a, n, t]) => `<div class="card" style="padding:12px"><b style="color:var(--purple)">${n}</b><p style="text-align:${a};margin:6px 0 0;font-size:.9rem;background:#f8fafc;padding:8px;border-radius:8px">${t}</p></div>`).join('')}
  </div>`;

  const lorem = 'La contaminación del aire es uno de los problemas ambientales más graves de las ciudades. Se produce principalmente por el humo de los carros, las fábricas y las quemas.';

  O9.data.modules = O9.data.modules || {};
  O9.data.modules.word = {
    id: 'word',
    name: 'Word',
    icon: '📝',
    tagline: 'Aprende a crear documentos profesionales.',
    description: 'Desde escribir y guardar tu primer documento hasta entregar informes, cartas y hojas de vida impecables.',
    levels: [
      /* ============================================================
       * NIVEL 1 — CONOCIENDO WORD
       * ============================================================ */
      {
        id: 'w1', num: 1, icon: '🧭', title: 'Conociendo Word',
        desc: 'Qué es Word, sus partes, crear, guardar, escribir, seleccionar, copiar y deshacer.',
        topics: [
          {
            id: 'w1-1', icon: '🖥️', title: '¿Qué es Word? Conoce su ventana', minutes: 6,
            summary: 'Word es un <b>procesador de textos</b>: sirve para escribir y darle forma a documentos. Arriba están las <b>pestañas</b> (Inicio, Insertar, Disposición...) y en la <b>cinta de opciones</b> aparecen sus botones. Abajo, la <b>barra de estado</b> muestra páginas y palabras.',
            learn: [
              P('<b>Microsoft Word</b> es un <b>procesador de textos</b>: un programa para escribir, corregir y darle una presentación bonita a tus documentos.'),
              EX('En el colegio lo usarás para <b>trabajos escritos, portadas, informes de laboratorio, cartas, hojas de vida</b> y guiones de exposición.'),
              { type: 'compare', beforeLabel: 'En el cuaderno', afterLabel: 'En Word',
                before: '✏️ Si te equivocas, borras y queda la marca.<br>📏 Los títulos dependen de tu letra.<br>🖼️ Las imágenes hay que pegarlas.',
                after: '⌨️ Corriges sin dejar rastro.<br>🔠 Cambias letra, tamaño y color en segundos.<br>🖼️ Insertas imágenes, tablas y números de página.' },
              H('Las partes de la ventana de Word'),
              { type: 'anatomy', app: 'word' },
              KEY('Casi todo lo que necesitas está en las <b>pestañas</b> de arriba: <b>Inicio</b> = formato del texto, <b>Insertar</b> = agregar cosas (imágenes, tablas), <b>Disposición</b> = cómo es la hoja.')
            ],
            practice: [
              { type: 'mcq', q: '¿Para qué sirve principalmente Microsoft Word?',
                options: ['Para crear y editar documentos de texto', 'Para hacer cálculos con muchos números', 'Para editar videos', 'Para navegar en internet'],
                answer: 0, why: [null, 'Eso es más trabajo de <b>Excel</b>, que veremos en el otro módulo.', 'Para eso hay programas de edición de video.', 'Para eso usas un navegador como Chrome o Edge.'],
                explain: 'Word es un procesador de textos: escribir, corregir y dar formato a documentos.' },
              { type: 'match', q: 'Relaciona cada parte de Word con lo que hace:',
                pairs: [['Cinta de opciones', 'Muestra los botones de cada pestaña'], ['Barra de estado', 'Muestra páginas, palabras y zoom'], ['Cursor', 'Indica dónde aparecerá lo que escribas'], ['Pestaña Insertar', 'Sirve para agregar imágenes y tablas']],
                explain: 'Conocer el nombre de cada parte te ayuda a seguir instrucciones del profe y tutoriales.' }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: 'Tu profe pidió un ensayo de <b>mínimo 300 palabras</b>. ¿Dónde miras cuántas llevas?',
                  options: ['En la barra de estado (abajo)', 'En la cinta de opciones', 'En la barra de título', 'En la regla'],
                  answer: 0, explain: 'La barra de estado, abajo a la izquierda, dice "245 palabras", por ejemplo. ¡Muy útil para trabajos con mínimo de palabras!' },
                { type: 'mcq', q: 'Necesitas agregar una foto del volcán a tu trabajo. ¿En qué pestaña buscas?',
                  options: ['Insertar', 'Inicio', 'Vista', 'Revisar'], answer: 0,
                  hint: 'Piensa: quieres <i>meter</i> algo nuevo en el documento.',
                  explain: 'Insertar agrupa todo lo que se agrega al documento: imágenes, tablas, formas, encabezados, números de página...' }
              ]
            }
          },
          {
            id: 'w1-2', icon: '💾', title: 'Crear, guardar y abrir documentos', minutes: 7,
            summary: 'Para <b>guardar</b> la primera vez usa <b>Archivo → Guardar como</b>, elige la carpeta y ponle un <b>nombre claro</b>. Después guarda seguido con <kbd>Ctrl</kbd>+<kbd>G</kbd>. Para <b>abrir</b>: Archivo → Abrir o Recientes.',
            learn: [
              STEPS(['Abre Word.', 'Haz clic en <b>Documento en blanco</b>.', '¡Listo! Ya tienes una hoja para escribir.<br><small class="muted">Si Word ya está abierto: <b>Archivo → Nuevo → Documento en blanco</b>.</small>'], '1️⃣ Crear un documento nuevo'),
              STEPS(['Ve a <b>Archivo → Guardar como</b> (o pulsa <kbd>F12</kbd>).', 'Elige <b>dónde</b> guardarlo: Documentos, tu USB o OneDrive.', 'Escribe un <b>nombre claro</b>, por ejemplo <code>Informe_Ciencias_JuanPerez</code>.', 'Haz clic en <b>Guardar</b>.'], '2️⃣ Guardar por primera vez'),
              TIP('Un buen nombre dice <b>materia + tema + tu nombre</b>. Evita nombres como "Documento1", "asdf" o "trabajo final final (2)".', 'Nombre claro'),
              WARN('Guarda seguido con <kbd>Ctrl</kbd>+<kbd>G</kbd> (en inglés <kbd>Ctrl</kbd>+<kbd>S</kbd>). Si se va la luz o el computador se reinicia, no pierdes tu trabajo.', 'Guarda cada rato'),
              { type: 'compare', beforeLabel: 'Guardar', afterLabel: 'Guardar como',
                before: 'Actualiza el <b>mismo archivo</b> con los cambios nuevos.',
                after: 'Crea una <b>copia</b> con otro nombre, en otra carpeta o en otro formato (por ejemplo <b>PDF</b>).' },
              STEPS(['Ve a <b>Archivo → Abrir</b>.', 'Busca la carpeta donde lo guardaste (o mira en <b>Recientes</b>).', 'Haz doble clic en el archivo.'], '3️⃣ Abrir un documento'),
              KEYS([[['Ctrl', 'G'], 'Guardar (inglés: Ctrl+S)'], [['F12'], 'Guardar como'], [['Ctrl', 'A'], 'Abrir (inglés: Ctrl+O)'], [['Ctrl', 'U'], 'Nuevo documento (inglés: Ctrl+N)']], '⌨️ Atajos (Word en español)'),
              KEY('Los archivos de Word terminan en <b>.docx</b>. Para entregar un trabajo sin que se desacomode en otro computador, guárdalo también como <b>PDF</b>.')
            ],
            practice: [
              { type: 'order', q: 'Ordena los pasos para guardar un documento por primera vez:',
                items: ['Ir a Archivo → Guardar como', 'Elegir la carpeta', 'Escribir un nombre claro', 'Hacer clic en Guardar'],
                explain: 'Siempre: dónde (carpeta) → cómo se llama (nombre) → Guardar.' },
              { type: 'mcq', q: '¿Cuál es el mejor nombre para tu archivo?',
                options: ['Ensayo_Sociales_MariaLopez', 'Documento1', 'asdfgh', 'trabajo final final (2)'], answer: 0,
                why: [null, 'Así se llaman todos los documentos nuevos: no sabrás cuál es.', 'No dice nada del contenido.', 'Confuso: ¿cuál es el final de verdad?'],
                explain: 'Un nombre claro te ayuda a encontrarlo y le dice al profe de quién es.' }
            ],
            challenge: {
              questions: [
                { type: 'mcq', q: 'Terminaste tu trabajo y el profe pide enviarlo de forma que <b>no se desacomode</b> en otro computador. ¿Qué haces?',
                  options: ['Guardar como → tipo PDF', 'Enviar una foto de la pantalla', 'Dejarlo como Documento1', 'No guardarlo y enviarlo así'], answer: 0,
                  explain: 'El PDF conserva la letra, las imágenes y la organización exactamente como las ves.' },
                { type: 'tf', q: '"Guardar como" sirve para crear una copia del archivo con otro nombre, lugar o formato.', answer: true,
                  explain: 'Correcto. "Guardar" actualiza el mismo archivo; "Guardar como" crea una versión nueva.' },
                { type: 'mcq', q: 'Llevas una hora escribiendo y no has guardado. ¿Qué atajo usas en Word en español?',
                  options: ['<kbd>Ctrl</kbd>+<kbd>G</kbd>', '<kbd>Ctrl</kbd>+<kbd>Z</kbd>', '<kbd>Ctrl</kbd>+<kbd>P</kbd>', '<kbd>Ctrl</kbd>+<kbd>C</kbd>'], answer: 0,
                  why: [null, 'Ctrl+Z es Deshacer.', 'Ctrl+P es Imprimir.', 'Ctrl+C es Copiar.'],
                  explain: 'Ctrl+G = Guardar (en Word en inglés es Ctrl+S).' }
              ]
            }
          },
          {
            id: 'w1-3', icon: '⌨️', title: 'Escribir, editar y seleccionar texto', minutes: 8,
            summary: 'La regla de oro de Word: <b>primero seleccionas, después aplicas</b>. Doble clic selecciona una palabra, triple clic un párrafo, y arrastrar selecciona lo que quieras. Solo pulsa <kbd>Enter</kbd> al terminar un párrafo.',
            learn: [
              P('El <b>cursor</b> es la rayita que parpadea: indica dónde aparecerá lo que escribas. Muévelo con un clic o con las flechas del teclado.'),
              KEYS([[['Enter'], 'Nuevo párrafo'], [['⌫ Retroceso'], 'Borra a la izquierda'], [['Supr'], 'Borra a la derecha'], [['Shift', 'letra'], 'Mayúscula'], [['Tab'], 'Sangría rápida']], '⌨️ Teclas para escribir'),
              WARN('No pulses <kbd>Enter</kbd> al final de cada renglón: Word pasa solo a la siguiente línea. Y nunca uses muchos espacios para centrar un título: usa el botón <b>Centrar</b>.'),
              H('Seleccionar: la habilidad más importante'),
              P('Para cambiar algo (ponerlo en negrita, copiarlo, borrarlo...) primero tienes que <b>seleccionarlo</b>. El texto seleccionado se ve sombreado.'),
              STEPS(['<b>Arrastrar:</b> clic al inicio del texto y, sin soltar, mueve el mouse hasta el final.', '<b>Doble clic</b> sobre una palabra: la selecciona completa.', '<b>Triple clic</b>: selecciona todo el párrafo.', '<b>Shift + flechas</b>: selecciona letra por letra con el teclado.', '<kbd>Ctrl</kbd>+<kbd>E</kbd> (inglés <kbd>Ctrl</kbd>+<kbd>A</kbd>): selecciona <b>todo</b> el documento.']),
              KEY('<b>Primero selecciono, después aplico.</b> Esta regla sirve para casi todo en Word.'),
              { type: 'sim', app: 'word', caption: 'haz <b>doble clic</b> en la palabra "Sol" y luego pulsa <b>N</b> (negrita). Después prueba triple clic en el párrafo.',
                options: { tabs: ['inicio'], html: '<p>El Sol es la estrella más cercana a la Tierra. Su luz tarda unos ocho minutos en llegar hasta nosotros.</p>' } }
            ],
            practice: [
              { type: 'mcq', q: '¿Cómo seleccionas rápidamente <b>una sola palabra</b>?', options: ['Doble clic sobre ella', 'Triple clic', 'Clic derecho', 'Pulsar Enter'], answer: 0,
                explain: 'Doble clic = palabra. Triple clic = párrafo completo.' },
              { type: 'tf', q: 'Debes presionar <kbd>Enter</kbd> al final de cada renglón para pasar al siguiente.', answer: false,
                explain: 'Word salta de renglón solo. Enter se usa únicamente para empezar un <b>párrafo nuevo</b>.' },
              { type: 'mcq', q: 'Quieres borrar la letra que está a la <b>izquierda</b> del cursor. ¿Qué tecla usas?', options: ['⌫ Retroceso', 'Supr', 'Enter', 'Tab'], answer: 0,
                why: [null, 'Supr borra lo que está a la <b>derecha</b> del cursor.', 'Enter crea un párrafo nuevo.', 'Tab mueve el texto hacia la derecha.'] }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['El texto tiene errores. Cambia <b>mas</b> por <b>más</b> (con tilde).', 'Cambia <b>Marte</b> por <b>Júpiter</b>.', 'Selecciona la palabra <b>Júpiter</b> (doble clic) y ponla en <b>negrita</b>.'],
                sim: { tabs: ['inicio'], html: '<p>El planeta mas grande del sistema solar es Marte.</p>' },
                checks: [
                  { id: 'containsExact', text: 'más grande', label: 'Escribiste "más" con tilde', hint: 'Haz clic justo después de la "a" de "mas", bórrala y escribe "á".' },
                  { id: 'containsExact', text: 'Júpiter', label: 'Escribiste "Júpiter"', hint: 'Recuerda la tilde en la "ú".' },
                  { id: 'notContains', text: 'Marte', label: 'Ya no aparece "Marte"', hint: 'Selecciona "Marte" con doble clic y escribe encima.' },
                  { id: 'textStyle', text: 'Júpiter', bold: true, label: '"Júpiter" está en negrita', hint: 'Doble clic sobre Júpiter y luego el botón N.' }
                ],
                success: '¡Corregiste y diste formato como un profesional! Seleccionar bien es el 50% de dominar Word.'
              }
            }
          },
          {
            id: 'w1-4', icon: '📋', title: 'Copiar, cortar y pegar', minutes: 6,
            summary: '<b>Copiar</b> (<kbd>Ctrl</kbd>+<kbd>C</kbd>) duplica: el original se queda. <b>Cortar</b> (<kbd>Ctrl</kbd>+<kbd>X</kbd>) mueve: el original desaparece. <b>Pegar</b> (<kbd>Ctrl</kbd>+<kbd>V</kbd>) lo pone donde está el cursor.',
            learn: [
              { type: 'compare', beforeLabel: '📋 Copiar', afterLabel: '✂️ Cortar',
                before: '<b>Duplica</b> el texto. El original <b>se queda</b> donde estaba.',
                after: '<b>Mueve</b> el texto. El original <b>desaparece</b> y lo pegas en otro lugar.' },
              STEPS(['<b>Selecciona</b> el texto.', 'Pulsa <b>Copiar</b> (<kbd>Ctrl</kbd>+<kbd>C</kbd>) o <b>Cortar</b> (<kbd>Ctrl</kbd>+<kbd>X</kbd>).', 'Haz clic donde quieres ponerlo (ahí queda el cursor).', 'Pulsa <b>Pegar</b> (<kbd>Ctrl</kbd>+<kbd>V</kbd>).'], 'Cómo se hace'),
              KEYS([[['Ctrl', 'C'], 'Copiar'], [['Ctrl', 'X'], 'Cortar'], [['Ctrl', 'V'], 'Pegar']], '⌨️ Estos atajos son iguales en todos los idiomas y programas'),
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '📥', l: 'Pegar', hl: true }, { i: '✂️', l: 'Cortar', hl: true }, { i: '📋', l: 'Copiar', hl: true }, { i: '🖌️', l: 'Copiar formato' }, { i: 'N', l: 'Negrita' }], caption: 'Grupo <b>Portapapeles</b>, al inicio de la pestaña Inicio.' },
              EX('Moviste un párrafo al lugar equivocado → <b>Cortar</b> y <b>Pegar</b>. Quieres repetir el título del trabajo en el encabezado → <b>Copiar</b> y <b>Pegar</b>.'),
              TIP('Al pegar texto de internet, usa <b>clic derecho → Mantener solo texto</b> para que no traiga letras y colores raros. Y recuerda: copiar sin citar la fuente es <b>plagio</b>.')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres <b>mover</b> un párrafo del final al inicio del documento. ¿Qué usas?',
                options: ['Cortar y pegar', 'Copiar y pegar', 'Deshacer', 'Borrarlo y escribirlo de nuevo'], answer: 0,
                why: [null, 'Con copiar, el párrafo quedaría <b>repetido</b> (al final y al inicio).', 'Deshacer solo revierte el último cambio.', 'Funciona, pero es muy lento y puedes equivocarte.'] },
              { type: 'match', q: 'Relaciona cada atajo con su acción:', pairs: [['Ctrl + C', 'Copiar'], ['Ctrl + X', 'Cortar'], ['Ctrl + V', 'Pegar'], ['Ctrl + Z', 'Deshacer']] }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Las frases de la rutina están desordenadas.', 'Selecciona una frase completa (triple clic), pulsa <b>Cortar ✂️</b>, ubica el cursor en su lugar correcto y pulsa <b>Pegar 📥</b>.', 'Deja el orden: 1. Me despierto → 2. Desayuno → 3. Voy al colegio.'],
                sim: { tabs: ['inicio'], html: '<h2>Mi rutina de la mañana</h2><p>3. Voy al colegio.</p><p>1. Me despierto a las 5:30.</p><p>2. Desayuno con mi familia.</p>' },
                checks: [
                  { id: 'textOrder', texts: ['1. Me despierto', '2. Desayuno', '3. Voy al colegio'], label: 'Las frases están en orden 1, 2, 3', hint: 'Corta la frase "3. Voy al colegio" y pégala al final.' },
                  { id: 'usedAction', action: 'cut', label: 'Usaste Cortar', hint: 'Botón ✂️ o Ctrl+X.' },
                  { id: 'usedAction', action: 'paste', label: 'Usaste Pegar', hint: 'Botón 📥 o Ctrl+V.' }
                ],
                success: '¡Excelente! Cortar y pegar te ahorra reescribir textos completos.'
              }
            }
          },
          {
            id: 'w1-5', icon: '↩️', title: 'Deshacer y rehacer', minutes: 5,
            summary: '<b>Deshacer</b> (<kbd>Ctrl</kbd>+<kbd>Z</kbd>) vuelve atrás el último cambio y puedes usarlo varias veces. <b>Rehacer</b> (<kbd>Ctrl</kbd>+<kbd>Y</kbd>) recupera lo que deshiciste.',
            learn: [
              P('¿Borraste algo por error? ¿Aplicaste un formato que no te gustó? <b>Tranquilo.</b> Word recuerda tus últimos cambios.'),
              KEYS([[['Ctrl', 'Z'], 'Deshacer ↶'], [['Ctrl', 'Y'], 'Rehacer ↷']]),
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '💾', l: 'Guardar' }, { i: '↶', l: 'Deshacer', hl: true }, { i: '↷', l: 'Rehacer', hl: true }], caption: 'Están en la barra de acceso rápido, arriba a la izquierda.' },
              EX('Seleccionaste todo el trabajo y sin querer tocaste una tecla: ¡desapareció todo! 😱 Pulsa <kbd>Ctrl</kbd>+<kbd>Z</kbd> y vuelve a aparecer. 😌'),
              TIP('Puedes pulsar Deshacer varias veces seguidas para ir más atrás. <b>Rehacer</b> solo funciona justo después de deshacer.'),
              KEY('En Word equivocarse no es grave: casi todo se puede deshacer. ¡Atrévete a experimentar!')
            ],
            practice: [
              { type: 'mcq', q: 'Borraste sin querer todo un párrafo. ¿Qué es lo más rápido?',
                options: ['<kbd>Ctrl</kbd>+<kbd>Z</kbd> (Deshacer)', 'Cerrar Word sin guardar', 'Escribirlo todo de nuevo', '<kbd>Ctrl</kbd>+<kbd>Y</kbd> (Rehacer)'], answer: 0,
                why: [null, 'Perderías también todo lo que no habías guardado.', 'Funciona, pero pierdes tiempo.', 'Rehacer es lo contrario: recupera algo que deshiciste.'] },
              { type: 'tf', q: 'Rehacer (<kbd>Ctrl</kbd>+<kbd>Y</kbd>) recupera un cambio que acabas de deshacer.', answer: true }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Selecciona todo el texto y <b>bórralo</b> (¡sin miedo!).', 'Usa <b>Deshacer ↶</b> (o <kbd>Ctrl</kbd>+<kbd>Z</kbd>) hasta que vuelva a aparecer.', 'Ahora pulsa <b>Rehacer ↷</b> y luego otra vez Deshacer, para ver cómo funcionan.'],
                sim: { tabs: ['inicio'], html: '<p>La ofimática nos ayuda a hacer los trabajos del colegio más rápido y más ordenados.</p>' },
                checks: [
                  { id: 'usedAction', action: 'undo', label: 'Usaste Deshacer', hint: 'Botón ↶ o Ctrl+Z.' },
                  { id: 'usedAction', action: 'redo', label: 'Usaste Rehacer', hint: 'Botón ↷ o Ctrl+Y, justo después de deshacer.' },
                  { id: 'containsText', text: 'La ofimática nos ayuda', label: 'El texto original está de vuelta', hint: 'Si lo perdiste, sigue pulsando Deshacer.' }
                ],
                success: 'Ahora sabes que nada está perdido. ¡Deshacer es tu superpoder!'
              }
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 2 — DAR FORMATO
       * ============================================================ */
      {
        id: 'w2', num: 2, icon: '🎨', title: 'Dar formato',
        desc: 'Letra, tamaño, negrita, cursiva, color, alineación, interlineado, sangrías y listas.',
        topics: [
          {
            id: 'w2-1', icon: '🔤', title: 'Tipo y tamaño de letra', minutes: 6,
            summary: 'La <b>fuente</b> es el tipo de letra y el <b>tamaño</b> se mide en puntos. Para el texto normal usa <b>11 o 12</b>; para títulos, <b>16 a 24</b>. Usa fuentes fáciles de leer como <b>Arial, Calibri o Times New Roman</b>.',
            learn: [
              P('La <b>fuente</b> es el tipo de letra (Arial, Calibri, Times New Roman...). El <b>tamaño</b> se mide en <b>puntos (pt)</b>: entre más grande el número, más grande la letra.'),
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: 'Calibri ▾', l: 'Fuente', hl: true }, { i: '11 ▾', l: 'Tamaño', hl: true }, { i: 'A⁺', l: 'Agrandar' }, { i: 'A⁻', l: 'Reducir' }], caption: 'Grupo <b>Fuente</b> en la pestaña Inicio.' },
              { type: 'compare', beforeLabel: 'Difícil de leer', afterLabel: 'Presentación clara',
                before: '<p style="font-family:\'Comic Sans MS\';font-size:10px;margin:0">los ecosistemas</p><p style="font-family:Georgia;font-size:9px;margin:0">Un ecosistema es un conjunto de seres vivos...</p>',
                after: '<p style="font-family:Arial;font-size:20px;font-weight:700;margin:0 0 4px">Los ecosistemas</p><p style="font-family:Arial;font-size:13px;margin:0">Un ecosistema es un conjunto de seres vivos...</p>' },
              STEPS(['<b>Selecciona</b> el texto.', 'Abre la lista <b>Fuente</b> y elige una (por ejemplo, Arial).', 'Abre la lista <b>Tamaño</b> y elige un número.']),
              TIP('Muchos profes piden <b>Arial o Times New Roman, tamaño 12</b>. Títulos: entre 14 y 24.', 'Para trabajos del colegio'),
              WARN('No mezcles muchas fuentes. Máximo <b>dos</b>: una para títulos y otra para el texto.'),
              { type: 'sim', app: 'word', caption: 'selecciona el título y cámbiale el tamaño; luego selecciona el párrafo y cambia la fuente.', options: { tabs: ['inicio'], html: '<p>Mi deporte favorito</p><p>Me gusta el fútbol porque se juega en equipo y me ayuda a estar en forma.</p>' } }
            ],
            practice: [
              { type: 'mcq', q: '¿Qué tamaño de letra es más adecuado para el <b>texto normal</b> de un trabajo?', options: ['12', '36', '6', '72'], answer: 0,
                why: [null, '36 es tamaño de título de afiche.', 'Muy pequeño: casi no se lee impreso.', '¡Enorme! Solo cabrían pocas palabras por hoja.'] },
              { type: 'mcq', q: '¿Cuál es la opción más adecuada para un <b>informe formal</b>?', options: ['Arial o Times New Roman', 'Comic Sans', 'Una fuente decorativa de letras cursivas', 'Mezclar cinco fuentes diferentes'], answer: 0,
                why: [null, 'Comic Sans se ve informal, como de caricatura.', 'Las fuentes decorativas cansan la vista en textos largos.', 'Se ve desordenado y poco profesional.'] }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Selecciona el título <b>Los volcanes</b> y ponle tamaño <b>20 o más</b>.', 'Selecciona el párrafo y cambia su fuente a <b>Arial</b>.'],
                sim: { tabs: ['inicio'], html: '<p>Los volcanes</p><p>Un volcán es una abertura de la Tierra por donde salen magma, gases y ceniza. En Colombia hay volcanes como el Nevado del Ruiz y el Galeras.</p>' },
                checks: [
                  { id: 'textStyle', text: 'Los volcanes', minSize: 20, label: 'El título tiene tamaño 20 o más', hint: 'Selecciona "Los volcanes" y usa la lista de tamaño.' },
                  { id: 'hasFont', font: 'Arial', label: 'El párrafo está en Arial', hint: 'Selecciona el párrafo con triple clic y elige Arial en la lista de fuentes.' }
                ],
                success: '¡Tu documento ya tiene jerarquía: se nota qué es título y qué es texto!'
              }
            }
          },
          {
            id: 'w2-2', icon: '🅱️', title: 'Negrita, cursiva y subrayado', minutes: 6,
            summary: '<b>Negrita (N)</b> resalta palabras clave, <i>cursiva (K)</i> se usa en títulos de libros y palabras en otro idioma, y <u>subrayado (S)</u> se usa poco. Si todo está resaltado, nada resalta.',
            learn: [
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '<b>N</b>', l: 'Negrita', hl: true }, { i: '<i>K</i>', l: 'Cursiva', hl: true }, { i: '<u>S</u>', l: 'Subrayado', hl: true }], caption: 'En Word en inglés los botones dicen <b>B</b>, <i>I</i> y <u>U</u>.' },
              P('🅱️ <b>Negrita</b>: para <b>resaltar palabras clave</b>. Ejemplo: La <b>fotosíntesis</b> es el proceso por el cual las plantas...'),
              P('📖 <i>Cursiva</i>: para <b>títulos de libros o películas</b>, palabras en otro idioma y nombres científicos. Ejemplo: Leí <i>Cien años de soledad</i>.'),
              P('〰️ <u>Subrayado</u>: úsalo poco, porque en pantalla se confunde con un enlace de internet.'),
              KEYS([[['Ctrl', 'N'], 'Negrita (inglés Ctrl+B)'], [['Ctrl', 'K'], 'Cursiva (inglés Ctrl+I)'], [['Ctrl', 'S'], 'Subrayado (inglés Ctrl+U)']]),
              WARN('Si todo está en negrita, <b>nada</b> resalta. Úsala solo en las palabras más importantes.'),
              TIP('Para <b>quitar</b> el formato, selecciona el texto y vuelve a pulsar el mismo botón.')
            ],
            practice: [
              { type: 'mcq', q: 'En la frase "Leí la novela Cien años de soledad", ¿qué formato lleva el título del libro?', options: ['Cursiva', 'Subrayado', 'Todo en mayúsculas', 'Color amarillo'], answer: 0,
                explain: 'Los títulos de libros, revistas y películas se escriben en cursiva.' },
              { type: 'match', q: 'Relaciona cada botón con su nombre:', pairs: [['N', 'Negrita'], ['K', 'Cursiva'], ['S', 'Subrayado']] },
              { type: 'tf', q: 'Es buena idea poner todo el trabajo en negrita para que se vea importante.', answer: false,
                explain: 'La negrita sirve para destacar. Si todo está destacado, el lector no sabe qué es lo importante.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Pon en <b>negrita</b>: <b>100 grados</b>.', 'Pon en <i>cursiva</i>: <i>Cien años de soledad</i>.', 'Pon <u>subrayado</u> a: <u>el viernes</u>.'],
                sim: { tabs: ['inicio'], html: '<p>El agua hierve a 100 grados. La novela Cien años de soledad fue escrita por Gabriel García Márquez. Recuerda entregar el trabajo el viernes.</p>' },
                checks: [
                  { id: 'textStyle', text: '100 grados', bold: true, label: '"100 grados" en negrita', hint: 'Arrastra el mouse sobre "100 grados" y pulsa N.' },
                  { id: 'textStyle', text: 'Cien años de soledad', italic: true, label: '"Cien años de soledad" en cursiva', hint: 'Selecciona las cuatro palabras y pulsa K.' },
                  { id: 'textStyle', text: 'el viernes', underline: true, label: '"el viernes" subrayado', hint: 'Selecciona "el viernes" y pulsa S.' }
                ]
              }
            }
          },
          {
            id: 'w2-3', icon: '🖍️', title: 'Color de texto', minutes: 5,
            summary: 'El botón <b>Color de fuente</b> (la "A" con una línea de color) cambia el color de las letras. Usa colores oscuros que se lean bien y máximo 2 o 3 colores por documento.',
            learn: [
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '<span style="border-bottom:4px solid #dc2626">A</span>', l: 'Color de fuente', hl: true }, { i: '<span style="background:#fde047;padding:0 3px">ab</span>', l: 'Resaltar' }], caption: '<b>Color de fuente</b> cambia las letras. <b>Resaltar</b> pinta el fondo, como un marcador.' },
              STEPS(['Selecciona el texto.', 'Clic en la flechita ▾ del botón <b>Color de fuente</b>.', 'Elige el color.']),
              EX('En un resumen para estudiar puedes poner los <span style="color:#2563eb;font-weight:700">conceptos en azul</span> y las <span style="color:#dc2626;font-weight:700">fechas en rojo</span>. ¡Tu cerebro los encuentra más rápido!'),
              TIP('Usa colores <b>oscuros</b> (negro, azul oscuro, verde oscuro). El amarillo claro o el verde neón casi no se leen sobre blanco.'),
              WARN('Si vas a <b>imprimir en blanco y negro</b>, los colores se verán grises. En trabajos formales, el texto va en negro.')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué color es mejor para el texto de un trabajo formal?', options: ['Negro o azul oscuro', 'Amarillo claro', 'Blanco', 'Verde neón'], answer: 0,
                why: [null, 'Casi no se lee sobre fondo blanco.', '¡Sería invisible en una hoja blanca!', 'Cansa la vista.'] },
              { type: 'tf', q: 'La herramienta <b>Resaltar</b> cambia el color de las letras.', answer: false,
                explain: 'Resaltar cambia el <b>fondo</b> (como un marcador). El que cambia las letras es <b>Color de fuente</b>.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Colorea cada estado del agua con un <b>color diferente</b>: <b>sólido</b>, <b>líquido</b> y <b>gaseoso</b>.', 'Recuerda: primero selecciona la palabra (doble clic) y luego elige el color.'],
                sim: { tabs: ['inicio'], html: '<p><b>Resumen: los estados del agua</b></p><p>El agua puede estar en estado sólido, líquido y gaseoso. El hielo es sólido, el agua del río es líquida y el vapor es gaseoso.</p>' },
                checks: [
                  { id: 'textStyle', text: 'sólido', color: true, label: '"sólido" tiene color', hint: 'Doble clic en la primera palabra "sólido" y elige un color.' },
                  { id: 'textStyle', text: 'líquido', color: true, label: '"líquido" tiene color', hint: 'Doble clic en "líquido" y elige un color.' },
                  { id: 'textStyle', text: 'gaseoso', color: true, label: '"gaseoso" tiene color', hint: 'Doble clic en "gaseoso" y elige un color.' }
                ]
              }
            }
          },
          {
            id: 'w2-4', icon: '↔️', title: 'Alineación del texto', minutes: 6,
            summary: '<b>Izquierda</b>: texto normal. <b>Centrar</b>: títulos y portadas. <b>Derecha</b>: fechas en cartas. <b>Justificar</b>: párrafos de trabajos formales (bordes parejos). Nunca centres con la barra espaciadora.',
            learn: [
              P('La alineación decide hacia dónde se "pega" el texto en el renglón.'),
              P(alignDemo),
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '☰', l: 'Izquierda' }, { i: '≡', l: 'Centrar', hl: true }, { i: '☰', l: 'Derecha' }, { i: '▤', l: 'Justificar', hl: true }], caption: 'Grupo <b>Párrafo</b> de la pestaña Inicio.' },
              KEYS([[['Ctrl', 'T'], 'Centrar'], [['Ctrl', 'J'], 'Justificar'], [['Ctrl', 'Q'], 'Izquierda'], [['Ctrl', 'D'], 'Derecha']], '⌨️ Atajos (Word en español)'),
              WARN('Nunca centres un título pulsando la barra espaciadora muchas veces: si cambias la letra, todo se corre. Usa el botón <b>Centrar</b>.'),
              TIP('La alineación se aplica a <b>todo el párrafo</b>: basta con tener el cursor dentro de él.')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué alineación usas para el <b>título</b> de tu trabajo?', options: ['Centrar', 'Derecha', 'Justificar', 'Izquierda'], answer: 0 },
              { type: 'mcq', q: 'El profe pide que los párrafos tengan los <b>dos bordes parejos</b>. ¿Qué usas?', options: ['Justificar', 'Centrar', 'Derecha', 'Muchos espacios'], answer: 0,
                explain: 'Justificar reparte los espacios para que ambos bordes queden rectos, como en los libros.' },
              { type: 'mcq', q: 'En una carta, ¿cómo se suele alinear la <b>ciudad y fecha</b>?', options: ['A la derecha', 'Centrada', 'Justificada', 'No se escribe'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Alinea la fecha <b>a la derecha</b>.', '<b>Centra</b> el título "Mi mascota".', '<b>Justifica</b> el párrafo.'],
                sim: { tabs: ['inicio'], html: '<p>Bogotá, 15 de marzo de 2026</p><p>Mi mascota</p><p>Mi mascota se llama Luna. Es una perrita criolla muy juguetona que llegó a mi casa hace tres años. Todos los días la saco a caminar por el parque del barrio y juega con los niños de la cuadra.</p>' },
                checks: [
                  { id: 'textStyle', text: 'Bogotá, 15', align: 'right', label: 'Fecha alineada a la derecha', hint: 'Cursor en la fecha y botón "Alinear a la derecha".' },
                  { id: 'textStyle', text: 'Mi mascota', align: 'center', label: 'Título centrado', hint: 'Cursor en "Mi mascota" (el título) y botón Centrar.' },
                  { id: 'textStyle', text: 'se llama Luna', align: 'justify', label: 'Párrafo justificado', hint: 'Cursor dentro del párrafo largo y botón Justificar.' }
                ]
              }
            }
          },
          {
            id: 'w2-5', icon: '📏', title: 'Interlineado y sangrías', minutes: 7,
            summary: 'El <b>interlineado</b> es el espacio entre renglones (1,0 · 1,15 · 1,5 · 2,0). La <b>sangría</b> es el espacio entre el margen y el texto; la de <b>primera línea</b> mete solo el primer renglón. Nunca hagas sangrías con espacios.',
            learn: [
              P('📐 <b>Interlineado</b> = espacio entre renglones. Muchos trabajos piden <b>1,5</b> o <b>2,0</b> ("doble espacio") para que se lean mejor.'),
              { type: 'compare', beforeLabel: 'Interlineado 1,0', afterLabel: 'Interlineado 2,0',
                before: `<p style="line-height:1;margin:0;font-size:.9rem">${lorem}</p>`,
                after: `<p style="line-height:2;margin:0;font-size:.9rem">${lorem}</p>` },
              P('➡️ <b>Sangría</b> = espacio entre el margen y el texto. La <b>sangría de primera línea</b> mete hacia adentro solo el primer renglón del párrafo, como en los libros.'),
              { type: 'compare', beforeLabel: 'Sin sangría', afterLabel: 'Sangría de primera línea',
                before: `<p style="margin:0;font-size:.9rem">${lorem}</p>`,
                after: `<p style="margin:0;font-size:.9rem;text-indent:1.25cm">${lorem}</p>` },
              { type: 'ribbon', app: 'word', tab: 'Inicio', buttons: [{ i: '↕', l: 'Interlineado', hl: true }, { i: '⇤', l: 'Disminuir sangría' }, { i: '⇥', l: 'Aumentar sangría', hl: true }, { i: '¶', l: 'Párrafo (más opciones)' }], caption: 'En <b>Párrafo → Especial → Primera línea</b> pones la sangría de primera línea (1,25 cm).' },
              WARN('No hagas sangrías pulsando espacio varias veces: quedan desiguales. Usa la opción de sangría o el triángulo de arriba en la <b>regla</b>.')
            ],
            practice: [
              { type: 'mcq', q: 'El profe pide el trabajo a "doble espacio". ¿Qué interlineado eliges?', options: ['2,0', '1,0', '1,15', '0,5'], answer: 0 },
              { type: 'tf', q: 'Para hacer una sangría lo correcto es pulsar la barra espaciadora cinco veces.', answer: false,
                explain: 'Se usa la sangría del párrafo o la tecla Tab. Con espacios quedan desiguales.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Selecciona los <b>dos párrafos</b>.', 'Ponles interlineado <b>1,5</b> (lista ↕ Interl.).', 'Con los párrafos seleccionados, aplica la sangría de <b>primera línea</b> (botón "1.ª lín.").'],
                sim: { tabs: ['inicio'], html: `<p>${lorem}</p><p>Para reducirla podemos caminar o usar bicicleta, sembrar árboles y evitar las quemas de basura. Pequeñas acciones de todos hacen una gran diferencia.</p>` },
                checks: [
                  { id: 'lineSpacing', value: '1.5', label: 'Interlineado 1,5', hint: 'Selecciona los párrafos y elige 1,5 en la lista de interlineado.' },
                  { id: 'hasFirstLine', label: 'Sangría de primera línea', hint: 'Selecciona los párrafos y pulsa el botón "1.ª lín.".' }
                ]
              }
            }
          },
          {
            id: 'w2-6', icon: '📋', title: 'Listas con viñetas y numeradas', minutes: 6,
            summary: 'Usa <b>viñetas (•)</b> cuando el orden no importa (materiales, ingredientes) y <b>numeración (1, 2, 3)</b> cuando el orden sí importa (pasos, instrucciones). Enter agrega un elemento; Enter dos veces termina la lista.',
            learn: [
              { type: 'compare', beforeLabel: '• Viñetas', afterLabel: '1. Numeración',
                before: 'Cuando el <b>orden no importa</b>:<ul style="margin:6px 0 0"><li>Cartulina</li><li>Tijeras</li><li>Pegante</li></ul>',
                after: 'Cuando el <b>orden sí importa</b>:<ol style="margin:6px 0 0"><li>Recortar</li><li>Pegar</li><li>Decorar</li></ol>' },
              STEPS(['Escribe cada elemento en su propio renglón.', 'Selecciona todos los renglones.', 'Pulsa <b>Viñetas</b> o <b>Numeración</b> (pestaña Inicio).', 'Pulsa <kbd>Enter</kbd> para un nuevo elemento; <kbd>Enter</kbd> dos veces para terminar la lista.']),
              TIP('Dentro de una lista, <kbd>Tab</kbd> crea un <b>subnivel</b> (una lista dentro de otra).'),
              EX('Receta, lista de materiales, pasos de un experimento, reglas de un juego, ideas principales de una exposición.')
            ],
            practice: [
              { type: 'mcq', q: 'Vas a escribir los <b>materiales</b> para el laboratorio. ¿Qué lista usas?', options: ['Viñetas', 'Numerada', 'Ninguna', 'Una tabla de 10 columnas'], answer: 0, explain: 'El orden de los materiales no importa.' },
              { type: 'mcq', q: 'Vas a escribir los <b>pasos del experimento</b>. ¿Qué lista usas?', options: ['Numerada', 'Viñetas', 'Todo en un párrafo', 'Subrayado'], answer: 0, explain: 'Los pasos tienen un orden: 1, 2, 3.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Convierte los <b>materiales</b> (Cartulina, Tijeras, Pegante) en una lista con <b>viñetas</b>.', 'Convierte los <b>pasos</b> (Recortar, Pegar, Decorar) en una lista <b>numerada</b>.'],
                sim: { tabs: ['inicio'], html: '<p><b>Materiales</b></p><p>Cartulina</p><p>Tijeras</p><p>Pegante</p><p><b>Pasos</b></p><p>Recortar la figura</p><p>Pegar en la cartulina</p><p>Decorar con colores</p>' },
                checks: [
                  { id: 'hasList', kind: 'ul', min: 3, label: 'Lista con viñetas de 3 materiales', hint: 'Selecciona los tres materiales y pulsa •☰.' },
                  { id: 'hasList', kind: 'ol', min: 3, label: 'Lista numerada de 3 pasos', hint: 'Selecciona los tres pasos y pulsa 1.☰.' }
                ]
              }
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 3 — DOCUMENTOS
       * ============================================================ */
      {
        id: 'w3', num: 3, icon: '📄', title: 'Documentos',
        desc: 'Imágenes, tablas, encabezado, pie de página, numeración, márgenes, orientación, portadas y saltos de página.',
        topics: [
          {
            id: 'w3-1', icon: '🖼️', title: 'Insertar imágenes', minutes: 6,
            summary: '<b>Insertar → Imágenes</b>. Para cambiar el tamaño sin deformar la imagen, arrástrala desde una <b>esquina</b>. Usa imágenes relacionadas con el tema y cita la fuente.',
            learn: [
              { type: 'ribbon', app: 'word', tab: 'Insertar', buttons: [{ i: '📘', l: 'Portada' }, { i: '▦', l: 'Tabla' }, { i: '🖼️', l: 'Imágenes', hl: true }, { i: '🔷', l: 'Formas' }, { i: '⭐', l: 'Iconos' }] },
              STEPS(['Pon el cursor donde quieres la imagen.', 'Ve a <b>Insertar → Imágenes</b> → <b>Este dispositivo</b> (o Imágenes en línea).', 'Elige la imagen y pulsa <b>Insertar</b>.', 'Cambia su tamaño arrastrando una <b>esquina</b>.', 'En <b>Ajustar texto</b> decides cómo se acomoda el texto alrededor.']),
              TIP('Arrastra desde las <b>esquinas</b>, no desde los lados: así la imagen no se estira ni se deforma.'),
              WARN('Usa imágenes que <b>expliquen</b> el tema (no solo decoración) y, si son de internet, escribe debajo de dónde las sacaste.')
            ],
            practice: [
              { type: 'mcq', q: '¿En qué pestaña está el botón <b>Imágenes</b>?', options: ['Insertar', 'Inicio', 'Revisar', 'Vista'], answer: 0 },
              { type: 'mcq', q: 'Quieres agrandar una imagen <b>sin que se deforme</b>. ¿De dónde la arrastras?', options: ['De una esquina', 'Del borde de la derecha', 'Del borde de arriba', 'Del centro'], answer: 0,
                why: [null, 'Desde un lado solo se estira a lo ancho: se deforma.', 'Desde arriba solo se estira a lo alto: se deforma.', 'Desde el centro la mueves, no cambias su tamaño.'] },
              { type: 'tf', q: 'Cualquier imagen de internet se puede usar en un trabajo sin decir de dónde salió.', answer: false, explain: 'Siempre cita la fuente de las imágenes que no son tuyas.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Ubica el cursor al final del párrafo.', 'Ve a la pestaña <b>Insertar → 🖼️ Imagen</b> y elige la del <b>planeta</b>.', 'Haz clic sobre la imagen y cambia su tamaño a <b>L</b> (grande) o <b>S</b> (pequeña).'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, html: '<h1>El sistema solar</h1><p>El sistema solar está formado por el Sol y ocho planetas que giran a su alrededor.</p>' },
                checks: [
                  { id: 'hasImage', label: 'Hay una imagen en el documento', hint: 'Pestaña Insertar → Imagen.' },
                  { id: 'imageResized', label: 'Cambiaste el tamaño de la imagen', hint: 'Clic sobre la imagen y luego S o L.' }
                ]
              }
            }
          },
          {
            id: 'w3-2', icon: '▦', title: 'Insertar tablas', minutes: 7,
            summary: 'Una tabla tiene <b>filas</b> (horizontales) y <b>columnas</b> (verticales); cada cuadrito es una <b>celda</b>. <b>Insertar → Tabla</b> y eliges columnas × filas. <kbd>Tab</kbd> pasa a la siguiente celda y en la última crea una fila nueva.',
            learn: [
              P('Las tablas organizan información en <b>filas</b> ➡️ y <b>columnas</b> ⬇️. Cada cuadrito es una <b>celda</b>.'),
              P(`<table class="mini-sheet" style="min-width:0"><tr><td class="bold">Hora</td><td class="bold">Lunes</td><td class="bold">Martes</td></tr><tr><td>7:00</td><td>Matemáticas</td><td>Inglés</td></tr><tr><td>8:00</td><td>Sociales</td><td>Tecnología</td></tr></table><p class="mini-sheet-caption">Un horario es una tabla de 3 columnas y 3 filas. La primera fila son los títulos.</p>`),
              STEPS(['Pon el cursor donde irá la tabla.', 'Ve a <b>Insertar → Tabla</b>.', 'Pasa el mouse por la cuadrícula eligiendo <b>columnas × filas</b> y haz clic.', 'Escribe en cada celda. Pasa a la siguiente con <kbd>Tab</kbd>.', 'Pulsa <kbd>Tab</kbd> en la <b>última celda</b> para agregar una fila nueva.']),
              TIP('Pon la <b>primera fila en negrita</b>: son los títulos de cada columna. En <b>Diseño de tabla</b> puedes elegir estilos con colores.')
            ],
            practice: [
              { type: 'mcq', q: 'Necesitas una tabla con <b>3 columnas y 5 filas</b>. En la cuadrícula eliges...', options: ['3 × 5', '5 × 3', '15 × 1', '8 × 8'], answer: 0, explain: 'En Word se lee primero columnas × filas.' },
              { type: 'tf', q: 'Las filas de una tabla son las verticales.', answer: false, explain: 'Filas = horizontales ➡️. Columnas = verticales ⬇️ (como las columnas de un edificio).' },
              { type: 'mcq', q: 'Estás en la última celda de la tabla y pulsas <kbd>Tab</kbd>. ¿Qué pasa?', options: ['Se crea una fila nueva', 'Se borra la tabla', 'Se cierra Word', 'Nada'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Debajo del título inserta una tabla de <b>2 columnas</b> y al menos <b>3 filas</b> (Insertar → Tabla).', 'En la primera fila escribe <b>Hora</b> y <b>Materia</b>.', 'Llena las demás filas con tu horario del lunes.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, html: '<h2>Mi horario del lunes</h2><p><br></p>' },
                checks: [
                  { id: 'hasTable', rows: 3, cols: 2, label: 'Tabla de 2 columnas y 3 filas o más', hint: 'Insertar → Tabla y elige 2 × 3 (o más).' },
                  { id: 'hasTable', rows: 3, cols: 2, filled: 6, label: 'Al menos 6 celdas con información', hint: 'Haz clic en cada celda y escribe.' },
                  { id: 'containsAll', texts: ['Hora', 'Materia'], label: 'Títulos "Hora" y "Materia"', hint: 'Escríbelos en la primera fila.' }
                ]
              }
            }
          },
          {
            id: 'w3-3', icon: '🔢', title: 'Encabezado, pie de página y numeración', minutes: 7,
            summary: 'El <b>encabezado</b> (arriba) y el <b>pie de página</b> (abajo) se escriben una vez y se repiten en todas las hojas. Los <b>números de página</b> se insertan con Insertar → Número de página, nunca a mano.',
            learn: [
              P('El <b>encabezado</b> es la zona de arriba de cada hoja y el <b>pie de página</b> la de abajo. Lo que escribes ahí <b>se repite en todas las páginas</b> automáticamente.'),
              EX('Encabezado: <i>Colegio Nueva Esperanza – Ciencias Naturales</i>. Pie de página: <i>Laura Gómez · Grado 9°B</i> y el número de página.'),
              STEPS(['Ve a <b>Insertar → Encabezado</b> (o haz doble clic en la parte de arriba de la hoja).', 'Escribe el texto.', 'Haz lo mismo con <b>Insertar → Pie de página</b>.', 'Para numerar: <b>Insertar → Número de página → Final de página</b> y elige la posición.', 'Pulsa <b>Cerrar encabezado y pie de página</b> (o doble clic en el centro de la hoja).']),
              WARN('Nunca escribas el número de página a mano en cada hoja: si agregas un párrafo, todo se desacomoda. Word los numera solo.'),
              TIP('Doble clic arriba = abrir encabezado. Doble clic en el centro = volver al texto.')
            ],
            practice: [
              { type: 'mcq', q: 'Quieres que el nombre del colegio aparezca <b>arriba en todas las páginas</b>. ¿Dónde lo escribes?', options: ['En el encabezado', 'En el pie de página', 'En cada página a mano', 'En el título'], answer: 0 },
              { type: 'tf', q: 'Hay que escribir el número de página a mano en cada hoja.', answer: false, explain: 'Insertar → Número de página lo hace automático y se actualiza solo.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Ve a la pestaña <b>Insertar</b>.', 'Pulsa <b>Encabezado</b> y escribe el nombre de tu colegio.', 'Pulsa <b>Pie</b> y escribe tu nombre y curso.', 'Pulsa <b>N.º página</b> para numerar.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: true, html: `<h1>Los ecosistemas</h1><p>Un ecosistema es un conjunto de seres vivos que se relacionan entre sí y con el lugar donde viven.</p><hr class="wd-pagebreak"><h2>Tipos de ecosistemas</h2><p>Existen ecosistemas terrestres, acuáticos y mixtos.</p>` },
                checks: [
                  { id: 'hasHeader', label: 'Encabezado con texto', hint: 'Insertar → Encabezado y escribe.' },
                  { id: 'hasFooter', label: 'Pie de página con texto', hint: 'Insertar → Pie y escribe.' },
                  { id: 'hasPageNumbers', label: 'Número de página insertado', hint: 'Insertar → N.º página.' }
                ]
              }
            }
          },
          {
            id: 'w3-4', icon: '📐', title: 'Márgenes y orientación', minutes: 6,
            summary: 'Los <b>márgenes</b> son el espacio en blanco alrededor de la hoja (Normal = 2,5 cm). La <b>orientación</b> puede ser <b>vertical</b> (normal) u <b>horizontal</b> (tablas anchas, líneas del tiempo). Ambas están en <b>Disposición</b>.',
            learn: [
              P('📄 <b>Márgenes</b>: el espacio en blanco entre el borde de la hoja y el texto. Sirven para que al imprimir o anillar no se corte nada.'),
              P('🔄 <b>Orientación</b>: <b>Vertical</b> ▯ es la normal. <b>Horizontal</b> ▭ sirve para tablas muy anchas, líneas del tiempo, afiches o mapas.'),
              { type: 'compare', beforeLabel: 'Vertical ▯', afterLabel: 'Horizontal ▭',
                before: '<div style="width:70px;height:96px;border:2px solid #94a3b8;border-radius:4px;margin:auto;padding:8px;background:#fff"><div style="height:6px;background:#cbd5e1;margin-bottom:4px"></div><div style="height:6px;background:#cbd5e1;margin-bottom:4px"></div><div style="height:6px;background:#cbd5e1;width:60%"></div></div>',
                after: '<div style="width:120px;height:80px;border:2px solid #7c3aed;border-radius:4px;margin:auto;padding:8px;background:#fff;display:flex;align-items:center;gap:4px"><span style="flex:1;height:4px;background:#7c3aed"></span>●<span style="flex:1;height:4px;background:#7c3aed"></span>●<span style="flex:1;height:4px;background:#7c3aed"></span></div>' },
              { type: 'ribbon', app: 'word', tab: 'Disposición', buttons: [{ i: '▣', l: 'Márgenes', hl: true }, { i: '▭', l: 'Orientación', hl: true }, { i: '📄', l: 'Tamaño' }, { i: '⫼', l: 'Columnas' }, { i: '⤓', l: 'Saltos' }], caption: 'En algunas versiones la pestaña se llama <b>Formato</b> o <b>Diseño de página</b>.' },
              TIP('Si el profe pide márgenes exactos (por ejemplo 3 cm a la izquierda), usa <b>Márgenes → Márgenes personalizados</b>.')
            ],
            practice: [
              { type: 'mcq', q: 'Vas a hacer una <b>línea del tiempo</b> larga. ¿Qué orientación es mejor?', options: ['Horizontal', 'Vertical', 'Da igual', 'Diagonal'], answer: 0 },
              { type: 'mcq', q: '¿En qué pestaña cambias los márgenes?', options: ['Disposición', 'Inicio', 'Insertar', 'Revisar'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['Ve a la pestaña <b>Disposición</b>.', 'Cambia la orientación a <b>Horizontal</b>.', 'Cambia los márgenes a <b>Estrecho</b> para aprovechar el espacio.'],
                sim: { tabs: ['disposicion', 'inicio'], showHF: false, html: '<h1 style="text-align:center">Línea del tiempo: independencia de Colombia</h1><p>1810 — Grito de independencia &nbsp;→&nbsp; 1819 — Batalla de Boyacá &nbsp;→&nbsp; 1821 — Constitución de Cúcuta</p>' },
                checks: [
                  { id: 'orientation', value: 'landscape', label: 'Orientación horizontal', hint: 'Disposición → Horizontal.' },
                  { id: 'margins', value: 'narrow', label: 'Márgenes estrechos', hint: 'Disposición → Márgenes → Estrecho.' }
                ]
              }
            }
          },
          {
            id: 'w3-5', icon: '📘', title: 'Portadas y saltos de página', minutes: 7,
            summary: 'La <b>portada</b> es la primera hoja: título, nombre, curso, profesor, colegio, ciudad y año, todo <b>centrado</b>. Para pasar a la hoja siguiente usa <b>Salto de página</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>), no muchos Enter.',
            learn: [
              P('La <b>portada</b> es la primera impresión de tu trabajo. Normalmente lleva, <b>centrado</b>:'),
              P(`<div class="card" style="max-width:280px;margin:auto;text-align:center;font-size:.85rem;line-height:1.5"><b style="font-size:1rem">LA CONTAMINACIÓN DEL AIRE</b><br><br>Laura Gómez Pérez<br>Grado 9°B<br><br>Profesora: Marta Ruiz<br>Ciencias Naturales<br><br>Colegio Nueva Esperanza<br>Medellín, 2026</div>`),
              TIP('Word trae portadas listas en <b>Insertar → Portada</b>. Solo cambias los textos.'),
              H('Salto de página'),
              P('Cuando terminas la portada y quieres empezar en la <b>hoja siguiente</b>, usa <b>Insertar → Salto de página</b> o <kbd>Ctrl</kbd>+<kbd>Enter</kbd>.'),
              WARN('¡No pulses Enter 20 veces para bajar a la siguiente hoja! Si luego agregas o quitas algo arriba, todo se desacomoda. El salto de página siempre queda en su lugar.'),
              KEYS([[['Ctrl', 'Enter'], 'Salto de página']])
            ],
            practice: [
              { type: 'mcq', q: 'Terminaste la portada y quieres que la introducción empiece en la <b>hoja 2</b>. ¿Qué haces?', options: ['Insertar un salto de página', 'Pulsar Enter muchas veces', 'Crear otro documento', 'Pulsar espacio hasta que baje'], answer: 0 },
              { type: 'mcq', q: '¿Qué <b>NO</b> va en la portada?', options: ['El desarrollo completo del tema', 'El título', 'Tu nombre y curso', 'El colegio, la ciudad y el año'], answer: 0, explain: 'La portada solo presenta el trabajo; el contenido va en las páginas siguientes.' }
            ],
            challenge: {
              task: {
                type: 'word',
                instructions: ['<b>Centra</b> las líneas de la portada (título, nombre, grado y colegio).', 'Pon el título en <b>negrita</b> o con estilo <b>Título 1</b>.', 'Pon el cursor justo antes de "Introducción" e inserta un <b>salto de página</b> (Insertar → Salto de página o <kbd>Ctrl</kbd>+<kbd>Enter</kbd>).'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, html: '<p>La contaminación del aire</p><p>Laura Gómez</p><p>Grado 9°B</p><p>Colegio Nueva Esperanza</p><p>Introducción: la contaminación del aire es un problema que afecta la salud de todas las personas que viven en las ciudades.</p>' },
                checks: [
                  { id: 'titleStyle', align: 'center', strong: true, label: 'Título centrado y destacado', hint: 'Selecciona el título: Centrar + Negrita (o Estilos → Título 1).' },
                  { id: 'centeredLines', n: 4, label: 'Datos de la portada centrados', hint: 'Selecciona las 4 primeras líneas y pulsa Centrar.' },
                  { id: 'coverPage', label: 'Salto de página después de la portada', hint: 'Cursor antes de "Introducción" → Insertar → Salto de página.' },
                  { id: 'contentAfterBreak', words: 5, label: 'La introducción quedó en la hoja 2', hint: 'El salto debe quedar entre "Colegio..." e "Introducción".' }
                ]
              }
            }
          }
        ]
      },

      /* ============================================================
       * NIVEL 4 — WORD PARA EL COLEGIO
       * ============================================================ */
      {
        id: 'w4', num: 4, icon: '🎒', title: 'Word para el colegio',
        desc: 'Portadas, hoja de vida, exposición escrita, cartas, informes, tablas de información y trabajos académicos.',
        topics: [
          {
            id: 'w4-1', icon: '🏷️', title: 'Crear la portada de un trabajo', minutes: 8,
            summary: 'Una buena portada tiene: <b>título</b> (grande y centrado), <b>tu nombre</b>, <b>grado</b>, <b>profesor(a)</b>, <b>materia</b>, <b>colegio</b>, <b>ciudad y año</b>. Todo centrado y separado, y un <b>salto de página</b> al final.',
            learn: [
              STEPS(['Escribe cada dato en su propio renglón: título, nombre, grado, profesor(a), materia, colegio, ciudad y año.', 'Selecciona todo y pulsa <b>Centrar</b>.', 'Pon el título en <b>negrita</b> y tamaño <b>16 a 24</b> (o estilo Título 1).', 'Separa los grupos de datos con renglones vacíos para que la hoja se vea equilibrada.', 'Al final, inserta un <b>salto de página</b>.'], 'Paso a paso'),
              EX('Arriba el título; en el centro tu nombre y grado; abajo profesor, materia, colegio, ciudad y año. La información ocupa toda la hoja, no solo la parte de arriba.'),
              TIP('Revisa la <b>ortografía</b> del título y de los nombres: es lo primero que ve el profe.'),
              WARN('Evita letras decorativas difíciles de leer y demasiados colores o imágenes en la portada.')
            ],
            practice: [
              { type: 'order', q: 'Ordena de arriba a abajo una portada clásica:', items: ['Título del trabajo', 'Nombre del estudiante y grado', 'Profesor(a) y materia', 'Colegio', 'Ciudad y año'] },
              { type: 'mcq', q: '¿Qué alineación lleva la portada?', options: ['Centrada', 'Justificada', 'A la derecha', 'Cada línea diferente'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Crea tu portada',
                instructions: ['Escribe una portada para un trabajo de <b>Sociales</b> sobre el tema que quieras.', 'Incluye: título, tu nombre, grado, profesor(a), colegio, ciudad y año.', 'Centra todo, destaca el título e inserta un salto de página al final.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, placeholder: 'Escribe aquí tu portada... (o usa Insertar → Portada y cambia los textos)' },
                checks: [
                  { id: 'titleStyle', align: 'center', strong: true, minSize: 14, label: 'Título centrado, destacado y grande (14+)', hint: 'Primer renglón: Centrar + Negrita + tamaño 16 o más (o Título 1).' },
                  { id: 'centeredLines', n: 6, label: 'Al menos 6 renglones centrados', hint: 'Selecciona todo y pulsa Centrar.' },
                  { id: 'containsAny', texts: ['profesor', 'profesora', 'docente'], label: 'Incluye al profesor(a)', hint: 'Escribe "Profesor(a): ..."' },
                  { id: 'containsAny', texts: ['9', 'noveno'], label: 'Incluye el grado', hint: 'Por ejemplo "Grado 9°A".' },
                  { id: 'containsAny', texts: ['2024', '2025', '2026', '2027', '2028'], label: 'Incluye el año', hint: 'Por ejemplo "Cali, 2026".' },
                  { id: 'hasPageBreak', label: 'Salto de página al final', hint: 'Insertar → Salto de página.' }
                ],
                success: '¡Portada lista! Ya puedes usar esta estructura en todos tus trabajos.'
              }
            }
          },
          {
            id: 'w4-2', icon: '👤', title: 'Crear una hoja de vida', minutes: 10,
            summary: 'La hoja de vida tiene secciones con <b>títulos</b>: Datos personales, Perfil, Formación académica, Experiencia o actividades, Habilidades (en lista) y Referencias. Debe ser clara, honesta y sin errores.',
            learn: [
              P('La <b>hoja de vida</b> (o currículum) presenta quién eres. La necesitarás para becas, cursos, práctica laboral o tu primer empleo.'),
              STEPS(['<b>Datos personales</b>: nombre, documento, teléfono, correo, ciudad (y una foto formal).', '<b>Perfil</b>: 2 o 3 renglones sobre quién eres y qué te gusta.', '<b>Formación académica</b>: colegio y grado actual, cursos.', '<b>Experiencia o actividades</b>: voluntariado, deportes, monitorías, grupos.', '<b>Habilidades</b>: en lista con viñetas (trabajo en equipo, Word y Excel, inglés básico...).', '<b>Referencias</b>: 2 personas que te conozcan (con teléfono).'], 'Las secciones'),
              TIP('Usa <b>Título 2</b> para cada sección: se ve ordenado y te sirve para hacer una tabla de contenido.'),
              WARN('Usa un correo serio (nombre.apellido@...), no "elcrack2010@...". Y <b>nunca</b> pongas información falsa.')
            ],
            practice: [
              { type: 'order', q: 'Ordena las secciones de una hoja de vida:', items: ['Datos personales', 'Perfil', 'Formación académica', 'Experiencia o actividades', 'Habilidades', 'Referencias'] },
              { type: 'mcq', q: '¿Cuál correo es más adecuado para una hoja de vida?', options: ['laura.gomez@correo.com', 'lauritaa_lokita15@correo.com', 'reina_del_free@correo.com', 'xXgamerXx@correo.com'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Tu hoja de vida',
                instructions: ['Escribe tu hoja de vida (puede ser con datos inventados).', 'Pon un <b>título</b> con tu nombre y usa <b>Título 2</b> para las secciones.', 'Incluye las secciones <b>Perfil</b>, <b>Formación</b>, <b>Habilidades</b> y <b>Referencias</b>.', 'Escribe las habilidades en una <b>lista con viñetas</b> e inserta una <b>imagen</b> como foto.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, html: '<h1>Hoja de vida</h1><p><br></p>' },
                checks: [
                  { id: 'minHeadings', n: 4, label: 'Al menos 4 títulos de sección (Título 1/2)', hint: 'Escribe el nombre de la sección, y en Estilos elige Título 2.' },
                  { id: 'containsAll', texts: ['perfil', 'formacion', 'habilidades', 'referencias'], label: 'Secciones: Perfil, Formación, Habilidades y Referencias', hint: 'Escribe cada una como título de sección.' },
                  { id: 'hasList', min: 3, label: 'Lista de al menos 3 habilidades', hint: 'Escribe 3 habilidades, selecciónalas y pulsa Viñetas.' },
                  { id: 'hasImage', label: 'Foto (imagen) insertada', hint: 'Insertar → Imagen.' },
                  { id: 'minWords', n: 50, label: 'Al menos 50 palabras', hint: 'Completa tu perfil y formación.' }
                ]
              }
            }
          },
          {
            id: 'w4-3', icon: '🎤', title: 'Crear una exposición escrita', minutes: 9,
            summary: 'Una exposición escrita tiene: <b>título</b>, <b>introducción</b> (de qué vas a hablar), <b>desarrollo</b> con subtítulos, <b>conclusión</b> y <b>fuentes</b>. Usa listas para las ideas principales: te ayudan a hablar sin leer todo.',
            learn: [
              P('Cuando te toca exponer, el documento escrito es tu <b>guion</b>: organiza las ideas para que hables con seguridad.'),
              STEPS(['<b>Título</b> del tema (Título 1).', '<b>Introducción</b>: qué vas a explicar y por qué es importante.', '<b>Desarrollo</b>: 2 o 3 subtítulos (Título 2) con las ideas principales.', '<b>Conclusión</b>: lo más importante en pocas líneas.', '<b>Fuentes</b>: de dónde sacaste la información.'], 'Estructura'),
              TIP('Escribe las ideas principales en <b>listas con viñetas</b>: frases cortas que te recuerden qué decir. ¡No leas párrafos enteros al público!'),
              EX('Tema: <i>El reciclaje</i>. Subtítulos: ¿Qué es reciclar? · ¿Cómo separar los residuos? · ¿Qué podemos hacer en el colegio?')
            ],
            practice: [
              { type: 'order', q: 'Ordena las partes de una exposición escrita:', items: ['Título', 'Introducción', 'Desarrollo con subtítulos', 'Conclusión', 'Fuentes'] },
              { type: 'mcq', q: '¿Para qué sirve la introducción?', options: ['Presentar el tema y por qué es importante', 'Poner todas las fuentes', 'Despedirse del público', 'Mostrar los resultados finales'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Tu guion de exposición',
                instructions: ['Elige un tema que te guste.', 'Escribe el <b>título</b> con Título 1 y usa <b>Título 2</b> para: Introducción, dos subtítulos de desarrollo y Conclusión.', 'Escribe las ideas principales en una <b>lista con viñetas</b>.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, placeholder: 'Escribe tu guion de exposición...' },
                checks: [
                  { id: 'minHeadings', tag: 'h1', n: 1, label: 'Título principal con estilo Título 1', hint: 'Escribe el título y en Estilos elige Título 1.' },
                  { id: 'minHeadings', tag: 'h2', n: 4, label: 'Al menos 4 subtítulos (Título 2)', hint: 'Introducción, 2 del desarrollo y Conclusión.' },
                  { id: 'containsAll', texts: ['introduccion', 'conclusion'], label: 'Tiene Introducción y Conclusión', hint: 'Escríbelas como subtítulos.' },
                  { id: 'hasList', min: 3, label: 'Lista con al menos 3 ideas', hint: 'Selecciona las ideas y pulsa Viñetas.' },
                  { id: 'minWords', n: 60, label: 'Al menos 60 palabras', hint: 'Desarrolla un poco más cada parte.' }
                ]
              }
            }
          },
          {
            id: 'w4-4', icon: '✉️', title: 'Escribir una carta', minutes: 8,
            summary: 'Partes de la carta: <b>ciudad y fecha</b>, <b>destinatario</b>, <b>saludo</b>, <b>cuerpo</b> (justificado), <b>despedida</b> y <b>firma</b>. Lenguaje respetuoso y claro.',
            learn: [
              P('Las cartas formales sirven para pedir permisos, hacer solicitudes al rector, invitar a alguien o presentar una queja con respeto.'),
              P(`<div class="card" style="font-size:.85rem;line-height:1.5;max-width:460px;margin:auto">
                <div style="text-align:right">Pereira, 10 de mayo de 2026</div><br>
                Señora<br><b>Ana María Torres</b><br>Rectora, Colegio San José<br><br>
                Respetada señora rectora:<br><br>
                <div style="text-align:justify">Los estudiantes de grado 9°B queremos solicitar permiso para realizar una feria de emprendimiento el viernes 22 de mayo en el patio central...</div><br>
                Atentamente,<br><br>__________________<br>Juan Pablo Ríos<br>Representante de curso 9°B</div>`),
              STEPS(['<b>Ciudad y fecha</b> (a la derecha o a la izquierda).', '<b>Destinatario</b>: a quién va dirigida y su cargo.', '<b>Saludo</b>: "Respetada señora:", "Cordial saludo."', '<b>Cuerpo</b>: el motivo, explicado con claridad (justificado).', '<b>Despedida</b>: "Atentamente," o "Cordialmente,".', '<b>Firma</b>: nombre y cargo.'], 'Partes de la carta'),
              TIP('Revisa la ortografía y usa un tono respetuoso. Una carta clara tiene más probabilidades de recibir un "sí".')
            ],
            practice: [
              { type: 'order', q: 'Ordena las partes de una carta formal:', items: ['Ciudad y fecha', 'Destinatario', 'Saludo', 'Cuerpo', 'Despedida', 'Firma'] },
              { type: 'mcq', q: '¿Cuál es una despedida adecuada para una carta formal?', options: ['Atentamente,', 'Chao, nos pillamos', 'Bye', 'Besos y abrazos'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Tu carta formal',
                instructions: ['Escribe una carta al rector(a) pidiendo algo para tu curso (una salida, un evento, una mejora).', 'Incluye ciudad y fecha, saludo, cuerpo, despedida y firma.', 'Pon la fecha <b>a la derecha</b> y el cuerpo <b>justificado</b>.'],
                sim: { tabs: ['inicio'], placeholder: 'Ciudad, fecha...' },
                checks: [
                  { id: 'containsAny', texts: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'], label: 'Ciudad y fecha', hint: 'Ejemplo: "Cali, 3 de abril de 2026".' },
                  { id: 'hasAlign', align: 'right', label: 'Fecha alineada a la derecha', hint: 'Cursor en la fecha → Alinear a la derecha.' },
                  { id: 'containsAny', texts: ['respetad', 'estimad', 'cordial saludo', 'senor', 'senora'], label: 'Saludo formal', hint: 'Ejemplo: "Respetado señor rector:".' },
                  { id: 'hasAlign', align: 'justify', label: 'Cuerpo justificado', hint: 'Cursor en el párrafo → Justificar.' },
                  { id: 'containsAny', texts: ['atentamente', 'cordialmente'], label: 'Despedida formal', hint: '"Atentamente," o "Cordialmente,".' },
                  { id: 'minWords', n: 60, label: 'Al menos 60 palabras', hint: 'Explica bien tu solicitud.' }
                ]
              }
            }
          },
          {
            id: 'w4-5', icon: '🧪', title: 'Hacer un informe escolar', minutes: 10,
            summary: 'El informe tiene: portada, <b>introducción</b>, <b>objetivos</b>, <b>desarrollo o procedimiento</b>, <b>resultados</b> (tablas o imágenes), <b>conclusiones</b> y <b>bibliografía</b>. Títulos con estilos, texto justificado y páginas numeradas.',
            learn: [
              P('Un <b>informe</b> cuenta lo que hiciste o investigaste: un experimento, una salida pedagógica, una encuesta.'),
              STEPS(['<b>Portada</b>.', '<b>Introducción</b>: de qué trata.', '<b>Objetivos</b>: qué querías lograr.', '<b>Procedimiento o desarrollo</b>: qué hiciste, paso a paso.', '<b>Resultados</b>: lo que obtuviste (aquí van <b>tablas</b> e <b>imágenes</b>).', '<b>Conclusiones</b>: qué aprendiste.', '<b>Bibliografía</b>: fuentes consultadas.'], 'Partes del informe'),
              KEY('Formato que casi todos los profes piden: títulos con <b>estilos</b> (Título 1 / Título 2), texto <b>justificado</b>, <b>interlineado 1,5</b> y <b>números de página</b>.'),
              TIP('Si usas los estilos de título, Word puede crear la <b>tabla de contenido</b> automática en <b>Referencias → Tabla de contenido</b>.')
            ],
            practice: [
              { type: 'mcq', q: '¿En qué parte del informe va la tabla con las medidas del experimento?', options: ['Resultados', 'Introducción', 'Portada', 'Bibliografía'], answer: 0 },
              { type: 'mcq', q: '¿Qué va en las conclusiones?', options: ['Lo que aprendiste y lo más importante de los resultados', 'La lista de materiales', 'El nombre del colegio', 'Las páginas web consultadas'], answer: 0 }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Dale formato al informe',
                instructions: ['Pon el título con estilo <b>Título 1</b>.', 'Pon <b>Introducción</b>, <b>Resultados</b> y <b>Conclusiones</b> con estilo <b>Título 2</b>.', '<b>Justifica</b> los párrafos.', 'En Resultados inserta una <b>tabla</b> (2 columnas × 3 filas) con los datos: Planta con luz – 12 cm, Planta sin luz – 3 cm.', 'Numera las páginas (Insertar → N.º página).'],
                sim: { tabs: ['inicio', 'insertar'], showHF: true, tall: true,
                  html: '<p>Informe: la luz y el crecimiento de las plantas</p><p>Introducción</p><p>En este experimento comprobamos si la luz del sol influye en el crecimiento de una planta de frijol durante dos semanas.</p><p>Resultados</p><p>Medimos las plantas al final del experimento:</p><p><br></p><p>Conclusiones</p><p>La planta que recibió luz creció cuatro veces más que la que estuvo en la oscuridad. La luz es necesaria para la fotosíntesis.</p>' },
                checks: [
                  { id: 'minHeadings', tag: 'h1', n: 1, label: 'Título con estilo Título 1', hint: 'Cursor en el título → Estilos → Título 1.' },
                  { id: 'minHeadings', tag: 'h2', n: 3, label: '3 secciones con Título 2', hint: 'Introducción, Resultados y Conclusiones → Título 2.' },
                  { id: 'hasAlign', align: 'justify', label: 'Párrafos justificados', hint: 'Selecciona los párrafos → Justificar.' },
                  { id: 'hasTable', rows: 3, cols: 2, filled: 4, label: 'Tabla de resultados con datos', hint: 'Insertar → Tabla 2 × 3 y escribe los datos.' },
                  { id: 'hasPageNumbers', label: 'Páginas numeradas', hint: 'Insertar → N.º página.' }
                ]
              }
            }
          },
          {
            id: 'w4-6', icon: '📊', title: 'Crear una tabla de información', minutes: 8,
            summary: 'Las tablas sirven para <b>comparar</b> y <b>organizar</b> información. Ponle un <b>título</b> arriba, la <b>primera fila en negrita</b> con los encabezados, y textos cortos en cada celda.',
            learn: [
              P('Un <b>cuadro comparativo</b> es una tabla que compara varias cosas según las mismas características.'),
              P(`<table class="mini-sheet" style="min-width:0"><tr><td class="bold">Animal</td><td class="bold">Grupo</td><td class="bold">Respira por</td></tr><tr><td>Tiburón</td><td>Pez</td><td>Branquias</td></tr><tr><td>Rana</td><td>Anfibio</td><td>Piel y pulmones</td></tr><tr><td>Águila</td><td>Ave</td><td>Pulmones</td></tr></table>`),
              STEPS(['Escribe un <b>título</b> arriba de la tabla.', 'Decide cuántas <b>columnas</b> (características) y <b>filas</b> (elementos) necesitas.', 'Inserta la tabla y llena la <b>primera fila</b> con los encabezados.', 'Pon la primera fila en <b>negrita</b>.', 'Escribe textos cortos en cada celda.']),
              TIP('Si la tabla es muy ancha, cambia la hoja a <b>horizontal</b>.')
            ],
            practice: [
              { type: 'mcq', q: '¿Qué va en la primera fila de una tabla?', options: ['Los encabezados (títulos de cada columna)', 'La conclusión', 'Nada, se deja vacía', 'Tu nombre'], answer: 0 },
              { type: 'mcq', q: 'Quieres comparar 4 países según capital, idioma y moneda. ¿Cuántas columnas necesitas?', options: ['4 (País, Capital, Idioma, Moneda)', '3', '2', '12'], answer: 0, explain: 'Una columna para el nombre del país y una para cada característica.' }
            ],
            challenge: {
              task: {
                type: 'word',
                heading: 'Tu cuadro comparativo',
                instructions: ['Escribe un título (por ejemplo: "Cuadro comparativo de animales").', 'Inserta una tabla de <b>3 columnas</b> y al menos <b>4 filas</b>.', 'Llena la tabla: primera fila con los encabezados y las demás con información.', 'Pon la primera fila en <b>negrita</b>.'],
                sim: { tabs: ['inicio', 'insertar'], showHF: false, placeholder: 'Escribe el título de tu cuadro comparativo...' },
                checks: [
                  { id: 'hasHeading', label: 'Tiene un título destacado', hint: 'Escribe el título y ponlo en negrita o con Título 1.' },
                  { id: 'hasTable', rows: 4, cols: 3, label: 'Tabla de 3 columnas y 4 filas o más', hint: 'Insertar → Tabla y elige 3 × 4.' },
                  { id: 'hasTable', rows: 4, cols: 3, filled: 10, label: 'Al menos 10 celdas con información', hint: 'Llena las celdas.' },
                  { id: 'tableHeaderBold', label: 'Primera fila en negrita', hint: 'Selecciona la primera fila y pulsa N.' }
                ]
              }
            }
          },
          {
            id: 'w4-7', icon: '🗂️', title: 'Organizar un trabajo académico', minutes: 9,
            summary: 'Orden de un trabajo: <b>Portada → Tabla de contenido → Introducción → Desarrollo → Conclusiones → Bibliografía → Anexos</b>. Con estilos de título, Word crea la tabla de contenido sola.',
            learn: [
              STEPS(['📘 <b>Portada</b>', '📑 <b>Tabla de contenido</b> (índice)', '👋 <b>Introducción</b>', '📚 <b>Desarrollo</b> (capítulos o subtemas)', '✅ <b>Conclusiones</b>', '🔗 <b>Bibliografía</b> (fuentes)', '📎 <b>Anexos</b> (fotos, encuestas, material extra)'], 'El orden de un trabajo escrito'),
              KEY('Normas frecuentes (APA o Icontec): letra Arial o Times New Roman <b>12</b>, interlineado <b>1,5 o 2</b>, texto <b>justificado</b>, márgenes definidos y páginas <b>numeradas</b>. Pregunta siempre cuáles pide tu profe.'),
              STEPS(['Aplica <b>Título 1</b> a cada capítulo y <b>Título 2</b> a los subtemas.', 'Pon el cursor en la hoja después de la portada.', 'Ve a <b>Referencias → Tabla de contenido</b> y elige un modelo.', 'Si cambias algo, pulsa <b>Actualizar tabla</b>.'], 'Tabla de contenido automática'),
              TIP('La <b>bibliografía</b> se ordena alfabéticamente por el apellido del autor. Ejemplo APA: <i>Pérez, J. (2023). Título del libro. Editorial.</i>')
            ],
            practice: [
              { type: 'order', q: 'Ordena las partes de un trabajo académico:', items: ['Portada', 'Tabla de contenido', 'Introducción', 'Desarrollo', 'Conclusiones', 'Bibliografía'] },
              { type: 'mcq', q: '¿Qué necesita Word para crear la tabla de contenido automática?', options: ['Que los títulos tengan estilos (Título 1, Título 2)', 'Que los títulos estén en rojo', 'Que escribas los números de página a mano', 'Que el texto esté centrado'], answer: 0 }
            ],
            challenge: {
              questions: [
                { type: 'order', q: 'Tu compañero entregó las hojas desordenadas. Ordénalas:', items: ['Portada', 'Tabla de contenido', 'Introducción', 'Desarrollo', 'Conclusiones', 'Bibliografía', 'Anexos'] },
                { type: 'mcq', q: 'Agregaste un capítulo nuevo y la tabla de contenido no lo muestra. ¿Qué haces?', options: ['Clic en la tabla → Actualizar tabla', 'Borrarla y escribirla a mano', 'Nada, así se queda', 'Poner el capítulo en negrita'], answer: 0 },
                { type: 'mcq', q: '¿Dónde van las fotos de la encuesta que hiciste en el colegio?', options: ['En los anexos', 'En la portada', 'En la tabla de contenido', 'En el encabezado'], answer: 0 },
                { type: 'match', q: 'Relaciona cada norma con su valor más común:', pairs: [['Tamaño de letra', '12'], ['Interlineado', '1,5 o 2'], ['Alineación del texto', 'Justificado'], ['Números de página', 'Automáticos']] }
              ]
            }
          }
        ]
      }
    ]
  };
})(window.O9);
