/**
 * DIAGNÓSTICO INICIAL
 * Preguntas de autoevaluación (Sí / Más o menos / No) y algunas preguntas
 * de comprobación. Cada pregunta está asociada a un nivel de Word o Excel,
 * para recomendar automáticamente por dónde empezar.
 */
(function (O9) {
  'use strict';

  O9.data.diagnostic = {
    /** Escala de autoevaluación */
    scale: [
      { value: 2, emoji: '😎', label: 'Sí, lo hago sin ayuda' },
      { value: 1, emoji: '🤔', label: 'Más o menos' },
      { value: 0, emoji: '😅', label: 'No / No sé' }
    ],
    questions: [
      { kind: 'self', level: 'w1', q: '¿Sabes guardar correctamente un documento (con nombre claro y en la carpeta correcta)?' },
      { kind: 'self', level: 'w2', q: '¿Sabes dar formato a un texto: negrita, tamaño de letra y alineación?' },
      { kind: 'self', level: 'w3', q: '¿Sabes insertar una imagen en Word?' },
      { kind: 'self', level: 'w3', q: '¿Sabes crear una tabla en Word?' },
      { kind: 'self', level: 'w4', q: '¿Sabes hacer una portada y organizar un trabajo escrito (introducción, desarrollo, conclusiones)?' },
      { kind: 'quiz', level: 'w1', q: 'Borraste un párrafo por error. ¿Qué atajo lo recupera?', options: ['Ctrl + Z', 'Ctrl + P', 'Ctrl + G', 'No se puede recuperar'], answer: 0 },
      { kind: 'quiz', level: 'w2', q: '¿Qué alineación deja los dos bordes del párrafo parejos?', options: ['Justificar', 'Centrar', 'Izquierda', 'Derecha'], answer: 0 },
      { kind: 'self', level: 'x1', q: '¿Sabes qué es una celda en Excel y cómo se llama (por ejemplo, B3)?' },
      { kind: 'self', level: 'x2', q: '¿Sabes dar formato a una tabla en Excel (bordes, colores, formato moneda)?' },
      { kind: 'self', level: 'x3', q: '¿Sabes utilizar SUMA en Excel?' },
      { kind: 'self', level: 'x3', q: '¿Sabes calcular un promedio en Excel?' },
      { kind: 'self', level: 'x5', q: '¿Sabes crear un gráfico en Excel?' },
      { kind: 'quiz', level: 'x3', q: '¿Qué fórmula suma los valores desde B2 hasta B6?', options: ['=SUMA(B2:B6)', 'SUMA B2-B6', '=B2:B6', '=SUMAR(B2;B6)'], answer: 0 },
      { kind: 'quiz', level: 'x5', q: '¿Qué gráfico es mejor para mostrar partes de un todo (porcentajes que suman 100%)?', options: ['Circular', 'Líneas', 'Ninguno', 'Una tabla'], answer: 0 }
    ],
    /** Umbrales para el nivel general (porcentaje del puntaje máximo) */
    bands: [
      { min: 0, name: 'Básico', icon: '🌱', text: 'Estás empezando, ¡y eso está perfecto! Vamos paso a paso desde lo más importante.' },
      { min: 40, name: 'Intermedio', icon: '🚀', text: 'Ya conoces varias cosas. Refuerza lo que te falta y avanza a los temas más útiles para el colegio.' },
      { min: 75, name: 'Avanzado', icon: '👑', text: '¡Sabes bastante! Puedes ir directo a los niveles avanzados, los retos y los proyectos finales.' }
    ]
  };
})(window.O9);
