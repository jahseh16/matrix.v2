/**
 * DEVMATRIX v2.0 — server.js
 * Puerto: 29153
 * Rutas:
 *   GET  /*             → sirve public/index.html (SPA fallback)
 *   POST /api/subscribe → guarda email+IP en data/users.json
 */

const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 29153;

// ── Rutas de datos ──────────────────────────────────────────
const DATA_DIR   = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Crea el directorio data/ y el archivo users.json si no existen
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');

// ── Middlewares ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── POST /api/subscribe ─────────────────────────────────────
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;

  // Validación básica del correo
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Correo inválido.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Captura de IP real (detrás de Nginx usa x-forwarded-for)
  const rawIp = req.headers['x-forwarded-for'] || req.ip || 'unknown';
  // x-forwarded-for puede traer lista separada por comas → tomar la primera
  const ip = rawIp.split(',')[0].trim();

  // ── Leer el archivo actual ──
  let users = [];
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    users = JSON.parse(raw);
    if (!Array.isArray(users)) users = [];
  } catch {
    users = [];
  }

  // ── Verificar duplicado por correo ──
  const alreadyExists = users.some(u => u.email === cleanEmail);
  if (alreadyExists) {
    return res.status(409).json({ success: false, message: 'Este correo ya está registrado.' });
  }

  // ── Crear nuevo registro ──
  const newUser = {
    id:       `${ip}-${cleanEmail}`,
    ip:       ip,
    email:    cleanEmail,
    joinedAt: new Date().toISOString()
  };

  users.push(newUser);

  // ── Persistir en users.json ──
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('[subscribe] Error al escribir users.json:', err.message);
    return res.status(500).json({ success: false, message: 'Error interno al guardar el registro.' });
  }

  console.log(`[subscribe] Nuevo registro → ${cleanEmail} | IP: ${ip}`);
  return res.status(201).json({ success: true, message: 'Registro exitoso.' });
});

// ── Fallback SPA: cualquier ruta no-API sirve index.html ────
// Cubre /login, /dashboard, /cualquier-cosa
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Arrancar servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[DEVMATRIX v2] Servidor corriendo en http://localhost:${PORT}`);
  console.log(`[DEVMATRIX v2] Persistencia activa → ${USERS_FILE}`);
});
