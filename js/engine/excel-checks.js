/**
 * VALIDADORES DE EXCEL.
 * Revisan la hoja del simulador y explican en lenguaje sencillo qué está mal.
 *
 * Tipos de requisito (campo "type"):
 *  cell        → una celda con valor esperado       { cell, value, fn?, formula?, range? }
 *  rowFormula  → cada fila de un rango calcula algo { range:'E2:E11', fn:'PROMEDIO', cols:'B:D' }
 *  countText   → mínimo N celdas con texto          { range, min }
 *  countNumbers→ mínimo N celdas con números        { range, min }
 *  fnCount     → la función X aparece en N fórmulas { fn, min }
 *  chart       → hay un gráfico (de cierto tipo)    { chartType? }
 *  format      → formato en un rango                { range, prop:'bold'|'fill'|'border'|'align'|'num'|'any', value?, mode:'any'|'all' }
 *  sorted      → un rango está ordenado             { range, dir }
 *  text        → una celda contiene un texto        { cell, text }
 *  value       → una celda tiene un valor (sin exigir fórmula) { cell, value }
 *  action      → se usó una herramienta             { action }
 *  rowPairs    → tras ordenar, cada fila sigue unida { cols:['A','B'], from, to, pairs:[[nombre, valor]] }
 *
 * O9.checks.excel.run(sim, checks) → [{ ok, label, hint, msg, cells }]
 */
(function (O9) {
  'use strict';

  const F = O9.formula;
  const fmt = (n) => (typeof n === 'number' ? O9.util.fmtNum(n) : String(n));
  const refsOf = (range) => (range.includes(':') ? F.expandRange(...range.split(':')) : [F.cleanRef(range)]);
  const close = (a, b, tol = 0.011) => typeof a === 'number' && Math.abs(a - b) <= tol;

  /** Revisa una sola celda con fórmula y devuelve un mensaje pedagógico. */
  function checkCell(sheet, c) {
    const ref = F.cleanRef(c.cell);
    const raw = sheet.getRaw(ref).trim();
    const v = sheet.value(ref);
    const needFormula = c.formula !== false;
    if (!raw) return { ok: false, msg: `La celda <b>${ref}</b> todavía está vacía.` };
    if (needFormula && !raw.startsWith('=')) {
      if (/^(SUMA|PROMEDIO|MAX|MIN|CONTAR|SUM|AVERAGE)/i.test(raw)) return { ok: false, msg: `En <b>${ref}</b> falta el signo <b>=</b> al inicio. Sin él, Excel lo ve como texto.` };
      if (close(F.parseLiteral(raw).value, c.value)) return { ok: false, msg: `En <b>${ref}</b> escribiste el número a mano. El resultado es correcto, pero debes usar una <b>fórmula</b> para que Excel lo calcule solo (y se actualice si cambian los datos).` };
      return { ok: false, msg: `En <b>${ref}</b> debe ir una fórmula (empieza con <b>=</b>).` };
    }
    if (F.isErr(v)) return { ok: false, msg: `<b>${ref}</b> muestra <b>${v.code}</b>: ${v.msg}` };
    const info = F.analyze(raw);
    if (c.fn && !info.functions.includes(c.fn)) {
      return { ok: false, msg: close(v, c.value)
        ? `El resultado de <b>${ref}</b> es correcto 👏, pero en este ejercicio debes usar la función <b>${c.fn}</b>.`
        : `En <b>${ref}</b> usa la función <b>${c.fn}</b>. Ejemplo: <code>=${c.fn}(${c.range || 'B2:B6'})</code>` };
    }
    if (c.value !== undefined && !(close(v, c.value, c.tol) || (typeof c.value === 'string' && O9.util.norm(v) === O9.util.norm(c.value)))) {
      let extra = '';
      if (c.range && info.ranges.length && !info.ranges.includes(c.range)) extra = ` Revisa el rango: usaste <b>${info.ranges.join(', ')}</b> y deberías incluir <b>${c.range}</b>.`;
      else if (c.range && !info.ranges.length && info.functions.length) extra = ` Recuerda escribir el rango con dos puntos, por ejemplo <b>${c.range}</b>.`;
      return { ok: false, msg: `<b>${ref}</b> da <b>${fmt(v)}</b>, pero se esperaba <b>${fmt(c.value)}</b>.${extra}` };
    }
    return { ok: true, msg: `<b>${ref}</b> = ${fmt(v)} ✔️` };
  }

  const V = {
    cell: (sheet, c) => { const r = checkCell(sheet, c); r.cells = [F.cleanRef(c.cell)]; return r; },
    value: (sheet, c) => checkCell(sheet, Object.assign({}, c, { formula: false })),

    rowFormula: (sheet, c) => {
      const refs = refsOf(c.range);
      const [c1, c2] = c.cols.split(':').map(F.colToNum);
      let good = 0;
      const bad = [];
      for (const ref of refs) {
        const p = F.parseRef(ref);
        const nums = [];
        for (let col = c1; col <= c2; col++) { const x = sheet.value(F.refName(col, p.row)); if (typeof x === 'number') nums.push(x); }
        if (!nums.length) { bad.push(ref); continue; }
        const expected = c.fn === 'SUMA' ? nums.reduce((a, b) => a + b, 0) : c.fn === 'MAX' ? Math.max(...nums) : c.fn === 'MIN' ? Math.min(...nums) : nums.reduce((a, b) => a + b, 0) / nums.length;
        const r = checkCell(sheet, { cell: ref, value: expected, fn: c.fn, range: `${F.numToCol(c1)}${p.row}:${F.numToCol(c2)}${p.row}` });
        if (r.ok) good++; else bad.push(ref);
      }
      const min = c.min || refs.length;
      const ok = good >= min;
      let msg = `${good} de ${min} fórmulas correctas.`;
      if (!ok && bad.length) {
        const first = checkCellMsg(sheet, c, bad[0], c1, c2);
        msg += ' ' + first;
      }
      return { ok, msg, cells: refs };
    },

    countText: (sheet, c) => {
      const n = refsOf(c.range).filter((r) => { const v = sheet.value(r); return typeof v === 'string' && v.trim() !== ''; }).length;
      return { ok: n >= c.min, msg: `Llevas ${n} de ${c.min}.` };
    },
    countNumbers: (sheet, c) => {
      const n = refsOf(c.range).filter((r) => typeof sheet.value(r) === 'number' && !sheet.isFormula(r)).length;
      return { ok: n >= c.min, msg: `Llevas ${n} de ${c.min} números.` };
    },
    fnCount: (sheet, c) => {
      let n = 0;
      Object.keys(sheet.cells).forEach((r) => {
        if (sheet.isFormula(r) && !F.isErr(sheet.value(r)) && F.analyze(sheet.getRaw(r)).functions.includes(c.fn)) n++;
      });
      const min = c.min || 1;
      return { ok: n >= min, msg: `Fórmulas con ${c.fn}: ${n} de ${min}.` };
    },
    chart: (sheet, c, sim) => {
      const ch = sim.getCharts();
      const ok = c.chartType ? ch.some((x) => x.type === c.chartType) : ch.length > 0;
      return { ok, msg: ok ? 'Gráfico listo ✔️' : c.chartType ? `Inserta un ${O9.charts.NAMES[c.chartType].toLowerCase()}.` : 'Todavía no hay gráfico.' };
    },
    format: (sheet, c) => {
      const refs = refsOf(c.range);
      const has = (r) => {
        const f = sheet.getFmt(r);
        if (c.prop === 'any') return !!(f.bold || f.fill || f.border || f.align);
        if (c.value !== undefined) return f[c.prop] === c.value;
        return !!f[c.prop];
      };
      const nonEmpty = refs.filter((r) => sheet.getRaw(r) !== '' || c.includeEmpty);
      const list = nonEmpty.length ? nonEmpty : refs;
      const ok = c.mode === 'all' ? list.every(has) : list.some(has);
      return { ok, msg: '' };
    },
    sorted: (sheet, c) => {
      const vals = refsOf(c.range).map((r) => sheet.value(r)).filter((v) => v !== '');
      const dir = c.dir || 1;
      let ok = vals.length > 1;
      for (let i = 1; i < vals.length && ok; i++) {
        const a = vals[i - 1], b = vals[i];
        const cmp = typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b), 'es');
        if (cmp * dir > 0) ok = false;
      }
      return { ok, msg: '' };
    },
    text: (sheet, c) => {
      const v = sheet.value(F.cleanRef(c.cell));
      return { ok: O9.util.norm(v).includes(O9.util.norm(c.text)), msg: '' };
    },
    action: (sheet, c, sim) => ({ ok: sim.actions.has(c.action), msg: '' }),
    /** Después de ordenar, cada nombre sigue con su dato (no se mezclaron las filas). */
    rowPairs: (sheet, c) => {
      const [ka, kb] = c.cols;
      let ok = true;
      for (let r = c.from; r <= c.to; r++) {
        const key = sheet.value(ka + r);
        const pair = c.pairs.find((p) => O9.util.norm(p[0]) === O9.util.norm(key));
        if (!pair || !close(sheet.value(kb + r), pair[1])) ok = false;
      }
      return { ok, msg: ok ? '' : 'Algunos nombres quedaron con la nota de otra persona. Selecciona <b>toda la tabla</b> (ambas columnas) antes de ordenar.' };
    }
  };

  function checkCellMsg(sheet, c, ref, c1, c2) {
    const p = F.parseRef(ref);
    const raw = sheet.getRaw(ref);
    if (!raw) return `Falta la fórmula en <b>${ref}</b>.`;
    if (!raw.startsWith('=')) return `En <b>${ref}</b> debe ir una fórmula que empiece con =.`;
    const v = sheet.value(ref);
    if (F.isErr(v)) return `<b>${ref}</b> muestra ${v.code}: ${v.msg}`;
    return `Revisa <b>${ref}</b>: debería ser <code>=${c.fn}(${F.numToCol(c1)}${p.row}:${F.numToCol(c2)}${p.row})</code>.`;
  }

  O9.checks.excel = {
    validators: V,
    run(sim, checks) {
      return checks.map((c) => {
        let r = { ok: false, msg: '' };
        try { r = V[c.type](sim.sheet, c, sim) || r; } catch (e) { r = { ok: false, msg: '' }; }
        return { ok: !!r.ok, label: c.label, hint: c.hint || '', msg: r.msg || '', cells: r.cells || (c.cell ? [F.cleanRef(c.cell)] : []) };
      });
    }
  };
})(window.O9);
