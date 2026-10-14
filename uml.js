/* UML.dibujar: diagrama de clases en SVG a partir de un objeto simple (copia propia del juego Gopher Arquitecto).

   spec = {
     clases: [{id, nombre, x, y, w?, estereotipo?, attrs: ["+ Hostname: string", ...], ops: ["+ Encender()", ...]}],
     rels:   [{id, tipo, de, a, mDe?, mA?, etq?, via?: [[x,y],...], pDe?: [fx,fy], pA?: [fx,fy]}]
   }
   tipo: asociacion | dependencia | agregacion | composicion | generalizacion | realizacion
   · agregación y composición: `de` es el todo (lleva el rombo) y `a` la parte.
   · generalización y realización: `de` es el hijo y `a` el padre o la interfaz (lleva el triángulo).
   · dependencia: `de` usa a `a` (la flecha llega a `a`). */
(function (global) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  let MONO = '"JuegoMono", Consolas, "Courier New", monospace';
  let SANS = 'Calibri, Carlito, "Segoe UI", Arial, sans-serif';
  const C = { azul: '#002C71', oro: '#EAAA00', vino: '#910048', texto: '#2D3B45', tenue: '#6b7785', linea: '#2D3B45' };
  let lienzo;

  function medir(txt, font) {
    lienzo = lienzo || document.createElement('canvas').getContext('2d');
    lienzo.font = font;
    return lienzo.measureText(txt).width;
  }
  function el(tag, at, padre) {
    const e = document.createElementNS(NS, tag);
    for (const k in at) if (at[k] !== undefined && at[k] !== null) e.setAttribute(k, at[k]);
    if (padre) padre.appendChild(e);
    return e;
  }

  /* medidas de cada caja (también sirven para enfocar) */
  function geometria(spec, o) {
    const f = o.f, lh = Math.round(f * 1.5), fn = o.fNombre;
    const g = {};
    for (const c of spec.clases) {
      const filas = [...(c.attrs || []), ...(c.ops || [])];
      const anchoTxt = Math.max(
        medir(c.nombre, `700 ${fn}px ${SANS}`),
        c.estereotipo ? medir('«' + c.estereotipo + '»', `italic ${f - 2}px ${SANS}`) : 0,
        ...filas.map(t => medir(t, `${f}px ${MONO}`)));
      const w = c.w || Math.ceil(anchoTxt + 2 * o.padX);
      const hNombre = Math.round(fn * 1.55) + (c.estereotipo ? Math.round(f * 1.2) : 0) + 4;
      const nA = (c.attrs || []).length, nO = (c.ops || []).length;
      const hA = nA ? nA * lh + 10 : (c.ops ? 12 : 0), hO = nO ? nO * lh + 10 : (c.attrs ? 12 : 0);
      g[c.id] = { x: c.x, y: c.y, w, h: hNombre + hA + hO, hNombre, hA, hO, lh };
    }
    return g;
  }

  /* punto del borde de la caja en la dirección de (px,py) */
  function borde(b, px, py) {
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = px - cx, dy = py - cy;
    if (!dx && !dy) return [cx, cy];
    const t = Math.min(dx ? (b.w / 2) / Math.abs(dx) : Infinity, dy ? (b.h / 2) / Math.abs(dy) : Infinity);
    return [cx + dx * t, cy + dy * t];
  }

  function puntas(tipo) {
    return {
      dash: tipo === 'dependencia' || tipo === 'realizacion' || tipo === 'pendiente',
      inicio: tipo === 'agregacion' ? 'rombo' : tipo === 'composicion' ? 'rombolleno' : null,
      fin: tipo === 'generalizacion' || tipo === 'realizacion' ? 'triangulo' : tipo === 'dependencia' ? 'flecha' : null
    };
  }

  function marca(g, forma, p, d, color) {
    // p: punto de la punta, d: dirección unitaria que sale de la caja hacia la línea
    const [ux, uy] = d, nx = -uy, ny = ux;
    const P = (a, b) => `${(p[0] + ux * a + nx * b).toFixed(1)},${(p[1] + uy * a + ny * b).toFixed(1)}`;
    if (forma === 'rombo' || forma === 'rombolleno')
      el('polygon', { points: [P(0, 0), P(11, 7), P(22, 0), P(11, -7)].join(' '), fill: forma === 'rombolleno' ? color : '#fff', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    else if (forma === 'triangulo')
      el('polygon', { points: [P(0, 0), P(17, 10), P(17, -10)].join(' '), fill: '#fff', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    else if (forma === 'flecha')
      el('polyline', { points: [P(13, 8), P(0, 0), P(13, -8)].join(' '), fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, g);
  }
  const largoMarca = { rombo: 22, rombolleno: 22, triangulo: 17, flecha: 0 };

  function texto(g, x, y, t, at) { const e = el('text', Object.assign({ x, y }, at), g); e.textContent = t; return e; }

  function fila(g, x, y, t, f, id, b) {
    el('rect', { class: 'uml-fbg', 'data-fondo': id, x: b.x + 3, y: y - b.lh * .68, width: b.w - 6, height: b.lh, rx: 4 }, g);
    const e = el('text', { x, y, 'font-family': MONO, 'font-size': f, fill: C.texto, 'data-fila': id, class: 'uml-f' }, g);
    const m = /^([+\-#~])\s?(.*)$/.exec(t);
    if (m) {
      const v = el('tspan', { fill: m[1] === '+' ? C.azul : m[1] === '-' ? C.vino : '#8a6400', 'font-weight': 700 }, e);
      v.textContent = m[1] === '-' ? '−' : m[1];
      const r = el('tspan', {}, e); r.textContent = ' ' + m[2];
    } else e.textContent = t;
    return e;
  }

  function dibujar(destino, spec, op = {}) {
    const o = Object.assign({ f: 15, fNombre: 17, padX: 12, margen: 16 }, op);
    const G = geometria(spec, o);
    const svg = destino.tagName && destino.tagName.toLowerCase() === 'svg' ? destino : el('svg', {}, destino);
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('class', ((svg.getAttribute('class') || '').replace(/\buml\b/g, '') + ' uml').trim());
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', op.titulo || 'Diagrama de clases UML');
    const oculto = new Set(o.ocultar || []), nuevo = new Set(o.nuevos || []), on = new Set(o.resaltar || []);
    const capaRel = el('g', { class: 'uml-rels' }, svg), capaCls = el('g', { class: 'uml-clases' }, svg);
    const caja = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    const crece = (x, y) => { caja.minX = Math.min(caja.minX, x); caja.minY = Math.min(caja.minY, y); caja.maxX = Math.max(caja.maxX, x); caja.maxY = Math.max(caja.maxY, y); };
    const out = { svg, clases: {}, rels: {}, geo: G };

    for (const c of spec.clases) {
      const b = G[c.id];
      crece(b.x, b.y); crece(b.x + b.w, b.y + b.h);
      if (oculto.has(c.id)) continue;
      const g = el('g', { class: 'uml-clase' + (on.has(c.id) ? ' on' : '') + (nuevo.has(c.id) ? ' nuevo' : '') + (c.estereotipo ? ' interfaz' : ''), 'data-uml': c.id }, capaCls);
      el('rect', { class: 'uml-halo', x: b.x - 5, y: b.y - 5, width: b.w + 10, height: b.h + 10, rx: 10 }, g);
      el('rect', { class: 'uml-caja', x: b.x, y: b.y, width: b.w, height: b.h, rx: 6, fill: '#fff', stroke: C.azul, 'stroke-width': 2 }, g);
      el('path', { class: 'uml-cab', d: `M${b.x} ${b.y + b.hNombre}V${b.y + 6}a6 6 0 0 1 6-6h${b.w - 12}a6 6 0 0 1 6 6V${b.y + b.hNombre}z`, fill: c.estereotipo ? C.oro : C.azul }, g);
      let yy = b.y + Math.round(o.fNombre * 1.2) + 4;
      if (c.estereotipo) {
        texto(g, b.x + b.w / 2, yy - 2, '«' + c.estereotipo + '»', { class: 'uml-n', 'text-anchor': 'middle', 'font-family': SANS, 'font-size': o.f - 2, 'font-style': 'italic', fill: C.azul });
        yy += Math.round(o.f * 1.2);
      }
      texto(g, b.x + b.w / 2, yy, c.nombre, { 'text-anchor': 'middle', 'font-family': SANS, 'font-size': o.fNombre, 'font-weight': 700, fill: c.estereotipo ? C.azul : '#fff', class: 'uml-n uml-nombre', 'data-fila': c.id + ':n' });
      if (o.etiquetas) [['nombre', b.y + b.hNombre / 2], ['atributos', b.y + b.hNombre + b.hA / 2], ['operaciones', b.y + b.hNombre + b.hA + b.hO / 2]].forEach(([t, yy2]) => {
        texto(g, b.x - 16, yy2 + 5, t.toUpperCase(), { class: 'uml-n uml-comp', 'text-anchor': 'end', 'font-family': SANS, 'font-size': o.f - 3, 'font-weight': 700, 'letter-spacing': 1, fill: C.tenue });
        crece(b.x - 16 - medir(t.toUpperCase(), `700 ${o.f - 3}px ${SANS}`) - 12, yy2);
      });
      if (c.attrs || c.ops) el('line', { x1: b.x, x2: b.x + b.w, y1: b.y + b.hNombre + b.hA, y2: b.y + b.hNombre + b.hA, stroke: C.azul, 'stroke-width': 1.5 }, g);
      (c.attrs || []).forEach((t, i) => fila(g, b.x + o.padX, b.y + b.hNombre + 5 + b.lh * (i + 1) - b.lh * .32, t, o.f, `${c.id}:a${i}`, b));
      (c.ops || []).forEach((t, i) => fila(g, b.x + o.padX, b.y + b.hNombre + b.hA + 5 + b.lh * (i + 1) - b.lh * .32, t, o.f, `${c.id}:o${i}`, b));
      out.clases[c.id] = g;
    }

    for (const r of spec.rels || []) {
      if (oculto.has(r.id) || oculto.has(r.de) || oculto.has(r.a)) continue;
      const A = G[r.de], B = G[r.a];
      const ca = [A.x + A.w / 2, A.y + A.h / 2], cb = [B.x + B.w / 2, B.y + B.h / 2];
      const via = r.via || [];
      const p0 = r.pDe ? [A.x + r.pDe[0] * A.w, A.y + r.pDe[1] * A.h] : borde(A, ...(via[0] || (r.pA ? [B.x + r.pA[0] * B.w, B.y + r.pA[1] * B.h] : cb)));
      const p1 = r.pA ? [B.x + r.pA[0] * B.w, B.y + r.pA[1] * B.h] : borde(B, ...(via[via.length - 1] || p0));
      const pts = [p0, ...via, p1];
      const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
      const d0 = unit(pts[0], pts[1]), d1 = unit(pts[pts.length - 1], pts[pts.length - 2]);
      const pu = puntas(r.tipo);
      const color = r.tipo === 'pendiente' ? '#9aa8bd' : C.linea;
      const g = el('g', { class: 'uml-rel ' + r.tipo + (on.has(r.id) ? ' on' : '') + (nuevo.has(r.id) ? ' nuevo' : ''), 'data-uml': r.id }, capaRel);
      // la línea empieza donde termina la punta
      const ini = pu.inicio ? [p0[0] + d0[0] * largoMarca[pu.inicio], p0[1] + d0[1] * largoMarca[pu.inicio]] : p0;
      const fin = pu.fin ? [p1[0] + d1[0] * largoMarca[pu.fin], p1[1] + d1[1] * largoMarca[pu.fin]] : p1;
      const linea = [ini, ...via, fin].map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
      el('polyline', { class: 'uml-toque', points: [p0, ...via, p1].map(p => p.join(',')).join(' '), fill: 'none', stroke: 'transparent', 'stroke-width': 18 }, g);
      el('polyline', { class: 'uml-linea', points: linea, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-dasharray': pu.dash ? '8 6' : null, 'stroke-linejoin': 'round' }, g);
      if (pu.inicio) marca(g, pu.inicio, p0, d0, color);
      if (pu.fin) marca(g, pu.fin, p1, d1, color);
      const etiqueta = (p, d, t, lado, ajuste, clase) => {
        if (!t) return;
        const n = [-d[1] * lado, d[0] * lado];
        const w = medir(t, `700 ${o.f - 1}px ${MONO}`);
        const sep = 7 + Math.abs(n[0]) * w / 2 + Math.abs(n[1]) * (o.f * .55);   // separación según el ancho del número
        const x = ajuste ? p[0] + ajuste[0] : p[0] + d[0] * 28 + n[0] * sep;
        const y = ajuste ? p[1] + ajuste[1] : p[1] + d[1] * 28 + n[1] * sep + o.f * .35;
        const e = texto(g, x, y, t, { 'text-anchor': 'middle', 'font-family': MONO, 'font-size': o.f - 1, 'font-weight': 700, fill: C.azul, class: clase });
        crece(x - 30, y - 14); crece(x + 30, y + 4);
        return e;
      };
      etiqueta(p0, d0, r.mDe, r.ladoDe || 1, r.posDe, 'uml-mult mde');
      etiqueta(p1, d1, r.mA, r.ladoA || -1, r.posA, 'uml-mult ma');
      if (r.etq) {
        const k = Math.floor((pts.length - 1) / 2), m = pts.length % 2 ? pts[k] : [(pts[k][0] + pts[k + 1][0]) / 2, (pts[k][1] + pts[k + 1][1]) / 2];
        const x = m[0] + (r.posEtq ? r.posEtq[0] : 0), y = m[1] + (r.posEtq ? r.posEtq[1] : -8);
        const w = medir(r.etq, `italic ${o.f - 1}px ${SANS}`) + 10;
        el('rect', { x: x - w / 2, y: y - o.f + 1, width: w, height: o.f + 4, rx: 4, fill: '#fff', opacity: .92 }, g);
        texto(g, x, y, r.etq, { class: 'uml-n uml-etq', 'text-anchor': 'middle', 'font-family': SANS, 'font-size': o.f - 1, 'font-style': 'italic', fill: C.texto });
      }
      pts.forEach(p => crece(...p));
      out.rels[r.id] = g;
    }
    const m = o.margen;
    const vb = o.viewBox || [caja.minX - m, caja.minY - m, caja.maxX - caja.minX + 2 * m, caja.maxY - caja.minY + 2 * m];
    svg.setAttribute('viewBox', vb.map(v => Math.round(v)).join(' '));
    out.viewBox = vb;
    return out;
  }

  /* caja que encierra unas clases (para enfocar la cámara del juego) */
  function marco(spec, ids, op = {}) {
    const o = Object.assign({ f: 15, fNombre: 17, padX: 12 }, op);
    const G = geometria(spec, o);
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const id of ids) {
      const b = G[id]; if (!b) continue;
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
    }
    const m = op.margen || 40;
    return [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m];
  }

  function fuentes(mono, sans) { MONO = mono; SANS = sans; }
  global.UML = { dibujar, marco, geometria, fuentes, colores: C };
})(typeof window !== 'undefined' ? window : globalThis);
