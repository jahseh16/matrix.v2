/**
 * DEVMATRIX v2.0 — script.js
 * 1. Starfield canvas
 * 2. Countdown → 25 julio 2026 00:00 CDMX (UTC-5)
 * 3. Formulario /api/subscribe
 */

/* ── 1. STARFIELD ──────────────────────────────────────────── */
(function () {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  const N = 180;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: N }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.3 + 0.15,
      base:  Math.random() * 0.55 + 0.1,
      speed: Math.random() * 0.005 + 0.001,
      phase: Math.random() * Math.PI * 2,
    }));
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = ts * 0.001;
    for (const s of stars) {
      const a = s.base * (0.5 + 0.5 * Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(195,185,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
}());

/* ── 2. COUNTDOWN ──────────────────────────────────────────── */
(function () {
  const TARGET = new Date('2026-07-25T05:00:00Z').getTime();
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
      ['cd-days','cd-hours','cd-mins','cd-secs']
        .forEach(id => { $( id).textContent = '00'; });
      return;
    }
    const s = Math.floor(diff / 1000);
    $('cd-days').textContent  = pad(Math.floor(s / 86400));
    $('cd-hours').textContent = pad(Math.floor((s % 86400) / 3600));
    $('cd-mins').textContent  = pad(Math.floor((s % 3600) / 60));
    $('cd-secs').textContent  = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
}());

/* ── 3. FORMULARIO ─────────────────────────────────────────── */
(function () {
  const form    = document.getElementById('subscribeForm');
  const input   = document.getElementById('emailInput');
  const btn     = document.getElementById('submitBtn');
  const btnTxt  = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  const msg     = document.getElementById('formMsg');
  const ok      = document.getElementById('successMsg');
  if (!form) return;

  const loading = on => {
    btn.disabled = on;
    btnTxt.classList.toggle('hidden', on);
    spinner.classList.toggle('hidden', !on);
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.textContent = '';
    const email = input.value.trim();
    if (!email) return;
    loading(true);

    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        form.style.transition = 'opacity .3s ease, transform .3s ease';
        form.style.opacity    = '0';
        form.style.transform  = 'translateY(-8px)';
        setTimeout(() => {
          form.classList.add('hidden');
          ok.classList.remove('hidden');
        }, 300);
      } else {
        msg.textContent = data.message || 'Ocurrió un error. Intenta de nuevo.';
        loading(false);
      }
    } catch {
      msg.textContent = 'Error de conexión. Verifica tu red.';
      loading(false);
    }
  });
}());
