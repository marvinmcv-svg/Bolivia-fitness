/* Bolivia Fitness CRM · gráficos SVG sin dependencias.
   Reglas: una sola serie por gráfico (color de marca), un solo eje, grilla tenue,
   barras de 4px de radio en el extremo, línea de 2px, tooltip al pasar el mouse o tocar
   y tabla accesible (aria-label + <table> oculta). */
(function () {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function niceMax(v) { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p; }
  function tipFor(host) { let t = host.querySelector(".ctip"); if (!t) { t = document.createElement("div"); t.className = "ctip"; t.setAttribute("role", "status"); host.appendChild(t); } return t; }
  function table(rows, head) { return '<table class="vh"><thead><tr>' + head.map((h) => "<th>" + esc(h) + "</th>").join("") + "</tr></thead><tbody>" + rows.map((r) => "<tr>" + r.map((c) => "<td>" + esc(c) + "</td>").join("") + "</tr>").join("") + "</tbody></table>"; }

  /* Serie temporal (área + línea) con cruz y tooltip. data: [{x:label, v:number, sub?:string}] */
  function line(host, data, o) {
    o = o || {};
    const W = host.clientWidth || 640, H = o.height || 240, P = { l: 52, r: 14, t: 14, b: 28 };
    const max = niceMax(Math.max(...data.map((d) => d.v), 0)), n = data.length;
    const x = (i) => P.l + (n === 1 ? 0 : (i / (n - 1)) * (W - P.l - P.r)), y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
    const pts = data.map((d, i) => [x(i), y(d.v)]);
    const path = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
    const area = path + "L" + pts[n - 1][0].toFixed(1) + "," + (H - P.b) + "L" + P.l + "," + (H - P.b) + "Z";
    const grid = [0, .25, .5, .75, 1].map((f) => { const yy = y(max * f); return '<line class="grid" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/><text class="axis" x="' + (P.l - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(o.fmtAxis ? o.fmtAxis(max * f) : Math.round(max * f)) + "</text>"; }).join("");
    const step = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - P.l - P.r) / 70))));
    const xl = data.map((d, i) => (i % step === 0 || i === n - 1) && !(i !== n - 1 && n - 1 - i < step * .6) ? '<text class="axis" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(d.x) + "</text>" : "").join("");
    host.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(o.label || "") + '">' +
      '<defs><linearGradient id="ag-' + (o.id || "x") + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--series)" stop-opacity=".28"/><stop offset="1" stop-color="var(--series)" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#ag-' + (o.id || "x") + ')"/><path class="ln" d="' + path + '"/>' + xl +
      '<line class="xh" y1="' + P.t + '" y2="' + (H - P.b) + '" visibility="hidden"/><circle class="dot" r="5" visibility="hidden"/>' +
      '<rect class="hit" x="' + P.l + '" y="0" width="' + (W - P.l - P.r) + '" height="' + H + '" fill="transparent"/></svg>' +
      table(data.map((d) => [d.x, o.fmt ? o.fmt(d.v) : d.v]), [o.xName || "", o.label || ""]);
    const svg = host.querySelector("svg"), tip = tipFor(host), xh = svg.querySelector(".xh"), dot = svg.querySelector(".dot");
    function move(ev) {
      const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) * (W / r.width);
      const i = Math.max(0, Math.min(n - 1, Math.round((px - P.l) / ((W - P.l - P.r) / Math.max(1, n - 1)))));
      const [cx, cy] = pts[i];
      xh.setAttribute("x1", cx); xh.setAttribute("x2", cx); xh.setAttribute("visibility", "visible");
      dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.setAttribute("visibility", "visible");
      tip.innerHTML = "<b>" + esc(o.fmt ? o.fmt(data[i].v) : data[i].v) + "</b><span>" + esc(data[i].tip || data[i].x) + (data[i].sub ? " · " + esc(data[i].sub) : "") + "</span>";
      tip.style.left = Math.min(r.width - 150, Math.max(0, cx * r.width / W - 70)) + "px"; tip.style.top = Math.max(0, cy * r.height / H - 62) + "px"; tip.classList.add("on");
    }
    const hide = () => { xh.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); tip.classList.remove("on"); };
    const hit = svg.querySelector(".hit");
    hit.addEventListener("pointermove", move); hit.addEventListener("pointerdown", move); hit.addEventListener("pointerleave", hide);
  }

  /* Barras verticales. data: [{x, v, tip?}] */
  function bars(host, data, o) {
    o = o || {};
    const W = host.clientWidth || 640, H = o.height || 200, P = { l: 44, r: 8, t: 10, b: 26 };
    const max = niceMax(Math.max(...data.map((d) => d.v), 0)), n = data.length, bw = (W - P.l - P.r) / n, w = Math.max(3, bw - 2);
    const y = (v) => H - P.b - (v / max) * (H - P.t - P.b);
    const grid = [0, .5, 1].map((f) => { const yy = y(max * f); return '<line class="grid" x1="' + P.l + '" x2="' + (W - P.r) + '" y1="' + yy + '" y2="' + yy + '"/><text class="axis" x="' + (P.l - 6) + '" y="' + (yy + 4) + '" text-anchor="end">' + esc(o.fmtAxis ? o.fmtAxis(max * f) : Math.round(max * f)) + "</text>"; }).join("");
    const r = Math.min(4, w / 2);
    const rects = data.map((d, i) => { const x0 = P.l + i * bw + (bw - w) / 2, top = y(d.v), h = H - P.b - top; if (h <= 0) return ""; const rr = Math.min(r, h);
      return '<path class="bar" data-i="' + i + '" d="M' + x0 + "," + (H - P.b) + "V" + (top + rr) + "Q" + x0 + "," + top + " " + (x0 + rr) + "," + top + "H" + (x0 + w - rr) + "Q" + (x0 + w) + "," + top + " " + (x0 + w) + "," + (top + rr) + "V" + (H - P.b) + 'Z"/>'; }).join("");
    const step = Math.max(1, Math.ceil(n / Math.floor((W - P.l) / 34)));
    const xl = data.map((d, i) => i % step === 0 ? '<text class="axis" x="' + (P.l + i * bw + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(d.x) + "</text>" : "").join("");
    const hits = data.map((d, i) => '<rect class="hitb" data-i="' + i + '" x="' + (P.l + i * bw) + '" y="' + P.t + '" width="' + bw + '" height="' + (H - P.t - P.b) + '" fill="transparent"/>').join("");
    host.innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" width="100%" height="' + H + '" role="img" aria-label="' + esc(o.label || "") + '">' + grid + rects + xl + hits + "</svg>" + table(data.map((d) => [d.x, o.fmt ? o.fmt(d.v) : d.v]), [o.xName || "", o.label || ""]);
    const svg = host.querySelector("svg"), tip = tipFor(host);
    svg.addEventListener("pointermove", (ev) => { const h = ev.target.closest(".hitb"); if (!h) return; const i = +h.dataset.i, rc = svg.getBoundingClientRect();
      svg.querySelectorAll(".bar").forEach((b) => b.classList.toggle("on", +b.dataset.i === i));
      tip.innerHTML = "<b>" + esc(o.fmt ? o.fmt(data[i].v) : data[i].v) + "</b><span>" + esc(data[i].tip || data[i].x) + "</span>";
      tip.style.left = Math.min(rc.width - 150, Math.max(0, (P.l + i * bw) * rc.width / W - 50)) + "px"; tip.style.top = Math.max(0, y(data[i].v) * rc.height / H - 60) + "px"; tip.classList.add("on"); });
    svg.addEventListener("pointerleave", () => { tip.classList.remove("on"); svg.querySelectorAll(".bar").forEach((b) => b.classList.remove("on")); });
  }

  /* Barras horizontales en HTML (rankings). rows: [{label, v, sub?, href?}] */
  function hbars(rows, o) {
    o = o || {};
    const max = Math.max(...rows.map((r) => r.v), 1);
    return '<ol class="hb">' + rows.map((r) => '<li title="' + esc(r.label + ": " + (o.fmt ? o.fmt(r.v) : r.v)) + '">' +
      '<div class="hb__lbl">' + (r.href ? '<a href="' + esc(r.href) + '">' + esc(r.label) + "</a>" : esc(r.label)) + (r.sub ? "<small>" + esc(r.sub) + "</small>" : "") + "</div>" +
      '<div class="hb__track"><i style="width:' + Math.max(1.5, r.v / max * 100).toFixed(1) + '%"></i></div><b class="hb__v">' + esc(o.fmt ? o.fmt(r.v) : r.v) + "</b></li>").join("") + "</ol>";
  }

  /* Mini tendencia para tarjetas KPI */
  function spark(vals) {
    const W = 120, H = 34, max = Math.max(...vals, 1), n = vals.length;
    const d = vals.map((v, i) => (i ? "L" : "M") + (i / Math.max(1, n - 1) * W).toFixed(1) + "," + (H - 3 - v / max * (H - 6)).toFixed(1)).join("");
    return '<svg class="spark" viewBox="0 0 ' + W + " " + H + '" width="' + W + '" height="' + H + '" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  window.CRMCHART = { line, bars, hbars, spark };
})();
