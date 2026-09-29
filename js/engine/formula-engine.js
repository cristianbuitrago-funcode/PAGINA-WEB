/**
 * MOTOR DE FÓRMULAS del mini Excel.
 *
 * - Convierte el texto de una fórmula en tokens (tokenize)
 * - Construye un árbol (parse) con precedencia de operadores
 * - Evalúa el árbol leyendo valores de una hoja (Sheet)
 *
 * Soporta: + - * / ^ %, &, comparaciones, paréntesis, referencias (A1, $B$2),
 * rangos (A1:B5) y funciones en español o inglés:
 * SUMA, PROMEDIO, MAX, MIN, CONTAR, CONTARA, CONTAR.SI, SI, REDONDEAR, ABS.
 *
 * Los argumentos se separan con punto y coma (;) como en Excel en español.
 * También se acepta la coma (,) para ayudar a quien vea tutoriales en inglés.
 */
(function (O9) {
  'use strict';

  /* ---------- Errores de Excel (con explicación para el estudiante) ---------- */
  class FormulaError {
    constructor(code, msg) {
      this.code = code;
      this.msg = msg;
    }
    toString() { return this.code; }
  }
  const E = {
    name: (m) => new FormulaError('#¿NOMBRE?', m || 'Excel no reconoce un nombre de la fórmula. Revisa cómo escribiste la función.'),
    div0: () => new FormulaError('#¡DIV/0!', 'Estás dividiendo entre cero o entre una celda vacía.'),
    value: (m) => new FormulaError('#¡VALOR!', m || 'La fórmula intenta hacer cuentas con texto.'),
    ref: () => new FormulaError('#¡REF!', 'La fórmula usa una celda que no existe.'),
    circ: () => new FormulaError('#CIRC!', 'Referencia circular: la celda se usa a sí misma en su propia fórmula.'),
    syntax: (m) => new FormulaError('#ERROR', m || 'La fórmula está mal escrita. Revisa paréntesis y signos.')
  };
  const isErr = (v) => v instanceof FormulaError;

  /* ---------- Utilidades de referencias ---------- */
  function colToNum(c) {
    let n = 0;
    for (const ch of c.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n;
  }
  function numToCol(n) {
    let s = '';
    while (n > 0) {
      const m = (n - 1) % 26;
      s = String.fromCharCode(65 + m) + s;
      n = Math.floor((n - 1) / 26);
    }
    return s;
  }
  function parseRef(ref) {
    const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(String(ref).trim());
    if (!m) return null;
    return { col: colToNum(m[1]), row: parseInt(m[2], 10) };
  }
  const refName = (col, row) => numToCol(col) + row;
  const cleanRef = (ref) => { const p = parseRef(ref); return p ? refName(p.col, p.row) : null; };

  /** Lista de celdas de un rango, recorriendo por filas. */
  function expandRange(a, b) {
    const p1 = parseRef(a), p2 = parseRef(b);
    if (!p1 || !p2) return [];
    const out = [];
    for (let r = Math.min(p1.row, p2.row); r <= Math.max(p1.row, p2.row); r++) {
      for (let c = Math.min(p1.col, p2.col); c <= Math.max(p1.col, p2.col); c++) out.push(refName(c, r));
    }
    return out;
  }

  /* ---------- Conversión de lo que escribe el usuario ---------- */
  /**
   * Interpreta un valor escrito en una celda (que NO es fórmula).
   * Acepta formatos colombianos: "5.000" → 5000, "3,5" → 3.5, "$ 8.000" → 8000, "20%" → 0.2
   */
  function parseLiteral(raw) {
    const s = String(raw == null ? '' : raw).trim();
    if (s === '') return { value: '', kind: 'empty' };
    let t = s.replace(/\s/g, '');
    let currency = false, pct = false;
    if (/^-?\$/.test(t)) { currency = true; t = t.replace('$', ''); }
    if (t.endsWith('%')) { pct = true; t = t.slice(0, -1); }
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.');
    else if (/^-?\d+,\d+$/.test(t)) t = t.replace(',', '.');
    if (/^-?\d+(\.\d+)?$/.test(t)) {
      const n = parseFloat(t);
      return { value: pct ? n / 100 : n, kind: 'number', auto: currency ? 'currency' : pct ? 'percent' : null };
    }
    if (/^(verdadero|true)$/i.test(s)) return { value: true, kind: 'bool' };
    if (/^(falso|false)$/i.test(s)) return { value: false, kind: 'bool' };
    return { value: s, kind: 'text' };
  }

  /* ---------- Tokenizador ---------- */
  function tokenize(src) {
    const tokens = [];
    let i = 0;
    const s = src;
    while (i < s.length) {
      const ch = s[i];
      if (/\s/.test(ch)) { i++; continue; }
      // Número
      let m = /^\d+(\.\d+)?/.exec(s.slice(i));
      if (m) { tokens.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
      // Texto entre comillas
      if (ch === '"') {
        const end = s.indexOf('"', i + 1);
        if (end === -1) throw E.syntax('Falta cerrar las comillas (").');
        tokens.push({ t: 'str', v: s.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
      // Referencia de celda (A1, $B$2) — no seguida de "(" ni de letras
      m = /^\$?[A-Za-z]{1,3}\$?\d+(?![A-Za-z0-9_.(])/.exec(s.slice(i));
      if (m) { tokens.push({ t: 'ref', v: cleanRef(m[0]) }); i += m[0].length; continue; }
      // Nombre (función o palabra)
      m = /^[A-Za-zÁÉÍÓÚÑáéíóúñ_][A-Za-z0-9ÁÉÍÓÚÑáéíóúñ_.]*/.exec(s.slice(i));
      if (m) { tokens.push({ t: 'name', v: m[0].toUpperCase() }); i += m[0].length; continue; }
      // Operadores de dos caracteres
      const two = s.substr(i, 2);
      if (two === '<=' || two === '>=' || two === '<>') { tokens.push({ t: 'op', v: two }); i += 2; continue; }
      if ('+-*/^&=<>%'.includes(ch)) { tokens.push({ t: 'op', v: ch }); i++; continue; }
      if (ch === '(' || ch === ')') { tokens.push({ t: ch }); i++; continue; }
      if (ch === ';' || ch === ',') { tokens.push({ t: 'sep' }); i++; continue; }
      if (ch === ':') { tokens.push({ t: ':' }); i++; continue; }
      throw E.syntax(`No entiendo el símbolo "${ch}".`);
    }
    return tokens;
  }

  /* ---------- Analizador (descenso recursivo) ---------- */
  function parse(src) {
    const tokens = tokenize(src);
    let p = 0;
    const peek = () => tokens[p];
    const next = () => tokens[p++];
    const isOp = (v) => peek() && peek().t === 'op' && peek().v === v;

    function expect(type, msg) {
      const tk = next();
      if (!tk || tk.t !== type) throw E.syntax(msg);
      return tk;
    }

    function comparison() {
      let left = concat();
      while (peek() && peek().t === 'op' && ['=', '<>', '<', '>', '<=', '>='].includes(peek().v)) {
        const op = next().v;
        left = { t: 'bin', op, l: left, r: concat() };
      }
      return left;
    }
    function concat() {
      let left = additive();
      while (isOp('&')) { next(); left = { t: 'bin', op: '&', l: left, r: additive() }; }
      return left;
    }
    function additive() {
      let left = term();
      while (isOp('+') || isOp('-')) {
        const op = next().v;
        left = { t: 'bin', op, l: left, r: term() };
      }
      return left;
    }
    function term() {
      let left = power();
      while (isOp('*') || isOp('/')) {
        const op = next().v;
        left = { t: 'bin', op, l: left, r: power() };
      }
      return left;
    }
    function power() {
      let left = unary();
      while (isOp('^')) { next(); left = { t: 'bin', op: '^', l: left, r: unary() }; }
      return left;
    }
    function unary() {
      if (isOp('-')) { next(); return { t: 'neg', e: unary() }; }
      if (isOp('+')) { next(); return unary(); }
      return postfix();
    }
    function postfix() {
      let e = primary();
      while (isOp('%')) { next(); e = { t: 'pct', e }; }
      return e;
    }
    function primary() {
      const tk = next();
      if (!tk) throw E.syntax('La fórmula está incompleta.');
      if (tk.t === 'num') return { t: 'num', v: tk.v };
      if (tk.t === 'str') return { t: 'str', v: tk.v };
      if (tk.t === 'ref') {
        if (peek() && peek().t === ':') {
          next();
          const b = next();
          if (!b || b.t !== 'ref') throw E.syntax('El rango está incompleto. Ejemplo correcto: B2:B6');
          return { t: 'range', a: tk.v, b: b.v };
        }
        return { t: 'ref', v: tk.v };
      }
      if (tk.t === 'name') {
        if (peek() && peek().t === '(') {
          next();
          const args = [];
          if (peek() && peek().t !== ')') {
            args.push(comparison());
            while (peek() && peek().t === 'sep') { next(); args.push(comparison()); }
          }
          expect(')', `Falta cerrar el paréntesis de ${tk.v}( ... ).`);
          return { t: 'fn', name: tk.v, args };
        }
        if (tk.v === 'VERDADERO' || tk.v === 'TRUE') return { t: 'bool', v: true };
        if (tk.v === 'FALSO' || tk.v === 'FALSE') return { t: 'bool', v: false };
        return { t: 'badname', v: tk.v };
      }
      if (tk.t === '(') {
        const e = comparison();
        expect(')', 'Falta cerrar un paréntesis ")".');
        return e;
      }
      throw E.syntax('Hay un signo fuera de lugar en la fórmula.');
    }

    const tree = comparison();
    if (p < tokens.length) {
      const tk = tokens[p];
      if (tk.t === ')') throw E.syntax('Sobra un paréntesis ")".');
      throw E.syntax('Hay algo de más al final de la fórmula.');
    }
    return tree;
  }

  /* ---------- Funciones disponibles ---------- */
  const ALIASES = {
    SUM: 'SUMA', AVERAGE: 'PROMEDIO', COUNT: 'CONTAR', COUNTA: 'CONTARA', IF: 'SI',
    ROUND: 'REDONDEAR', COUNTIF: 'CONTAR.SI', 'MÁX': 'MAX', 'MÍN': 'MIN'
  };

  /** Toma los argumentos y devuelve solo números (ignora texto de rangos, como Excel). */
  function numbersFrom(args) {
    const out = [];
    for (const a of args) {
      if (a.range) {
        for (const v of a.values) {
          if (isErr(v)) throw v;
          if (typeof v === 'number') out.push(v);
        }
      } else {
        const v = a.value;
        if (isErr(v)) throw v;
        if (typeof v === 'number') out.push(v);
        else if (typeof v === 'boolean') out.push(v ? 1 : 0);
        else if (v === '') continue;
        else {
          const lit = parseLiteral(v);
          if (lit.kind === 'number') out.push(lit.value);
          else throw E.value(`"${v}" es texto, no un número.`);
        }
      }
    }
    return out;
  }

  /** Compara un valor con un criterio de CONTAR.SI (ej.: "Sí", ">3", "<=10"). */
  function matchCriteria(v, crit) {
    const c = String(crit);
    const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(c);
    const op = m[1] || '=';
    const rhsLit = parseLiteral(m[2]);
    if (rhsLit.kind === 'number' && typeof v === 'number') {
      const r = rhsLit.value;
      switch (op) {
        case '=': return v === r; case '<>': return v !== r; case '<': return v < r;
        case '>': return v > r; case '<=': return v <= r; case '>=': return v >= r;
      }
    }
    const a = O9.util.norm(v), b = O9.util.norm(m[2]);
    if (op === '=') return a === b;
    if (op === '<>') return a !== b;
    return false;
  }

  const FUNCS = {
    SUMA: (args) => numbersFrom(args).reduce((a, b) => a + b, 0),
    PROMEDIO: (args) => {
      const n = numbersFrom(args);
      if (!n.length) throw E.div0();
      return n.reduce((a, b) => a + b, 0) / n.length;
    },
    MAX: (args) => { const n = numbersFrom(args); return n.length ? Math.max(...n) : 0; },
    MIN: (args) => { const n = numbersFrom(args); return n.length ? Math.min(...n) : 0; },
    CONTAR: (args) => {
      let c = 0;
      for (const a of args) {
        const vals = a.range ? a.values : [a.value];
        vals.forEach((v) => { if (typeof v === 'number') c++; });
      }
      return c;
    },
    CONTARA: (args) => {
      let c = 0;
      for (const a of args) {
        const vals = a.range ? a.values : [a.value];
        vals.forEach((v) => { if (v !== '' && v != null) c++; });
      }
      return c;
    },
    'CONTAR.SI': (args) => {
      if (args.length !== 2 || !args[0].range) throw E.value('CONTAR.SI necesita un rango y un criterio: =CONTAR.SI(B2:B10;"Sí")');
      return args[0].values.filter((v) => matchCriteria(v, args[1].value)).length;
    },
    SI: (args) => {
      if (args.length < 2) throw E.value('SI necesita al menos 2 partes: =SI(prueba; valor_si_verdadero; valor_si_falso)');
      const test = args[0].value;
      if (isErr(test)) throw test;
      const truthy = typeof test === 'number' ? test !== 0 : !!test;
      if (truthy) return args[1].value;
      return args.length > 2 ? args[2].value : false;
    },
    REDONDEAR: (args) => {
      const [n, d = 0] = numbersFrom(args);
      const f = Math.pow(10, d);
      return Math.round(n * f) / f;
    },
    ABS: (args) => Math.abs(numbersFrom(args)[0] || 0)
  };
  const FUNC_NAMES = Object.keys(FUNCS);

  /** Distancia de edición: sirve para sugerir "¿Quisiste decir SUMA?". */
  function lev(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length];
  }
  function suggest(name) {
    let best = null, bestD = 3;
    for (const f of FUNC_NAMES) {
      const d = lev(name, f);
      if (d < bestD) { bestD = d; best = f; }
    }
    return best;
  }

  /* ---------- Evaluación ---------- */
  function toNumber(v) {
    if (isErr(v)) throw v;
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (v === '' || v == null) return 0;
    const lit = parseLiteral(v);
    if (lit.kind === 'number') return lit.value;
    throw E.value(`"${v}" es texto: no se puede usar en una operación matemática.`);
  }

  function evaluate(node, ctx) {
    switch (node.t) {
      case 'num': return node.v;
      case 'str': return node.v;
      case 'bool': return node.v;
      case 'ref': return ctx.get(node.v);
      case 'range': throw E.value('Un rango (como A1:A5) debe ir dentro de una función, por ejemplo =SUMA(A1:A5).');
      case 'badname': {
        const s = suggest(node.v);
        throw E.name(`"${node.v}" no es una celda ni una función.` + (s ? ` ¿Quisiste escribir ${s}( )?` : ''));
      }
      case 'neg': return -toNumber(evaluate(node.e, ctx));
      case 'pct': return toNumber(evaluate(node.e, ctx)) / 100;
      case 'bin': {
        const l = evaluate(node.l, ctx), r = evaluate(node.r, ctx);
        if (isErr(l)) throw l;
        if (isErr(r)) throw r;
        switch (node.op) {
          case '+': return toNumber(l) + toNumber(r);
          case '-': return toNumber(l) - toNumber(r);
          case '*': return toNumber(l) * toNumber(r);
          case '/': { const d = toNumber(r); if (d === 0) throw E.div0(); return toNumber(l) / d; }
          case '^': return Math.pow(toNumber(l), toNumber(r));
          case '&': return String(l) + String(r);
          default: {
            const a = typeof l === 'string' ? O9.util.norm(l) : l;
            const b = typeof r === 'string' ? O9.util.norm(r) : r;
            switch (node.op) {
              case '=': return a === b; case '<>': return a !== b; case '<': return a < b;
              case '>': return a > b; case '<=': return a <= b; case '>=': return a >= b;
            }
          }
        }
        break;
      }
      case 'fn': {
        let name = node.name;
        if (ALIASES[name]) name = ALIASES[name];
        const fn = FUNCS[name];
        if (!fn) {
          const s = suggest(name);
          throw E.name(`La función ${node.name} no existe.` + (s ? ` ¿Quisiste escribir ${s}?` : ''));
        }
        const args = node.args.map((a) =>
          a.t === 'range'
            ? { range: true, values: expandRange(a.a, a.b).map((r) => ctx.get(r)) }
            : { value: evaluate(a, ctx) }
        );
        return fn(args);
      }
    }
    throw E.syntax();
  }

  /** Recorre el árbol para saber qué funciones y celdas usa una fórmula. */
  function analyze(src) {
    const info = { functions: [], refs: [], ranges: [], ok: true, error: null };
    try {
      const tree = parse(String(src).replace(/^=/, ''));
      (function walk(n) {
        if (!n) return;
        if (n.t === 'fn') { info.functions.push(ALIASES[n.name] || n.name); n.args.forEach(walk); }
        else if (n.t === 'ref') info.refs.push(n.v);
        else if (n.t === 'range') { info.ranges.push(n.a + ':' + n.b); info.refs.push(...expandRange(n.a, n.b)); }
        else if (n.t === 'bin') { walk(n.l); walk(n.r); }
        else if (n.t === 'neg' || n.t === 'pct') walk(n.e);
      })(tree);
    } catch (e) {
      info.ok = false;
      info.error = e;
    }
    return info;
  }

  /* ---------- Hoja de cálculo (modelo de datos) ---------- */
  class Sheet {
    constructor(rows = 10, cols = 6) {
      this.rows = rows;
      this.cols = cols;
      this.cells = {}; // { A1: { raw: '...', fmt: {...} } }
      this.cache = {};
      this.astCache = {};
    }
    cell(ref) { return this.cells[ref] || (this.cells[ref] = { raw: '', fmt: {} }); }
    getRaw(ref) { return this.cells[ref] ? this.cells[ref].raw : ''; }
    setRaw(ref, raw) {
      this.cell(ref).raw = raw == null ? '' : String(raw);
      this.cache = {};
    }
    getFmt(ref) { return this.cells[ref] ? this.cells[ref].fmt : {}; }
    isFormula(ref) { return /^=/.test(this.getRaw(ref)); }

    /** Valor calculado de una celda (número, texto, booleano o FormulaError). */
    value(ref, stack) {
      if (ref in this.cache) return this.cache[ref];
      const p = parseRef(ref);
      if (!p) return E.ref();
      const raw = this.getRaw(ref);
      let val;
      if (raw.startsWith('=')) {
        stack = stack || new Set();
        if (stack.has(ref)) return E.circ();
        stack.add(ref);
        try {
          const body = raw.slice(1);
          if (!body.trim()) throw E.syntax('Escribiste "=" pero falta la fórmula.');
          const ast = this.astCache[raw] || (this.astCache[raw] = parse(body));
          val = evaluate(ast, { get: (r) => this.value(r, stack) });
          if (typeof val === 'number' && !isFinite(val)) val = E.div0();
          if (val === '' || val == null) val = 0; // una celda vacía vale 0, como en Excel
        } catch (e) {
          val = isErr(e) ? e : E.syntax();
        }
        stack.delete(ref);
      } else {
        val = parseLiteral(raw).value;
      }
      this.cache[ref] = val;
      return val;
    }

    /** Texto que se muestra en la celda, aplicando el formato. */
    display(ref) {
      const v = this.value(ref);
      const fmt = this.getFmt(ref);
      const auto = !this.isFormula(ref) ? parseLiteral(this.getRaw(ref)).auto : null;
      return formatValue(v, fmt.num || auto);
    }

    toJSON() {
      const cells = {};
      for (const [k, c] of Object.entries(this.cells)) {
        if (c.raw !== '' || Object.keys(c.fmt || {}).length) cells[k] = { raw: c.raw, fmt: c.fmt };
      }
      return { rows: this.rows, cols: this.cols, cells };
    }
    load(json) {
      if (!json) return;
      this.cells = {};
      for (const [k, c] of Object.entries(json.cells || {})) this.cells[k] = { raw: c.raw || '', fmt: Object.assign({}, c.fmt) };
      this.cache = {};
    }
  }

  /** Aplica formato numérico: moneda, porcentaje o número normal. */
  function formatValue(v, fmt) {
    if (isErr(v)) return v.code;
    if (typeof v === 'boolean') return v ? 'VERDADERO' : 'FALSO';
    if (typeof v === 'number') {
      if (fmt === 'currency') return '$ ' + v.toLocaleString('es-CO', { maximumFractionDigits: 0 });
      if (fmt === 'percent') return (v * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + '%';
      if (fmt === 'decimal') return v.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      return v.toLocaleString('es-CO', { maximumFractionDigits: 2 });
    }
    return v == null ? '' : String(v);
  }

  O9.formula = {
    Sheet, FormulaError, isErr, parse, analyze, parseLiteral, formatValue,
    parseRef, refName, numToCol, colToNum, expandRange, cleanRef, suggest,
    FUNC_NAMES
  };
})(window.O9);
