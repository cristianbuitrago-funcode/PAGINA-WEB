/**
 * BLOQUES DE CONTENIDO para la sección "📚 Aprende".
 * Cada lección es una lista de bloques ({ type, ... }) definidos en js/data.
 * Aquí se convierten en HTML y se les da interactividad.
 *
 * Tipos: p, h, tip, warn, example, key, steps, keys, ribbon, anatomy, sheet,
 *        formula, compare, chart, datatable, reveal, sim
 */
(function (O9) {
  'use strict';

  const { esc, $$ } = O9.util;

  /* ---------- Maquetas de las ventanas de Word y Excel (anatomía) ---------- */
  const ANATOMY = {
    word: [
      { id: 'title', name: 'Barra de título y acceso rápido', color: '#2b62d9', fg: '#fff', html: '💾 ↶ ↷ &nbsp;&nbsp; <b>Trabajo de Ciencias.docx</b> – Word',
        info: 'Muestra el <b>nombre del documento</b>. A la izquierda está la barra de acceso rápido: <b>Guardar 💾</b>, <b>Deshacer ↶</b> y <b>Rehacer ↷</b>.' },
      { id: 'tabs', name: 'Pestañas', color: '#2b62d9', fg: '#dbe6ff', html: 'Archivo &nbsp; <u style="color:#fff">Inicio</u> &nbsp; Insertar &nbsp; Diseño &nbsp; Disposición &nbsp; Referencias &nbsp; Revisar &nbsp; Vista',
        info: 'Las <b>pestañas</b> agrupan las herramientas por tema. <b>Inicio</b>: formato de texto. <b>Insertar</b>: imágenes, tablas, encabezados. <b>Disposición</b>: márgenes y orientación. <b>Archivo</b>: guardar, abrir, imprimir.' },
      { id: 'ribbon', name: 'Cinta de opciones', color: '#f3f6fb', fg: '#334155', html: 'Calibri ▾ &nbsp;11 ▾ &nbsp;&nbsp; <b>N</b> <i>K</i> <u>S</u> &nbsp;&nbsp; ☰ ≡ ☷ &nbsp;&nbsp; • 1. &nbsp;&nbsp; Estilos',
        info: 'La <b>cinta de opciones</b> muestra los botones de la pestaña elegida. En Inicio encuentras fuente, tamaño, <b>Negrita (N)</b>, <i>Cursiva (K)</i>, <u>Subrayado (S)</u>, alineación y listas.' },
      { id: 'ruler', name: 'Regla', color: '#fff', fg: '#94a3b8', html: '| · · 1 · · 2 · · 3 · · 4 · · 5 · · 6 · · 7 · · 8 · · 9 · · 10 · · 11 · · |',
        info: 'La <b>regla</b> sirve para ver y ajustar márgenes y sangrías. Si no la ves, actívala en <b>Vista → Regla</b>.' },
      { id: 'page', name: 'Área de trabajo (la hoja)', color: '#e9edf3', fg: '#334155', tall: true,
        html: '<div style="background:#fff;margin:8px auto;width:70%;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.15);text-align:left"><b>La fotosíntesis</b><br>Las plantas producen su alimento usando la luz del sol...<span style="border-left:2px solid #111;margin-left:2px">&nbsp;</span></div>',
        info: 'Es la <b>hoja en blanco</b> donde escribes. La rayita que parpadea se llama <b>cursor</b>: indica dónde aparecerá lo que escribas.' },
      { id: 'status', name: 'Barra de estado', color: '#2b62d9', fg: '#fff', html: 'Página 1 de 3 &nbsp;·&nbsp; 245 palabras &nbsp;·&nbsp; Español (Colombia) <span style="float:right">➖ ──●── ➕ 100%</span>',
        info: 'Abajo ves <b>en qué página estás</b>, <b>cuántas palabras</b> llevas y el <b>zoom</b> para acercar o alejar la hoja.' }
    ],
    excel: [
      { id: 'title', name: 'Barra de título', color: '#138a4f', fg: '#fff', html: '💾 ↶ ↷ &nbsp;&nbsp; <b>Notas 9A.xlsx</b> – Excel',
        info: 'Muestra el nombre del <b>libro</b> (así se llama un archivo de Excel) y los botones Guardar, Deshacer y Rehacer.' },
      { id: 'tabs', name: 'Pestañas y cinta', color: '#138a4f', fg: '#d6f5e5', html: 'Archivo &nbsp; <u style="color:#fff">Inicio</u> &nbsp; Insertar &nbsp; Fórmulas &nbsp; Datos &nbsp; Revisar &nbsp; Vista',
        info: 'Igual que en Word. En Excel son muy útiles: <b>Inicio</b> (formato), <b>Insertar</b> (gráficos), <b>Fórmulas</b> y <b>Datos</b> (ordenar y filtrar).' },
      { id: 'fbar', name: 'Cuadro de nombres y barra de fórmulas', color: '#fff', fg: '#334155',
        html: '<span style="display:inline-block;border:1px solid #cbd5e1;padding:0 10px;margin-right:6px">B7</span> <i>fx</i> &nbsp; =SUMA(B2:B6)',
        info: 'El <b>cuadro de nombres</b> (izquierda) dice qué celda está seleccionada, por ejemplo <b>B7</b>. La <b>barra de fórmulas</b> muestra lo que realmente hay dentro de la celda, incluso la fórmula.' },
      { id: 'cols', name: 'Columnas (letras)', color: '#eef1f4', fg: '#475569', html: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; A &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; B &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; C &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; D',
        info: 'Las <b>columnas</b> son verticales ⬇️ y se nombran con <b>letras</b>: A, B, C...' },
      { id: 'grid', name: 'Filas y celdas', color: '#fff', fg: '#334155', tall: true,
        html: '<table style="border-collapse:collapse;width:100%;font-size:.75rem"><tr><td style="background:#eef1f4;width:24px;text-align:center">1</td><td style="border:1px solid #e2e8f0">Nombre</td><td style="border:1px solid #e2e8f0">Nota</td><td style="border:1px solid #e2e8f0"></td></tr><tr><td style="background:#eef1f4;text-align:center">2</td><td style="border:1px solid #e2e8f0">Ana</td><td style="border:2px solid #138a4f">4,5</td><td style="border:1px solid #e2e8f0"></td></tr><tr><td style="background:#eef1f4;text-align:center">3</td><td style="border:1px solid #e2e8f0">Luis</td><td style="border:1px solid #e2e8f0">3,8</td><td style="border:1px solid #e2e8f0"></td></tr></table>',
        info: 'Las <b>filas</b> son horizontales ➡️ y se nombran con <b>números</b>. Donde se cruzan una columna y una fila hay una <b>celda</b>. La celda con borde verde es <b>B2</b> (columna B, fila 2).' },
      { id: 'sheets', name: 'Hojas', color: '#f6f8f7', fg: '#138a4f', html: '<b style="background:#fff;padding:0 8px;border-bottom:2px solid #138a4f">Hoja1</b> &nbsp; Hoja2 &nbsp; ⊕',
        info: 'Un libro puede tener varias <b>hojas</b>, como las páginas de un cuaderno. Con <b>⊕</b> agregas una nueva. Puedes cambiarles el nombre con doble clic.' }
    ]
  };

  const blocks = {};

  /** Pinta una lista de bloques dentro de un contenedor. */
  blocks.render = (container, list) => {
    container.classList.add('lesson-blocks');
    container.innerHTML = '';
    list.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'block';
      container.appendChild(el);
      const fn = RENDER[b.type];
      if (fn) fn(el, b);
      else el.innerHTML = `<p>${b.html || ''}</p>`;
    });
  };

  const callout = (cls, icon, defLabel) => (el, b) => {
    el.innerHTML = `<div class="${cls}"><span class="block-ico">${icon}</span><div>
      ${b.label !== false ? `<span class="block-label">${esc(b.label || defLabel)}</span>` : ''}${b.html}</div></div>`;
  };

  const RENDER = {
    p: (el, b) => { el.innerHTML = `<p>${b.html}</p>`; },
    h: (el, b) => { el.innerHTML = `<h3>${b.text}</h3>`; },
    tip: callout('block-tip', '💡', 'Truco'),
    warn: callout('block-warn', '⚠️', 'Ojo'),
    example: callout('block-example', '🏫', 'Ejemplo del colegio'),
    key: callout('block-key', '🔑', 'Idea clave'),

    steps: (el, b) => {
      el.innerHTML = (b.title ? `<h3>${b.title}</h3>` : '') +
        `<ol class="steps-list">${b.items.map((i) => `<li>${i}</li>`).join('')}</ol>`;
    },

    keys: (el, b) => {
      el.innerHTML = (b.title ? `<h3>${b.title}</h3>` : '') + `<div class="keys">${b.items
        .map(([keys, label]) => `<div class="key-card">${keys.map((k) => `<kbd>${esc(k)}</kbd>`).join(' + ')} <span>${esc(label)}</span></div>`)
        .join('')}</div>`;
    },

    ribbon: (el, b) => {
      const tabs = b.tabs || (b.app === 'excel'
        ? ['Archivo', 'Inicio', 'Insertar', 'Fórmulas', 'Datos', 'Vista']
        : ['Archivo', 'Inicio', 'Insertar', 'Diseño', 'Disposición', 'Vista']);
      el.innerHTML = `<div class="ribbon-mock ${b.app || 'word'}">
        <div class="ribbon-mock-tabs">${tabs.map((t) => `<span class="${t === b.tab ? 'on' : ''}">${esc(t)}</span>`).join('')}</div>
        <div class="ribbon-mock-body">${b.buttons.map((x) => `<div class="ribbon-btn ${x.hl ? 'hl' : ''}"><b>${x.i}</b>${esc(x.l)}</div>`).join('')}</div>
        ${b.caption ? `<div class="ribbon-caption">${b.caption}</div>` : ''}</div>`;
    },

    /** Ventana interactiva: clic en cada parte para ver qué es. */
    anatomy: (el, b) => {
      const parts = ANATOMY[b.app];
      el.innerHTML = `<div class="anatomy">
        <div class="anatomy-window">${parts.map((p) => `<div class="anatomy-part" data-id="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}"
          style="background:${p.color};color:${p.fg};padding:${p.tall ? '6px 36px 6px 8px' : '6px 36px 6px 10px'}">${p.html}<span class="hot">?</span></div>`).join('')}</div>
        <div><div class="anatomy-info"><h4>👆 Toca cada parte</h4><p>Haz clic en las zonas con el círculo <b>?</b> para descubrir cómo se llama cada parte de la ventana de ${b.app === 'word' ? 'Word' : 'Excel'}.</p></div>
        <div class="anatomy-legend">${parts.map((p) => `<button data-id="${p.id}">${esc(p.name)}</button>`).join('')}</div>
        <p class="muted" style="margin-top:8px;font-size:.85rem" data-count>Has explorado 0 de ${parts.length} partes.</p></div></div>`;
      const seen = new Set();
      const show = (id) => {
        const p = parts.find((x) => x.id === id);
        seen.add(id);
        $$('.anatomy-part, .anatomy-legend button', el).forEach((n) => n.classList.toggle('on', n.dataset.id === id));
        $$('.anatomy-legend button', el).forEach((n) => n.classList.toggle('seen', seen.has(n.dataset.id)));
        el.querySelector('.anatomy-info').innerHTML = `<h4>${esc(p.name)}</h4><p>${p.info}</p>`;
        el.querySelector('[data-count]').textContent = seen.size === parts.length
          ? '🎉 ¡Exploraste todas las partes!' : `Has explorado ${seen.size} de ${parts.length} partes.`;
      };
      $$('[data-id]', el).forEach((n) => {
        n.addEventListener('click', () => show(n.dataset.id));
        n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(n.dataset.id); } });
      });
    },

    /**
     * Mini hoja estática calculada con el motor real de fórmulas.
     * { rows: [['Producto','Precio'], ...], hl: ['B7'], range: 'B2:B6', showFormulas: bool }
     */
    sheet: (el, b) => {
      const sh = new O9.formula.Sheet(b.rows.length, Math.max(...b.rows.map((r) => r.length)));
      b.rows.forEach((r, ri) => r.forEach((v, ci) => sh.setRaw(O9.formula.refName(ci + 1, ri + 1), v == null ? '' : v)));
      const hl = new Set(b.hl || []);
      const rangeCells = new Set(b.range ? O9.formula.expandRange(...b.range.split(':')) : []);
      const bold = new Set(b.bold || []);
      const hasF = b.rows.some((r) => r.some((v) => /^=/.test(String(v || ''))));
      let showF = !!b.showFormulas;
      const draw = () => {
        let html = `<div class="mini-sheet-wrap"><table class="mini-sheet"><tr><th></th>`;
        for (let c = 1; c <= sh.cols; c++) html += `<th>${O9.formula.numToCol(c)}</th>`;
        html += '</tr>';
        for (let r = 1; r <= sh.rows; r++) {
          html += `<tr><th>${r}</th>`;
          for (let c = 1; c <= sh.cols; c++) {
            const ref = O9.formula.refName(c, r);
            const isF = sh.isFormula(ref);
            const v = sh.value(ref);
            const txt = showF && isF ? sh.getRaw(ref) : sh.display(ref);
            const cls = [typeof v === 'number' && !(showF && isF) ? 'num' : '', hl.has(ref) ? 'hl' : '',
              rangeCells.has(ref) ? 'hl-range' : '', bold.has(ref) || r === 1 && b.header !== false ? 'bold' : '', showF && isF ? 'formula' : ''].join(' ');
            html += `<td class="${cls}">${esc(txt)}</td>`;
          }
          html += '</tr>';
        }
        html += '</table></div>';
        if (b.caption) html += `<div class="mini-sheet-caption">${b.caption}</div>`;
        if (hasF) html += `<button class="btn btn-sm btn-light" style="margin-top:8px" data-toggle>${showF ? '🔢 Ver resultados' : '👀 Ver fórmulas'}</button>`;
        el.innerHTML = html;
        const t = el.querySelector('[data-toggle]');
        if (t) t.onclick = () => { showF = !showF; draw(); };
      };
      draw();
    },

    /** Anatomía de una fórmula: =SUMA(B2:B6) con cada parte explicada. */
    formula: (el, b) => {
      el.innerHTML = `<div class="card" style="background:#fbfaff">
        <div style="font-family:ui-monospace,Consolas,monospace;font-size:clamp(1.2rem,4vw,1.8rem);font-weight:800;text-align:center;margin:6px 0 14px;word-break:break-all">
          ${b.parts.map((p, i) => `<span style="color:${O9.charts.PALETTE[i % 10]}">${esc(p[0])}</span>`).join('')}</div>
        <div class="grid" style="gap:8px">${b.parts.map((p, i) => `<div class="row" style="gap:10px;flex-wrap:nowrap">
          <code style="color:${O9.charts.PALETTE[i % 10]};min-width:90px;text-align:center">${esc(p[0])}</code><span>${p[1]}</span></div>`).join('')}</div></div>`;
    },

    compare: (el, b) => {
      el.innerHTML = `<div class="compare">
        <div class="compare-box"><h5>${esc(b.beforeLabel || 'Antes')}</h5>${b.before}</div>
        <div class="compare-arrow">➜</div>
        <div class="compare-box"><h5>${esc(b.afterLabel || 'Después')}</h5>${b.after}</div></div>`;
    },

    chart: (el, b) => {
      el.innerHTML = `<div class="chart-box">${O9.charts.svg(b.chart, b)}</div>${b.caption ? `<p class="muted" style="margin-top:6px">${b.caption}</p>` : ''}`;
    },

    /** Tabla con botones para ordenar y filtrar (simula Datos → Ordenar / Filtro). */
    datatable: (el, b) => {
      let rows = b.rows.map((r) => r.slice());
      const original = rows.slice();
      let sortState = { col: -1, dir: 1 };
      let filterVal = '';
      const fc = b.filter; // índice de columna filtrable
      const uniq = fc != null ? [...new Set(b.rows.map((r) => r[fc]))] : [];
      el.innerHTML = `<div class="dt-toolbar">
          ${b.sort !== false ? '<span class="pill pill-purple">Toca un encabezado para ordenar ↕</span>' : ''}
          ${fc != null ? `<label class="row" style="gap:6px;font-weight:800">🔽 Filtrar ${esc(b.columns[fc])}:
            <select class="input" style="min-width:140px;padding:6px 10px"><option value="">(Todos)</option>${uniq.map((u) => `<option>${esc(u)}</option>`).join('')}</select></label>` : ''}
          <button class="btn btn-sm btn-light" data-reset>↺ Original</button>
        </div><div class="mini-sheet-wrap"><table class="mini-sheet dt"></table></div><p class="mini-sheet-caption" data-info></p>`;
      const table = el.querySelector('table');
      const draw = () => {
        let visible = 0;
        table.innerHTML = `<tr><th></th>${b.columns.map((c, i) => `<th><button data-col="${i}">${esc(c)} ${fc === i ? '<span class="filter-arrow">▾</span>' : ''}${sortState.col === i ? (sortState.dir > 0 ? '▲' : '▼') : ''}</button></th>`).join('')}</tr>` +
          rows.map((r, i) => {
            const hide = filterVal && String(r[fc]) !== filterVal;
            if (!hide) visible++;
            return `<tr class="${hide ? 'hidden-row' : ''}"><th>${i + 2}</th>${r.map((v) => `<td class="${typeof v === 'number' ? 'num' : ''}">${esc(typeof v === 'number' ? O9.util.fmtNum(v) : v)}</td>`).join('')}</tr>`;
          }).join('');
        el.querySelector('[data-info]').textContent = filterVal
          ? `Filtro activo: se muestran ${visible} de ${rows.length} filas (las demás están ocultas, no borradas).`
          : sortState.col >= 0 ? `Ordenado por "${b.columns[sortState.col]}" ${sortState.dir > 0 ? (typeof rows[0][sortState.col] === 'number' ? 'de menor a mayor' : 'de la A a la Z') : (typeof rows[0][sortState.col] === 'number' ? 'de mayor a menor' : 'de la Z a la A')}.` : (b.caption || '');
        if (b.sort !== false) $$('th button', table).forEach((btn) => (btn.onclick = () => {
          const col = +btn.dataset.col;
          sortState = { col, dir: sortState.col === col ? -sortState.dir : 1 };
          rows.sort((x, y) => (typeof x[col] === 'number' ? x[col] - y[col] : String(x[col]).localeCompare(String(y[col]), 'es')) * sortState.dir);
          draw();
        }));
      };
      const sel = el.querySelector('select');
      if (sel) sel.onchange = () => { filterVal = sel.value; draw(); };
      el.querySelector('[data-reset]').onclick = () => { rows = original.slice(); sortState = { col: -1, dir: 1 }; filterVal = ''; if (sel) sel.value = ''; draw(); };
      draw();
    },

    /** Pregunta para pensar antes de ver la respuesta. */
    reveal: (el, b) => {
      el.innerHTML = `<div class="card" style="border:2px dashed var(--purple-100)"><p style="font-weight:800;margin-bottom:10px">🤔 ${b.q}</p>
        <button class="btn btn-sm btn-purple">Ver respuesta</button><div class="feedback info hidden" style="margin-top:10px">${b.a}</div></div>`;
      el.querySelector('button').onclick = (e) => { e.target.remove(); el.querySelector('.feedback').classList.remove('hidden'); };
    },

    /** Simulador libre para experimentar dentro de la lección. */
    sim: (el, b) => {
      el.innerHTML = (b.caption ? `<p><b>🧪 Pruébalo:</b> ${b.caption}</p>` : '') + '<div data-sim></div>';
      const host = el.querySelector('[data-sim]');
      if (b.app === 'excel') O9.ExcelSim.create(host, b.options || {});
      else O9.WordSim.create(host, b.options || {});
    }
  };

  blocks.ANATOMY = ANATOMY;
  O9.blocks = blocks;
})(window.O9);
