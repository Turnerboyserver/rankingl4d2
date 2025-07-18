// server.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;
const STEAM_API_KEY = process.env.STEAM_API_KEY;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Users and sessions
const users = {
  admin1: { password: 'Death666', role: 'admin', name: 'Dark Admin - AdminDeath666' },
  admin2: { password: 'Blood999', role: 'admin', name: 'Shadow Master - BloodAdmin999' },
  mod1:   { password: 'Gore123',   role: 'moderator', name: 'Skull Crusher - ModGore123' },
  mod2:   { password: 'Death456', role: 'moderator', name: 'Bone Reaper - DeathMod456' },
  mod3:   { password: 'Gore789',   role: 'moderator', name: 'Blood Hunter - GoreMod789' },
  mod4:   { password: 'Night321', role: 'moderator', name: 'Dark Watcher - NightMod321' },
  mod5:   { password: 'Shadow654', role: 'moderator', name: 'Void Walker - ShadowMod654' },
  mod6:   { password: 'Crimson987', role: 'moderator', name: 'Red Death - CrimsonMod987' },
  mod7:   { password: 'Black147',  role: 'moderator', name: 'Nightmare - BlackMod147' },
  mod8:   { password: 'Void258',   role: 'moderator', name: 'Soul Eater - VoidMod258' }
};

let activeSessions = {};

function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || !activeSessions[sessionId]) {
    return res.status(401).json({ success: false, error: 'No autorizado' });
  }
  req.user = activeSessions[sessionId];
  next();
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!users[username] || users[username].password !== password) {
    return res.json({ success: false, error: 'Credenciales inválidas' });
  }
  const sessionId = Math.random().toString(36).substr(2, 15);
  activeSessions[sessionId] = { username, role: users[username].role, name: users[username].name };
  res.json({ success: true, sessionId, user: activeSessions[sessionId] });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const sessionId = req.headers['x-session-id'];
  delete activeSessions[sessionId];
  res.json({ success: true });
});

app.get('/api/steam/resolve/:customName', requireAuth, async (req, res) => {
  try {
    const { customName } = req.params;
    const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${STEAM_API_KEY}&vanityurl=${customName}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json({ success: data.response.success === 1, steamid: data.response.steamid });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.get('/api/steam/player/:steamid', requireAuth, async (req, res) => {
  try {
    const { steamid } = req.params;
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamid}`;
    const response = await fetch(url);
    const data = await response.json();
    const player = data.response.players[0];
    res.json({ success: !!player, player });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`));
