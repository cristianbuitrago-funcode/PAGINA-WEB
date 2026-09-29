/**
 * SIMULADOR DE EXCEL ("mini Excel").
 * Hoja con celdas editables, barra de fórmulas, formato básico,
 * ordenar, autoajustar columnas e inserción de gráficos.
 *
 * Uso: const sim = O9.ExcelSim.create(contenedor, opciones)
 * Opciones:
 *   rows, cols        tamaño de la hoja
 *   data              { A1: 'Texto', B2: '=SUMA(...)' }
 *   formats           { A1: { bold:true, fill:'blue', align:'center', border:true, num:'currency' } }
 *   locked            ['A1', 'A2:B6']   celdas que no se pueden editar
 *   targets           ['B7']            celdas resaltadas (donde el estudiante debe trabajar)
 *   toolbar           true/false
 *   charts            true/false        permite insertar gráficos
 *   title, onChange(sim)
 */
(function (O9) {
  'use strict';

  const F = O9.formula;
  const { esc, $, $$ } = O9.util;
  const FILLS = [['', 'Sin relleno', '#fff'], ['blue', 'Azul', '#dbeafe'], ['green', 'Verde', '#dcfce7'], ['yellow', 'Amarillo', '#fef9c3'], ['purple', 'Morado', '#ede9fe'], ['orange', 'Naranja', '#ffedd5'], ['dark', 'Azul oscuro', '#1e3a8a']];

  /** Convierte ['A1', 'A2:B6'] en un Set con todas las celdas. */
  function expandList(list) {
    const out = new Set();
    (list || []).forEach((x) => {
      if (x.includes(':')) F.expandRange(...x.split(':')).forEach((r) => out.add(r));
      else out.add(F.cleanRef(x));
    });
    return out;
  }

  function create(root, opts = {}) {
    const sheet = new F.Sheet(opts.rows || 12, opts.cols || 6);
    Object.entries(opts.data || {}).forEach(([k, v]) => sheet.setRaw(F.cleanRef(k), v));
    Object.entries(opts.formats || {}).forEach(([k, v]) => {
      const refs = k.includes(':') ? F.expandRange(...k.split(':')) : [F.cleanRef(k)];
      refs.forEach((r) => Object.assign(sheet.cell(r).fmt, v));
    });
    const locked = expandList(opts.locked);
    let targets = expandList(opts.targets);
    const colWidths = Object.assign({}, opts.colWidths || {});
    let charts = [];
    const actions = new Set();

    let active = 'A1';
    let anchor = 'A1';
    let selEnd = 'A1';
    let dragging = false;

    /* ---------- Estructura ---------- */
    const el = document.createElement('div');
    el.className = 'xl';
    el.innerHTML = `
      <div class="xl-titlebar"><span class="dots"><i></i><i></i><i></i></span><span>${esc(opts.title || 'Libro1')} – Excel <small style="opacity:.75">(simulador)</small></span></div>
      ${opts.toolbar === false ? '' : `<div class="xl-toolbar">
        <button class="tb" data-fmt="bold" title="Negrita"><b>N</b></button>
        <button class="tb" data-fmt="italic" title="Cursiva"><i style="font-family:serif">K</i></button>
        <span class="xl-sep"></span>
        <button class="tb" data-align="left" title="Alinear a la izquierda">⬅</button>
        <button class="tb" data-align="center" title="Centrar">↔</button>
        <button class="tb" data-align="right" title="Alinear a la derecha">➡</button>
        <span class="xl-sep"></span>
        <select class="tb-select" data-fill title="Color de relleno" aria-label="Color de relleno">${FILLS.map(([v, n]) => `<option value="${v}">🎨 ${n}</option>`).join('')}</select>
        <button class="tb" data-border title="Bordes (todos)">▦ <small>Bordes</small></button>
        <span class="xl-sep"></span>
        <button class="tb" data-num="currency" title="Formato moneda">$</button>
        <button class="tb" data-num="percent" title="Formato porcentaje">%</button>
        <button class="tb" data-num="decimal" title="Un decimal">,0</button>
        <button class="tb" data-num="" title="Formato general"><small>Gral</small></button>
        <span class="xl-sep"></span>
        <button class="tb" data-sort="1" title="Ordenar de A a Z / menor a mayor (según la primera columna seleccionada)"><small>A→Z</small></button>
        <button class="tb" data-sort="-1" title="Ordenar de Z a A / mayor a menor"><small>Z→A</small></button>
        <button class="tb" data-autofit title="Autoajustar ancho de columnas">↔ <small>Ajustar</small></button>
        <button class="tb" data-clear title="Borrar contenido de la selección">🧽</button>
        ${opts.charts ? '<span class="xl-sep"></span><button class="tb" data-chart title="Insertar gráfico">📊 <small>Gráfico</small></button>' : ''}
      </div>`}
      <div class="xl-fbar"><span class="xl-name" aria-live="polite">A1</span><span class="xl-fx">fx</span>
        <input class="xl-input" type="text" aria-label="Barra de fórmulas" autocomplete="off" spellcheck="false" autocapitalize="off"></div>
      <div class="xl-grid-wrap"><table class="xl-grid"></table></div>
      <div class="xl-chart-form hidden"></div>
      <div class="xl-msg" aria-live="polite">Haz clic en una celda y escribe. Para una fórmula empieza con <b>=</b></div>
      <div class="xl-sheets"><span>Hoja1</span><em>⊕</em></div>
      <div class="xl-charts"></div>`;
    root.innerHTML = '';
    root.appendChild(el);

    const grid = $('.xl-grid', el);
    const fInput = $('.xl-input', el);
    const nameBox = $('.xl-name', el);
    const msg = $('.xl-msg', el);
    const chartsBox = $('.xl-charts', el);
    const chartForm = $('.xl-chart-form', el);

    /* ---------- Construcción de la tabla ---------- */
    function build() {
      let h = '<thead><tr><th></th>';
      for (let c = 1; c <= sheet.cols; c++) {
        const L = F.numToCol(c);
        h += `<th data-col="${L}" style="${colWidths[L] ? `min-width:${colWidths[L]}px` : ''}">${L}</th>`;
      }
      h += '</tr></thead><tbody>';
      for (let r = 1; r <= sheet.rows; r++) {
        h += `<tr><th data-row="${r}">${r}</th>`;
        for (let c = 1; c <= sheet.cols; c++) {
          const ref = F.refName(c, r);
          h += `<td data-ref="${ref}"><input class="xl-cell" data-ref="${ref}" aria-label="Celda ${ref}" autocomplete="off" spellcheck="false" autocapitalize="off" ${locked.has(ref) ? 'readonly' : ''}></td>`;
        }
        h += '</tr>';
      }
      grid.innerHTML = h + '</tbody>';
      renderAll();
    }

    const cellInput = (ref) => grid.querySelector(`input[data-ref="${ref}"]`);
    const cellTd = (ref) => grid.querySelector(`td[data-ref="${ref}"]`);

    /** Pinta el valor calculado y el formato de cada celda. */
    function renderAll() {
      $$('input.xl-cell', grid).forEach((inp) => {
        // La celda que se está editando conserva lo escrito (solo se actualiza su formato)
        paintCell(inp.dataset.ref, inp, document.activeElement === inp && !inp.readOnly);
      });
      renderSelection();
      renderCharts();
    }
    function paintCell(ref, inp, keepValue) {
      inp = inp || cellInput(ref);
      if (!inp) return;
      const v = sheet.value(ref);
      const fmt = sheet.getFmt(ref);
      if (!keepValue) inp.value = sheet.display(ref);
      const td = inp.parentNode;
      inp.className = 'xl-cell' +
        (typeof v === 'number' ? ' num' : '') + (F.isErr(v) ? ' err' : '') +
        (fmt.bold ? ' fb' : '') + (fmt.italic ? ' fi' : '') + (fmt.align ? ' al-' + fmt.align : '');
      td.className = (fmt.fill ? 'fill-' + fmt.fill : '') + (fmt.border ? ' b-all' : '') + (locked.has(ref) ? ' locked' : '') + (targets.has(ref) ? ' target' : '');
      const col = ref.replace(/\d+/g, '');
      if (colWidths[col]) inp.style.minWidth = colWidths[col] + 'px';
      td.title = F.isErr(v) ? v.msg : '';
    }

    /* ---------- Selección ---------- */
    function selRange() {
      const a = F.parseRef(anchor), b = F.parseRef(selEnd);
      return {
        c1: Math.min(a.col, b.col), c2: Math.max(a.col, b.col),
        r1: Math.min(a.row, b.row), r2: Math.max(a.row, b.row)
      };
    }
    function selectedRefs() {
      const s = selRange();
      const out = [];
      for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) out.push(F.refName(c, r));
      return out;
    }
    function selName() {
      const s = selRange();
      const a = F.refName(s.c1, s.r1), b = F.refName(s.c2, s.r2);
      return a === b ? a : a + ':' + b;
    }
    function renderSelection() {
      const set = new Set(selectedRefs());
      const multi = set.size > 1;
      $$('td[data-ref]', grid).forEach((td) => {
        td.classList.toggle('sel', multi && set.has(td.dataset.ref));
        td.classList.toggle('active', td.dataset.ref === active);
      });
      const s = selRange();
      $$('th[data-col]', grid).forEach((th) => { const c = F.colToNum(th.dataset.col); th.classList.toggle('hl', c >= s.c1 && c <= s.c2); });
      $$('th[data-row]', grid).forEach((th) => { const r = +th.dataset.row; th.classList.toggle('hl', r >= s.r1 && r <= s.r2); });
      nameBox.textContent = selName();
      if (document.activeElement !== fInput) fInput.value = sheet.getRaw(active);
      const fmt = sheet.getFmt(active);
      $$('[data-fmt]', el).forEach((b) => b.classList.toggle('on', !!fmt[b.dataset.fmt]));
      $$('[data-align]', el).forEach((b) => b.classList.toggle('on', fmt.align === b.dataset.align));
      highlightRefs(sheet.getRaw(active));
    }

    /** Colorea las celdas que usa la fórmula activa (como hace Excel). */
    function highlightRefs(raw) {
      $$('td.ref-hint', grid).forEach((td) => td.classList.remove('ref-hint'));
      if (!/^=/.test(raw)) return;
      const info = F.analyze(raw);
      info.refs.forEach((r) => { const td = cellTd(r); if (td) td.classList.add('ref-hint'); });
    }

    function setActive(ref, extend) {
      active = ref;
      if (!extend) anchor = ref;
      selEnd = ref;
      renderSelection();
      const v = sheet.value(ref);
      if (F.isErr(v)) showMsg(`<b>${esc(v.code)}</b> en ${ref}: ${esc(v.msg)}`, 'err');
      else if (sheet.isFormula(ref)) showMsg(`La celda <b>${ref}</b> tiene la fórmula <code>${esc(sheet.getRaw(ref))}</code> y su resultado es <b>${esc(sheet.display(ref))}</b>.`, 'tip');
      else showMsg(locked.has(ref) ? `La celda ${ref} tiene datos del ejercicio (no se puede cambiar).` : `Celda <b>${ref}</b> seleccionada. Escribe un dato o una fórmula que empiece con <b>=</b>.`);
    }
    function showMsg(html, type = '') { msg.innerHTML = html; msg.className = 'xl-msg ' + type; }

    /* ---------- Edición ---------- */
    function commit(ref, raw) {
      if (locked.has(ref)) return;
      raw = raw == null ? '' : String(raw);
      // Si escriben "SUMA(...)" sin "=", avisamos
      if (/^(SUMA|PROMEDIO|MAX|MIN|CONTAR|SUM|AVERAGE)\s*\(/i.test(raw.trim())) {
        showMsg('💡 Parece una fórmula, pero le falta el signo <b>=</b> al inicio. Excel la tomará como texto.', 'err');
      }
      if (sheet.getRaw(ref) === raw) return;
      sheet.setRaw(ref, raw);
      if (raw.startsWith('=')) actions.add('formula');
      else if (raw) actions.add('data');
      renderAll();
      const v = sheet.value(ref);
      if (F.isErr(v)) showMsg(`<b>${esc(v.code)}</b> en ${ref}: ${esc(v.msg)}`, 'err');
      else if (raw.startsWith('=')) showMsg(`✅ Fórmula en <b>${ref}</b>: <code>${esc(raw)}</code> = <b>${esc(sheet.display(ref))}</b>`, 'tip');
      notify();
    }

    const notify = O9.util.debounce(() => opts.onChange && opts.onChange(api), 150);

    function move(ref, dc, dr) {
      const p = F.parseRef(ref);
      const c = O9.util.clamp(p.col + dc, 1, sheet.cols);
      const r = O9.util.clamp(p.row + dr, 1, sheet.rows);
      return F.refName(c, r);
    }
    function focusCell(ref) {
      const inp = cellInput(ref);
      if (inp) inp.focus();
    }

    grid.addEventListener('focusin', (e) => {
      const inp = e.target.closest('input.xl-cell');
      if (!inp) return;
      const ref = inp.dataset.ref;
      if (!dragging && !shiftDown) setActive(ref);
      if (!inp.readOnly) inp.value = sheet.getRaw(ref);
      inp.dataset.orig = inp.value;
    });
    grid.addEventListener('focusout', (e) => {
      const inp = e.target.closest('input.xl-cell');
      if (!inp) return;
      if (!inp.readOnly && inp.dataset.cancel !== '1') commit(inp.dataset.ref, inp.value);
      inp.dataset.cancel = '';
      paintCell(inp.dataset.ref, inp);
    });
    grid.addEventListener('input', (e) => {
      const inp = e.target.closest('input.xl-cell');
      if (!inp) return;
      fInput.value = inp.value;
      highlightRefs(inp.value);
    });
    grid.addEventListener('keydown', (e) => {
      const inp = e.target.closest('input.xl-cell');
      if (!inp) return;
      const ref = inp.dataset.ref;
      const editingFormula = inp.value.startsWith('=');
      let to = null;
      if (e.key === 'Enter') to = move(ref, 0, e.shiftKey ? -1 : 1);
      else if (e.key === 'Tab') to = move(ref, e.shiftKey ? -1 : 1, 0);
      else if (e.key === 'ArrowDown' && !editingFormula) to = move(ref, 0, 1);
      else if (e.key === 'ArrowUp' && !editingFormula) to = move(ref, 0, -1);
      else if (e.key === 'Escape') { inp.dataset.cancel = '1'; inp.value = inp.dataset.orig || ''; inp.blur(); inp.focus(); return; }
      else if ((e.key === 'Delete') && inp.readOnly === false && inp.selectionStart === 0 && inp.selectionEnd === inp.value.length) { inp.value = ''; }
      if (to) {
        e.preventDefault();
        commit(ref, inp.value);
        focusCell(to);
      }
    });

    // Selección con arrastre o con Shift + clic
    let shiftDown = false;
    grid.addEventListener('pointerdown', (e) => {
      const td = e.target.closest('td[data-ref]');
      if (!td) return;
      shiftDown = e.shiftKey;
      if (e.shiftKey) {
        e.preventDefault();
        selEnd = td.dataset.ref;
        active = anchor;
        renderSelection();
        showMsg(`Rango seleccionado: <b>${selName()}</b> (${selectedRefs().length} celdas)`, 'tip');
        return;
      }
      dragging = true;
      anchor = selEnd = active = td.dataset.ref;
      renderSelection();
    });
    grid.addEventListener('pointerover', (e) => {
      if (!dragging || e.buttons !== 1) return;
      const td = e.target.closest('td[data-ref]');
      if (!td || td.dataset.ref === selEnd) return;
      selEnd = td.dataset.ref;
      renderSelection();
      if (selectedRefs().length > 1) {
        const inp = cellInput(active);
        if (inp) inp.blur();
        showMsg(`Rango seleccionado: <b>${selName()}</b> (${selectedRefs().length} celdas)`, 'tip');
      }
    });
    const stopDrag = () => { dragging = false; shiftDown = false; };
    window.addEventListener('pointerup', stopDrag);

    // Seleccionar columna o fila completa al hacer clic en su encabezado
    grid.addEventListener('click', (e) => {
      const th = e.target.closest('th');
      if (!th) return;
      if (th.dataset.col) { anchor = th.dataset.col + '1'; selEnd = th.dataset.col + sheet.rows; active = anchor; }
      else if (th.dataset.row) { anchor = 'A' + th.dataset.row; selEnd = F.numToCol(sheet.cols) + th.dataset.row; active = anchor; }
      else return;
      renderSelection();
      showMsg(th.dataset.col ? `Seleccionaste la <b>columna ${th.dataset.col}</b> (vertical ⬇️).` : `Seleccionaste la <b>fila ${th.dataset.row}</b> (horizontal ➡️).`, 'tip');
    });

    // Barra de fórmulas
    fInput.addEventListener('input', () => {
      const inp = cellInput(active);
      if (inp && !inp.readOnly) inp.value = fInput.value;
      highlightRefs(fInput.value);
    });
    fInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(active, fInput.value); focusCell(move(active, 0, 1)); }
      if (e.key === 'Escape') { fInput.value = sheet.getRaw(active); fInput.blur(); }
    });
    fInput.addEventListener('focus', () => {
      if (locked.has(active)) { fInput.readOnly = true; } else fInput.readOnly = false;
    });
    fInput.addEventListener('change', () => commit(active, fInput.value));

    /* ---------- Barra de herramientas ---------- */
    function applyFmt(fn, action) {
      selectedRefs().forEach((r) => fn(sheet.cell(r).fmt, r));
      sheet.cache = {};
      actions.add(action);
      renderAll();
      notify();
    }
    const tb = $('.xl-toolbar', el);
    if (tb) {
      tb.addEventListener('mousedown', (e) => { if (!e.target.closest('select')) e.preventDefault(); });
      tb.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b) return;
        const d = b.dataset;
        if (d.fmt) { const on = !sheet.getFmt(active)[d.fmt]; applyFmt((f) => { f[d.fmt] = on; }, d.fmt); }
        else if (d.align) applyFmt((f) => { f.align = f.align === d.align ? '' : d.align; }, 'align');
        else if (d.border !== undefined) { const on = !sheet.getFmt(active).border; applyFmt((f) => { f.border = on; }, 'border'); }
        else if (d.num !== undefined) applyFmt((f) => { f.num = d.num; }, 'num-' + (d.num || 'general'));
        else if (d.sort) sortSelection(+d.sort);
        else if (d.autofit !== undefined) autofit();
        else if (d.clear !== undefined) {
          selectedRefs().forEach((r) => { if (!locked.has(r)) sheet.setRaw(r, ''); });
          renderAll(); notify();
        } else if (d.chart !== undefined) openChartForm();
      });
      tb.addEventListener('change', (e) => {
        if (e.target.matches('[data-fill]')) { const v = e.target.value; applyFmt((f) => { f.fill = v; }, 'fill'); e.target.value = ''; }
      });
    }

    /** Confirma lo que se esté escribiendo en una celda antes de cambiar la hoja por código. */
    function commitActive() {
      const a = document.activeElement;
      if (a && a.classList.contains('xl-cell') && grid.contains(a)) a.blur();
    }

    /** Ordena las filas del rango seleccionado según su primera columna. */
    function sortSelection(dir) {
      commitActive();
      const s = selRange();
      if (s.r2 - s.r1 < 1) return showMsg('Selecciona varias filas (arrastrando) para poder ordenarlas. No incluyas la fila de títulos.', 'err');
      for (let r = s.r1; r <= s.r2; r++) for (let c = s.c1; c <= s.c2; c++) if (locked.has(F.refName(c, r))) return showMsg('Ese rango tiene celdas bloqueadas del ejercicio.', 'err');
      const rows = [];
      for (let r = s.r1; r <= s.r2; r++) {
        const row = [];
        for (let c = s.c1; c <= s.c2; c++) { const ref = F.refName(c, r); row.push({ raw: sheet.getRaw(ref), fmt: Object.assign({}, sheet.getFmt(ref)), key: sheet.value(ref) }); }
        rows.push(row);
      }
      rows.sort((a, b) => {
        const x = a[0].key, y = b[0].key;
        if (x === '' && y !== '') return 1;
        if (y === '' && x !== '') return -1;
        if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
        return String(x).localeCompare(String(y), 'es') * dir;
      });
      rows.forEach((row, i) => row.forEach((cell, j) => {
        const ref = F.refName(s.c1 + j, s.r1 + i);
        sheet.setRaw(ref, cell.raw);
        sheet.cell(ref).fmt = cell.fmt;
      }));
      actions.add('sort');
      renderAll();
      notify();
      showMsg(`Ordenado ${dir > 0 ? 'de la A a la Z (o de menor a mayor)' : 'de la Z a la A (o de mayor a menor)'} según la columna ${F.numToCol(s.c1)}.`, 'tip');
    }

    function autofit() {
      commitActive();
      const s = selRange();
      for (let c = s.c1; c <= s.c2; c++) {
        let max = 4;
        for (let r = 1; r <= sheet.rows; r++) max = Math.max(max, String(sheet.display(F.refName(c, r))).length);
        colWidths[F.numToCol(c)] = Math.min(320, Math.max(88, max * 8.5 + 20));
      }
      actions.add('autofit');
      build();
      notify();
      showMsg('Columnas ajustadas al contenido más largo. (En Excel: doble clic en el borde derecho de la letra de la columna).', 'tip');
    }

    /* ---------- Gráficos ---------- */
    function openChartForm() {
      commitActive();
      const s = selRange();
      let labels = '', values = '';
      if (s.c2 > s.c1) {
        // Primera columna = etiquetas, última columna = valores (sin la fila de títulos si es texto)
        let r1 = s.r1;
        const top = sheet.value(F.refName(s.c2, s.r1));
        if (typeof top !== 'number') r1++;
        labels = `${F.refName(s.c1, r1)}:${F.refName(s.c1, s.r2)}`;
        values = `${F.refName(s.c2, r1)}:${F.refName(s.c2, s.r2)}`;
      }
      let type = 'bar';
      chartForm.classList.remove('hidden');
      chartForm.innerHTML = `
        <label>Tipo de gráfico<div class="xl-chart-types">${['bar', 'pie', 'line'].map((t) => `<button type="button" data-t="${t}" class="${t === type ? 'on' : ''}">${O9.charts.ICONS[t]} ${t === 'bar' ? 'Barras' : t === 'pie' ? 'Circular' : 'Líneas'}</button>`).join('')}</div></label>
        <label>Etiquetas (ej. A2:A6)<input data-l value="${labels}" placeholder="A2:A6"></label>
        <label>Valores (ej. B2:B6)<input data-v value="${values}" placeholder="B2:B6"></label>
        <label>Título<input data-ti placeholder="Título del gráfico" value="${esc(opts.chartTitle || '')}"></label>
        <div class="row"><button type="button" class="btn btn-sm btn-green" data-ok>Insertar</button><button type="button" class="btn btn-sm btn-light" data-cancel>Cancelar</button></div>`;
      $$('[data-t]', chartForm).forEach((b) => (b.onclick = () => { type = b.dataset.t; $$('[data-t]', chartForm).forEach((x) => x.classList.toggle('on', x === b)); }));
      $('[data-cancel]', chartForm).onclick = () => chartForm.classList.add('hidden');
      $('[data-ok]', chartForm).onclick = () => {
        const l = $('[data-l]', chartForm).value.trim().toUpperCase();
        const v = $('[data-v]', chartForm).value.trim().toUpperCase();
        const valid = (x) => /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/.test(x);
        if (!valid(l) || !valid(v)) return showMsg('Escribe los rangos así: <b>A2:A6</b> para etiquetas y <b>B2:B6</b> para valores.', 'err');
        const ch = { type, labels: l.replace(/\$/g, ''), values: v.replace(/\$/g, ''), title: $('[data-ti]', chartForm).value.trim() };
        const d = chartData(ch);
        if (!d.values.some((x) => x !== 0)) return showMsg('El rango de valores no tiene números. Revisa que elegiste la columna correcta.', 'err');
        charts.push(ch);
        actions.add('chart');
        chartForm.classList.add('hidden');
        renderCharts();
        notify();
        showMsg(`${O9.charts.ICONS[type]} ¡Gráfico insertado! Si cambias los datos, el gráfico se actualiza solo.`, 'tip');
      };
    }
    function chartData(ch) {
      const L = F.expandRange(...ch.labels.split(':'));
      const V = F.expandRange(...ch.values.split(':'));
      return {
        labels: L.map((r) => sheet.display(r)),
        values: V.map((r) => { const x = sheet.value(r); return typeof x === 'number' ? x : 0; }),
        title: ch.title
      };
    }
    function renderCharts() {
      chartsBox.innerHTML = charts.map((ch, i) => `<div class="xl-chart"><button class="x" data-del="${i}" title="Eliminar gráfico" aria-label="Eliminar gráfico">✕</button>${O9.charts.svg(ch.type, chartData(ch))}</div>`).join('');
      $$('[data-del]', chartsBox).forEach((b) => (b.onclick = () => { charts.splice(+b.dataset.del, 1); renderCharts(); notify(); }));
    }

    /* ---------- API pública ---------- */
    const api = {
      el, sheet, actions,
      value: (ref) => sheet.value(ref),
      raw: (ref) => sheet.getRaw(ref),
      getCharts: () => charts.slice(),
      setTargets(list) { targets = expandList(list); renderAll(); },
      /** Marca celdas como correctas / incorrectas tras validar. */
      mark(refs, ok) {
        (refs || []).forEach((r) => { const td = cellTd(r); if (td) { td.classList.remove('ok-cell', 'bad-cell'); td.classList.add(ok ? 'ok-cell' : 'bad-cell'); } });
      },
      clearMarks() { $$('.ok-cell, .bad-cell', grid).forEach((td) => td.classList.remove('ok-cell', 'bad-cell')); },
      serialize: () => ({ sheet: sheet.toJSON(), charts: charts.slice(), colWidths: Object.assign({}, colWidths) }),
      load(data) {
        if (!data) return;
        commitActive();
        sheet.load(data.sheet);
        charts = (data.charts || []).slice();
        Object.assign(colWidths, data.colWidths || {});
        build();
      },
      clear() {
        commitActive();
        Object.keys(sheet.cells).forEach((r) => { if (!locked.has(r)) { sheet.cells[r] = { raw: '', fmt: {} }; } });
        sheet.cache = {};
        charts = [];
        build();
        notify();
      },
      message: showMsg
    };

    build();
    setActive('A1');
    return api;
  }

  O9.ExcelSim = { create };
})(window.O9);
