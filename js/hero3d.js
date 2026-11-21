/* Bolivia Fitness · hero 3D (WebGL, three.js vendorizado en assets/vendor).
   Medallón metálico con el logo real (perfil de @boliviafitness en 1080 px) en ambas caras
   y la cara del león extruida al frente (capas recortadas del mismo logo), aro metálico rojo,
   brasas que suben, parallax con el mouse y rotación ligada al scroll.
   También maneja la pantalla de carga. Si WebGL no está disponible, queda el logo en CSS 3D. */
import * as THREE from "three";
import { RoomEnvironment } from "../assets/vendor/RoomEnvironment.js";

const $ = (s) => document.querySelector(s);
const loader = $("#loader"), stage = $("#heroStage"), section = $("#hero");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const firstVisit = !sessionStorage.getItem("bf_seen_intro");
const MIN_MS = reduced ? 200 : firstVisit ? 1700 : 600;
const t0 = performance.now();
let progress = 0, shown = 0;

/* ---------- pantalla de carga ---------- */
const bar = $("#loaderBar"), pct = $("#loaderPct"), CIRC = 2 * Math.PI * 64;
function paintLoader() {
  const timeP = Math.min(1, (performance.now() - t0) / MIN_MS);
  const target = Math.min(progress, timeP);
  shown += (target - shown) * 0.18;
  if (bar) bar.style.strokeDashoffset = String(CIRC * (1 - shown));
  if (pct) pct.textContent = String(Math.round(shown * 100)).padStart(3, "0") + "%";
  if (shown > 0.995 && progress >= 1) return finishLoader();
  requestAnimationFrame(paintLoader);
}
let finished = false, introStart = 0;
function finishLoader() {
  if (finished) return; finished = true;
  sessionStorage.setItem("bf_seen_intro", "1");
  loader.classList.add("done");
  document.documentElement.classList.remove("is-loading");
  introStart = performance.now();
  updateCopy(0);
  setTimeout(() => loader.remove(), 1200);
}
if (bar) bar.style.strokeDasharray = String(CIRC);
requestAnimationFrame(paintLoader);

/* ---------- texto según scroll ---------- */
const hls = [...document.querySelectorAll("[data-hl]")];
const cue = $("#scrollCue");
function updateCopy(p) {
  const idx = p < 0.3 ? 0 : p < 0.64 ? 1 : 2;
  hls.forEach((el) => el.classList.toggle("on", +el.dataset.hl === idx && finished));
  if (cue) cue.style.opacity = p > 0.06 ? "0" : "1";
}
function scrollProgress() {
  const r = section.getBoundingClientRect(), total = section.offsetHeight - innerHeight;
  return Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
}
addEventListener("scroll", () => updateCopy(scrollProgress()), { passive: true });

/* ---------- escena ---------- */
function fallback() {
  const f = $("#heroFallback"); if (f) f.hidden = false;
  progress = 1;
}
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
} catch (e) { renderer = null; }
if (!renderer || !renderer.getContext()) { fallback(); }
else {
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  stage.querySelector(".hero3d__bg").after(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 6); scene.add(key);
  const redL = new THREE.PointLight(0xff1a1f, 60, 30, 2); redL.position.set(4, -1, 3); scene.add(redL);
  const back = new THREE.PointLight(0xe00006, 90, 30, 2); back.position.set(0, 1, -4); scene.add(back);

  const manager = new THREE.LoadingManager();
  manager.onProgress = (_u, loaded, total) => { progress = Math.max(progress, loaded / total * 0.95); };
  manager.onLoad = () => { progress = 1; };
  manager.onError = () => { progress = 1; };
  const tl = new THREE.TextureLoader(manager);
  const logoTex = tl.load("assets/brand/logo-1024.webp"); logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = 8;
  const faceTex = tl.load("assets/brand/emblem-face.png"); faceTex.colorSpace = THREE.SRGBColorSpace;

  const R = 1.5, T = 0.26;
  const medal = new THREE.Group();
  // cuerpo del medallón (caras con el logo)
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x3a0406, metalness: 1, roughness: 0.32 });
  const capMat = new THREE.MeshStandardMaterial({ map: logoTex, metalness: 0.2, roughness: 0.5, emissive: 0xffffff, emissiveMap: logoTex, emissiveIntensity: 0.32 });
  // costado abierto + caras planas (UV planares → el logo queda derecho y alineado con la cara extruida)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, T, 160, 1, true), sideMat);
  body.rotation.x = Math.PI / 2;
  medal.add(body);
  const front = new THREE.Mesh(new THREE.CircleGeometry(R, 160), capMat); front.position.z = T / 2; medal.add(front);
  const backF = new THREE.Mesh(new THREE.CircleGeometry(R, 160), capMat); backF.position.z = -T / 2; backF.rotation.y = Math.PI; medal.add(backF);
  // aros metálicos
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc80a10, metalness: 1, roughness: 0.18 });
  [T / 2, -T / 2].forEach((z) => { const rim = new THREE.Mesh(new THREE.TorusGeometry(R, 0.085, 32, 200), rimMat); rim.position.z = z; medal.add(rim); });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(R + 0.24, 0.012, 16, 200), new THREE.MeshBasicMaterial({ color: 0xff3b3f, transparent: true, opacity: 0.55 }));
  medal.add(halo);
  // cara del león extruida (capas)
  const FACE_LAYERS = 18, depth = 0.24;
  for (let i = 0; i < FACE_LAYERS; i++) {
    const f = i / (FACE_LAYERS - 1);
    const shade = new THREE.Color().setScalar(i === FACE_LAYERS - 1 ? 1 : 0.18 + 0.5 * f);
    const mat = new THREE.MeshStandardMaterial({ map: faceTex, color: shade, alphaTest: 0.5, metalness: 0.1, roughness: 0.45, emissive: i === FACE_LAYERS - 1 ? 0x2a2a2a : 0x000000, emissiveMap: i === FACE_LAYERS - 1 ? faceTex : null });
    const layer = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, 2 * R), mat);
    layer.position.z = T / 2 + 0.006 + f * depth;
    medal.add(layer);
    const backLayer = layer.clone(); backLayer.position.z = -layer.position.z; backLayer.rotation.y = Math.PI; medal.add(backLayer);
  }
  scene.add(medal);

  // brasas
  const N = 420, pos = new Float32Array(N * 3), spd = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 14; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1; spd[i] = 0.004 + Math.random() * 0.012; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement("canvas"); dot.width = dot.height = 64;
  const g = dot.getContext("2d"), grd = g.createRadialGradient(32, 32, 0, 32, 32, 32); grd.addColorStop(0, "rgba(255,200,120,1)"); grd.addColorStop(0.3, "rgba(255,40,40,.8)"); grd.addColorStop(1, "rgba(255,0,0,0)"); g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  const embers = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.09, map: new THREE.CanvasTexture(dot), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(embers);

  // tamaño
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w < 700 ? 19 : 13.6;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  // interacción
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener("pointermove", (e) => { mouse.tx = e.clientX / innerWidth - 0.5; mouse.ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  let visible = true;
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 }).observe(section);

  const ease = (x) => 1 - Math.pow(1 - x, 4);
  const clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = clock.getElapsedTime(), p = scrollProgress();
    mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
    const intro = finished ? ease(Math.min(1, (performance.now() - introStart) / 1600)) : 0.12;
    const spinIntro = (1 - intro) * Math.PI * 2.5;
    const idle = reduced ? 0 : Math.sin(t * 0.6) * 0.35;
    medal.rotation.y = idle + spinIntro + p * Math.PI * 2 + mouse.x * 0.6;
    medal.rotation.x = mouse.y * 0.4 + (reduced ? 0 : Math.sin(t * 0.8) * 0.05);
    const s = (0.35 + 0.65 * intro) * (1 - p * 0.35);
    medal.scale.setScalar(s);
    medal.position.y = (reduced ? 0 : Math.sin(t * 1.1) * 0.08) + p * 0.6 + (innerWidth < 700 ? 0.15 : 0.05);
    halo.material.opacity = 0.35 + Math.sin(t * 2) * 0.2;
    redL.position.x = Math.sin(t * 0.7) * 4; redL.position.y = Math.cos(t * 0.5) * 2;
    if (!reduced) {
      const a = pg.attributes.position.array;
      for (let i = 0; i < N; i++) { a[i * 3 + 1] += spd[i]; a[i * 3] += Math.sin(t + i) * 0.0015; if (a[i * 3 + 1] > 4.5) a[i * 3 + 1] = -4.5; }
      pg.attributes.position.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }
  frame();
}
