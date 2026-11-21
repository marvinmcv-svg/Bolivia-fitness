/* LeonIA 3D · medallón WebGL con el logo real de @boliviafitness (three.js vendorizado, sin importmap).
   Es la "cara" de LeonIA: se monta en el carrusel, en la sección del asistente y en el chat.
   mountLeon3D(el, opts) → { setState("idle"|"thinking"|"listening"|"speaking"), destroy() }
   - Solo dibuja cuando el contenedor está en pantalla y la pestaña visible.
   - Sin WebGL (o con reducción de movimiento) queda el logo plano con CSS. */
import * as THREE from "../assets/vendor/three.module.min.js";
import { RoomEnvironment } from "../assets/vendor/RoomEnvironment.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LOGO = new URL("../assets/brand/logo-1024.webp", import.meta.url).href;
const FACE = new URL("../assets/brand/emblem-face.png", import.meta.url).href;
let texCache = null;
function textures() {
  if (texCache) return texCache;
  const tl = new THREE.TextureLoader();
  const logo = tl.load(LOGO); logo.colorSpace = THREE.SRGBColorSpace; logo.anisotropy = 8;
  const face = tl.load(FACE); face.colorSpace = THREE.SRGBColorSpace;
  return (texCache = { logo, face });
}

function fallback(el) {
  const img = document.createElement("img");
  img.src = LOGO; img.alt = ""; img.className = "leon3d__flat"; img.width = 512; img.height = 512;
  el.appendChild(img);
  return { setState(s) { el.dataset.state = s; }, destroy() { img.remove(); }, flat: true };
}

export function mountLeon3D(el, opts = {}) {
  const o = Object.assign({ embers: false, interactive: true, faceLayers: 18, zoom: 1, dpr: 2 }, opts);
  el.classList.add("leon3d");
  let renderer = null;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: o.small ? "low-power" : "high-performance" }); } catch (e) { renderer = null; }
  if (!renderer || !renderer.getContext()) return fallback(el);

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, o.dpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute("aria-hidden", "true");
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 6); scene.add(key);
  const redL = new THREE.PointLight(0xff1a1f, 60, 30, 2); redL.position.set(4, -1, 3); scene.add(redL);
  const back = new THREE.PointLight(0xe00006, 90, 30, 2); back.position.set(0, 1, -4); scene.add(back);

  const { logo, face } = textures();
  const R = 1.5, T = 0.26, medal = new THREE.Group();
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x3a0406, metalness: 1, roughness: 0.32 });
  const capMat = new THREE.MeshStandardMaterial({ map: logo, metalness: 0.2, roughness: 0.5, emissive: 0xffffff, emissiveMap: logo, emissiveIntensity: 0.32 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 128, 1, true), sideMat); body.rotation.x = Math.PI / 2; medal.add(body);
  const front = new THREE.Mesh(new THREE.CircleGeometry(R, 128), capMat); front.position.z = T / 2; medal.add(front);
  const backF = new THREE.Mesh(new THREE.CircleGeometry(R, 128), capMat); backF.position.z = -T / 2; backF.rotation.y = Math.PI; medal.add(backF);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc80a10, metalness: 1, roughness: 0.18 });
  [T / 2, -T / 2].forEach((z) => { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.085, 24, 160), rimMat); rim.position.z = z; medal.add(rim); });
  const haloMat = new THREE.MeshBasicMaterial({ color: 0xff3b3f, transparent: true, opacity: 0.55 });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(R + 0.24, 0.014, 12, 160), haloMat); medal.add(halo);
  const halo2 = new THREE.Mesh(new THREE.TorusGeometry(R + 0.46, 0.01, 12, 160), haloMat.clone()); halo2.material.opacity = 0; medal.add(halo2);
  const L = o.faceLayers, depth = 0.24;
  for (let i = 0; i < L; i++) {
    const f = i / (L - 1), top = i === L - 1;
    const mat = new THREE.MeshStandardMaterial({ map: face, color: new THREE.Color().setScalar(top ? 1 : 0.18 + 0.5 * f), alphaTest: 0.5, metalness: 0.1, roughness: 0.45, emissive: top ? 0x2a2a2a : 0x000000, emissiveMap: top ? face : null });
    const layer = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), mat);
    layer.position.z = T / 2 + 0.006 + f * depth; medal.add(layer);
    const bl = layer.clone(); bl.position.z = -layer.position.z; bl.rotation.y = Math.PI; medal.add(bl);
  }
  scene.add(medal);

  let embers = null, pg = null, spd = null, N = 0;
  if (o.embers && !reduced) {
    N = 260; const pos = new Float32Array(N * 3); spd = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 9; pos[i * 3 + 1] = (Math.random() - 0.5) * 7; pos[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1; spd[i] = 0.004 + Math.random() * 0.01; }
    pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dot = document.createElement("canvas"); dot.width = dot.height = 64;
    const g = dot.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, "rgba(255,200,120,1)"); grd.addColorStop(0.3, "rgba(255,40,40,.8)"); grd.addColorStop(1, "rgba(255,0,0,0)"); g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    embers = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.08, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(embers);
  }

  function resize() {
    const w = Math.max(1, el.clientWidth), h = Math.max(1, el.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // encuadre: el medallón (radio ~1,9 con el halo) entra completo en el lado más corto
    const fit = 1.95 / Math.tan((camera.fov * Math.PI) / 360) / Math.min(1, camera.aspect);
    camera.position.z = fit / o.zoom; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize); ro.observe(el); resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => { const r = el.getBoundingClientRect(); mouse.tx = Math.max(-1, Math.min(1, (e.clientX - r.left) / r.width - 0.5)); mouse.ty = Math.max(-1, Math.min(1, (e.clientY - r.top) / r.height - 0.5)); };
  if (o.interactive) addEventListener("pointermove", onMove, { passive: true });

  let state = "idle", visible = true, alive = true, spin = 0, last = performance.now(), energy = 0;
  const io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0 }); io.observe(el);
  const SPEED = { idle: 0.35, listening: 0.6, thinking: 3.2, speaking: 0.9 };
  const t0 = performance.now();

  let raf = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!alive || !visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000;
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    const target = state === "idle" ? 0 : 1; energy += (target - energy) * 0.06;
    if (reduced) { medal.rotation.y = mouse.x * 0.4; }
    else {
      // solo "pensando" gira completo; al volver, llega suave al frente más cercano (nunca queda de canto)
      const TAU = Math.PI * 2;
      if (state === "thinking") spin += dt * SPEED.thinking;
      else spin += ((Math.round(spin / TAU) * TAU) - spin) * 0.06;
      const sway = state === "speaking" ? Math.sin(t * 2.2) * 0.22 : state === "listening" ? Math.sin(t * 1.4) * 0.12 : Math.sin(t * 0.6) * 0.35;
      medal.rotation.y = spin + sway + mouse.x * 0.6;
    }
    medal.rotation.x = mouse.y * 0.4 + (reduced ? 0 : Math.sin(t * 0.8) * 0.05);
    const talk = state === "speaking" ? (Math.sin(t * 11) * 0.5 + Math.sin(t * 17.3) * 0.5) * 0.035 : 0;
    medal.scale.setScalar(1 + talk + (state === "listening" ? Math.sin(t * 3) * 0.02 : 0));
    medal.position.y = reduced ? 0 : Math.sin(t * 1.1) * 0.06;
    haloMat.opacity = 0.35 + Math.sin(t * (2 + energy * 4)) * 0.2 + energy * 0.25;
    halo2.material.opacity = energy * (0.25 + Math.sin(t * 5) * 0.2);
    halo2.scale.setScalar(1 + (state === "listening" ? (t % 1.2) / 1.2 * 0.12 : 0));
    redL.intensity = 60 + energy * 80;
    redL.position.x = Math.sin(t * 0.7) * 4; redL.position.y = Math.cos(t * 0.5) * 2;
    if (embers) {
      const a = pg.attributes.position.array;
      for (let i = 0; i < N; i++) { a[i * 3 + 1] += spd[i] * (1 + energy * 2); a[i * 3] += Math.sin(t + i) * 0.0015; if (a[i * 3 + 1] > 3.5) a[i * 3 + 1] = -3.5; }
      pg.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  const onVis = () => { last = performance.now(); loop(); };
  document.addEventListener("visibilitychange", onVis);
  loop();

  return {
    setState(s) { if (SPEED[s] != null) { state = s; el.dataset.state = s; } },
    destroy() {
      alive = false; cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      removeEventListener("pointermove", onMove); document.removeEventListener("visibilitychange", onVis);
      scene.traverse((m) => { if (m.geometry) m.geometry.dispose(); if (m.material) [].concat(m.material).forEach((x) => x.dispose()); });
      pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
    },
  };
}
