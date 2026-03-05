// =====================
// LocalStorage Auth (MVP)
// =====================
const HL_AUTH_KEY = "hl_auth_v1";     // session
const HL_USERS_KEY = "hl_users_v1";   // users list (MVP)

const _$ = (sel, root = document) => root.querySelector(sel);
const _$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function writeJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function firstNameFromName(name) {
  const s = String(name || "").trim();
  return s ? s.split(/\s+/)[0] : "";
}

function getUsers() {
  return readJSON(HL_USERS_KEY, []);
}

function saveUsers(users) {
  writeJSON(HL_USERS_KEY, users);
}

function getSession() {
  return readJSON(HL_AUTH_KEY, null);
}

function setSession(session) {
  writeJSON(HL_AUTH_KEY, session);
}

function clearSession() {
  localStorage.removeItem(HL_AUTH_KEY);
}

function getCurrentUser() {
  const sess = getSession();
  if (!sess?.email) return null;

  const email = normalizeEmail(sess.email);
  return getUsers().find(u => normalizeEmail(u.email) === email) || null;
}

// MVP-only hashing (demo). In real backend: bcrypt/argon2.
async function sha256(text) {
  const enc = new TextEncoder().encode(String(text));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function signupUser({ first, last, email, password }) {
  const users = getUsers();
  const e = normalizeEmail(email);

  if (users.some(u => normalizeEmail(u.email) === e)) {
    return { ok: false, message: "An account with this email already exists." };
  }

  const name = `${String(first || "").trim()} ${String(last || "").trim()}`.trim();
  const passwordHash = await sha256(password);

  const user = {
    id: crypto.randomUUID(),
    first: String(first || "").trim(),
    last: String(last || "").trim(),
    name,
    email: e,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);

  // auto-login
  setSession({ email: e, loggedInAt: new Date().toISOString() });
  return { ok: true, user };
}

async function loginUser({ email, password }) {
  const e = normalizeEmail(email);
  const user = getUsers().find(u => normalizeEmail(u.email) === e);
  if (!user) return { ok: false, message: "Invalid email or password." };

  const passwordHash = await sha256(password);
  if (user.passwordHash !== passwordHash) return { ok: false, message: "Invalid email or password." };

  setSession({ email: e, loggedInAt: new Date().toISOString() });
  return { ok: true, user };
}

function logoutUser() {
  clearSession();
}