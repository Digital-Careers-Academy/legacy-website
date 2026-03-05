// assets/js/dashboard.js

/* ------------------------------
  LocalStorage "Backend" (MVP)
--------------------------------*/
const LS_KEYS = {
  user: "hl_user",
  vault: "hl_vault_items",
  contacts: "hl_contacts",
  plan: "hl_transition_plan",
  capsules: "hl_memory_capsules",
  notifications: "hl_notifications",
  activity: "hl_activity_log",
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nowISO() {
  return new Date().toISOString();
}

function seedIfEmpty() {
  const user = readJSON(LS_KEYS.user, null);
  if (!user) {
    writeJSON(LS_KEYS.user, { firstName: "Jane", lastName: "Doe", email: "jane@example.com" });
  }

  const vault = readJSON(LS_KEYS.vault, null);
  if (!vault) {
    writeJSON(LS_KEYS.vault, [
      { id: crypto.randomUUID(), type: "Document", title: "Will Draft.pdf", updatedAt: nowISO() },
      { id: crypto.randomUUID(), type: "Note", title: "Funeral preferences", updatedAt: nowISO() },
    ]);
  }

  const contacts = readJSON(LS_KEYS.contacts, null);
  if (!contacts) {
    writeJSON(LS_KEYS.contacts, [
      { id: crypto.randomUUID(), name: "Amina Patel", role: "Guardian", email: "amina@example.com", confirmed: true, updatedAt: nowISO() },
      { id: crypto.randomUUID(), name: "John Okafor", role: "Trusted Contact", email: "john@example.com", confirmed: false, updatedAt: nowISO() },
      { id: crypto.randomUUID(), name: "Sade Williams", role: "Trusted Contact", email: "sade@example.com", confirmed: true, updatedAt: nowISO() },
    ]);
  }

  const plan = readJSON(LS_KEYS.plan, null);
  if (!plan) {
    writeJSON(LS_KEYS.plan, {
      updatedAt: nowISO(),
      steps: [
        { id: crypto.randomUUID(), title: "Assign a guardian", done: false },
        { id: crypto.randomUUID(), title: "Add trusted contacts", done: true },
        { id: crypto.randomUUID(), title: "Upload essential documents", done: true },
        { id: crypto.randomUUID(), title: "Write final message", done: false },
        { id: crypto.randomUUID(), title: "Review and confirm instructions", done: false },
      ],
    });
  }

  const capsules = readJSON(LS_KEYS.capsules, null);
  if (!capsules) {
    writeJSON(LS_KEYS.capsules, [
      { id: crypto.randomUUID(), title: "Message to my family", body: "I love you. Please remember…", updatedAt: nowISO() },
    ]);
  }

  const notifications = readJSON(LS_KEYS.notifications, null);
  if (!notifications) {
    writeJSON(LS_KEYS.notifications, [
      { id: crypto.randomUUID(), text: "You haven’t assigned a guardian.", read: false, createdAt: nowISO() },
      { id: crypto.randomUUID(), text: "Your Transition Plan is in progress.", read: false, createdAt: nowISO() },
      { id: crypto.randomUUID(), text: "A trusted contact confirmed their role.", read: false, createdAt: nowISO() },
    ]);
  }

  const activity = readJSON(LS_KEYS.activity, null);
  if (!activity) writeJSON(LS_KEYS.activity, []);
}

function logActivity(action, meta = {}) {
  const activity = readJSON(LS_KEYS.activity, []);
  activity.unshift({ id: crypto.randomUUID(), action, meta, createdAt: nowISO() });
  writeJSON(LS_KEYS.activity, activity.slice(0, 25));
}

function computeProgress() {
  const plan = readJSON(LS_KEYS.plan, { steps: [] });
  const steps = plan.steps || [];
  if (!steps.length) return { percent: 0, done: 0, total: 0 };
  const done = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((done / total) * 100);
  return { percent, done, total };
}

/* ------------------------------
  UI Helpers
--------------------------------*/
function toast(title, msg) {
  const host = $("#toastHost");
  if (!host) return;

  const el = document.createElement("div");
  el.className =
    "w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg px-4 py-3 flex gap-3 items-start " +
    "animate-[slideUp_.18s_ease-out]";
  el.innerHTML = `
    <div class="mt-0.5 h-8 w-8 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center ring-1 ring-emerald-200">✓</div>
    <div class="flex-1">
      <div class="font-semibold text-slate-900">${escapeHtml(title)}</div>
      <div class="text-sm text-slate-600 leading-6">${escapeHtml(msg)}</div>
    </div>
    <button class="h-9 w-9 rounded-xl hover:bg-slate-50 transition grid place-items-center" aria-label="Close">✕</button>
  `;

  const closeBtn = el.querySelector("button");
  closeBtn.addEventListener("click", () => el.remove());

  host.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  $$("[data-nav]").forEach((a) => {
    const target = a.getAttribute("href");
    const isActive = target === path;
    a.classList.toggle("bg-slate-900", isActive);
    a.classList.toggle("text-white", isActive);
    a.classList.toggle("hover:bg-slate-100", !isActive);
    a.classList.toggle("text-slate-700", !isActive);
  });
}

function toggleMobileSidebar(open) {
  const drawer = $("#mobileDrawer");
  const backdrop = $("#drawerBackdrop");
  if (!drawer || !backdrop) return;

  if (open) {
    drawer.classList.remove("-translate-x-full");
    backdrop.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  } else {
    drawer.classList.add("-translate-x-full");
    backdrop.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }
}

function initNotifications() {
  const bellBtn = $("#notifBtn");
  const panel = $("#notifPanel");
  const countEl = $("#notifCount");
  if (!bellBtn || !panel || !countEl) return;

  const render = () => {
    const items = readJSON(LS_KEYS.notifications, []);
    const unread = items.filter((n) => !n.read);

    countEl.textContent = String(unread.length);
    countEl.classList.toggle("hidden", unread.length === 0);

    const list = $("#notifList");
    list.innerHTML = "";

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "text-sm text-slate-500 py-8 text-center";
      empty.textContent = "No notifications yet.";
      list.appendChild(empty);
      return;
    }

    items.slice(0, 8).forEach((n) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className =
        "w-full text-left px-3 py-3 rounded-xl hover:bg-slate-50 transition flex gap-3";
      row.innerHTML = `
        <span class="mt-1 h-2.5 w-2.5 rounded-full ${n.read ? "bg-slate-200" : "bg-amber-400"}"></span>
        <span class="text-sm text-slate-700 leading-6">${escapeHtml(n.text)}</span>
      `;
      row.addEventListener("click", () => {
        const all = readJSON(LS_KEYS.notifications, []);
        const idx = all.findIndex((x) => x.id === n.id);
        if (idx >= 0) {
          all[idx].read = true;
          writeJSON(LS_KEYS.notifications, all);
          render();
        }
      });
      list.appendChild(row);
    });
  };

  const close = () => panel.classList.add("hidden");
  const open = () => {
    panel.classList.remove("hidden");
    render();
  };

  bellBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.contains("hidden") ? open() : close();
  });

  $("#markAllRead")?.addEventListener("click", () => {
    const items = readJSON(LS_KEYS.notifications, []);
    items.forEach((n) => (n.read = true));
    writeJSON(LS_KEYS.notifications, items);
    logActivity("notifications_mark_all_read");
    toast("All set", "All notifications marked as read.");
    close();
    render();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#notifPanel") && !e.target.closest("#notifBtn")) close();
  });

  render();
}

function initStickyHeaderShadow() {
  const header = $("#topHeader");
  if (!header) return;

  const onScroll = () => {
    const scrolled = window.scrollY > 6;
    header.classList.toggle("shadow-sm", scrolled);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setKPIs() {
  const vault = readJSON(LS_KEYS.vault, []);
  const contacts = readJSON(LS_KEYS.contacts, []);
  const capsules = readJSON(LS_KEYS.capsules, []);
  const { percent } = computeProgress();

  $("#kpiVault") && ($("#kpiVault").textContent = String(vault.length));
  $("#kpiContacts") && ($("#kpiContacts").textContent = String(contacts.length));
  $("#kpiCapsules") && ($("#kpiCapsules").textContent = String(capsules.length));
  $("#kpiProgress") && ($("#kpiProgress").textContent = `${percent}%`);
}

function setProgressUI() {
  const { percent, done, total } = computeProgress();
  const bar = $("#progressBar");
  const label = $("#progressLabel");
  const hint = $("#progressHint");

  if (bar) bar.style.width = `${percent}%`;
  if (label) label.textContent = `${percent}% complete`;
  if (hint) hint.textContent = `${done} of ${total} steps done`;
}

function initAutosavePulse() {
  const chip = $("#autosaveChip");
  if (!chip) return;

  setInterval(() => {
    chip.classList.add("ring-2", "ring-emerald-200");
    setTimeout(() => chip.classList.remove("ring-2", "ring-emerald-200"), 650);
  }, 10000);
}

/* ------------------------------
  Page-specific init
--------------------------------*/
function initDashboardPage() {
  setKPIs();
  setProgressUI();

  // Update "last updated" text on dashboard cards
  const plan = readJSON(LS_KEYS.plan, { updatedAt: nowISO() });
  $("#planUpdatedAt") && ($("#planUpdatedAt").textContent = formatNiceDate(plan.updatedAt));
}

function formatNiceDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "Recently";
  }
}
// ---- Smart Estate Intake (Dashboard widgets) ----
const ESTATE_KEY = "hl_estate_intake_v1";

function getEstateDraft() {
  return readJSON(ESTATE_KEY, {
    meta: { status: "draft", lastSavedAt: null, submittedAt: null },
    ui: { currentStep: 1 },
    assets: [],
    accounts: [],
    properties: [],
    documents: [],
  });
}

function computeEstateProgress(draft) {
  // 6 steps: Overview, Assets, Accounts, Properties, Documents, Review/Submit
  // Lightweight completion logic for dashboard:
  const hasAssets = (draft.assets || []).length > 0;
  const hasAccounts = (draft.accounts || []).length > 0;
  const hasProps = (draft.properties || []).length > 0;
  const hasDocs = (draft.documents || []).length > 0;

  // Score = overview(1) + each category present + docs present + review(submitted)
  // Keep simple for MVP.
  let score = 1;
  if (hasAssets) score++;
  if (hasAccounts) score++;
  if (hasProps) score++;
  if (hasDocs) score++;
  if (draft.meta?.status === "submitted") score++;

  const percent = Math.round((score / 6) * 100);
  const step = Math.min(Math.max(draft.ui?.currentStep || 1, 1), 6);
  return { percent, step };
}

function initEstateDashboardSection() {
  const lastSavedEl = document.getElementById("estateLastSaved");
  if (!lastSavedEl) return; // section not present

  const draft = getEstateDraft();
  const { percent, step } = computeEstateProgress(draft);

  const bar = $("#estateProgressBar");
  const label = $("#estateProgressLabel");
  const hint = $("#estateProgressHint");

  if (bar) bar.style.width = `${percent}%`;
  if (label) label.textContent = `${percent}% complete`;
  if (hint) hint.textContent = `Step ${step} of 6`;

  $("#estateAssetsCount") && ($("#estateAssetsCount").textContent = String((draft.assets || []).length));
  $("#estateAccountsCount") && ($("#estateAccountsCount").textContent = String((draft.accounts || []).length));
  $("#estatePropertiesCount") && ($("#estatePropertiesCount").textContent = String((draft.properties || []).length));
  $("#estateDocsCount") && ($("#estateDocsCount").textContent = String((draft.documents || []).length));

  lastSavedEl.textContent = draft.meta?.lastSavedAt ? formatNiceDate(draft.meta.lastSavedAt) : "Not yet";

  const resumeBtn = $("#estateResumeBtn");
  if (resumeBtn) {
    const stepAnchor = draft.ui?.currentStep ? `#step-${draft.ui.currentStep}` : "";
    resumeBtn.textContent = (draft.meta?.lastSavedAt ? "Resume intake →" : "Start intake →");
    resumeBtn.setAttribute("href", `estate-intake.html${stepAnchor}`);
  }

  $("#estateResetBtn")?.addEventListener("click", () => {
    localStorage.removeItem(ESTATE_KEY);
    toast("Reset complete", "Smart Estate Intake draft has been cleared.");
    initEstateDashboardSection();
  });
}

// Call this inside DOMContentLoaded after initDashboardPage
// In your boot block, add:
 // initEstateDashboardSection();
/* ------------------------------
  Boot
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  seedIfEmpty();
  setActiveNav();

  // mobile drawer
  $("#openDrawer")?.addEventListener("click", () => toggleMobileSidebar(true));
  $("#closeDrawer")?.addEventListener("click", () => toggleMobileSidebar(false));
  $("#drawerBackdrop")?.addEventListener("click", () => toggleMobileSidebar(false));

  initStickyHeaderShadow();
  initNotifications();
  initAutosavePulse();

  // detect page
  const page = location.pathname.split("/").pop() || "index.html";
  if (page === "index.html") {
  initDashboardPage();
  initEstateDashboardSection();
}
});

/* Tailwind keyframe helper (optional; no CSS file needed) */
const style = document.createElement("style");
style.textContent = `
@keyframes slideUp { from { transform: translateY(10px); opacity:.0 } to { transform: translateY(0); opacity:1 } }
`;
document.head.appendChild(style);