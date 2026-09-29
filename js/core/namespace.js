/**
 * Espacio de nombres global de la aplicación.
 * Cada archivo agrega su parte a window.O9 para evitar variables globales sueltas.
 *
 *  O9.util      → utilidades generales (DOM, formato, eventos)
 *  O9.store     → lectura/escritura en localStorage
 *  O9.data      → contenido educativo (lecciones, retos, insignias...)
 *  O9.formula   → motor de fórmulas del mini Excel
 *  O9.charts    → dibujo de gráficos SVG
 *  O9.checks    → validadores de tareas (Word / Excel)
 *  O9.progress  → avance del estudiante en lecciones y retos
 *  O9.game      → XP, niveles, puntos e insignias
 *  O9.ui        → componentes visuales (toast, modal, barras)
 *  O9.blocks    → bloques de contenido de la sección "Aprende"
 *  O9.ex        → ejercicios (opción múltiple, completar, ordenar...)
 *  O9.WordSim / O9.ExcelSim → simuladores
 *  O9.tasks     → tareas prácticas con validación automática
 *  O9.views     → pantallas
 *  O9.router    → navegación por hash (#/ruta)
 */
window.O9 = window.O9 || {
  data: {},
  views: {},
  checks: {}
};
