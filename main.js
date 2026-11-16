import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const { SITE, PROJECTS, ABOUT } = window;
const $ = (s) => document.querySelector(s);
const TAU = Math.PI * 2;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STATUS = { live: 'Live', dev: 'In development', school: 'School project' };
const statusOf = (b) => (STATUS[b.status] ? b.status : 'dev');
const building = (b) => b.kind === 'project' && (b.status === 'dev' || !!b.upgrading);
const randn = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// ───────── HUD text ─────────
$('#name').textContent = SITE.name;
$('#role').textContent = SITE.role;
$('#introName').textContent = SITE.name;
$('#introRole').textContent = SITE.role;
if (SITE.github) $('#githubBtn').href = SITE.github; else $('#githubBtn').remove();
if (SITE.resumeUrl && SITE.resumeUrl !== '#') $('#resumeBtn').href = SITE.resumeUrl; else $('#resumeBtn').remove();

// ───────── renderer / scene ─────────
const canvas = $('#space');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x03040a);
scene.fog = new THREE.FogExp2(0x03040a, 0.00035);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 5000);
const HOME_POS = innerWidth < 760 ? new THREE.Vector3(0, 420, 170) : new THREE.Vector3(0, 95, 280);
const ORIGIN = new THREE.Vector3();
camera.position.set(0, 420, 1500);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.8;
controls.minDistance = 10;
controls.maxDistance = 900;
controls.enablePan = false;
controls.autoRotate = !reduceMotion;
controls.autoRotateSpeed = 0.25;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.85, 0.5, 0.3);
composer.addPass(bloom);
composer.addPass(new OutputPass());

// ───────── procedural textures ─────────
function canvasTex(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const glowTex = canvasTex(128, (g, s) => {
  const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.12, 'rgba(255,255,255,.85)');
  gr.addColorStop(0.35, 'rgba(255,255,255,.2)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, s, s);
});
const flareTex = canvasTex(256, (g, s) => {
  const c = s / 2;
  const ray = (angle, len, w) => {
    g.save(); g.translate(c, c); g.rotate(angle);
    const gr = g.createLinearGradient(-len, 0, len, 0);
    gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(-len, -w / 2, len * 2, w); g.restore();
  };
  ray(0, c, 2.5); ray(Math.PI / 2, c, 2.5); ray(Math.PI / 4, c * 0.45, 1.5); ray(-Math.PI / 4, c * 0.45, 1.5);
});
const cloudTex = canvasTex(256, (g, s) => {
  for (let i = 0; i < 60; i++) {
    const x = s / 2 + randn() * s * 0.22, y = s / 2 + randn() * s * 0.22, r = 20 + Math.random() * 70;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${0.04 + Math.random() * 0.08})`);
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, s, s);
  }
});

// ───────── background starfield (spiral galaxy + distant shell) ─────────
const starUniforms = { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() } };
function makeStarfield(count) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const size = new Float32Array(count), phase = new Float32Array(count);
  const palette = [0xffffff, 0xbcd4ff, 0xffe2c0, 0xd8c4ff, 0x9fd8ff].map((c) => new THREE.Color(c));
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    let x, y, z;
    if (i < count * 0.6) {
      const r = 40 + Math.pow(Math.random(), 0.8) * 1100;
      const arm = (i % 3) * (TAU / 3);
      const a = arm + r * 0.0045 + randn() * (0.25 + 60 / r);
      x = Math.cos(a) * r; z = Math.sin(a) * r; y = randn() * (12 + r * 0.035);
    } else {
      const r = 900 + Math.random() * 1600;
      const u = Math.random() * 2 - 1, t = Math.random() * TAU, q = Math.sqrt(1 - u * u);
      x = q * Math.cos(t) * r; y = u * r; z = q * Math.sin(t) * r;
    }
    pos.set([x, y, z], i * 3);
    c.copy(palette[(Math.random() * palette.length) | 0]).multiplyScalar((0.3 + Math.random() * 0.5) * (i < count * 0.6 ? 0.7 : 1));
    col.set([c.r, c.g, c.b], i * 3);
    size[i] = 0.7 + Math.pow(Math.random(), 7) * 6;
    phase[i] = Math.random() * TAU;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: starUniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
    vertexShader: `
      attribute float aSize; attribute float aPhase;
      uniform float uTime; uniform float uPR;
      varying vec3 vColor; varying float vTw;
      void main() {
        vColor = color;
        vTw = 0.65 + 0.35 * sin(uTime * (0.6 + fract(aPhase) * 2.0) + aPhase * 7.0);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = max(1.0, aSize * uPR * (700.0 / -mv.z));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vTw;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vColor * vTw, a * a);
      }`,
  });
  return new THREE.Points(geo, mat);
}
const galaxy = makeStarfield(reduceMotion ? 6000 : 11000);
scene.add(galaxy);

// nebula clouds
const nebulaColors = [0x6a3cff, 0x1fb6ff, 0xff4fa3, 0x2fffd1, 0x8a5cff, 0x3d6bff];
for (let i = 0; i < 14; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: cloudTex, color: nebulaColors[i % nebulaColors.length], transparent: true,
    opacity: 0.05 + Math.random() * 0.07, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  const a = Math.random() * TAU, r = 700 + Math.random() * 900;
  s.position.set(Math.cos(a) * r, randn() * 120, Math.sin(a) * r);
  s.scale.setScalar(700 + Math.random() * 700);
  s.material.rotation = Math.random() * TAU;
  scene.add(s);
}

// galactic core
const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9a8, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
core.scale.setScalar(150);
scene.add(core);

// ───────── feature stars ─────────
const bodies = [
  ...PROJECTS.map((p) => ({ ...p, kind: 'project' })),
  ...ABOUT.map((a) => ({ ...a, kind: 'about' })),
];

function placeBodies() {
  const nP = PROJECTS.length;
  let pi = 0, ai = 0;
  for (const b of bodies) {
    if (b.kind === 'project') {
      const a = (pi / Math.max(nP, 1)) * TAU + 0.4;
      const r = 70 + (pi % 3) * 22;
      b.pos = new THREE.Vector3(Math.cos(a) * r, Math.sin(pi * 1.9) * 18, Math.sin(a) * r);
      pi++;
    } else {
      const a = (ai / ABOUT.length) * TAU + Math.PI / 4;
      b.pos = new THREE.Vector3(Math.cos(a) * 200, ai % 2 ? 38 : -26, Math.sin(a) * 200);
      ai++;
    }
  }
}
placeBodies();

const hitTargets = [];
const white = new THREE.Color(0xffffff);
const labelsEl = $('#labels');

for (const b of bodies) {
  const color = new THREE.Color(b.color);
  const g = new THREE.Group();
  g.position.copy(b.pos);
  const isProj = b.kind === 'project';

  const coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(isProj ? 3.2 : 2.6, 32, 16),
    new THREE.MeshBasicMaterial({ color: color.clone().lerp(white, 0.45).multiplyScalar(1.6) })
  );
  g.add(coreMesh);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.scale.setScalar(isProj ? 38 : 30);
  g.add(glow);

  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, color: color.clone().lerp(white, 0.4), transparent: true, opacity: isProj ? 0.7 : 0.45, depthWrite: false, blending: THREE.AdditiveBlending }));
  flare.scale.setScalar(isProj ? 70 : 46);
  if (!isProj) flare.material.rotation = Math.PI / 4;
  g.add(flare);

  // in-development stars get an orbit ring with a "construction probe" circling them
  let probe = null;
  if (building(b)) {
    const ringPts = [];
    for (let i = 0; i <= 96; i++) ringPts.push(new THREE.Vector3(Math.cos((i / 96) * TAU) * 9, 0, Math.sin((i / 96) * TAU) * 9));
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts),
      new THREE.LineDashedMaterial({ color: 0xffb84d, dashSize: 0.9, gapSize: 0.7, transparent: true, opacity: 0.6 }));
    ring.computeLineDistances();
    ring.rotation.x = 0.5; ring.rotation.z = 0.25;
    g.add(ring);
    probe = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb84d).multiplyScalar(3) }));
    ring.add(probe);
  }

  // big invisible sphere = easy click target
  const hit = new THREE.Mesh(new THREE.SphereGeometry(13, 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hit.userData.body = b;
  g.add(hit);
  hitTargets.push(hit);

  scene.add(g);
  Object.assign(b, { group: g, glow, flare, probe, phase: Math.random() * TAU });

  const el = document.createElement('button');
  el.className = 'label';
  const tag = isProj ? statusOf(b) : 'about';
  const sub = isProj ? STATUS[statusOf(b)] + (b.upgrading ? ' · Upgrading' : '') : 'About me';
  el.innerHTML = `<span class="dot ${tag}"></span>${esc(b.name)}<small>${sub}</small>`;
  el.addEventListener('click', () => select(b));
  labelsEl.appendChild(el);
  b.label = el;
}

// faint constellation lines between projects
{
  const pts = bodies.filter((b) => b.kind === 'project').map((b) => b.pos);
  if (pts.length > 1) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([...pts, pts[0]]),
      new THREE.LineBasicMaterial({ color: 0x8ab4ff, transparent: true, opacity: 0.16 }));
    scene.add(line);
  }
}

// ───────── shooting stars ─────────
const shooters = [];
function spawnShooter() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array([2, 2, 2.4, 0, 0, 0]), 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending }));
  const start = new THREE.Vector3(randn() * 500, 80 + Math.random() * 250, randn() * 500);
  const vel = new THREE.Vector3(randn(), -0.3 - Math.random() * 0.4, randn()).normalize().multiplyScalar(500 + Math.random() * 300);
  scene.add(line);
  shooters.push({ line, pos: start, vel, life: 0, max: 1 + Math.random() * 0.8 });
}

// ───────── camera flights ─────────
let flight = null;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function flyTo(toPos, toTarget, dur = 1.8, onDone) {
  if (reduceMotion) dur = 0.01;
  flight = {
    t: 0, dur, p0: camera.position.clone(), p1: toPos.clone(), t0: controls.target.clone(), t1: toTarget.clone(),
    lift: Math.min(camera.position.distanceTo(toPos) * 0.15, 80), onDone,
  };
  controls.enabled = false;
}

let current = null;
function select(b) {
  dismissIntro();
  closeMap();
  current = b;
  const dir = camera.position.clone().sub(b.pos).normalize();
  dir.y = Math.max(dir.y, 0.2);
  dir.normalize();
  flyTo(b.pos.clone().add(dir.multiplyScalar(b.kind === 'project' ? 62 : 50)), b.pos, 1.9);
  controls.autoRotate = false;
  openPanel(b);
}
function goHome() {
  current = null;
  closePanel();
  flyTo(HOME_POS, ORIGIN, 2);
  controls.autoRotate = !reduceMotion;
}

// ───────── panel ─────────
const panel = $('#panel'), panelBody = $('#panelBody');
const tagsHTML = (arr = []) => `<div class="tags">${arr.map((t) => `<span>${esc(t)}</span>`).join('')}</div>`;

function galleryHTML(shots = [], bg) {
  if (!shots.length) return `<div class="gallery"><div class="no-shots"><span>◌</span>Screenshots incoming</div></div>`;
  return `<div class="gallery">
    <img class="main" src="${esc(shots[0])}" alt=""${bg ? ` style="background:${esc(bg)}"` : ''} />
    ${shots.length > 1 ? `<div class="thumbs">${shots.map((s, i) => `<img src="${esc(s)}" data-i="${i}" class="${i ? '' : 'on'}" alt="" />`).join('')}</div>` : ''}
  </div>`;
}

function renderBody(b) {
  if (b.kind === 'project') {
    const st = statusOf(b);
    return `
      <div class="eyebrow">Project</div>
      <h2>${esc(b.name)}</h2>
      <div class="badges"><span class="status ${st}"><i class="dot ${st}"></i>${STATUS[st]}</span>${b.upgrading ? `<span class="status dev"><i class="dot dev"></i>Upgrading</span>` : ''}</div>
      ${b.upgrading ? `<p class="upgrade">✦ In the works: ${esc(b.upgrading)}</p>` : ''}
      <p class="tagline">${esc(b.tagline)}</p>
      ${galleryHTML(b.screenshots, b.shotBg)}
      <p>${esc(b.description)}</p>
      <h3>Built with</h3>${tagsHTML(b.tech)}
      ${b.links?.length ? `<div class="links">${b.links.map((l, i) => `<a class="chip ${i ? '' : 'solid'}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`).join('')}</div>` : ''}`;
  }
  let inner = '';
  if (b.groups) inner = b.groups.map((g) => `<h3>${esc(g.title)}</h3>${tagsHTML(g.items)}`).join('');
  if (b.timeline) inner = `<div class="timeline" style="margin-top:20px">${b.timeline.map((t) => `<div class="item"><div class="when">${esc(t.when)}</div><div class="what">${esc(t.what)}</div><p>${esc(t.note)}</p></div>`).join('')}</div>`;
  if (b.stories) inner = `<div style="margin-top:20px">${b.stories.map((s) => `<div class="story"><h4>${esc(s.title)}</h4>${s.body ? `<p>${esc(s.body)}</p>` : ''}${s.items ? `<ul class="questions">${s.items.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div>`;
  return `<div class="eyebrow">About me</div><h2>${esc(b.name)}</h2>${inner}`;
}

function openPanel(b) {
  panelBody.innerHTML = renderBody(b);
  panelBody.scrollTop = 0;
  const i = bodies.indexOf(b);
  $('#navCount').textContent = `${i + 1} / ${bodies.length}`;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
}
function closePanel() {
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
}
panelBody.addEventListener('click', (e) => {
  const t = e.target.closest('.thumbs img');
  if (!t) return;
  panelBody.querySelector('.gallery .main').src = t.src;
  panelBody.querySelectorAll('.thumbs img').forEach((im) => im.classList.toggle('on', im === t));
});
const step = (d) => select(bodies[(bodies.indexOf(current) + d + bodies.length) % bodies.length]);
$('#nextBtn').onclick = () => step(1);
$('#prevBtn').onclick = () => step(-1);
$('#closeBtn').onclick = goHome;

// ───────── star map ─────────
const mapEl = $('#map');
function buildMap() {
  const item = (b) => {
    const tag = b.kind === 'project' ? statusOf(b) : 'about';
    const sub = b.kind === 'project' ? esc(b.tagline) : '';
    return `<button class="map-item" data-id="${esc(b.id)}"><i class="dot ${tag}"></i><span class="t">${esc(b.name)}${sub ? `<small>${sub}</small>` : ''}</span><span class="mono">→</span></button>`;
  };
  $('#mapList').innerHTML = `
    <div class="map-group"><div class="eyebrow">Projects</div>${bodies.filter((b) => b.kind === 'project').map(item).join('')}</div>
    <div class="map-group"><div class="eyebrow">About me</div>${bodies.filter((b) => b.kind === 'about').map(item).join('')}</div>`;
}
buildMap();
function closeMap() { mapEl.hidden = true; }
$('#mapBtn').onclick = () => { dismissIntro(); mapEl.hidden = false; };
$('#mapClose').onclick = closeMap;
mapEl.addEventListener('click', (e) => {
  const it = e.target.closest('.map-item');
  if (it) select(bodies.find((b) => b.id === it.dataset.id));
  else if (e.target === mapEl) closeMap();
});

// ───────── intro / tour ─────────
const intro = $('#intro');
function dismissIntro() { intro.classList.add('gone'); document.body.classList.remove('intro-on'); }
const tour = () => select(bodies[0]);
$('#tourBtn').onclick = tour;
$('#introTour').onclick = tour;
$('#introExplore').onclick = dismissIntro;

// ───────── picking ─────────
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = null, hovered = null;
function pick(e) {
  ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObjects(hitTargets, false)[0]?.object.userData.body || null;
}
canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; controls.autoRotate = false; });
canvas.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 5) { dismissIntro(); return; }
  const b = pick(e);
  if (b) select(b);
});
canvas.addEventListener('pointermove', (e) => {
  if (downAt || e.pointerType !== 'mouse') return;
  const b = pick(e);
  if (b !== hovered) {
    hovered?.label.classList.remove('hot');
    hovered = b;
    hovered?.label.classList.add('hot');
    document.body.classList.toggle('hovering', !!b);
  }
});
canvas.addEventListener('wheel', dismissIntro, { passive: true });
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!mapEl.hidden) closeMap(); else if (current) goHome(); }
  if (current && e.key === 'ArrowRight') step(1);
  if (current && e.key === 'ArrowLeft') step(-1);
});

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// ───────── loop ─────────
const clock = new THREE.Clock();
const v = new THREE.Vector3();
let viewShift = 0, nextShooter = 2;
flyTo(HOME_POS, ORIGIN, 4.2); // intro warp-in

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  starUniforms.uTime.value = t;
  galaxy.rotation.y += dt * 0.004;

  // camera flight with a gentle arc + FOV "warp"
  if (flight) {
    flight.t = Math.min(flight.t + dt / flight.dur, 1);
    const k = easeInOut(flight.t);
    camera.position.lerpVectors(flight.p0, flight.p1, k);
    camera.position.y += Math.sin(Math.PI * k) * flight.lift;
    controls.target.lerpVectors(flight.t0, flight.t1, k);
    camera.fov = 60 + Math.sin(Math.PI * k) * (reduceMotion ? 0 : 22);
    if (flight.t >= 1) { const done = flight.onDone; flight = null; controls.enabled = true; camera.fov = 60; done?.(); }
  }

  // shift the view left when the side panel is open (desktop only), so the star isn't hidden behind it
  const want = current && innerWidth > 760 ? Math.min(460, innerWidth) / 2 : 0;
  viewShift += (want - viewShift) * Math.min(1, dt * 4);
  camera.setViewOffset(innerWidth, innerHeight, viewShift, 0, innerWidth, innerHeight);
  camera.updateProjectionMatrix();
  controls.update();

  // star animation
  for (const b of bodies) {
    const pulse = building(b) ? 1 + 0.14 * Math.sin(t * 2.6 + b.phase) : 1 + 0.04 * Math.sin(t * 1.2 + b.phase);
    const base = b.kind === 'project' ? 38 : 30;
    b.glow.scale.setScalar(base * pulse * (b === hovered || b === current ? 1.25 : 1));
    b.flare.material.rotation += dt * 0.05 * (b.kind === 'project' ? 1 : -1);
    if (b.probe) { const a = t * 1.4 + b.phase; b.probe.position.set(Math.cos(a) * 9, 0, Math.sin(a) * 9); }

    // HTML label follows the star
    v.copy(b.pos).project(camera);
    const behind = v.z > 1;
    const dist = camera.position.distanceTo(b.pos);
    const x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
    b.label.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${Math.max(14, 900 / dist)}px)`;
    b.label.style.opacity = behind || b === current ? 0 : Math.max(0.4, Math.min(1, 1.5 - dist / 700));
    b.label.style.pointerEvents = behind || b === current ? 'none' : 'auto';
  }

  // shooting stars
  if (!reduceMotion && (nextShooter -= dt) < 0) { spawnShooter(); nextShooter = 2.5 + Math.random() * 5; }
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.life += dt;
    s.pos.addScaledVector(s.vel, dt);
    const tail = s.pos.clone().addScaledVector(s.vel, -0.08);
    s.line.geometry.attributes.position.array.set([s.pos.x, s.pos.y, s.pos.z, tail.x, tail.y, tail.z]);
    s.line.geometry.attributes.position.needsUpdate = true;
    s.line.material.opacity = Math.sin(Math.PI * (s.life / s.max));
    if (s.life > s.max) { scene.remove(s.line); s.line.geometry.dispose(); shooters.splice(i, 1); }
  }

  composer.render();
  requestAnimationFrame(frame);
}
frame();
