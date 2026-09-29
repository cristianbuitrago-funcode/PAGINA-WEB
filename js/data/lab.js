/**
 * LABORATORIO "APRENDE HACIENDO"
 * Misiones cortas para practicar libremente en los simuladores.
 * Usan los mismos validadores que las tareas (engine/word-checks.js y engine/excel-checks.js).
 */
(function (O9) {
  'use strict';

  O9.data.lab = {
    word: [
      { id: 'lw-1', icon: '🅱️', title: 'Tu nombre en negrita', text: 'Escribe tu nombre completo y ponlo en <b>negrita</b>.',
        checks: [{ id: 'minWords', n: 2, label: 'Escribiste tu nombre' }, { id: 'hasBold', label: 'Hay texto en negrita' }] },
      { id: 'lw-2', icon: '🔠', title: 'Título llamativo', text: 'Escribe un título, <b>céntralo</b> y ponle tamaño <b>20 o más</b>.',
        checks: [{ id: 'titleStyle', align: 'center', minSize: 20, label: 'Primer renglón centrado y de tamaño 20+' }] },
      { id: 'lw-3', icon: '🖼️', title: 'Imagen a la medida', text: 'Inserta una imagen y cámbiale el tamaño (S o L).',
        checks: [{ id: 'hasImage', label: 'Imagen insertada' }, { id: 'imageResized', label: 'Tamaño cambiado' }] },
      { id: 'lw-4', icon: '🔢', title: 'Mi top 3', text: 'Haz una <b>lista numerada</b> con 3 cosas que te gustan.',
        checks: [{ id: 'hasList', kind: 'ol', min: 3, label: 'Lista numerada de 3 elementos' }] },
      { id: 'lw-5', icon: '▦', title: 'Tabla 3 × 3', text: 'Inserta una tabla de 3 × 3 y llena todas sus celdas.',
        checks: [{ id: 'hasTable', rows: 3, cols: 3, filled: 9, label: 'Tabla 3 × 3 completamente llena' }] },
      { id: 'lw-6', icon: '💾', title: 'Buen hábito', text: 'Guarda tu documento con <kbd>Ctrl</kbd>+<kbd>G</kbd>.',
        checks: [{ id: 'usedAction', action: 'save', label: 'Guardaste con Ctrl+G' }] }
    ],
    excel: [
      { id: 'lx-1', icon: 'Σ', title: 'Suma rápida', text: 'Escribe 5 números en <b>A1:A5</b> y súmalos con <b>SUMA</b> en A6.',
        checks: [{ type: 'countNumbers', range: 'A1:A5', min: 5, label: '5 números en A1:A5' }, { type: 'fnCount', fn: 'SUMA', min: 1, label: 'Una fórmula con SUMA' }] },
      { id: 'lx-2', icon: '⚖️', title: 'Promedio', text: 'Calcula un promedio con la función <b>PROMEDIO</b>.',
        checks: [{ type: 'fnCount', fn: 'PROMEDIO', min: 1, label: 'Una fórmula con PROMEDIO' }] },
      { id: 'lx-3', icon: '🔝', title: 'El mayor y el menor', text: 'Usa <b>MAX</b> y <b>MIN</b> sobre un grupo de números.',
        checks: [{ type: 'fnCount', fn: 'MAX', min: 1, label: 'Una fórmula con MAX' }, { type: 'fnCount', fn: 'MIN', min: 1, label: 'Una fórmula con MIN' }] },
      { id: 'lx-4', icon: '🎨', title: 'Tabla con estilo', text: 'Ponle <b>bordes</b> y <b>color de relleno</b> a una tabla.',
        checks: [{ type: 'format', range: 'A1:H15', prop: 'border', mode: 'any', label: 'Celdas con bordes' }, { type: 'format', range: 'A1:H15', prop: 'fill', mode: 'any', label: 'Celdas con relleno' }] },
      { id: 'lx-5', icon: '🔤', title: 'Ordenar', text: 'Escribe una lista de nombres y ordénala de la A a la Z.',
        checks: [{ type: 'action', action: 'sort', label: 'Usaste Ordenar' }] },
      { id: 'lx-6', icon: '📊', title: 'Mi primer gráfico', text: 'Escribe datos (nombres y números) y crea un <b>gráfico</b>.',
        checks: [{ type: 'chart', label: 'Gráfico insertado' }] }
    ]
  };
})(window.O9);
