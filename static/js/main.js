// ===== Starfield: twinkling stars + occasional shooting stars (cheap: ~1 canvas, rAF) =====
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let stars = [], meteors = [], W = 0, H = 0;
let starsOn = true, meteorBurstUntil = 0;
// star + meteor colors follow the active theme (void / darkness)
const SKY = {
  void:     { s: ['#ffffff', '#d9d2ff', '#a78bfa'], head: '239,234,255', tail: '139,92,246' },
  darkness: { s: ['#e8e6f2', '#b9b3d6', '#6d5fa8'], head: '232,230,242', tail: '80,70,140' },
};
const preEl = document.getElementById('preloader'); // cached: skip star work while boot covers the screen

function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const n = Math.min(220, Math.floor(W * H / 9000));
  stars = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.4 + 0.3,
    p: Math.random() * Math.PI * 2,
    s: 0.4 + Math.random() * 1.6,
    tint: Math.random() // <0.75 white, else lavender/violet
  }));
}
resize();
addEventListener('resize', resize);

function spawnMeteor() {
  const x = Math.random() * W * 0.8 + W * 0.1;
  meteors.push({ x, y: -10, vx: -(4 + Math.random() * 3), vy: 3 + Math.random() * 2, life: 1 });
}

let lastMeteor = 0;
function frame(t) {
  requestAnimationFrame(frame);
  if (!starsOn || !preEl.classList.contains('hide')) return; // boot overlay on top: draw nothing
  if (reducedMotion) { // static sky, no animation
    ctx.clearRect(0, 0, W, H);
    stars.forEach(s => {
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#efeaff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    return;
  }
  ctx.clearRect(0, 0, W, H);
  const sec = t / 1000;
  const sky = SKY[document.documentElement.dataset.theme] || SKY.void;
  for (const s of stars) {
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(sec * s.s + s.p));
    ctx.globalAlpha = tw;
    ctx.fillStyle = s.tint < 0.72 ? sky.s[0] : (s.tint < 0.9 ? sky.s[1] : sky.s[2]);
    if (s.r > 1.2) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    } else {
      ctx.fillRect(s.x, s.y, s.r, s.r); // rects are far cheaper than arcs for tiny stars
    }
    if (s.r > 1.4) { // cross sparkle on the biggest stars
      ctx.globalAlpha = tw * 0.35;
      ctx.fillRect(s.x - s.r * 3, s.y - 0.5, s.r * 6, 1);
      ctx.fillRect(s.x - 0.5, s.y - s.r * 3, 1, s.r * 6);
    }
  }
  ctx.globalAlpha = 1;

  // meteors: ambient one every 4-9s, or a burst after the konami code
  const burst = performance.now() < meteorBurstUntil;
  if (sec - lastMeteor > (burst ? 0.2 : 2.5 + Math.random() * 3)) {
    lastMeteor = sec;
    spawnMeteor();
    if (burst && Math.random() > 0.5) spawnMeteor();
  }
  meteors = meteors.filter(m => m.life > 0 && m.y < H + 40);
  for (const m of meteors) {
    m.x += m.vx; m.y += m.vy; m.life -= 0.012;
    const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
    grad.addColorStop(0, `rgba(${sky.head},${0.9 * m.life})`);
    grad.addColorStop(1, `rgba(${sky.tail},0)`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
    ctx.stroke();
  }
}
requestAnimationFrame(frame);

// ===== Marquee: two identical halves = seamless loop, Golang highlighted =====
const TECHS = ['GOLANG', 'GRPC', 'POSTGRESQL', 'MSSQL', 'ASP.NET', 'DOCKER', 'LINUX', 'C#', 'C++', 'REST API', 'JWT', 'SWAGGER', 'BCRYPT', 'MVC', 'KOTLIN', 'GIT'];
(function buildMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  const half = TECHS.map(t =>
    `<span class="mq-item${t === 'GOLANG' ? ' mq-hl' : ''}">✦&nbsp;&nbsp;${t}&nbsp;&nbsp;</span>`
  ).join('');
  track.innerHTML = `<div class="mq-group">${half}</div><div class="mq-group" aria-hidden="true">${half}</div>`;
})();

// ===== Cursor glow + dot (rAF-coalesced so rapid moves cost one paint) =====
const glow = document.getElementById('cursorGlow');
const dot = document.getElementById('cursorDot');
let cx = innerWidth / 2, cy = innerHeight * 0.3, glowQueued = false;
addEventListener('pointermove', e => {
  cx = e.clientX; cy = e.clientY;
  if (glowQueued) return; glowQueued = true;
  requestAnimationFrame(() => {
    glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
    dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
    glowQueued = false;
  });
}, { passive: true });
// the glow/dot only know where the pointer is while it is over the page:
// hide them the moment it leaves the window so no frozen circle is left
// behind (mouseout with no relatedTarget is the bulletproof exit signal),
// and clear any mid-hover card transforms for the same reason
let cursorOut = false;
function setCursorVisible(v) {
  if (v === !cursorOut) return;
  cursorOut = !v;
  glow.style.opacity = cursorOut ? '0' : '';
  dot.style.opacity = cursorOut ? '0' : '';
}
document.addEventListener('mouseout', e => {
  if (!e.relatedTarget) {
    setCursorVisible(false);
    document.querySelectorAll('.tilt,.magnetic').forEach(el => { el.style.transform = ''; });
  }
});
document.addEventListener('mouseover', () => setCursorVisible(true));
addEventListener('blur', () => setCursorVisible(false));
addEventListener('focus', () => setCursorVisible(true));

// ===== Toast =====
function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200);
}

// ===== Boot preloader (skippable) =====
const bootLines = [
  '$ ./boot --user=amirreza --theme=darkness',
  '[OK] kernel 6.8.0 • arch x86_64 • shell zsh',
  '[OK] loading modules: go, grpc, postgres, mssql, docker…',
  '[OK] mounting /dev/portfolio … work-xp found',
  '[OK] starting net/http on :8080',
  '[OK] grpc channel … ready',
  '[OK] starfield renderer … online ✦',
  '> access granted — welcome, visitor_',
];
const bootLog = document.getElementById('bootLog');
const bootFill = document.getElementById('bootFill');
let bootDone = false;
function finishBoot() { if (bootDone) return; bootDone = true; document.getElementById('preloader').classList.add('hide'); }
(async () => {
  for (let i = 0; i < bootLines.length; i++) {
    if (bootDone) break;
    const d = document.createElement('div'); d.textContent = bootLines[i]; bootLog.appendChild(d);
    bootFill.style.width = ((i + 1) / bootLines.length * 100) + '%';
    await new Promise(r => setTimeout(r, 220));
  }
  await new Promise(r => setTimeout(r, 350));
  finishBoot();
})();
addEventListener('keydown', e => { if (!bootDone) finishBoot(); });
document.getElementById('preloader').addEventListener('click', finishBoot);

// ===== Typed roles =====
const roles = ['Backend Developer', 'Golang Engineer', 'gRPC Microservice Builder', 'C# + MSSQL Integrator', 'PostgreSQL Tuner', 'Docker + Linux Deployer'];
const roleEl = document.getElementById('typedRole');
(async function typeLoop() {
  let ri = 0;
  while (true) {
    const word = roles[ri % roles.length];
    for (let i = 1; i <= word.length; i++) { roleEl.textContent = word.slice(0, i); await new Promise(r => setTimeout(r, 50)); }
    await new Promise(r => setTimeout(r, 1600));
    for (let i = word.length; i >= 0; i--) { roleEl.textContent = word.slice(0, i); await new Promise(r => setTimeout(r, 22)); }
    ri++;
  }
})();

// Fake terminal typing second line
const cmds = ['go run server.go --port 8080', 'grpcurl -plaintext localhost:50051 list', 'docker compose up --build', 'psql -c "SELECT * FROM skills;"', 'dotnet run --project Security.Api'];
const tl2 = document.getElementById('termLine2');
(async () => {
  await new Promise(r => setTimeout(r, 2500));
  let ci = 0;
  while (true) {
    const w = cmds[ci % cmds.length];
    for (let i = 1; i <= w.length; i++) { tl2.textContent = w.slice(0, i); await new Promise(r => setTimeout(r, 45)); }
    await new Promise(r => setTimeout(r, 2200)); tl2.textContent = ''; ci++;
  }
})();

// ===== Scroll reveal + skill bars + counters + progress =====
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('visible');
  e.target.querySelectorAll('.bar-fill').forEach(b => { b.style.width = b.dataset.level + '%'; });
  e.target.querySelectorAll('[data-count]').forEach(runCounter);
  if (e.target.hasAttribute('data-count')) runCounter(e.target);
}), { threshold: 0.15 });
document.querySelectorAll('.reveal, .hero-stats').forEach(el => io.observe(el));
document.querySelectorAll('.bar-fill').forEach(b => { if (b.getBoundingClientRect().top < innerHeight) b.style.width = b.dataset.level + '%'; });

function runCounter(el) {
  if (el.dataset.done) return; el.dataset.done = 1;
  const target = +el.dataset.count; let cur = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur; }, 50);
}

const prog = document.getElementById('scrollProgress');
let scrollQueued = false;
addEventListener('scroll', () => {
  if (scrollQueued) return; scrollQueued = true;
  requestAnimationFrame(() => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    prog.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + '%';
    scrollQueued = false;
  });
}, { passive: true });

// ===== Nav clock + footer clock =====
setInterval(() => {
  const t = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const ts = new Date().toLocaleTimeString('en-GB');
  const nc = document.getElementById('navClock'); if (nc) nc.textContent = t;
  const fc = document.getElementById('footClock'); if (fc) fc.textContent = t;
  const sc = document.getElementById('sysmonClock'); if (sc) sc.textContent = ts;
}, 1000);

// ===== Fake sysmon (cpu/mem wander) + real ping =====
let cpu = 32, mem = 54;
setInterval(() => {
  cpu = Math.min(96, Math.max(8, cpu + (Math.random() * 16 - 8)));
  mem = Math.min(92, Math.max(30, mem + (Math.random() * 8 - 4)));
  document.getElementById('cpuBar').style.width = cpu + '%';
  document.getElementById('memBar').style.width = mem + '%';
  document.getElementById('cpuTxt').textContent = Math.round(cpu) + '%';
  document.getElementById('memTxt').textContent = Math.round(mem) + '%';
}, 1200);

// ===== Tilt cards + magnetic buttons (rAF-coalesced) =====
document.querySelectorAll('.tilt').forEach(card => {
  let queued = false;
  card.addEventListener('pointermove', e => {
    if (queued) return; queued = true;
    const x = e.clientX, y = e.clientY;
    requestAnimationFrame(() => {
      const r = card.getBoundingClientRect();
      const dx = (x - r.left) / r.width - 0.5, dy = (y - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg) translateY(-3px)`;
      queued = false;
    });
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});
document.querySelectorAll('.magnetic').forEach(btn => {
  let queued = false;
  btn.addEventListener('pointermove', e => {
    if (queued) return; queued = true;
    const x = e.clientX, y = e.clientY;
    requestAnimationFrame(() => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(x - r.left - r.width / 2) * 0.12}px,${(y - r.top - r.height / 2) * 0.2}px)`;
      queued = false;
    });
  });
  btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
});

// ===== Mobile menu =====
const burger = document.getElementById('burger'), mm = document.getElementById('mobileMenu');
burger.onclick = () => mm.classList.toggle('open');
mm.querySelectorAll('a').forEach(a => a.onclick = () => mm.classList.remove('open'));

// ===== Themes: darkness (default) / void, persisted =====
const THEMES = ['darkness', 'void'];
function setTheme(name, silent) {
  document.documentElement.dataset.theme = name;
  try { localStorage.setItem('pf-theme', name); } catch { /* private mode */ }
  if (!silent) toast('theme: ' + name);
}
function cycleTheme() {
  const cur = THEMES.indexOf(document.documentElement.dataset.theme || 'void');
  setTheme(THEMES[(cur + 1) % THEMES.length]);
}
(function initTheme() {
  let t = 'darkness';
  try { t = localStorage.getItem('pf-theme') || 'darkness'; } catch { /* private mode */ }
  if (!THEMES.includes(t)) t = 'darkness';
  setTheme(t, true);
})();
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) themeBtn.onclick = () => cycleTheme();

// ===== Copy helpers =====
function copyText(txt, msg) {
  navigator.clipboard?.writeText(txt).then(() => toast(msg || 'copied ✓')).catch(() => toast('copy failed'));
}
document.getElementById('copyEmailBtn').onclick = () => copyText('amirrezasaadi0509@gmail.com', '$ email copied to clipboard ✓');
document.getElementById('copyAboutBtn').onclick = () => copyText(document.getElementById('aboutCode').innerText, 'about.go copied ✓');
document.getElementById('copyApiBtn').onclick = () => copyText(document.getElementById('apiOut').innerText, 'response copied ✓');

// ===== "click me" easter egg: floating shortcut straight to the terminal =====
const toTermBtn = document.getElementById('toTerminalBtn');
const pgSection = document.getElementById('playground');
if (toTermBtn) {
  toTermBtn.addEventListener('click', () => {
    if (pgSection) pgSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(() => {
      const pi = document.getElementById('playInput');
      if (pi) pi.focus({ preventScroll: true });
      toast("you found the terminal — try 'help' ✦");
    }, reducedMotion ? 0 : 650);
  });
  // stay visible, but get out of the way once the terminal is on screen
  if (pgSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      toTermBtn.classList.toggle('gone', e.isIntersecting);
    }), { threshold: 0.2 }).observe(pgSection);
  }
}

// ===== EN badge: leads to the ILI diploma story =====
const enBadge = document.getElementById('enBadge');
if (enBadge) enBadge.addEventListener('click', () => toast('ILI English certificate · Advanced (CEFR C2) · 2022'));

// ===== Project filters =====
document.querySelectorAll('.filter').forEach(f => {
  f.onclick = () => {
    document.querySelectorAll('.filter').forEach(x => x.classList.remove('active'));
    f.classList.add('active');
    const v = f.dataset.filter;
    document.querySelectorAll('#projGrid .proj-card').forEach(c => {
      const cat = c.dataset.cat;
      c.classList.toggle('hide', !(v === 'all' || cat === v || cat === 'all'));
    });
  };
});

// ===== API live docs =====
document.querySelectorAll('.api-btn').forEach(b => {
  b.onclick = async () => {
    document.querySelectorAll('.api-btn').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const ep = b.dataset.ep;
    document.getElementById('apiTitle').textContent = 'GET ' + ep + ' — live';
    const out = document.getElementById('apiOut');
    out.textContent = '$ curl -s localhost:8080' + ep + ' | jq\n// fetching…';
    try {
      const r = await fetch(ep); const j = await r.json();
      out.textContent = JSON.stringify(j, null, 2);
    } catch { out.textContent = '$ curl failed — run `go run .` for live API'; }
  };
});

// ===== Health / uptime =====
let bootT = Date.now();
async function health() {
  const t0 = performance.now();
  try {
    const r = await fetch('/api/health'); const j = await r.json();
    const ms = Math.round(performance.now() - t0);
    document.getElementById('serverPill').textContent = `● go net/http online • uptime ${j.uptime} • ${ms}ms`;
    document.getElementById('serverPill').classList.add('ok');
    document.getElementById('navStatus').textContent = 'online • :8080';
    document.getElementById('uptimeFoot').textContent = j.uptime;
    document.getElementById('uptimeHero').textContent = j.uptime;
    document.getElementById('pingTxt').textContent = `rtt ${ms}ms • up ${j.uptime}`;
  } catch {
    const s = Math.floor((Date.now() - bootT) / 1000);
    document.getElementById('uptimeFoot').textContent = s + 's (static preview)';
    document.getElementById('uptimeHero').textContent = s + 's';
    document.getElementById('serverPill').textContent = '● static preview — run `go run .` for live API';
    document.getElementById('pingTxt').textContent = 'static preview — no server';
  }
}
health(); setInterval(health, 5000);

// ===== Contact form → Go /api/contact =====
document.getElementById('contactForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, btn = document.getElementById('sendBtn'), st = document.getElementById('formStatus');
  const payload = { name: f.name.value, email: f.email.value, message: f.message.value };
  btn.textContent = 'sending…'; btn.disabled = true;
  try {
    const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await r.json();
    st.textContent = '$ ' + (j.message || 'sent ✓'); f.reset(); toast('message sent ✓');
  } catch {
    st.textContent = '$ mailto:amirrezasaadi0509@gmail.com — (start `go run .` to enable API send)';
  }
  btn.textContent = 'send --message'; btn.disabled = false;
});

// ===== Command palette (ctrl+k) =====
const palOverlay = document.getElementById('paletteOverlay');
const palInput = document.getElementById('palInput');
const palList = document.getElementById('palList');
const palCmds = [
  { n: 'go → about', run: () => location.hash = '#about' },
  { n: 'go → skills', run: () => location.hash = '#skills' },
  { n: 'go → experience', run: () => location.hash = '#experience' },
  { n: 'go → projects', run: () => location.hash = '#projects' },
  { n: 'go → education', run: () => location.hash = '#education' },
  { n: 'go → contact', run: () => location.hash = '#contact' },
  { n: 'open github ↗', run: () => open('https://github.com/AmirrezaSaadi', '_blank') },
  { n: 'open grpc-user-validation repo', run: () => open('https://github.com/AmirrezaSaadi/gRPC-user-validation', '_blank') },
  { n: 'copy email', run: () => copyText('amirrezasaadi0509@gmail.com', '$ email copied ✓') },
  { n: 'download resume.pdf', run: () => open('/static/resume.pdf', '_blank') },
  { n: 'meteor shower ✦', run: () => { meteorBurstUntil = performance.now() + 6000; toast('✦ meteor shower ✦'); } },
  { n: 'cycle theme (darkness/void)', run: () => cycleTheme() },
  { n: 'fetch /api/health', run: () => document.querySelector('[data-ep="/api/health"]').click() },
];
let palSel = 0;
function renderPal(q = '') {
  const items = palCmds.filter(c => c.n.toLowerCase().includes(q.toLowerCase()));
  palList.innerHTML = '';
  items.forEach((c, i) => {
    const d = document.createElement('div');
    d.className = 'pal-item' + (i === palSel ? ' sel' : '');
    d.innerHTML = '<span class="p-neon">❯</span> ' + c.n;
    d.onclick = () => { c.run(); closePal(); };
    palList.appendChild(d);
  });
  palList._items = items;
}
function openPal() { palOverlay.classList.add('open'); palSel = 0; palInput.value = ''; renderPal(); setTimeout(() => palInput.focus(), 30); }
function closePal() { palOverlay.classList.remove('open'); }
document.getElementById('paletteBtn').onclick = openPal;
palOverlay.addEventListener('click', e => { if (e.target === palOverlay) closePal(); });
palInput.addEventListener('input', () => { palSel = 0; renderPal(palInput.value); });
palInput.addEventListener('keydown', e => {
  const items = palList._items || [];
  if (e.key === 'ArrowDown') { palSel = Math.min(items.length - 1, palSel + 1); renderPal(palInput.value); e.preventDefault(); }
  if (e.key === 'ArrowUp') { palSel = Math.max(0, palSel - 1); renderPal(palInput.value); e.preventDefault(); }
  if (e.key === 'Enter' && items[palSel]) { items[palSel].run(); closePal(); }
});
addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palOverlay.classList.contains('open') ? closePal() : openPal(); }
  if (e.key === 'Escape') closePal();
  if (e.key === '/' && document.activeElement !== palInput && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    e.preventDefault(); document.getElementById('playInput').focus();
  }
});

// ===== Interactive playground terminal =====
const playOut = document.getElementById('playOut'), playIn = document.getElementById('playInput');
const answers = {
  help: `available: <b>whoami</b> • <b>skills</b> • <b>xp</b> • <b>projects</b> • <b>contact</b> • <b>edu</b> • <b>go version</b> • <b>theme</b> • <b>meteors</b> • <b>clear</b>`,
  whoami: `<b>amirreza_saadi</b> — backend dev (Go/C#/C++/SQL), ex-motorsazan intern, Tabriz`,
  skills: `Go 78 • C++ 74 • PostgreSQL 77 • MSSQL 71 • C# 66 • Linux 68 • Docker 63 • Python 58 • Kotlin 57`,
  xp: `<b>Motorsazan Tractorsazi</b> (Aug–Oct 2026): full-stack intern — ASP.NET MVC + MSSQL + DevExpress, JWT APIs, Swagger-tested. See #experience ↑`,
  projects: `1) <b>lenslocked</b> (Go+PG+Docker) 2) <b>grpc-user-validation</b> (Go/gRPC) 3) <b>nodolist</b> (Kotlin) 4) <b>PHASE</b> (C++) 5) <b>this-website</b> (yes, this page)`,
  contact: `email: amirrezasaadi0509@gmail.com • phone: +98 933 014 8482 • github.com/AmirrezaSaadi`,
  edu: `B.Sc Computer Eng, Shahid Madani Univ (2023—), GPA 16.35 • ILI English C2 (2022)`,
  'go version': `go version go1.27 linux/amd64 — this site runs on net/http`,
  sudo: `<span class="cmd-err">[sudo] permission denied: visitor is not in the sudoers file ;)</span>`,
  'rm -rf /': `<span class="cmd-err">nice try. this incident will be reported ;)</span>`,
  vim: `<span class="cmd-err">you opened vim… good luck exiting. try :q!</span>`,
  ':q': `you escaped vim. impressive.`,
  theme: `cycling theme…`,
  meteors: `summoning a meteor shower ✦…`,
};
playIn.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  const raw = playIn.value.trim(); const cmd = raw.toLowerCase();
  const line = document.createElement('div');
  line.innerHTML = `<span class="p-neon">visitor@web:~$</span> ${raw || ''}`;
  playOut.appendChild(line);
  if (cmd === 'clear') { playOut.innerHTML = ''; }
  else if (cmd === '') { }
  else if (cmd === 'meteors') { meteorBurstUntil = performance.now() + 6000; const o = document.createElement('div'); o.className = 'cmd-ok'; o.textContent = '✦ look up — meteor shower incoming'; playOut.appendChild(o); }
  else if (cmd === 'theme') { cycleTheme(); const o = document.createElement('div'); o.className = 'cmd-ok'; o.textContent = 'theme: ' + (document.documentElement.dataset.theme || 'void'); playOut.appendChild(o); }
  else {
    const out = document.createElement('div');
    out.className = 'cmd-ok';
    out.innerHTML = answers[cmd] || `<span class="cmd-err">command not found: ${raw} — try 'help'</span>`;
    playOut.appendChild(out);
  }
  playIn.value = ''; playOut.scrollTop = playOut.scrollHeight;
});

// ===== Konami easter egg: meteor shower =====
let seq = [];
addEventListener('keydown', e => {
  seq.push(e.key); seq = seq.slice(-10);
  if (seq.join(',') === 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a') {
    meteorBurstUntil = performance.now() + 8000;
    toast('↑↑↓↓←→←→BA — ✦ meteor shower ✦');
  }
});
