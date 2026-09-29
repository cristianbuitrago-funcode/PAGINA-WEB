/**
 * SIMULADOR DE WORD ("mini Word").
 * Un editor dentro de la página con cinta de opciones parecida a Word:
 *   Inicio      → deshacer, portapapeles, fuente, tamaño, N K S, color, alineación, listas, interlineado, sangrías, estilos
 *   Insertar    → portada, imagen, tabla, encabezado, pie de página, número de página, salto de página
 *   Disposición → márgenes, orientación, salto de página
 *
 * Uso: const sim = O9.WordSim.create(contenedor, opciones)
 * Opciones: { html, header, footer, pageNumbers, orientation, margins, tabs, showHF,
 *             placeholder, title, tall, onChange(sim) }
 *
 * Se usa document.execCommand para el formato básico (es liviano y suficiente para
 * un simulador educativo). Deshacer/Rehacer usa un historial propio para ser confiable.
 */
(function (O9) {
  'use strict';

  const { esc, $, $$ } = O9.util;

  /* ---------- Imágenes simuladas (SVG generados en código) ---------- */
  const svgURI = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const IMAGES = [
    { name: 'Paisaje', src: svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#bfdbfe"/><circle cx="125" cy="25" r="12" fill="#fbbf24"/><path d="M0 100 L45 40 L80 85 L105 55 L160 100Z" fill="#16a34a"/><path d="M45 40 L55 53 L35 53Z" fill="#fff"/></svg>') },
    { name: 'Planeta', src: svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#1e1b4b"/><circle cx="20" cy="15" r="1.5" fill="#fff"/><circle cx="140" cy="80" r="1.5" fill="#fff"/><circle cx="120" cy="20" r="1" fill="#fff"/><circle cx="80" cy="50" r="28" fill="#7c3aed"/><ellipse cx="80" cy="50" rx="48" ry="9" fill="none" stroke="#fbbf24" stroke-width="4"/></svg>') },
    { name: 'Planta', src: svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#ecfdf5"/><rect x="62" y="68" width="36" height="26" rx="4" fill="#b45309"/><path d="M80 68 V30" stroke="#15803d" stroke-width="4"/><ellipse cx="66" cy="40" rx="14" ry="7" fill="#22c55e" transform="rotate(-30 66 40)"/><ellipse cx="94" cy="34" rx="14" ry="7" fill="#22c55e" transform="rotate(30 94 34)"/><circle cx="80" cy="26" r="6" fill="#f472b6"/></svg>') },
    { name: 'Gráfico', src: svgURI('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100"><rect width="160" height="100" fill="#fff"/><rect x="20" y="55" width="22" height="35" fill="#2563eb"/><rect x="52" y="35" width="22" height="55" fill="#7c3aed"/><rect x="84" y="20" width="22" height="70" fill="#16a34a"/><rect x="116" y="45" width="22" height="45" fill="#f59e0b"/><line x1="12" y1="90" x2="148" y2="90" stroke="#334155" stroke-width="2"/></svg>') }
  ];

  const FONTS = ['Calibri', 'Arial', 'Times New Roman', 'Verdana', 'Georgia', 'Comic Sans MS'];
  const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48];
  const COLORS = [['#111111', 'Negro'], ['#dc2626', 'Rojo'], ['#2563eb', 'Azul'], ['#16a34a', 'Verde'], ['#7c3aed', 'Morado'], ['#ea580c', 'Naranja']];
  const BLOCK_SEL = 'p,div,h1,h2,h3,li';

  function create(root, opts = {}) {
    const tabs = opts.tabs || ['inicio', 'insertar', 'disposicion'];
    const state = {
      pageNumbers: !!opts.pageNumbers,
      orientation: opts.orientation || 'portrait',
      margins: opts.margins || 'normal',
      showHF: opts.showHF !== undefined ? opts.showHF : tabs.includes('insertar')
    };
    const actions = new Set();   // acciones usadas (para misiones: "usa deshacer", etc.)
    let clip = '';               // portapapeles interno
    let savedRange = null;
    let selectedImg = null;

    /* ---------- Estructura HTML ---------- */
    const el = document.createElement('div');
    el.className = 'wd' + (opts.tall ? ' tall' : '');
    const TAB_NAMES = { inicio: 'Inicio', insertar: 'Insertar', disposicion: 'Disposición' };
    el.innerHTML = `
      <div class="wd-titlebar"><span class="dots"><i></i><i></i><i></i></span>
        <span>${esc(opts.title || 'Documento1')} – Word <small style="opacity:.75">(simulador)</small></span></div>
      <div class="wd-tabs" role="tablist">${tabs.map((t, i) => `<button class="wd-tab ${i === 0 ? 'on' : ''}" data-tab="${t}" role="tab">${TAB_NAMES[t]}</button>`).join('')}</div>
      <div class="wd-ribbon">
        ${tabs.includes('inicio') ? panelInicio() : ''}
        ${tabs.includes('insertar') ? panelInsertar() : ''}
        ${tabs.includes('disposicion') ? panelDisposicion() : ''}
      </div>
      <div class="wd-canvas"><div class="wd-page">
        <div class="wd-header" contenteditable="true" data-placeholder="Encabezado (haz clic para escribir)" spellcheck="false"></div>
        <div class="wd-body" contenteditable="true" spellcheck="false" data-placeholder="${esc(opts.placeholder || 'Escribe aquí...')}"></div>
        <div class="wd-footer"><div class="wd-footer-text" contenteditable="true" data-placeholder="Pie de página" spellcheck="false"></div><span class="wd-pagenum hidden">1</span></div>
      </div></div>
      <div class="wd-status"><span data-st-page>Página 1 de 1</span><span data-st-words>0 palabras</span><span data-st-saved></span></div>`;
    root.innerHTML = '';
    root.appendChild(el);
    $('.wd-panel', el) && $('.wd-panel', el).classList.add('on');

    const body = $('.wd-body', el);
    const header = $('.wd-header', el);
    const footer = $('.wd-footer-text', el);
    const page = $('.wd-page', el);
    const pageNum = $('.wd-pagenum', el);
    const ribbon = $('.wd-ribbon', el);

    body.innerHTML = opts.html || '<p><br></p>';
    header.innerHTML = opts.header || '';
    footer.innerHTML = opts.footer || '';
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) { /* navegadores antiguos */ }

    /* ---------- Paneles de la cinta ---------- */
    function panelInicio() {
      return `<div class="wd-panel" data-panel="inicio">
        <div class="wd-group"><button class="tb" data-cmd="undo" title="Deshacer (Ctrl+Z)">↶</button><button class="tb" data-cmd="redo" title="Rehacer (Ctrl+Y)">↷</button></div>
        <div class="wd-group"><button class="tb" data-cmd="cut" title="Cortar (Ctrl+X)">✂️</button><button class="tb" data-cmd="copy" title="Copiar (Ctrl+C)">📋</button><button class="tb" data-cmd="paste" title="Pegar (Ctrl+V)">📥</button></div>
        <div class="wd-group">
          <select class="tb-select" data-font title="Tipo de letra" aria-label="Tipo de letra">${FONTS.map((f) => `<option value="${f}" style="font-family:${f}">${f}</option>`).join('')}</select>
          <select class="tb-select" data-size title="Tamaño de letra" aria-label="Tamaño de letra"><option value="">Tam.</option>${SIZES.map((s) => `<option>${s}</option>`).join('')}</select>
        </div>
        <div class="wd-group"><button class="tb" data-cmd="bold" title="Negrita (Ctrl+N)"><b>N</b></button><button class="tb" data-cmd="italic" title="Cursiva (Ctrl+K)"><i style="font-family:serif">K</i></button><button class="tb" data-cmd="underline" title="Subrayado (Ctrl+S)"><u>S</u></button></div>
        <div class="wd-group tb-colors" title="Color de fuente">${COLORS.map(([c, n]) => `<button class="tb-color" data-color="${c}" style="background:${c}" title="Color ${n}" aria-label="Color ${n}"></button>`).join('')}</div>
        <div class="wd-group">
          <button class="tb" data-align="Left" title="Alinear a la izquierda">${alignIcon('l')}</button>
          <button class="tb" data-align="Center" title="Centrar">${alignIcon('c')}</button>
          <button class="tb" data-align="Right" title="Alinear a la derecha">${alignIcon('r')}</button>
          <button class="tb" data-align="Full" title="Justificar">${alignIcon('j')}</button>
        </div>
        <div class="wd-group"><button class="tb" data-cmd="insertUnorderedList" title="Viñetas">•☰</button><button class="tb" data-cmd="insertOrderedList" title="Numeración">1.☰</button></div>
        <div class="wd-group">
          <select class="tb-select" data-spacing title="Interlineado" aria-label="Interlineado"><option value="">↕ Interl.</option><option value="1">1,0</option><option value="1.15">1,15</option><option value="1.5">1,5</option><option value="2">2,0</option></select>
          <button class="tb" data-indent="1" title="Aumentar sangría">⇥</button><button class="tb" data-indent="-1" title="Disminuir sangría">⇤</button>
          <button class="tb" data-firstline title="Sangría de primera línea"><small>1.ª lín.</small></button>
        </div>
        <div class="wd-group"><select class="tb-select" data-style title="Estilos" aria-label="Estilos"><option value="">Estilos</option><option value="p">Normal</option><option value="h1">Título 1</option><option value="h2">Título 2</option></select></div>
      </div>`;
    }
    function panelInsertar() {
      return `<div class="wd-panel" data-panel="insertar">
        <div class="wd-group"><button class="tb" data-cover title="Insertar portada">📘 <small>Portada</small></button></div>
        <div class="wd-group"><button class="tb" data-pop="img" title="Insertar imagen">🖼️ <small>Imagen</small></button>
          <span class="img-size hidden" style="display:inline-flex;gap:2px"><button class="tb" data-imgsize="s" title="Imagen pequeña"><small>S</small></button><button class="tb" data-imgsize="m" title="Imagen mediana"><small>M</small></button><button class="tb" data-imgsize="l" title="Imagen grande"><small>L</small></button></span></div>
        <div class="wd-group"><button class="tb" data-pop="table" title="Insertar tabla">▦ <small>Tabla</small></button><button class="tb" data-addrow title="Agregar fila a la tabla"><small>+ Fila</small></button></div>
        <div class="wd-group"><button class="tb" data-hf="header" title="Encabezado">⬒ <small>Encabezado</small></button><button class="tb" data-hf="footer" title="Pie de página">⬓ <small>Pie</small></button><button class="tb" data-pagenum title="Número de página">#️⃣ <small>N.º página</small></button></div>
        <div class="wd-group"><button class="tb" data-break title="Salto de página (Ctrl+Enter)">⤓ <small>Salto de página</small></button></div>
      </div>`;
    }
    function panelDisposicion() {
      return `<div class="wd-panel" data-panel="disposicion">
        <div class="wd-group"><small style="font-weight:800">Márgenes</small><select class="tb-select" data-margins aria-label="Márgenes"><option value="normal">Normal (2,5 cm)</option><option value="narrow">Estrecho (1,27 cm)</option><option value="wide">Ancho (5 cm)</option></select></div>
        <div class="wd-group"><small style="font-weight:800">Orientación</small><button class="tb" data-orient="portrait" title="Vertical">▯ <small>Vertical</small></button><button class="tb" data-orient="landscape" title="Horizontal">▭ <small>Horizontal</small></button></div>
        <div class="wd-group"><button class="tb" data-break title="Salto de página">⤓ <small>Salto de página</small></button></div>
      </div>`;
    }
    function alignIcon(t) {
      const lines = { l: [16, 10, 16, 8], c: [16, 10, 14, 8], r: [16, 10, 16, 8], j: [16, 16, 16, 16] }[t];
      const x = (w) => (t === 'c' ? (16 - w) / 2 : t === 'r' ? 16 - w : 0);
      return `<svg width="16" height="14" viewBox="0 0 16 14" aria-hidden="true">${lines.map((w, i) => `<rect x="${x(w)}" y="${i * 3.6}" width="${w}" height="2" rx="1" fill="currentColor"/>`).join('')}</svg>`;
    }

    /* ---------- Selección: guardar y restaurar ---------- */
    const inEditable = (node) => node && (body.contains(node) || header.contains(node) || footer.contains(node));
    document.addEventListener('selectionchange', onSelChange);
    function onSelChange() {
      if (!document.body.contains(el)) { document.removeEventListener('selectionchange', onSelChange); return; }
      const sel = window.getSelection();
      if (sel.rangeCount && inEditable(sel.anchorNode)) {
        savedRange = sel.getRangeAt(0).cloneRange();
        updateToolbar();
      }
    }
    function restore() {
      if (!savedRange) { body.focus(); placeCaretEnd(body); return; }
      const target = savedRange.commonAncestorContainer;
      const host = header.contains(target) ? header : footer.contains(target) ? footer : body;
      host.focus({ preventScroll: true });
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRange);
    }
    function placeCaretEnd(node) {
      const r = document.createRange();
      r.selectNodeContents(node);
      r.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
      savedRange = r.cloneRange();
    }
    const hasSelection = () => savedRange && !savedRange.collapsed && body.contains(savedRange.commonAncestorContainer);
    const needSelection = () => {
      if (hasSelection()) return true;
      O9.ui.toast('Primero <b>selecciona</b> el texto (arrastra el mouse sobre él) y luego aplica el formato.', '', '🖱️');
      return false;
    };

    /* ---------- Historial propio (deshacer / rehacer) ---------- */
    const history = [];
    let hIndex = -1;
    const snap = () => JSON.stringify([body.innerHTML, header.innerHTML, footer.innerHTML]);
    function pushHistory() {
      const s = snap();
      if (history[hIndex] === s) return;
      history.splice(hIndex + 1);
      history.push(s);
      if (history.length > 80) history.shift();
      hIndex = history.length - 1;
    }
    const pushSoon = O9.util.debounce(pushHistory, 350);
    function applyHistory(i) {
      if (i < 0 || i >= history.length) return false;
      hIndex = i;
      const [b, h, f] = JSON.parse(history[i]);
      body.innerHTML = b; header.innerHTML = h; footer.innerHTML = f;
      savedRange = null;
      changed(false);
      return true;
    }
    function undo() {
      pushHistory();
      if (!applyHistory(hIndex - 1)) O9.ui.toast('No hay nada más para deshacer.', '', '↶');
      else actions.add('undo');
    }
    function redo() {
      if (!applyHistory(hIndex + 1)) O9.ui.toast('No hay nada para rehacer.', '', '↷');
      else actions.add('redo');
    }

    /* ---------- Comandos ---------- */
    function exec(cmd, val) {
      restore();
      try { document.execCommand('styleWithCSS', false, false); } catch (e) { /* */ }
      document.execCommand(cmd, false, val);
      after();
    }
    function after(action) {
      if (action) actions.add(action);
      pushHistory();
      changed();
      updateToolbar();
    }

    /** Reemplaza <font size=7> por un span con tamaño real en puntos. */
    function applySize(pt) {
      if (!needSelection()) return;
      exec('fontSize', '7');
      $$('font[size="7"]', el).forEach((f) => {
        const span = document.createElement('span');
        span.style.fontSize = pt + 'pt';
        span.innerHTML = f.innerHTML;
        f.replaceWith(span);
      });
      after('size');
    }

    /** Bloques (párrafos) que toca la selección actual. */
    function selectedBlocks() {
      restore();
      const sel = window.getSelection();
      if (!sel.rangeCount) return [];
      const range = sel.getRangeAt(0);
      let list = $$(BLOCK_SEL, body).filter((b) => range.intersectsNode(b) && !b.querySelector(BLOCK_SEL));
      if (!list.length) {
        let n = range.startContainer;
        while (n && n !== body) {
          if (n.nodeType === 1 && n.matches(BLOCK_SEL)) return [n];
          n = n.parentNode;
        }
        document.execCommand('formatBlock', false, 'p');
        const s2 = window.getSelection();
        if (s2.rangeCount) {
          let m = s2.getRangeAt(0).startContainer;
          while (m && m !== body) { if (m.nodeType === 1 && m.matches(BLOCK_SEL)) return [m]; m = m.parentNode; }
        }
      }
      return list;
    }

    function insertHTML(html) {
      restore();
      if (!body.contains(window.getSelection().anchorNode)) { body.focus(); placeCaretEnd(body); }
      document.execCommand('insertHTML', false, html);
    }

    /* ---------- Eventos de la cinta ---------- */
    // Evita que los botones quiten la selección del texto
    ribbon.addEventListener('mousedown', (e) => {
      if (!e.target.closest('select')) e.preventDefault();
    });

    $$('.wd-tab', el).forEach((t) => (t.onclick = () => {
      $$('.wd-tab', el).forEach((x) => x.classList.toggle('on', x === t));
      $$('.wd-panel', el).forEach((p) => p.classList.toggle('on', p.dataset.panel === t.dataset.tab));
      closePop();
    }));

    ribbon.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const d = b.dataset;
      if (d.cmd === 'undo') return undo();
      if (d.cmd === 'redo') return redo();
      if (d.cmd === 'copy' || d.cmd === 'cut') {
        if (!needSelection()) return;
        restore();
        const frag = savedRange.cloneContents();
        const tmp = document.createElement('div');
        tmp.appendChild(frag);
        clip = tmp.innerHTML;
        try { document.execCommand('copy'); } catch (err) { /* */ }
        if (d.cmd === 'cut') { document.execCommand('delete'); after('cut'); O9.ui.toast('Texto cortado. Ahora ubica el cursor y pulsa Pegar.', '', '✂️'); }
        else { actions.add('copy'); O9.ui.toast('Texto copiado. Ubica el cursor donde lo quieras y pulsa Pegar.', '', '📋'); }
        return;
      }
      if (d.cmd === 'paste') {
        if (!clip) return O9.ui.toast('El portapapeles está vacío: primero copia o corta algo.', '', '📥');
        insertHTML(clip);
        return after('paste');
      }
      if (d.cmd) {
        const names = { bold: 'bold', italic: 'italic', underline: 'underline', insertUnorderedList: 'ul', insertOrderedList: 'ol' };
        if (['bold', 'italic', 'underline'].includes(d.cmd) && !needSelection()) return;
        exec(d.cmd);
        return after(names[d.cmd]);
      }
      if (d.color) { if (!needSelection()) return; exec('foreColor', d.color); return after('color'); }
      if (d.align) { exec('justify' + d.align); return after('align-' + d.align.toLowerCase()); }
      if (d.indent) {
        selectedBlocks().forEach((blk) => {
          const cur = parseFloat(blk.style.marginLeft) || 0;
          const v = Math.max(0, cur + 1.25 * +d.indent);
          blk.style.marginLeft = v ? v + 'cm' : '';
        });
        return after('indent');
      }
      if (d.firstline !== undefined) {
        selectedBlocks().forEach((blk) => { blk.style.textIndent = blk.style.textIndent ? '' : '1.25cm'; });
        return after('firstline');
      }
      if (d.pop) return togglePop(d.pop, b);
      if (d.imgsize) {
        if (!selectedImg || !body.contains(selectedImg)) return O9.ui.toast('Haz clic sobre una imagen del documento para seleccionarla.', '', '🖼️');
        selectedImg.classList.remove('sz-s', 'sz-m', 'sz-l');
        selectedImg.classList.add('sz-' + d.imgsize);
        return after('imgsize');
      }
      if (d.addrow !== undefined) {
        restore();
        const sel = window.getSelection();
        const td = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentNode).closest('td,th');
        if (!td || !body.contains(td)) return O9.ui.toast('Ubica el cursor dentro de una celda de la tabla.', '', '▦');
        const tr = td.parentNode;
        const nr = tr.cloneNode(true);
        $$('td,th', nr).forEach((c) => (c.innerHTML = '<br>'));
        tr.after(nr);
        return after('addrow');
      }
      if (d.hf) {
        state.showHF = true;
        applyState();
        const target = d.hf === 'header' ? header : footer;
        target.focus();
        placeCaretEnd(target);
        O9.ui.toast(d.hf === 'header' ? 'Escribe el encabezado: se repite arriba en todas las páginas.' : 'Escribe el pie de página: se repite abajo en todas las páginas.', '', '✏️');
        return after(d.hf);
      }
      if (d.pagenum !== undefined) {
        state.pageNumbers = !state.pageNumbers;
        state.showHF = true;
        applyState();
        O9.ui.toast(state.pageNumbers ? 'Número de página agregado en el pie.' : 'Número de página quitado.', '', '#️⃣');
        return after('pagenum');
      }
      if (d.break !== undefined) {
        insertHTML('<hr class="wd-pagebreak"><p><br></p>');
        return after('pagebreak');
      }
      if (d.cover !== undefined) {
        body.insertAdjacentHTML('afterbegin', `<p style="text-align:center"><br></p><h1 style="text-align:center">TÍTULO DEL TRABAJO</h1><p style="text-align:center">Subtítulo o tema</p><p style="text-align:center"><br></p><p style="text-align:center">Nombre del estudiante</p><p style="text-align:center">Grado 9°</p><p style="text-align:center">Nombre del colegio</p><p style="text-align:center">Ciudad, año</p><hr class="wd-pagebreak">`);
        O9.ui.toast('Portada insertada al inicio. Cambia los textos por tus datos.', '', '📘');
        return after('cover');
      }
      if (d.orient) { state.orientation = d.orient; applyState(); return after('orientation'); }
    });

    ribbon.addEventListener('change', (e) => {
      const s = e.target;
      if (s.matches('[data-font]')) { if (needSelection()) { exec('fontName', s.value); after('font'); } }
      else if (s.matches('[data-size]')) { if (s.value) applySize(+s.value); s.value = ''; }
      else if (s.matches('[data-spacing]')) {
        if (s.value) { selectedBlocks().forEach((b) => (b.style.lineHeight = s.value)); after('spacing'); }
        s.value = '';
      } else if (s.matches('[data-style]')) {
        if (s.value) { exec('formatBlock', s.value); after(s.value === 'p' ? 'normal' : 'heading'); }
        s.value = '';
      } else if (s.matches('[data-margins]')) { state.margins = s.value; applyState(); after('margins'); }
    });

    /* ---------- Ventanas emergentes: imagen y tabla ---------- */
    let pop = null;
    function closePop() { if (pop) { pop.remove(); pop = null; } }
    function togglePop(kind, btn) {
      if (pop && pop.dataset.kind === kind) return closePop();
      closePop();
      pop = document.createElement('div');
      pop.className = 'wd-pop';
      pop.dataset.kind = kind;
      const r = btn.getBoundingClientRect(), rr = ribbon.getBoundingClientRect();
      pop.style.left = Math.max(4, Math.min(r.left - rr.left, rr.width - 300)) + 'px';
      pop.style.top = r.bottom - rr.top + 4 + 'px';
      if (kind === 'img') {
        pop.innerHTML = `<div style="font-weight:800;font-size:.85rem;margin-bottom:6px">Elige una imagen</div><div class="img-pick">${IMAGES.map((im, i) => `<button data-img="${i}" title="${im.name}"><img src="${im.src}" alt="${im.name}"></button>`).join('')}</div>`;
        pop.addEventListener('click', (e) => {
          const b = e.target.closest('[data-img]');
          if (!b) return;
          const im = IMAGES[+b.dataset.img];
          insertHTML(`<img class="wd-img sz-m" src="${im.src}" alt="${im.name}"><p><br></p>`);
          closePop();
          O9.ui.toast('Imagen insertada. Haz clic sobre ella y usa S, M o L para cambiar su tamaño.', '', '🖼️');
          after('image');
        });
      } else {
        const N = 6;
        pop.innerHTML = `<div class="tgrid">${Array.from({ length: N * N }, (_, i) => `<span data-r="${Math.floor(i / N) + 1}" data-c="${(i % N) + 1}"></span>`).join('')}</div><div class="tgrid-label">Pasa el mouse y haz clic</div>`;
        const label = $('.tgrid-label', pop);
        pop.addEventListener('mouseover', (e) => {
          const s = e.target.closest('span[data-r]');
          if (!s) return;
          $$('span[data-r]', pop).forEach((x) => x.classList.toggle('on', +x.dataset.r <= +s.dataset.r && +x.dataset.c <= +s.dataset.c));
          label.textContent = `Tabla de ${s.dataset.c} × ${s.dataset.r} (columnas × filas)`;
        });
        pop.addEventListener('click', (e) => {
          const s = e.target.closest('span[data-r]');
          if (!s) return;
          const rows = +s.dataset.r, cols = +s.dataset.c;
          const html = '<table>' + Array.from({ length: rows }, () => '<tr>' + '<td><br></td>'.repeat(cols) + '</tr>').join('') + '</table><p><br></p>';
          insertHTML(html);
          closePop();
          O9.ui.toast(`Tabla de ${cols} columnas y ${rows} filas insertada. Haz clic en una celda para escribir.`, '', '▦');
          after('table');
        });
      }
      ribbon.appendChild(pop);
    }
    const docClick = (e) => {
      if (!document.body.contains(el)) return document.removeEventListener('mousedown', docClick);
      if (pop && !pop.contains(e.target) && !e.target.closest('[data-pop]')) closePop();
    };
    document.addEventListener('mousedown', docClick);

    /* ---------- Eventos del documento ---------- */
    body.addEventListener('click', (e) => {
      $$('img.sel', body).forEach((i) => i.classList.remove('sel'));
      const img = e.target.closest('img');
      selectedImg = img || null;
      const sz = $('.img-size', el);
      if (sz) sz.classList.toggle('hidden', !img);
      if (img) {
        img.classList.add('sel');
        const insTab = $('.wd-tab[data-tab="insertar"]', el);
        if (insTab && !insTab.classList.contains('on')) insTab.click();
      }
    });

    [body, header, footer].forEach((node) => {
      node.addEventListener('input', () => { pushSoon(); changed(); });
      // Pegar siempre como texto sin formato (evita traer estilos raros)
      node.addEventListener('paste', (e) => {
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        if (!text && clip) { e.preventDefault(); document.execCommand('insertHTML', false, clip); after('paste'); return; }
        e.preventDefault();
        document.execCommand('insertText', false, text);
        after('paste');
      });
      node.addEventListener('copy', () => actions.add('copy'));
      node.addEventListener('cut', () => { actions.add('cut'); setTimeout(() => after(), 0); });
      node.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (e.ctrlKey || e.metaKey) {
          const map = { b: 'bold', n: 'bold', i: 'italic', k: 'italic', u: 'underline', s: 'underline' };
          if (k === 'z') { e.preventDefault(); return e.shiftKey ? redo() : undo(); }
          if (k === 'y') { e.preventDefault(); return redo(); }
          if (k === 'g') { e.preventDefault(); return save(); }
          if (k === 'enter' && node === body) { e.preventDefault(); insertHTML('<hr class="wd-pagebreak"><p><br></p>'); return after('pagebreak'); }
          if (map[k] && !e.shiftKey && !e.altKey) { e.preventDefault(); document.execCommand(map[k]); return after(map[k]); }
        }
      });
    });

    function save() {
      actions.add('save');
      const st = $('[data-st-saved]', el);
      st.textContent = '💾 Guardado';
      setTimeout(() => (st.textContent = ''), 2500);
      O9.ui.toast('Documento guardado (Ctrl+G). ¡Buen hábito!', 'success', '💾');
      if (opts.onSave) opts.onSave(api);
    }

    /* ---------- Estado visual ---------- */
    function applyState() {
      page.classList.toggle('landscape', state.orientation === 'landscape');
      page.classList.toggle('m-narrow', state.margins === 'narrow');
      page.classList.toggle('m-wide', state.margins === 'wide');
      pageNum.classList.toggle('hidden', !state.pageNumbers);
      el.classList.toggle('show-hf', !!state.showHF);
      el.classList.toggle('hide-hf', !state.showHF && !tabs.includes('insertar'));
      $$('[data-orient]', el).forEach((b) => b.classList.toggle('on', b.dataset.orient === state.orientation));
      const m = $('[data-margins]', el);
      if (m) m.value = state.margins;
      const pn = $('[data-pagenum]', el);
      if (pn) pn.classList.toggle('on', state.pageNumbers);
    }

    function updateToolbar() {
      ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].forEach((c) => {
        const b = $(`[data-cmd="${c}"]`, el);
        if (b) { let on = false; try { on = document.queryCommandState(c); } catch (e) { /* */ } b.classList.toggle('on', on); }
      });
      ['Left', 'Center', 'Right', 'Full'].forEach((a) => {
        const b = $(`[data-align="${a}"]`, el);
        if (b) { let on = false; try { on = document.queryCommandState('justify' + a); } catch (e) { /* */ } b.classList.toggle('on', on); }
      });
    }

    function stats() {
      const text = body.innerText || '';
      const words = (text.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/g) || []).length;
      const pages = $$('hr.wd-pagebreak', body).length + 1;
      return { words, pages };
    }

    const notify = O9.util.debounce(() => opts.onChange && opts.onChange(api), 250);
    function changed(doNotify = true) {
      const s = stats();
      $('[data-st-words]', el).textContent = `${s.words} palabra${s.words === 1 ? '' : 's'}`;
      $('[data-st-page]', el).textContent = `Página 1 de ${s.pages}`;
      pageNum.textContent = s.pages > 1 ? `Página 1 de ${s.pages}` : '1';
      if (doNotify) notify();
      else opts.onChange && opts.onChange(api);
    }

    /* ---------- API pública ---------- */
    const api = {
      el, body, header, footer,
      actions,
      getState: () => ({
        body,
        headerText: header.innerText.trim(),
        footerText: footer.innerText.trim(),
        pageNumbers: state.pageNumbers,
        orientation: state.orientation,
        margins: state.margins,
        pageBreaks: $$('hr.wd-pagebreak', body).length,
        actions
      }),
      serialize: () => ({ html: body.innerHTML, header: header.innerHTML, footer: footer.innerHTML, pageNumbers: state.pageNumbers, orientation: state.orientation, margins: state.margins }),
      load(data) {
        if (!data) return;
        body.innerHTML = data.html || '<p><br></p>';
        header.innerHTML = data.header || '';
        footer.innerHTML = data.footer || '';
        state.pageNumbers = !!data.pageNumbers;
        state.orientation = data.orientation || 'portrait';
        state.margins = data.margins || 'normal';
        if (data.header || data.footer || data.pageNumbers) state.showHF = true;
        applyState();
        pushHistory();
        changed(false);
      },
      clear() { body.innerHTML = '<p><br></p>'; header.innerHTML = ''; footer.innerHTML = ''; after(); },
      focus() { body.focus(); placeCaretEnd(body); }
    };

    applyState();
    pushHistory();
    changed(false);
    return api;
  }

  O9.WordSim = { create, IMAGES };
})(window.O9);
