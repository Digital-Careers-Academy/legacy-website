// assets/js/app.js

// ---------- Utilities ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
function initCookies() {
  const banner = document.getElementById("cookieBanner");
  const modal = document.getElementById("cookieModal");
  const analyticsToggle = document.getElementById("analyticsToggle");

  if (!banner) return;

  const saved = localStorage.getItem("hl_cookie_consent");

  if (!saved) {
    setTimeout(() => {
      banner.classList.remove("translate-y-full");
    }, 400);
  }

  document.getElementById("cookieAccept")?.addEventListener("click", () => {
    localStorage.setItem("hl_cookie_consent", JSON.stringify({
      essential: true,
      analytics: true
    }));
    banner.classList.add("translate-y-full");
  });

  document.getElementById("cookieReject")?.addEventListener("click", () => {
    localStorage.setItem("hl_cookie_consent", JSON.stringify({
      essential: true,
      analytics: false
    }));
    banner.classList.add("translate-y-full");
  });

  document.getElementById("cookieSettingsBtn")?.addEventListener("click", () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  document.getElementById("cookieModalCancel")?.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  document.getElementById("cookieModalSave")?.addEventListener("click", () => {
    localStorage.setItem("hl_cookie_consent", JSON.stringify({
      essential: true,
      analytics: analyticsToggle.checked
    }));
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    banner.classList.add("translate-y-full");
  });
}
function setYear() {
  const y = $("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

// ---------- Toast ----------
function showToast({ title = "Done", message = "", type = "success" } = {}) {
  const host = $("#toastHost");
  if (!host) return;

  const map = {
    success: { ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-900", icon: "✓" },
    warning: { ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-900", icon: "!" },
    error: { ring: "ring-rose-200", bg: "bg-rose-50", text: "text-rose-900", icon: "!" },
    info: { ring: "ring-sky-200", bg: "bg-sky-50", text: "text-sky-900", icon: "i" },
  };

  const t = map[type] || map.success;

  const el = document.createElement("div");
  el.className =
    `pointer-events-auto w-full max-w-md rounded-2xl ${t.bg} ${t.text} ring-1 ${t.ring} shadow-lg p-4 flex gap-3 items-start`;
  el.innerHTML = `
    <div class="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 ring-1 ring-black/5 font-bold">${t.icon}</div>
    <div class="flex-1">
      <p class="font-semibold leading-5">${escapeHtml(title)}</p>
      <p class="mt-1 text-sm leading-5 opacity-90">${escapeHtml(message)}</p>
    </div>
    <button class="ml-2 h-8 w-8 rounded-xl bg-white/70 ring-1 ring-black/5 hover:bg-white" aria-label="Close">✕</button>
  `;
  host.appendChild(el);

  const close = () => {
    el.classList.add("opacity-0", "translate-y-2");
    setTimeout(() => el.remove(), 180);
  };

  el.querySelector("button")?.addEventListener("click", close);
  setTimeout(close, 4200);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- Layout injection ----------
function mountHeaderFooter() {
  const headerHost = $("#site-header");
  const footerHost = $("#site-footer");
  if (headerHost) headerHost.innerHTML = headerHTML();
  if (footerHost) footerHost.innerHTML = footerHTML();

  // active link highlight
  const path = location.pathname.split("/").pop() || "index.html";
  $$(`[data-nav]`).forEach((a) => {
    const target = a.getAttribute("href")?.split("/").pop();
    if (target === path) a.classList.add("!text-slate-900", "bg-slate-100");
  });

  // mobile menu toggle
  const btn = $("#menuBtn");
  const panel = $("#mobileMenu");

  function openMenu() {
    panel.classList.remove("max-h-0", "opacity-0", "pb-0");
    panel.classList.add("max-h-96", "opacity-100", "pb-4");
    btn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    panel.classList.add("max-h-0", "opacity-0", "pb-0");
    panel.classList.remove("max-h-96", "opacity-100", "pb-4");
    btn.setAttribute("aria-expanded", "false");
  }

  btn?.addEventListener("click", () => {
    const isOpen = panel.classList.contains("max-h-96");
    isOpen ? closeMenu() : openMenu();
  });

  // close on navigation click
  $$("#mobileMenu a").forEach((a) =>
    a.addEventListener("click", () => closeMenu())
  );

  // sticky shadow on scroll
  const header = $("#appHeader");
  const onScroll = () => {
    if (!header) return;
    const scrolled = window.scrollY > 6;
    header.classList.toggle("shadow-md", scrolled);
    header.classList.toggle("shadow-transparent", !scrolled);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function headerHTML() {
  return `
<header id="appHeader"
  class="fixed w-full py-2 top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-all duration-300">
    <div class="mx-auto max-w-6xl px-4">
      <div class="h-16 flex items-center justify-between gap-3">
        <a href="./index.html" class="flex items-center gap-3">
        <div class="flex items-center gap-3">
  <img src="./assets/images/logo.png"
       alt="Human Legacy Logo"
       class="h-[70px] w-auto object-contain transition-transform duration-200 hover:scale-105">
  <div>
    <div class="font-semibold text-slate-900">Human Legacy</div>
    <div class="text-xs text-slate-500">Built with privacy in mind.</div>
  </div>
</div>
        </a>

        <nav class="hidden md:flex items-center gap-2">
          <a data-nav href="./index.html" class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">Home</a>
          <a data-nav href="./faq.html" class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">FAQ</a>
          <a data-nav href="./contact.html" class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">Contact</a>
          <a data-nav href="./login.html" class="px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50">Login</a>
          <a data-nav href="./signup.html" class="px-3 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">Sign up</a>
        </nav>

        <button id="menuBtn" class="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 hover:bg-slate-50"
          aria-label="Open menu" aria-expanded="false">
          ☰
        </button>
      </div>

      <div id="mobileMenu" class="md:hidden overflow-hidden max-h-0 opacity-0 transition-all duration-300 ease-out pb-0">
        <div class="grid gap-2">
          <a href="./index.html" class="px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">Home</a>
          <a href="./faq.html" class="px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">FAQ</a>
          <a href="./contact.html" class="px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">Contact</a>
          <a href="./login.html" class="px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50">Login</a>
          <a href="./signup.html" class="px-3 py-2 rounded-xl text-sm font-medium text-white bg-slate-900 hover:bg-slate-800">Sign up</a>
        </div>
      </div>
    </div>
  </header>
  `;
}

function footerHTML() {
  return `
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-6xl px-4 py-10">
      <div class="grid gap-8 md:grid-cols-3">
        <div>
          <div class="font-semibold text-slate-900">Human Legacy</div>
          <p class="mt-2 text-sm text-slate-600 max-w-sm">
            A privacy-first platform to preserve memories, instructions, and important documents—shared only with trusted people.
          </p>
        </div>

        <div class="grid gap-2">
          <div class="text-sm font-medium text-slate-900">Links</div>
          <a class="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline" href="./contact.html">Contact Us</a>
          <a class="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline" href="./faq.html">FAQ</a>
          <a class="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline" href="./cookie-policy.html">Cookie Policy</a>
        </div>

        <div class="grid gap-2">
          <div class="text-sm font-medium text-slate-900">Get in touch</div>
          <a class="text-sm text-slate-600 hover:text-slate-900 underline-offset-4 hover:underline" href="mailto:hello@humanlegacy.example">hello@humanlegacy.example</a>

         <div class="mt-2 flex gap-3">
  <!-- Instagram -->
  <a href="https://www.instagram.com/" target="_blank" rel="noopener"
     class="h-10 w-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-900 hover:text-white transition-colors duration-200"
     aria-label="Instagram">
    <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8"
         viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
      <circle cx="12" cy="12" r="3.5"></circle>
      <circle cx="17.5" cy="6.5" r="1"></circle>
    </svg>
  </a>

  <!-- Facebook -->
  <a href="https://www.facebook.com/" target="_blank" rel="noopener"
     class="h-10 w-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-900 hover:text-white transition-colors duration-200"
     aria-label="Facebook">
    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M13 22v-9h3l1-4h-4V7.5c0-1.2.3-2 2-2h2V2.1C16.6 2 15.3 2 14 2c-3 0-5 1.8-5 5v2H6v4h3v9h4z"/>
    </svg>
  </a>

  <!-- LinkedIn -->
  <a href="https://www.linkedin.com/" target="_blank" rel="noopener"
     class="h-10 w-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-900 hover:text-white transition-colors duration-200"
     aria-label="LinkedIn">
    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.98 3.5C4.98 4.9 3.9 6 2.5 6S0 4.9 0 3.5 1.08 1 2.5 1 4.98 2.1 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.05c.53-1 1.82-2.2 3.75-2.2 4 0 4.75 2.6 4.75 6V24h-4v-7.6c0-1.8-.03-4-2.45-4-2.45 0-2.82 1.9-2.82 3.9V24h-4V8z"/>
    </svg>
  </a>
</div>
        </div>
      </div>

      <div class="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-500">
        <span>© <span id="year"></span> Human Legacy. All rights reserved.</span>
        <span class="text-xs">Built with privacy in mind.</span>
      </div>
    </div>
  </footer>
  `;
}

// ---------- Form validation helpers ----------
function setFieldError(input, message = "") {
  const wrap = input.closest("[data-field]");
  const err = wrap?.querySelector("[data-error]");
  if (!wrap || !err) return;
  err.textContent = message;
  input.classList.toggle("ring-2", Boolean(message));
  input.classList.toggle("ring-rose-200", Boolean(message));
  input.classList.toggle("border-rose-300", Boolean(message));
}

function isEmail(v) {
  // reasonable, not overly strict
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());
}

function isPhone(v) {
  // allow +, spaces, -, parentheses; require at least 8 digits
  const digits = String(v).replace(/[^\d]/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

// ---------- Page features ----------
function initContact() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const first = $("#cFirst");
    const last = $("#cLast");
    const email = $("#cEmail");
    const phone = $("#cPhone");
    const subject = $("#cSubject");
    const msg = $("#cMsg");
    const maxChars = 800;

    let ok = true;

    // required
    [first, last, email, subject, msg].forEach((el) => setFieldError(el, ""));
    if (!first.value.trim()) (setFieldError(first, "This field is required"), (ok = false));
    if (!last.value.trim()) (setFieldError(last, "This field is required"), (ok = false));
    if (!email.value.trim()) (setFieldError(email, "This field is required"), (ok = false));
    if (!subject.value.trim()) (setFieldError(subject, "This field is required"), (ok = false));
    if (!msg.value.trim()) (setFieldError(msg, "This field is required"), (ok = false));

    if (email.value.trim() && !isEmail(email.value)) (setFieldError(email, "Please enter a valid email address"), (ok = false));

    // optional phone, but validate if present
    setFieldError(phone, "");
    if (phone.value.trim() && !isPhone(phone.value)) (setFieldError(phone, "Please enter a valid phone number"), (ok = false));

    // character limit
    if (msg.value.length > maxChars) {
      setFieldError(msg, `Message is too long. Max ${maxChars} characters.`);
      ok = false;
    }

    if (!ok) {
      showToast({ title: "Please fix errors", message: "Some fields need your attention.", type: "error" });
      return;
    }

    // Demo success
    showToast({
      title: "Message sent",
      message: "Thanks — we’ve received your message. (Demo: no email is sent yet.)",
      type: "success",
    });

    form.reset();
  });

  // live character count
  const msg = $("#cMsg");
  const count = $("#cCount");
  if (msg && count) {
    const maxChars = 800;
    const update = () => (count.textContent = `${msg.value.length}/${maxChars}`);
    msg.addEventListener("input", update);
    update();
  }
}

function initSignup() {
  const form = $("#signupForm");
  if (!form) return;

  const pass = $("#sPass");
  const pass2 = $("#sPass2");
  const hint = $("#passHint");

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

  function paintHint() {
    const v = validatePassword(pass.value);
    hint.textContent = v.rules.map((r) => (r.ok ? "✓ " : "• ") + r.msg).join("   ");
    hint.className = v.ok ? "text-xs text-emerald-700" : "text-xs text-slate-500";
  }

  pass?.addEventListener("input", paintHint);
  paintHint();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const first = $("#sFirst");
    const last = $("#sLast");
    const email = $("#sEmail");

    [first, last, email, pass, pass2].forEach((el) => setFieldError(el, ""));

    let ok = true;
    if (!first.value.trim()) (setFieldError(first, "This field is required"), (ok = false));
    if (!last.value.trim()) (setFieldError(last, "This field is required"), (ok = false));
    if (!email.value.trim()) (setFieldError(email, "This field is required"), (ok = false));
    if (email.value.trim() && !isEmail(email.value)) (setFieldError(email, "Please enter a valid email address"), (ok = false));

    const pv = validatePassword(pass.value);
    if (!pv.ok) (setFieldError(pass, "Password does not meet requirements"), (ok = false));
    if (pass.value !== pass2.value) (setFieldError(pass2, "Passwords do not match"), (ok = false));

    if (!ok) {
      showToast({ title: "Sign up failed", message: "Please correct the highlighted fields.", type: "error" });
      return;
    }

    // Demo success + redirect to confirm page
    showToast({ title: "Sign up successful", message: "A confirmation email would be sent in production.", type: "success" });

    setTimeout(() => {
      window.location.href = "./confirm.html";
    }, 700);
  });
}

function initLogin() {
  const form = $("#loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#lEmail");
    const pass = $("#lPass");

    [email, pass].forEach((el) => setFieldError(el, ""));
    let ok = true;

    if (!email.value.trim()) (setFieldError(email, "This field is required"), (ok = false));
    if (email.value.trim() && !isEmail(email.value)) (setFieldError(email, "Email address is invalid"), (ok = false));

    if (!pass.value.trim()) (setFieldError(pass, "This field is required"), (ok = false));

    if (!ok) {
      showToast({ title: "Login failed", message: "Please correct the highlighted fields.", type: "error" });
      return;
    }

    showToast({ title: "Signed in (demo)", message: "Next step: connect backend auth.", type: "success" });
    form.reset();
  });
}

function initFAQ() {
  // accessible accordion
  $$("[data-accordion-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("aria-controls");
      const panel = document.getElementById(id);
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.classList.toggle("hidden", expanded);
    });
  });
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  mountHeaderFooter();
  setYear();

  initContact();
  initSignup();
  initLogin();
  initFAQ();
  initCookies();
});
