// If you already have toast() globally, remove this fallback.
function toast(title, msg) {
  const host = document.querySelector("#toastHost");
  if (!host) return alert(`${title}\n${msg}`);
  const el = document.createElement("div");
  el.className = "w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg px-4 py-3 flex gap-3 items-start";
  el.innerHTML = `
    <div class="mt-0.5 h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center ring-1 ring-emerald-200">✓</div>
    <div class="flex-1">
      <div class="font-semibold text-slate-900">${title}</div>
      <div class="text-sm text-slate-600 leading-6">${msg}</div>
    </div>
    <button class="h-9 w-9 rounded-xl hover:bg-slate-50 transition grid place-items-center" aria-label="Close">✕</button>
  `;
  el.querySelector("button").addEventListener("click", () => el.remove());
  host.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function clearFieldErrors(form) {
  form?.querySelectorAll("[data-field]").forEach((w) => {
    const p = w.querySelector("[data-error]");
    if (p) p.textContent = "";
  });
}

function setFieldError(inputEl, message) {
  const wrap = inputEl?.closest("[data-field]");
  const p = wrap?.querySelector("[data-error]");
  if (p) p.textContent = message || "";
}

function isEmail(v) {
  const s = String(v || "").trim();
  // simple + practical
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

// ---------- Password rules + hint ----------
function validatePassword(p) {
  const rules = [
    { ok: p.length >= 8, msg: "8+ characters" },
    { ok: /[A-Z]/.test(p), msg: "Uppercase letter" },
    { ok: /[a-z]/.test(p), msg: "Lowercase letter" },
    { ok: /\d/.test(p), msg: "Number" },
    { ok: /[^A-Za-z0-9]/.test(p), msg: "Special character" },
  ];
  return { ok: rules.every((r) => r.ok), rules };
}

function paintPassHint(passEl, hintEl) {
  if (!passEl || !hintEl) return;
  const v = validatePassword(passEl.value || "");
  hintEl.textContent = v.rules.map((r) => (r.ok ? "✓ " : "• ") + r.msg).join("   ");
  hintEl.className = v.ok ? "mt-2 text-xs text-emerald-700" : "mt-2 text-xs text-slate-500";
}

// ---------- Signup ----------
function initSignup() {
  const form = document.querySelector("#signupForm");
  if (!form) return;

  const first = document.querySelector("#sFirst");
  const last = document.querySelector("#sLast");
  const email = document.querySelector("#sEmail");
  const pass = document.querySelector("#sPass");
  const pass2 = document.querySelector("#sPass2");
  const hint = document.querySelector("#passHint");

  // Live hint
  pass?.addEventListener("input", () => paintPassHint(pass, hint));
  paintPassHint(pass, hint);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    [first, last, email, pass, pass2].forEach((el) => setFieldError(el, ""));
    let ok = true;

    if (!first?.value?.trim()) { setFieldError(first, "This field is required"); ok = false; }
    if (!last?.value?.trim())  { setFieldError(last, "This field is required"); ok = false; }

    const emailVal = email?.value?.trim() || "";
    if (!emailVal) { setFieldError(email, "This field is required"); ok = false; }
    else if (!isEmail(emailVal)) { setFieldError(email, "Please enter a valid email address"); ok = false; }

    const pv = validatePassword(pass?.value || "");
    if (!pv.ok) { setFieldError(pass, "Password does not meet requirements"); ok = false; }

    if ((pass?.value || "") !== (pass2?.value || "")) {
      setFieldError(pass2, "Passwords do not match");
      ok = false;
    }

    if (!ok) {
      toast("Sign up failed", "Please correct the highlighted fields.");
      return;
    }

    // LocalStorage signup + auto-login (from auth.js)
    const res = await signupUser({
      first: first.value.trim(),
      last: last.value.trim(),
      email: emailVal,
      password: pass.value,
    });

    if (!res.ok) {
      setFieldError(email, res.message || "Could not sign up.");
      toast("Sign up failed", res.message || "Please try again.");
      return;
    }

    // Welcome (signup)
    toast("Welcome", `Welcome, ${firstNameFromName(res.user.name)}.`);
    window.location.href = "/legacy-website/dashboard/index.html";
  });
}

// ---------- Login ----------
function initLogin() {
  const form = document.querySelector("#loginForm");
  if (!form) return;

  const email = document.querySelector("#lEmail");
  const pass = document.querySelector("#lPass");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    [email, pass].forEach((el) => setFieldError(el, ""));
    let ok = true;

    const emailVal = email?.value?.trim() || "";
    if (!emailVal) { setFieldError(email, "This field is required"); ok = false; }
    else if (!isEmail(emailVal)) { setFieldError(email, "Email address is invalid"); ok = false; }

    if (!pass?.value?.trim()) { setFieldError(pass, "This field is required"); ok = false; }

    if (!ok) {
      toast("Login failed", "Please correct the highlighted fields.");
      return;
    }

    const res = await loginUser({ email: emailVal, password: pass.value });

    if (!res.ok) {
      // don't leak which field is wrong
      setFieldError(email, res.message || "Invalid email or password.");
      setFieldError(pass, res.message || "Invalid email or password.");
      toast("Login failed", res.message || "Invalid credentials.");
      return;
    }

    // Welcome back (login)
    toast("Welcome back", `Welcome back, ${firstNameFromName(res.user.name)}.`);
    const after = sessionStorage.getItem("hl_redirect_after_login");
    sessionStorage.removeItem("hl_redirect_after_login");
    window.location.href = after || "/legacy-website/dashboard/index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, skip auth pages
  const u = getCurrentUser();
  if (u && (document.querySelector("#loginForm") || document.querySelector("#signupForm"))) {
    window.location.href = "/legacy-website/dashboard/index.html";
    return;
  }

  initSignup();
  initLogin();
});