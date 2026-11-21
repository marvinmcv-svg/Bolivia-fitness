/* Inicio · LeonIA en 3D: sección Coach y diapositiva del carrusel. Se montan solo cuando hacen falta. */
import { mountLeon3D } from "./leon3d.js";

function mount(el, opts) {
  if (!el || el.dataset.mounted) return null;
  el.dataset.mounted = "1";
  const ctl = mountLeon3D(el, opts);
  if (!ctl.flat) { const img = el.querySelector(":scope > img"); if (img) img.remove(); }
  return ctl;
}

// Sección "Tu coach personal": se monta al acercarse; al pasar por las preguntas rápidas, LeonIA "escucha"
const coachEl = document.getElementById("coachLeon");
if (coachEl) {
  let ctl = null;
  new IntersectionObserver((en, ob) => {
    if (!en[0].isIntersecting) return;
    ob.disconnect();
    ctl = mount(coachEl, { embers: true, zoom: 0.92 });
    const ask = document.querySelector(".coach__ask");
    if (ask && ctl) {
      ask.addEventListener("pointerover", () => ctl.setState("listening"));
      ask.addEventListener("pointerleave", () => ctl.setState("idle"));
    }
  }, { rootMargin: "300px 0px" }).observe(coachEl);
}

// Diapositiva "LeonIA Coach" del carrusel: se monta la primera vez que se muestra (o en un momento libre)
const slideEl = document.getElementById("hcarLeon");
if (slideEl) {
  let ctl = null;
  const ensure = () => { if (!ctl) ctl = mount(slideEl, { embers: true, zoom: 0.95 }); return ctl; };
  document.addEventListener("hcar:slide", (e) => {
    if (e.detail.id !== "coach") return;
    const c = ensure();
    if (c) { c.setState("speaking"); setTimeout(() => c.setState("idle"), 2600); }
  });
  (window.requestIdleCallback || ((f) => setTimeout(f, 2500)))(ensure, { timeout: 6000 });
}
