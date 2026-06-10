/**
 * DEVMATRIX v2.0 — script.js
 * 1. Starfield canvas
 * 2. Countdown → 25 julio 2026, 00:00 CDMX (UTC-5)
 * 3. Formulario /api/subscribe con transición suave
 */

/* ══════════════════════════════════════════
   1. CAMPO DE ESTRELLAS (canvas)
══════════════════════════════════════════ */
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let stars = [];
  const STAR_COUNT = 160;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       Math.random() * 1.2 + 0.2,
        alpha:   Math.random() * 0.6 + 0.15,
        speed:   Math.random() * 0.004 + 0.001,
        phase:   Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = ts * 0.001;
    for (const s of stars) {
      const a = s.alpha * (0.55 + 0.45 * Math.sin(t * s.speed * 60 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,190,255,${a.toFixed(3)})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  requestAnimationFrame(draw);
}());

/* ══════════════════════════════════════════
   2. CUENTA REGRESIVA
══════════════════════════════════════════ */
(function initCountdown() {
  const TARGET = new Date('2026-07-25T05:00:00Z').getTime();

  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
      els.days.textContent = els.hours.textContent =
      els.mins.textContent = els.secs.textContent  = '00';
      return;
    }
    const s = Math.floor(diff / 1000);
    els.days.textContent  = pad(Math.floor(s / 86400));
    els.hours.textContent = pad(Math.floor((s % 86400) / 3600));
    els.mins.textContent  = pad(Math.floor((s % 3600) / 60));
    els.secs.textContent  = pad(s % 60);
  }

  tick();
  setInterval(tick, 1000);
}());

/* ══════════════════════════════════════════
   3. FORMULARIO /api/subscribe
══════════════════════════════════════════ */
(function initSubscribeForm() {
  const form       = document.getElementById('subscribeForm');
  const emailInput = document.getElementById('emailInput');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');
  const formMsg    = document.getElementById('formMsg');
  const successMsg = document.getElementById('successMsg');
  if (!form) return;

  function setLoading(on) {
    submitBtn.disabled = on;
    btnText.classList.toggle('hidden', on);
    btnSpinner.classList.toggle('hidden', !on);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';
    const email = emailInput.value.trim();
    if (!email) return;
    setLoading(true);

    try {
      const res  = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        form.style.opacity    = '0';
        form.style.transform  = 'translateY(-6px)';
        setTimeout(() => {
          form.classList.add('hidden');
          successMsg.classList.remove('hidden');
        }, 300);
      } else {
        formMsg.textContent = data.message || 'Ocurrió un error. Intenta de nuevo.';
        setLoading(false);
      }
    } catch {
      formMsg.textContent = 'Error de conexión. Verifica tu red e intenta de nuevo.';
      setLoading(false);
    }
  });
}());
