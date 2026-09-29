/**
 * GRÁFICOS en SVG (sin librerías externas).
 * O9.charts.svg(tipo, { labels, values, title, seriesName }) → string SVG
 * Tipos: 'bar' (barras), 'pie' (circular), 'line' (líneas).
 */
(function (O9) {
  'use strict';

  const PALETTE = ['#2563eb', '#7c3aed', '#16a34a', '#f59e0b', '#db2777', '#0891b2', '#ea580c', '#4f46e5', '#65a30d', '#dc2626'];
  const esc = (s) => O9.util.esc(s);
  const short = (s, n = 10) => { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const fmt = (n) => O9.util.fmtNum(n, 1);

  /** Calcula un máximo "redondo" para el eje Y (10, 20, 50, 100...). */
  function niceMax(max) {
    if (max <= 0) return 1;
    const exp = Math.pow(10, Math.floor(Math.log10(max)));
    const f = max / exp;
    const nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return nf * exp;
  }

  function titleText(title, W) {
    return title ? `<text x="${W / 2}" y="24" text-anchor="middle" font-size="16" font-weight="800" fill="#0f172a">${esc(title)}</text>` : '';
  }

  function axes(W, H, pad, max) {
    let g = '';
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const y = pad.t + (H - pad.t - pad.b) * (1 - i / steps);
      const val = (max * i) / steps;
      g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
      g += `<text x="${pad.l - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#64748b">${fmt(val)}</text>`;
    }
    g += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${H - pad.b}" y2="${H - pad.b}" stroke="#94a3b8" stroke-width="1.5"/>`;
    return g;
  }

  function bar({ labels, values, title }) {
    const W = 560, H = 320, pad = { t: title ? 44 : 20, r: 16, b: 48, l: 56 };
    const max = niceMax(Math.max(...values, 0));
    const n = values.length || 1;
    const slot = (W - pad.l - pad.r) / n;
    const bw = Math.min(56, slot * 0.62);
    let bars = '';
    values.forEach((v, i) => {
      const h = ((H - pad.t - pad.b) * Math.max(v, 0)) / max;
      const x = pad.l + slot * i + (slot - bw) / 2;
      const y = H - pad.b - h;
      bars += `<g><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${PALETTE[i % PALETTE.length]}">
        <animate attributeName="height" from="0" to="${h}" dur=".6s" fill="freeze"/>
        <animate attributeName="y" from="${H - pad.b}" to="${y}" dur=".6s" fill="freeze"/></rect>
        <text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" font-size="12" font-weight="800" fill="#334155">${fmt(v)}</text>
        <text x="${x + bw / 2}" y="${H - pad.b + 18}" text-anchor="middle" font-size="12" fill="#334155">${esc(short(labels[i], 11))}</text></g>`;
    });
    return svgWrap(W, H, title, titleText(title, W) + axes(W, H, pad, max) + bars);
  }

  function line({ labels, values, title }) {
    const W = 560, H = 320, pad = { t: title ? 44 : 20, r: 24, b: 48, l: 56 };
    const max = niceMax(Math.max(...values, 0));
    const n = values.length;
    const step = n > 1 ? (W - pad.l - pad.r) / (n - 1) : 0;
    const pts = values.map((v, i) => [pad.l + step * i + (n === 1 ? (W - pad.l - pad.r) / 2 : 0), H - pad.b - ((H - pad.t - pad.b) * Math.max(v, 0)) / max]);
    const path = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = pts.length ? `${path} L ${pts[pts.length - 1][0]} ${H - pad.b} L ${pts[0][0]} ${H - pad.b} Z` : '';
    let marks = '';
    pts.forEach((p, i) => {
      marks += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#fff" stroke="#7c3aed" stroke-width="3"/>
        <text x="${p[0]}" y="${p[1] - 10}" text-anchor="middle" font-size="12" font-weight="800" fill="#334155">${fmt(values[i])}</text>
        <text x="${p[0]}" y="${H - pad.b + 18}" text-anchor="middle" font-size="12" fill="#334155">${esc(short(labels[i], 9))}</text>`;
    });
    const body = `<path d="${area}" fill="rgba(124,58,237,.12)"/>
      <path d="${path}" fill="none" stroke="#7c3aed" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">
      <animate attributeName="stroke-dashoffset" from="1" to="0" dur=".9s" fill="freeze"/></path>${marks}`;
    return svgWrap(W, H, title, titleText(title, W) + axes(W, H, pad, max) + body);
  }

  function pie({ labels, values, title }) {
    const W = 560, H = 320;
    const cx = 170, cy = title ? 182 : 165, r = 118;
    const total = values.reduce((a, b) => a + Math.max(b, 0), 0) || 1;
    let a0 = -Math.PI / 2, slices = '', legend = '';
    values.forEach((v, i) => {
      const frac = Math.max(v, 0) / total;
      const a1 = a0 + frac * Math.PI * 2;
      const color = PALETTE[i % PALETTE.length];
      if (frac >= 0.9999) {
        slices += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/>`;
      } else if (frac > 0) {
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
        const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
        slices += `<path d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${color}" stroke="#fff" stroke-width="2"/>`;
      }
      if (frac >= 0.06) {
        const am = (a0 + a1) / 2;
        slices += `<text x="${cx + r * 0.62 * Math.cos(am)}" y="${cy + r * 0.62 * Math.sin(am) + 5}" text-anchor="middle" font-size="13" font-weight="900" fill="#fff">${Math.round(frac * 100)}%</text>`;
      }
      const ly = (title ? 64 : 40) + i * 26;
      legend += `<rect x="330" y="${ly - 12}" width="16" height="16" rx="4" fill="${color}"/>
        <text x="354" y="${ly + 1}" font-size="13" fill="#334155"><tspan font-weight="800">${esc(short(labels[i], 16))}</tspan> — ${fmt(v)} (${Math.round(frac * 100)}%)</text>`;
      a0 = a1;
    });
    const body = `<g style="transform-origin:${cx}px ${cy}px;animation:pop .6s">${slices}</g>${legend}`;
    return svgWrap(W, H, title, titleText(title, W) + body);
  }

  function svgWrap(W, H, title, inner) {
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title || 'Gráfico')}" xmlns="http://www.w3.org/2000/svg" font-family="Nunito, Arial, sans-serif">${inner}</svg>`;
  }

  const NAMES = { bar: 'Gráfico de barras', pie: 'Gráfico circular', line: 'Gráfico de líneas' };
  const ICONS = { bar: '📊', pie: '🥧', line: '📈' };

  O9.charts = {
    PALETTE, NAMES, ICONS,
    svg(type, data) {
      const clean = {
        labels: (data.labels || []).map((l) => (l == null ? '' : l)),
        values: (data.values || []).map((v) => (typeof v === 'number' && isFinite(v) ? v : 0)),
        title: data.title || ''
      };
      if (type === 'pie') return pie(clean);
      if (type === 'line') return line(clean);
      return bar(clean);
    }
  };
})(window.O9);
