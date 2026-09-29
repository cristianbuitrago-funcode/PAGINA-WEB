/**
 * VALIDADORES DE WORD.
 * Revisan el documento del simulador y dicen qué requisitos se cumplen.
 *
 * Cada requisito se describe en los datos así:
 *   { id: 'hasImage', label: 'Inserta una imagen', hint: 'Insertar → Imagen' , ...parámetros }
 *
 * O9.checks.word.run(sim, checks) → [{ ok, label, hint }]
 */
(function (O9) {
  'use strict';

  const { norm } = O9.util;
  const BLOCKS = 'p,div,h1,h2,h3,li,td,th';

  /** Nodos de texto con contenido real. */
  function textNodes(root) {
    const out = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (/\S/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    while (w.nextNode()) out.push(w.currentNode);
    return out;
  }
  const up = (n, root, sel) => {
    const el = n.nodeType === 1 ? n : n.parentElement;
    const found = el && el.closest(sel);
    return found && root.contains(found) ? found : null;
  };
  const style = (n) => window.getComputedStyle(n.nodeType === 1 ? n : n.parentElement);
  const sizePt = (n) => parseFloat(style(n).fontSize) * 0.75;

  const isBold = (n, root) => !!up(n, root, 'b,strong,[style*="font-weight"]') && parseInt(style(n).fontWeight, 10) >= 600;
  const isItalic = (n, root) => !!up(n, root, 'i,em,[style*="italic"]');
  const isUnderline = (n, root) => !!up(n, root, 'u,[style*="underline"]');
  const hasColor = (n, root) => {
    const f = up(n, root, 'font[color],[style*="color"]');
    if (!f) return false;
    const c = style(n).color.replace(/\s/g, '');
    return !['rgb(0,0,0)', 'rgb(17,17,17)'].includes(c);
  };
  const alignOf = (n, root) => {
    const b = up(n, root, BLOCKS) || root;
    const a = style(b).textAlign;
    return a === 'start' ? 'left' : a === 'end' ? 'right' : a;
  };
  const isHeadingNode = (n, root) => !!up(n, root, 'h1,h2,h3') || (isBold(n, root) && sizePt(n) >= 14);

  /**
   * Nodos de texto que forman una frase buscada (aunque esté partida en varios
   * elementos por el formato). Devuelve null si la frase no está.
   */
  function nodesForText(root, text) {
    const all = [];
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) all.push(w.currentNode);
    let full = '';
    const map = [];
    all.forEach((n) => { map.push([full.length, n]); full += n.nodeValue.replace(/\u00a0/g, ' '); });
    const i = full.toLowerCase().indexOf(String(text).toLowerCase());
    if (i < 0) return null;
    const end = i + text.length;
    return map
      .filter(([start, n]) => start < end && start + n.nodeValue.length > i && /\S/.test(n.nodeValue.slice(Math.max(0, i - start), end - start)))
      .map((x) => x[1]);
  }

  /** Primer bloque con texto del documento (normalmente el título). */
  function firstTextNode(root) {
    const t = textNodes(root);
    return t[0] || null;
  }

  function countWords(root) {
    return ((root.innerText || '').match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+/g) || []).length;
  }

  const V = {
    minWords: (st, c) => countWords(st.body) >= c.n,
    hasBold: (st) => textNodes(st.body).some((n) => isBold(n, st.body) && !up(n, st.body, 'h1,h2,h3')),
    hasItalic: (st) => textNodes(st.body).some((n) => isItalic(n, st.body)),
    hasUnderline: (st) => textNodes(st.body).some((n) => isUnderline(n, st.body)),
    hasColor: (st) => textNodes(st.body).some((n) => hasColor(n, st.body)),
    fontSizeMin: (st, c) => textNodes(st.body).some((n) => sizePt(n) >= c.pt && !up(n, st.body, 'h1,h2,h3')),
    fontSizeChanged: (st) => textNodes(st.body).some((n) => !!up(n, st.body, '[style*="font-size"]')),
    hasFont: (st, c) => textNodes(st.body).some((n) => {
      const f = up(n, st.body, 'font[face],[style*="font-family"]');
      return !!f && style(f).fontFamily.toLowerCase().includes(c.font.toLowerCase());
    }),
    fontChanged: (st) => textNodes(st.body).some((n) => !!up(n, st.body, 'font[face],[style*="font-family"]')),
    hasAlign: (st, c) => textNodes(st.body).some((n) => alignOf(n, st.body) === c.align),
    alignCount: (st, c) => new Set(textNodes(st.body).map((n) => alignOf(n, st.body))).size >= c.n,
    hasHeading: (st) => textNodes(st.body).some((n) => isHeadingNode(n, st.body)),
    /** El primer texto (título) cumple ciertas condiciones. */
    titleStyle: (st, c) => {
      const n = firstTextNode(st.body);
      if (!n) return false;
      if (c.align && alignOf(n, st.body) !== c.align) return false;
      if (c.strong && !(isBold(n, st.body) || isHeadingNode(n, st.body))) return false;
      if (c.minSize && sizePt(n) < c.minSize) return false;
      return true;
    },
    /** Un texto concreto tiene cierto formato. */
    textStyle: (st, c) => {
      const nodes = nodesForText(st.body, c.text);
      return !!nodes && nodes.length > 0 && nodes.every((n) => (!c.bold || isBold(n, st.body) || isHeadingNode(n, st.body)) &&
        (!c.italic || isItalic(n, st.body)) && (!c.underline || isUnderline(n, st.body)) &&
        (!c.color || hasColor(n, st.body)) && (!c.align || alignOf(n, st.body) === c.align) && (!c.minSize || sizePt(n) >= c.minSize));
    },
    containsText: (st, c) => norm(st.body.innerText).includes(norm(c.text)),
    containsAll: (st, c) => c.texts.every((t) => norm(st.body.innerText).includes(norm(t))),
    containsAny: (st, c) => c.texts.some((t) => norm(st.body.innerText).includes(norm(t))),
    notContains: (st, c) => !norm(st.body.innerText).includes(norm(c.text)),
    /** Igual que containsText pero respetando tildes (para ejercicios de ortografía). */
    containsExact: (st, c) => (st.body.innerText || '').replace(/\u00a0/g, ' ').toLowerCase().includes(c.text.toLowerCase()),
    /** Los textos aparecen en este orden dentro del documento. */
    textOrder: (st, c) => {
      const full = norm(st.body.innerText);
      let last = -1;
      return c.texts.every((t) => { const i = full.indexOf(norm(t)); const ok = i > last; last = i; return ok; });
    },
    /** Al menos n renglones centrados (útil para portadas). */
    centeredLines: (st, c) => Array.from(st.body.querySelectorAll('p,div,h1,h2,h3')).filter((b) => /\S/.test(b.innerText) && !b.querySelector('p,div,h1,h2,h3') && style(b).textAlign === 'center').length >= c.n,
    /** Al menos n títulos con estilo (Título 1 / Título 2). */
    minHeadings: (st, c) => Array.from(st.body.querySelectorAll(c.tag || 'h1,h2,h3')).filter((h) => /\S/.test(h.innerText)).length >= c.n,
    /** La primera fila de alguna tabla está en negrita. */
    tableHeaderBold: (st) => Array.from(st.body.querySelectorAll('table')).some((t) => {
      const first = t.rows[0];
      if (!first) return false;
      const nodes = textNodes(first);
      return nodes.length > 0 && nodes.every((n) => isBold(n, st.body) || !!up(n, st.body, 'th'));
    }),
    minParagraphs: (st, c) => Array.from(st.body.querySelectorAll('p,div')).filter((p) => countWords(p) >= (c.words || 5)).length >= c.n,
    hasList: (st, c) => {
      const sel = c.kind === 'ul' ? 'ul' : c.kind === 'ol' ? 'ol' : 'ul,ol';
      return Array.from(st.body.querySelectorAll(sel)).some((l) => Array.from(l.querySelectorAll('li')).filter((li) => /\S/.test(li.innerText)).length >= (c.min || 2));
    },
    hasImage: (st, c) => st.body.querySelectorAll('img').length >= (c.min || 1),
    imageResized: (st) => Array.from(st.body.querySelectorAll('img')).some((i) => !i.classList.contains('sz-m')),
    hasTable: (st, c) => Array.from(st.body.querySelectorAll('table')).some((t) => {
      const rows = t.rows.length;
      const cols = Math.max(...Array.from(t.rows).map((r) => r.cells.length));
      const filled = Array.from(t.querySelectorAll('td,th')).filter((td) => /\S/.test(td.innerText)).length;
      return rows >= (c.rows || 2) && cols >= (c.cols || 2) && filled >= (c.filled || 0);
    }),
    hasHeader: (st) => st.headerText.length > 0,
    hasFooter: (st) => st.footerText.length > 0,
    hasPageNumbers: (st) => st.pageNumbers,
    hasPageBreak: (st, c) => st.pageBreaks >= (c.n || 1),
    orientation: (st, c) => st.orientation === c.value,
    margins: (st, c) => st.margins === c.value,
    lineSpacing: (st, c) => Array.from(st.body.querySelectorAll('p,div,li,h1,h2')).some((b) => String(b.style.lineHeight) === String(c.value) && /\S/.test(b.innerText)),
    anySpacing: (st) => Array.from(st.body.querySelectorAll('p,div,li,h1,h2')).some((b) => b.style.lineHeight && /\S/.test(b.innerText)),
    hasIndent: (st) => Array.from(st.body.querySelectorAll('p,div,li,h1,h2')).some((b) => (b.style.marginLeft || b.style.textIndent) && /\S/.test(b.innerText)),
    hasFirstLine: (st) => Array.from(st.body.querySelectorAll('p,div')).some((b) => b.style.textIndent && /\S/.test(b.innerText)),
    usedAction: (st, c) => st.actions.has(c.action),
    usedAny: (st, c) => c.actions.some((a) => st.actions.has(a)),
    /** Portada: hay un salto de página y antes de él hay texto centrado. */
    coverPage: (st) => {
      const hr = st.body.querySelector('hr.wd-pagebreak');
      if (!hr) return false;
      let count = 0, centered = 0;
      for (let n = st.body.firstChild; n && n !== hr; n = n.nextSibling) {
        if (n.nodeType === 1 && /\S/.test(n.innerText || '')) {
          count++;
          if (style(n).textAlign === 'center') centered++;
        }
      }
      return count >= 3 && centered >= 2;
    },
    /** Hay contenido después del primer salto de página. */
    contentAfterBreak: (st, c) => {
      const hr = st.body.querySelector('hr.wd-pagebreak');
      if (!hr) return false;
      let words = 0;
      for (let n = hr.nextSibling; n; n = n.nextSibling) words += countWords(n.nodeType === 1 ? n : { innerText: n.nodeValue || '' });
      return words >= (c.words || 20);
    }
  };

  O9.checks.word = {
    validators: V,
    run(sim, checks) {
      const st = sim.getState();
      return checks.map((c) => {
        let ok = false;
        try { ok = !!(V[c.id] && V[c.id](st, c)); } catch (e) { ok = false; }
        return { ok, label: c.label, hint: c.hint || '' };
      });
    },
    countWords
  };
})(window.O9);
