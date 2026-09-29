/**
 * VISTAS INFORMATIVAS
 *  - #/privacidad → Aviso de privacidad y tratamiento de datos (Ley 1581 de 2012, Colombia)
 *  - #/ayuda      → Preguntas frecuentes para estudiantes
 * Se pueden ver sin iniciar sesión.
 */
(function (O9) {
  'use strict';

  const { esc, $$ } = O9.util;
  const opts = () => O9.cloudOptions || {};

  /* ---------- Aviso de privacidad ---------- */
  function privacyHTML() {
    const inst = esc(opts().institucion || 'la institución educativa');
    const contact = opts().contactoPrivacidad ? `<a href="mailto:${esc(opts().contactoPrivacidad)}">${esc(opts().contactoPrivacidad)}</a>` : 'tu docente o la coordinación académica';
    return `
      <p><b>Ofimática 9°</b> es una plataforma educativa usada por ${inst} para enseñar Word y Excel. Este aviso explica, en palabras sencillas, qué datos guardamos y para qué.</p>
      <h3>1. ¿Qué datos se guardan?</h3>
      <ul>
        <li><b>Datos de la cuenta:</b> nombre completo, correo electrónico y el grupo al que perteneces.</li>
        <li><b>Datos de aprendizaje:</b> temas completados, respuestas correctas e incorrectas, XP, insignias, retos, proyectos y resultado del diagnóstico.</li>
        <li><b>Tareas:</b> los archivos que entregas, tus comentarios, la fecha de entrega y la calificación.</li>
      </ul>
      <p>No se piden datos sensibles (salud, religión, ubicación, fotos del rostro ni documento de identidad).</p>
      <h3>2. ¿Para qué se usan?</h3>
      <ul>
        <li>Guardar tu progreso para que continúes desde cualquier dispositivo.</li>
        <li>Que tu docente vea tu avance, revise tus tareas y te califique.</li>
        <li>Detectar los temas donde el grupo necesita refuerzo.</li>
      </ul>
      <p>Tus datos <b>no se venden, no se publican y no se usan para publicidad</b>.</p>
      <h3>3. ¿Quién los puede ver?</h3>
      <ul>
        <li><b>Tú</b> ves tu propia información.</li>
        <li><b>Los docentes</b> autorizados de la plataforma ven el avance y las entregas de los estudiantes.</li>
        <li><b>Otros estudiantes no pueden ver</b> tus datos ni tus archivos.</li>
      </ul>
      <p>La información se almacena en <b>Google Firebase</b> (servicio en la nube de Google), protegida con reglas de seguridad.</p>
      <h3>4. Menores de edad</h3>
      <p>Como la mayoría de estudiantes son menores de edad, para usar la plataforma se requiere la <b>autorización de tu padre, madre o acudiente</b>, de acuerdo con la <b>Ley 1581 de 2012</b> y el <b>Decreto 1377 de 2013</b> sobre protección de datos personales en Colombia.</p>
      <h3>5. Tus derechos</h3>
      <p>Tú y tu acudiente pueden <b>conocer, actualizar, corregir o pedir que se borren</b> tus datos en cualquier momento, y retirar la autorización. Para hacerlo, comunícate con ${contact}.</p>
      <h3>6. ¿Por cuánto tiempo?</h3>
      <p>Los datos se conservan mientras uses la plataforma durante el año escolar. Al finalizar, el docente puede eliminar las cuentas y la información.</p>
      <p class="muted" style="font-size:.85rem">Versión ${O9.cloud ? O9.cloud.PRIVACY_VERSION || 1 : 1} del aviso de privacidad.</p>`;
  }

  function renderPrivacy(root) {
    root.innerHTML = `<div class="diag-wrap">
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Aviso de privacidad</span></div>
      <h1>🔒 Aviso de privacidad</h1>
      <section class="card info-text">${privacyHTML()}</section>
      <div class="row section" style="justify-content:center"><button class="btn btn-light" onclick="history.back()">← Volver</button><a class="btn btn-light" href="#/ayuda">❓ Ayuda</a></div>
    </div>`;
  }

  /* ---------- Ayuda ---------- */
  const FAQ = [
    ['🚀 Empezar', [
      ['¿Cómo creo mi cuenta?', 'Entra a la página, pulsa <b>Crear cuenta</b>, escribe el <b>código de tu grupo</b> (te lo da tu docente), tu nombre completo, tu correo y una contraseña de al menos 6 caracteres. Debes aceptar el aviso de privacidad con autorización de tu acudiente.'],
      ['Entré con Google y me pide un código', 'Es normal: todos los estudiantes deben pertenecer a un grupo. Escribe el código de 6 letras o números que te dio tu docente.'],
      ['Me dice que el código no existe', 'Revisa que lo escribiste igual (no importan mayúsculas o minúsculas). Si el grupo está <b>cerrado</b>, pídele a tu docente que lo abra.'],
      ['Olvidé mi contraseña', 'En <b>Iniciar sesión</b>, escribe tu correo y pulsa <b>¿Olvidaste tu contraseña?</b>. Te llegará un correo para crear una nueva (revisa también el spam).'],
      ['Me equivoqué de grupo', 'Ve a <b>Perfil → Ver mi cuenta → Cambiar de grupo</b> y escribe el código correcto. No pierdes tu progreso.']
    ]],
    ['📚 Aprender', [
      ['¿Por dónde empiezo?', 'Haz el <b>diagnóstico</b> desde el inicio: te dice tu nivel y te recomienda por dónde comenzar en Word y en Excel.'],
      ['¿Cómo funciona cada tema?', 'Cada tema tiene 4 pasos: <b>📚 Aprende</b> (explicación con ejemplos), <b>🎯 Practica</b> (preguntas con pistas), <b>🧠 Reto</b> (hazlo tú en el simulador) y <b>🏆 Recompensa</b> (XP e insignias).'],
      ['¿Qué pasa si me equivoco?', '¡Nada malo! Equivocarse es parte de aprender. Primero te damos una pista, luego un repaso y si fallas tres veces te mostramos la solución explicada.'],
      ['¿Qué son el XP, los niveles y las insignias?', 'Ganas <b>XP</b> al completar temas, acertar y superar retos. Con XP subes de nivel: Principiante → Aprendiz → Explorador → Experto → Maestro de Ofimática. Las <b>insignias</b> son premios por logros especiales.'],
      ['¿El simulador es igual a Word y Excel?', 'Es una versión simplificada para practicar sin miedo. Los botones y las fórmulas funcionan igual que en los programas reales, así que lo que aprendes aquí lo puedes hacer en Word y Excel.']
    ]],
    ['📋 Tareas', [
      ['¿Dónde veo mis tareas?', 'En el menú <b>📋 Tareas</b>. En el inicio también aparece un aviso cuando tienes tareas pendientes.'],
      ['¿Cómo entrego una tarea?', 'En la tarea pulsa <b>📤 Entregar tarea</b>, elige tus archivos (Word, Excel, PDF o imágenes) y pulsa <b>Entregar</b>. Puedes agregar un comentario para tu docente.'],
      ['Mi archivo es muy grande', 'El máximo es <b>3 MB por archivo</b>. Guárdalo como PDF (Archivo → Guardar como → PDF), reduce el tamaño de las imágenes o comprímelo.'],
      ['¿Puedo cambiar lo que entregué?', 'Sí, mientras tu docente no la haya calificado. Pulsa <b>🔁 Cambiar mi entrega</b>.'],
      ['¿Dónde veo mi nota?', 'Cuando tu docente califique, la nota y su comentario aparecen en la tarjeta de la tarea, en <b>📋 Tareas</b>.']
    ]],
    ['🔒 Cuenta y privacidad', [
      ['¿Se guarda mi progreso?', 'Sí, en la nube y automáticamente. Puedes seguir desde cualquier computador o celular iniciando sesión con tu cuenta.'],
      ['Uso un computador del colegio', 'Al terminar, ve a <b>Perfil → Ver mi cuenta → Cerrar sesión</b>. Tu progreso queda guardado y nadie más podrá usar tu cuenta.'],
      ['¿Quién ve mis datos?', 'Solo tú y tus docentes. Otros estudiantes no pueden ver tu información ni tus archivos. Lee el <a href="#/privacidad">aviso de privacidad</a>.']
    ]]
  ];

  function renderHelp(root) {
    root.innerHTML = `<div class="diag-wrap">
      <div class="breadcrumb"><a href="#/">Inicio</a> › <span>Ayuda</span></div>
      <h1>❓ Ayuda</h1>
      <p class="muted">Respuestas a las preguntas más comunes. Toca una pregunta para ver la respuesta.</p>
      ${FAQ.map(([title, items]) => `<section class="section"><h2>${title}</h2><div class="stack" style="margin-top:10px">
        ${items.map(([q, a]) => `<details class="faq card"><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`).join('')}
      <div class="card section center"><p style="margin:0">¿No encontraste tu respuesta? Pregúntale a tu docente en clase. 🙋</p></div>
    </div>`;
    $$('details', root).forEach((d) => d.addEventListener('toggle', () => { if (d.open) $$('details', root).forEach((o) => { if (o !== d) o.open = false; }); }));
  }

  O9.views.privacy = { render: renderPrivacy, html: privacyHTML };
  O9.views.help = { render: renderHelp };
})(window.O9);
