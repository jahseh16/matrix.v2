/**
 * DEVMATRIX v2.0 — script.js
 * 1. Countdown al 25 de julio de 2026
 * 2. Formulario /api/subscribe con transición suave
 */

/* ══════════════════════════════════════════
   1. CUENTA REGRESIVA
   Target: 25 julio 2026, 00:00:00 UTC-5 (LATAM)
══════════════════════════════════════════ */
(function initCountdown() {
  // 25 de julio de 2026, medianoche hora CDMX/Bogotá (UTC-5)
  const TARGET = new Date('2026-07-25T05:00:00Z').getTime();

  const els = {
    days:  document.getElementById('cd-days'),
    hours: document.getElementById('cd-hours'),
    mins:  document.getElementById('cd-mins'),
    secs:  document.getElementById('cd-secs'),
  };

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function tick() {
    const now  = Date.now();
    const diff = TARGET - now;

    if (diff <= 0) {
      // Contador llegó a cero — mostrar zeros y detener
      els.days.textContent  = '00';
      els.hours.textContent = '00';
      els.mins.textContent  = '00';
      els.secs.textContent  = '00';
      return; // no volver a llamar
    }

    const totalSecs = Math.floor(diff / 1000);
    const d = Math.floor(totalSecs / 86400);
    const h = Math.floor((totalSecs % 86400) / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    els.days.textContent  = pad(d);
    els.hours.textContent = pad(h);
    els.mins.textContent  = pad(m);
    els.secs.textContent  = pad(s);
  }

  tick(); // pintar inmediatamente sin esperar 1s
  setInterval(tick, 1000);
}());

/* ══════════════════════════════════════════
   2. FORMULARIO DE SUSCRIPCIÓN
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

  function showError(msg) {
    formMsg.textContent = msg;
    formMsg.style.color = '#f87171'; // --red
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMsg.textContent = '';

    const email = emailInput.value.trim();
    if (!email) return;

    setLoading(true);

    try {
      const res  = await fetch('/api/subscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        // Transición suave: ocultar form, mostrar mensaje de éxito
        form.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        form.style.opacity    = '0';
        form.style.transform  = 'translateY(-6px)';

        setTimeout(() => {
          form.classList.add('hidden');
          successMsg.classList.remove('hidden');
        }, 300);
      } else {
        // 409 duplicado u otros errores del servidor
        showError(data.message || 'Ocurrió un error. Intenta de nuevo.');
        setLoading(false);
      }
    } catch {
      showError('Error de conexión. Verifica tu red e intenta de nuevo.');
      setLoading(false);
    }
  });
}());
