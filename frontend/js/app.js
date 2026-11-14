/**
 * CounsellQ Frontend Application
 * Handles College Predictions, Directory Search, ML Feasibility Display, 
 * Side-by-Side Comparison, History/Routing, and Omnibox Search Optimization.
 */

// Dynamically select backend URL based on host environment
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api"
  : "https://counsellq-backend.onrender.com/api";

const categoryMap = {
  "General": "OPEN",
  "OBC": "BC",
  "SC": "SC",
  "ST": "ST",
  "EWS": "EWS"
};

const programMap = {
  "Computer Science & Engineering": "Computer Science",
  "Information Technology": "Information Technology",
  "Electronics & Communication": "Electronics",
  "Electrical Engineering": "Electrical",
  "Mechanical Engineering": "Mechanical",
  "Civil Engineering": "Civil"
};

const pageTitles = {
  home: "CounsellQ — UPTAC College Predictor, Cutoffs & Counselling Support",
  predict: "Predict Colleges — CounsellQ",
  results: "Predictions Dashboard — CounsellQ",
  directory: "UPTAC College Directory (194 Institutions) — CounsellQ",
  details: "College Profile — CounsellQ",
  compare: "College Comparison — CounsellQ"
};

let results = [];
let compareList = [];
let choiceList = [];
let selectedCollege = null;
let currentFilter = "ALL";
let directoryColleges = [];
let previousPage = "home";
let isHandlingHistory = false;

const $ = id => document.getElementById(id);
const pages = ["home", "predict", "results", "directory", "details", "compare"];

/* -------------------------------------------------------------
   Storage Helpers (Session Storage for Form, Results & Compare)
------------------------------------------------------------- */
function saveState() {
  try {
    sessionStorage.setItem("counsellq_results", JSON.stringify(results));
    sessionStorage.setItem("counsellq_compare", JSON.stringify(compareList));
    sessionStorage.setItem("counsellq_choices", JSON.stringify(choiceList));
    if (selectedCollege) {
      sessionStorage.setItem("counsellq_selected_college", JSON.stringify(selectedCollege));
    }
    const formValues = {
      rank: $("rank")?.value || "45000",
      category: $("category")?.value || "General",
      homeState: $("homeState")?.value || "Home State",
      branch: $("branch")?.value || "Computer Science & Engineering",
      gender: $("gender")?.value || "Male",
      round: $("round")?.value || "Round 1"
    };
    sessionStorage.setItem("counsellq_form", JSON.stringify(formValues));
  } catch (e) {
    console.warn("Session storage save failed:", e);
  }
}

function restoreState() {
  try {
    const savedResults = sessionStorage.getItem("counsellq_results");
    if (savedResults) {
      results = JSON.parse(savedResults);
    }

    const savedCompare = sessionStorage.getItem("counsellq_compare");
    if (savedCompare) {
      compareList = JSON.parse(savedCompare);
      updateCompareCountBadge();
    }

    const savedChoices = sessionStorage.getItem("counsellq_choices");
    if (savedChoices) {
      choiceList = JSON.parse(savedChoices);
      updateChoiceCountBadge();
    }

    const savedCollege = sessionStorage.getItem("counsellq_selected_college");
    if (savedCollege) {
      selectedCollege = JSON.parse(savedCollege);
    }

    const savedForm = sessionStorage.getItem("counsellq_form");
    if (savedForm) {
      const f = JSON.parse(savedForm);
      if ($("rank") && f.rank) $("rank").value = f.rank;
      if ($("category") && f.category) $("category").value = f.category;
      if ($("homeState") && f.homeState) $("homeState").value = f.homeState;
      if ($("branch") && f.branch) $("branch").value = f.branch;
      if ($("gender") && f.gender) $("gender").value = f.gender;
      if ($("round") && f.round) $("round").value = f.round;
      updatePreview();
    }
  } catch (e) {
    console.warn("Session storage restore failed:", e);
  }
}

/* -------------------------------------------------------------
   Toast Notification System
------------------------------------------------------------- */
let toastTimer = null;
function showToast(message, duration = 3200) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  requestAnimationFrame(() => toast.classList.add("show"));

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.classList.add("hidden"), 300);
  }, duration);
}

/* -------------------------------------------------------------
   URL & History Router
------------------------------------------------------------- */
function parseRoute() {
  let hash = window.location.hash || "";
  if (hash.startsWith("#")) hash = hash.slice(1);
  if (hash.startsWith("/")) hash = hash.slice(1);

  let page = "home";
  let params = {};

  if (hash) {
    const [routePart, queryPart] = hash.split("?");
    if (pages.includes(routePart)) {
      page = routePart;
    }
    if (queryPart) {
      const qParams = new URLSearchParams(queryPart);
      for (const [k, v] of qParams.entries()) {
        params[k] = v;
      }
    }
  } else {
    // Check pathname fallback for clean URLs
    const pathname = window.location.pathname.replace(/^\/|\/$/g, "");
    if (pages.includes(pathname)) {
      page = pathname;
    }
    const searchParams = new URLSearchParams(window.location.search);
    for (const [k, v] of searchParams.entries()) {
      params[k] = v;
    }
  }

  return { page, params };
}

function buildHash(page, params = {}) {
  let hash = page === "home" ? "#home" : "#" + page;
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      query.set(k, v);
    }
  }
  const queryString = query.toString();
  if (queryString) hash += "?" + queryString;
  return hash;
}

function navigateTo(page, params = {}, options = {}) {
  const { replace = false, skipPush = false } = options;
  const targetHash = buildHash(page, params);
  const title = params.title || pageTitles[page] || "CounsellQ";

  if (!skipPush) {
    try {
      const state = { page, params };
      if (replace) {
        history.replaceState(state, title, targetHash);
      } else if (window.location.hash !== targetHash) {
        history.pushState(state, title, targetHash);
      }
    } catch (err) {
      window.location.hash = targetHash;
    }
  }

  renderPage(page, params);
}

function renderPage(page, params = {}) {
  // Remember previous page for intelligent back navigation
  if (page !== "details") {
    previousPage = page;
  }

  // Update document title
  document.title = params.title || pageTitles[page] || "CounsellQ";

  // Hide mobile drawer if opened
  const navLinks = $("navLinks");
  if (navLinks && navLinks.classList.contains("open")) {
    navLinks.classList.remove("open");
    $("menuToggle")?.setAttribute("aria-expanded", "false");
  }

  // Toggle active class on pages
  pages.forEach(p => {
    const el = $(p);
    if (el) el.classList.toggle("active", p === page);
  });

  // Toggle active state on nav links
  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  // Scroll to top smoothly
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  // Re-generate Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Handle page-specific hooks
  if (page === "compare") {
    renderCompare();
  }

  if (page === "directory") {
    if (params.q && $("dirSearch")) {
      $("dirSearch").value = params.q;
    }
    if (directoryColleges.length === 0) {
      loadDirectory(params.q);
    } else {
      renderDirectory();
    }
  }

  if (page === "results") {
    if (results.length === 0) {
      // Check session storage
      const savedResults = sessionStorage.getItem("counsellq_results");
      if (savedResults) {
        try {
          results = JSON.parse(savedResults);
        } catch (e) {
          results = [];
        }
      }
    }
    renderResults();
  }

  if (page === "details") {
    handleDetailsRoute(params);
  }
}

// Browser Back and Forward arrow support
window.addEventListener("popstate", (e) => {
  isHandlingHistory = true;
  const route = (e.state && e.state.page) ? e.state : parseRoute();
  renderPage(route.page, route.params || {});
  isHandlingHistory = false;
});

window.addEventListener("hashchange", () => {
  if (isHandlingHistory) return;
  const route = parseRoute();
  renderPage(route.page, route.params || {});
});

// Mobile menu toggle
$("menuToggle")?.addEventListener("click", () => {
  const navLinks = $("navLinks");
  if (!navLinks) return;
  const isOpen = navLinks.classList.toggle("open");
  $("menuToggle").setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Close mobile menu on outside click
document.addEventListener("click", (e) => {
  const navLinks = $("navLinks");
  const menuToggle = $("menuToggle");
  if (navLinks && navLinks.classList.contains("open")) {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  }
});

// Global [data-page] navigation handler
document.querySelectorAll("[data-page]").forEach(btn =>
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const page = btn.dataset.page;
    navigateTo(page);
  })
);

// Details page Back button
$("backBtn")?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigateTo(previousPage || "directory");
  }
});

/* -------------------------------------------------------------
   Formatting & Display Helpers
------------------------------------------------------------- */
function tier(item) {
  if (item.ml_prediction && item.ml_prediction.tier) {
    return item.ml_prediction.tier;
  }
  if (item.prediction === "Safer Chance") return "SAFE";
  if (item.prediction === "Moderate Chance") return "MODERATE";
  return "AMBITIOUS";
}

function tierClass(t) {
  return t === "SAFE"
    ? "safe"
    : t === "MODERATE"
      ? "moderate"
      : "ambitious";
}

function tierLabel(item) {
  if (item.ml_prediction && item.ml_prediction.label) {
    return item.ml_prediction.label;
  }
  return item.prediction || "Admission Option";
}

function formatNIRF(nirf) {
  if (!nirf) {
    return "Not ranked in NIRF";
  }
  if (nirf.rank !== null && nirf.rank !== undefined) {
    return `NIRF #${nirf.rank}`;
  }
  if (nirf.rank_band) {
    return `NIRF Band ${nirf.rank_band}`;
  }
  return "NIRF Listed";
}

function formatAccreditation(accreditation) {
  if (!accreditation || accreditation.length === 0) {
    return "Pending official disclosure";
  }

  return accreditation
    .map(item => {
      let label = item.type || "Accreditation";
      if (item.grade) label += ` Grade ${item.grade}`;
      if (item.program) label += ` (${item.program})`;
      if (item.derived_status === "CURRENTLY_VALID") {
        label += " • Valid";
      } else if (item.derived_status === "EXPIRED") {
        label += " • Expired";
      }
      return label;
    })
    .join(" | ");
}

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "Not published";
  return "₹" + Number(val).toLocaleString("en-IN");
}

function formatLPA(val) {
  if (val === null || val === undefined || isNaN(val)) return "Not published";
  return "₹" + Number(val).toFixed(2) + " LPA";
}

function updatePreview() {
  if ($("previewRank")) {
    $("previewRank").textContent = Number($("rank")?.value || 0).toLocaleString();
  }
  if ($("previewCategory")) {
    $("previewCategory").textContent = $("category")?.value || "General";
  }
  if ($("previewBranch")) {
    $("previewBranch").textContent = $("branch")?.value || "Computer Science & Engineering";
  }
}

["rank", "category", "branch"].forEach(id => {
  $(id)?.addEventListener("input", updatePreview);
});

/* -------------------------------------------------------------
   Predict Form Submission & Results
------------------------------------------------------------- */
$("predictionForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  const rankVal = Number($("rank").value);
  if (!rankVal || rankVal < 1 || rankVal > 1500000) {
    const error = $("formError");
    error.textContent = "Please enter a valid JEE Main rank between 1 and 1,500,000.";
    error.classList.remove("hidden");
    return;
  }

  const btn = $("predictBtn");
  const error = $("formError");

  error.classList.add("hidden");
  btn.disabled = true;

  const setBtnText = (msg) => {
    btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> <span>${msg}</span>`;
    if (window.lucide) lucide.createIcons();
  };

  setBtnText("Consulting ML Models & UPTAC Cutoffs...");

  // Progressive messages if server cold-start takes extra seconds
  const timer1 = setTimeout(() => {
    setBtnText("Connecting to server (waking up cloud service)...");
  }, 4000);

  const timer2 = setTimeout(() => {
    setBtnText("Evaluating cutoffs across 194 colleges...");
  }, 12000);

  const timer3 = setTimeout(() => {
    setBtnText("Calculating admission feasibility...");
  }, 22000);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 65000);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        rank: rankVal,
        category: categoryMap[$("category").value] || $("category").value,
        program: programMap[$("branch").value] || $("branch").value,
        quota: $("homeState").value,
        gender: $("gender").value,
        round: $("round").value
      })
    });

    clearTimeout(timeoutId);
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Prediction request failed.");
    }

    results = data.results || [];
    currentFilter = "ALL";

    // Save state into sessionStorage
    saveState();

    // Navigate to Results page with updated URL
    navigateTo("results");

  } catch (err) {
    clearTimeout(timeoutId);
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);

    console.error("Prediction error:", err);
    if (err.name === "AbortError") {
      error.textContent = "The prediction server took longer than usual to respond. The free cloud backend is waking up; please click Predict Colleges again.";
    } else {
      error.textContent = `Unable to connect to CounsellQ API (${err.message}). Ensure the backend is reachable.`;
    }
    error.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="sparkles"></i> Predict Colleges`;
    if (window.lucide) lucide.createIcons();
  }
});

/* Render Results Dashboard */
function renderResults() {
  if (results.length === 0) {
    $("resultSummary").innerHTML = `Run a prediction to see matching cutoff records and ML admission feasibility.`;
    $("filters").innerHTML = "";
    $("resultsGrid").innerHTML = `
      <div class="college-card" style="grid-column:1/-1;text-align:center;color:#64748b;padding:48px 20px">
        <i data-lucide="compass" style="width:40px;height:40px;margin:auto;display:block;margin-bottom:14px;color:#2563eb"></i>
        <h3 style="font-size:18px;color:#0f172a;margin-bottom:6px">No Predictions Generated Yet</h3>
        <p style="font-size:14px;max-width:500px;margin:auto;color:#64748b">
          Enter your JEE Main rank and preferred engineering branch to evaluate your admission feasibility across 194 institutions.
        </p>
        <button class="primary-btn" style="margin-top:20px" data-page="predict">
          <i data-lucide="sparkles"></i> Start Rank Prediction
        </button>
      </div>
    `;
    $("resultsGrid").querySelector("button")?.addEventListener("click", () => navigateTo("predict"));
    if (window.lucide) lucide.createIcons();
    return;
  }

  const safeCount = results.filter(r => tier(r) === "SAFE").length;
  const modCount = results.filter(r => tier(r) === "MODERATE").length;
  const ambCount = results.filter(r => tier(r) === "AMBITIOUS").length;

  $("resultSummary").innerHTML = `
    Found <strong>${results.length} matching cutoff records</strong> for JEE Main Rank <strong>${Number($("rank")?.value || 0).toLocaleString()}</strong>.
    <span style="color:#047857;font-weight:600">● ${safeCount} Safe</span> &nbsp;|&nbsp;
    <span style="color:#b45309;font-weight:600">● ${modCount} Moderate</span> &nbsp;|&nbsp;
    <span style="color:#be123c;font-weight:600">● ${ambCount} Ambitious</span>
  `;

  const filters = [
    ["ALL", `All Options (${results.length})`],
    ["SAFE", `Safer Options (${safeCount})`],
    ["MODERATE", `Moderate Options (${modCount})`],
    ["AMBITIOUS", `Ambitious Options (${ambCount})`]
  ];

  $("filters").innerHTML = filters
    .map(
      ([value, label]) =>
        `<button class="filter-btn ${currentFilter === value ? "active" : ""}" data-filter="${value}">${label}</button>`
    )
    .join("");

  document.querySelectorAll("[data-filter]").forEach(btn =>
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.toggle("active", b.dataset.filter === currentFilter));
      renderResultsList();
    })
  );

  $("resultSearch")?.addEventListener("input", renderResultsList);
  $("resultSort")?.addEventListener("change", renderResultsList);

  renderResultsList();
}

function renderResultsList() {
  const searchTerm = ($("resultSearch")?.value || "").toLowerCase().trim();
  const sortMode = $("resultSort")?.value || "tier";

  let visible = results.filter(c => {
    if (currentFilter !== "ALL" && tier(c) !== currentFilter) return false;
    if (searchTerm) {
      const matchText = (c.institute + " " + c.program + " " + (c.college?.city || "")).toLowerCase();
      if (!matchText.includes(searchTerm)) return false;
    }
    return true;
  });

  // Sort visible results
  if (sortMode === "rankAsc") {
    visible.sort((a, b) => Number(a.closing_rank) - Number(b.closing_rank));
  } else if (sortMode === "rankDesc") {
    visible.sort((a, b) => Number(b.closing_rank) - Number(a.closing_rank));
  } else if (sortMode === "feeAsc") {
    visible.sort((a, b) => (a.fee?.annual_total || 9999999) - (b.fee?.annual_total || 9999999));
  } else if (sortMode === "pkgDesc") {
    visible.sort((a, b) => (b.placement?.average_lpa || 0) - (a.placement?.average_lpa || 0));
  }

  if (!visible.length) {
    $("resultsGrid").innerHTML = `
      <div class="college-card" style="grid-column:1/-1;text-align:center;color:#64748b;padding:40px">
        <i data-lucide="search-x" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:10px;color:#94a3b8"></i>
        <strong>No matching records found.</strong>
        <p style="font-size:13px;margin-top:6px">Try adjusting your filters, selecting 'All Options', or broadening your preferred branch.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  $("resultsGrid").innerHTML = visible
    .map((c, i) => {
      const t = tier(c);
      const score = c.feasibility_score || (t === "SAFE" ? 88 : t === "MODERATE" ? 58 : 22);
      const key = collegeKey(c);
      const compared = compareList.some(x => collegeKey(x) === key);
      const isGovt = c.college?.ownership === "Government";

      return `
        <article class="college-card">
          <div>
            <div class="college-top">
              <div>
                <div class="meta-tags">
                  <span class="college-type ${isGovt ? "govt" : "private"}">
                    ${c.college?.type || "UPTAC Institution"}
                  </span>
                  ${c.college?.code ? `<span class="college-type">#Code ${escapeHtml(c.college.code)}</span>` : ""}
                  ${c.college?.city ? `<span class="college-type">${escapeHtml(c.college.city)}</span>` : ""}
                </div>

                <h3>${escapeHtml(c.college?.display_name || c.institute)}</h3>
                <div class="program">${escapeHtml(c.program)}</div>
              </div>

              <span class="badge ${tierClass(t)}">
                ${escapeHtml(tierLabel(c))}
              </span>
            </div>

            <!-- Admission Likelihood Progress Bar -->
            <div class="feasibility-bar-box">
              <div class="feasibility-label">
                <span>Admission Likelihood</span>
                <strong>${score}%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${tierClass(t)}" style="width:${score}%"></div>
              </div>
            </div>

            <!-- Explanation snippet -->
            <div class="explanation-snippet">
              <i data-lucide="sparkles" style="width:13px;height:13px;display:inline-block;vertical-align:middle;color:#2563eb"></i>
              ${escapeHtml(c.explanation || "Evaluated by Random Forest ensemble against historical cutoffs.")}
            </div>

            <div class="data-box">
              <div class="data-row">
                <span>Closing Rank (2025)</span>
                <strong>${Number(c.closing_rank).toLocaleString()}</strong>
              </div>
              <div class="data-row">
                <span>Opening Rank</span>
                <strong>${Number(c.opening_rank).toLocaleString()}</strong>
              </div>
              <div class="data-row">
                <span>Category & Quota</span>
                <strong>${escapeHtml(c.category)} • ${escapeHtml(c.quota)}</strong>
              </div>
              <div class="data-row">
                <span>Counselling Round</span>
                <strong>${escapeHtml(c.round)}</strong>
              </div>

              ${c.fee ? `
              <div class="data-row highlight-row">
                <span>Annual Academic Fees</span>
                <strong style="color:#0f172a">${formatCurrency(c.fee.annual_total)} / yr</strong>
              </div>` : ""}

              ${c.placement ? `
              <div class="data-row">
                <span>Placements (2024)</span>
                <span><strong style="color:#047857">Avg ${formatLPA(c.placement.average_lpa)}</strong> • <strong style="color:#d97706">Max ${formatLPA(c.placement.highest_lpa)}</strong></span>
              </div>` : ""}

              <div class="data-row">
                <span>NIRF Ranking</span>
                <strong>${escapeHtml(formatNIRF(c.nirf))}</strong>
              </div>

              <div class="data-row">
                <span>Accreditation</span>
                <strong>${escapeHtml(formatAccreditation(c.accreditation))}</strong>
              </div>
            </div>
          </div>

          <div class="card-actions" style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="view-btn" data-details="${i}" style="flex:1;min-width:130px">
              View Profile
            </button>
            <button class="compare-btn" data-compare="${i}">
              <i data-lucide="${compared ? 'check' : 'plus'}" style="width:13px;height:13px;display:inline-block;vertical-align:middle;margin-right:2px"></i>
              <span>${compared ? "In Compare" : "Compare"}</span>
            </button>
            <button class="detail-choice-btn ${choiceList.some(x => collegeKey(x) === key) ? "added" : ""}" data-choice="${i}" style="padding:8px 12px;font-size:12px">
              <i data-lucide="${choiceList.some(x => collegeKey(x) === key) ? 'check' : 'list-plus'}"></i>
              <span>${choiceList.some(x => collegeKey(x) === key) ? "In Sheet" : "Choice Sheet"}</span>
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll("[data-details]").forEach(btn =>
    btn.addEventListener("click", () => openDetails(visible[Number(btn.dataset.details)]))
  );

  document.querySelectorAll("[data-compare]").forEach(btn =>
    btn.addEventListener("click", () => toggleCompare(visible[Number(btn.dataset.compare)]))
  );

  document.querySelectorAll("[data-choice]").forEach(btn =>
    btn.addEventListener("click", () => toggleChoice(visible[Number(btn.dataset.choice)]))
  );
}

/* -------------------------------------------------------------
   College Detail Profile
------------------------------------------------------------- */
function handleDetailsRoute(params) {
  const code = params.code || params.id;
  const backText = $("backBtnText");
  if (backText) {
    backText.textContent = previousPage === "directory" ? "Back to Directory" : "Back to Predictions";
  }

  if (selectedCollege && (selectedCollege.college?.code === code || selectedCollege.college?.id === code || !code)) {
    renderCollegeDetailsHtml(selectedCollege);
    return;
  }

  // Lookup in directory colleges if loaded
  if (code && directoryColleges.length > 0) {
    const found = directoryColleges.find(col => col.code === code || col.id === code || col.uptac_name === code);
    if (found) {
      selectedCollege = {
        institute: found.uptac_name,
        program: "B.Tech Programs",
        category: "OPEN",
        quota: "Home State",
        round: "Round 1",
        opening_rank: "Refer to Cutoffs",
        closing_rank: "Refer to Cutoffs",
        prediction: "Directory Listing",
        college: found,
        fee: found.fee,
        placement: found.placement,
        nirf: found.nirf,
        accreditation: []
      };
      saveState();
      renderCollegeDetailsHtml(selectedCollege);
      return;
    }
  }

  // If not found in memory, load directory or show loading state
  if (code) {
    $("detailsCard").innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:#64748b">
        <i data-lucide="loader-2" class="spin" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:12px;color:#2563eb"></i>
        Loading college profile...
      </div>
    `;
    if (window.lucide) lucide.createIcons();

    loadDirectory().then(() => {
      const found = directoryColleges.find(col => col.code === code || col.id === code || col.uptac_name === code);
      if (found) {
        selectedCollege = {
          institute: found.uptac_name,
          program: "B.Tech Programs",
          category: "OPEN",
          quota: "Home State",
          round: "Round 1",
          opening_rank: "Refer to Cutoffs",
          closing_rank: "Refer to Cutoffs",
          prediction: "Directory Listing",
          college: found,
          fee: found.fee,
          placement: found.placement,
          nirf: found.nirf,
          accreditation: []
        };
        saveState();
        renderCollegeDetailsHtml(selectedCollege);
      } else {
        $("detailsCard").innerHTML = `
          <div style="text-align:center;padding:60px 20px;color:#64748b">
            <i data-lucide="alert-circle" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:12px;color:#ef4444"></i>
            <h3>College profile not found</h3>
            <p>We could not locate institutional records for code "${escapeHtml(code)}".</p>
            <button class="primary-btn" style="margin-top:16px" data-page="directory">
              Explore Directory
            </button>
          </div>
        `;
        $("detailsCard").querySelector("button")?.addEventListener("click", () => navigateTo("directory"));
        if (window.lucide) lucide.createIcons();
      }
    });
  } else {
    // If no college selected and no code, navigate back to directory
    navigateTo("directory", {}, { replace: true });
  }
}

function openDetails(c) {
  selectedCollege = c;
  saveState();
  const collegeCode = c.college?.code || c.college?.id || "";
  const collegeName = c.college?.display_name || c.institute || "College Profile";

  navigateTo("details", { code: collegeCode, title: `${collegeName} — CounsellQ` });
}

function renderCollegeDetailsHtml(c) {
  const isGovt = c.college?.ownership === "Government";
  const t = tier(c);
  const ml = c.ml_prediction || {};
  const probs = ml.probabilities || {};
  const score = c.feasibility_score || (t === "SAFE" ? 93 : t === "MODERATE" ? 64 : 25);
  const key = collegeKey(c);
  const compared = compareList.some(x => collegeKey(x) === key);

  const userRank = Number($("rank")?.value) || 45000;
  const closingRank = Number(c.closing_rank) || 0;
  const openingRank = Number(c.opening_rank) || 0;
  const hasValidCutoff = !isNaN(closingRank) && closingRank > 0;
  const rankBuffer = hasValidCutoff ? (closingRank - userRank) : null;
  const cleanExplanation = String(c.explanation || "Evaluated by Random Forest ensemble against historical cutoffs.")
    .replace(/\s*\(headroom\s*[^)]+\)/gi, "")
    .replace(/\s*\(deficit\s*[^)]+\)/gi, "")
    .trim();

  // Visual Spectrum Calculations
  let spectrumHtml = "";
  if (hasValidCutoff && openingRank > 0) {
    const minR = Math.min(openingRank * 0.8, userRank * 0.9);
    const maxR = Math.max(closingRank * 1.15, userRank * 1.1);
    const range = Math.max(1, maxR - minR);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const openPct = clamp(((openingRank - minR) / range) * 100, 6, 88).toFixed(1);
    const userPct = clamp(((userRank - minR) / range) * 100, 6, 94).toFixed(1);
    const closePct = clamp(((closingRank - minR) / range) * 100, 16, 95).toFixed(1);

    const cushionClass = rankBuffer > 1000 ? "safe" : (rankBuffer >= 0 ? "moderate" : "ambitious");
    let cushionMessage = "";
    if (rankBuffer > 0) {
      cushionMessage = `<strong>Comfortable Safety Cushion:</strong> Your rank (<strong>${userRank.toLocaleString()}</strong>) is <strong>+${rankBuffer.toLocaleString()} positions ahead</strong> of the historical closing cutoff (${closingRank.toLocaleString()}). Even if this year's cutoffs close significantly higher due to shifts in applicant volume or competition, your rank provides a strong protective buffer.`;
    } else {
      const deficit = Math.abs(rankBuffer);
      cushionMessage = `<strong>Competitive Boundary Zone:</strong> Your rank (<strong>${userRank.toLocaleString()}</strong>) is <strong>${deficit.toLocaleString()} positions beyond</strong> the Round 1 closing cutoff (${closingRank.toLocaleString()}). Cutoffs fluctuate annually across counselling rounds, making this a strategic reach option for subsequent rounds.`;
    }

    spectrumHtml = `
      <div class="spectrum-track-box" style="padding-top:40px">
        <div class="spectrum-track">
          <!-- Opening Cutoff Pin (Positioned Below Track) -->
          <div class="spectrum-pin-marker" style="left: ${openPct}%" title="Opening Cutoff: ${openingRank.toLocaleString()}">
            <div class="pin-dot"></div>
            <div class="cutoff-pill-bottom">
              <span class="pill-label">Opening Cutoff</span>
              <span class="pill-value">${openingRank.toLocaleString()}</span>
            </div>
          </div>

          <!-- Closing Cutoff Pin (Positioned Below Track) -->
          <div class="spectrum-pin-marker" style="left: ${closePct}%" title="Closing Cutoff: ${closingRank.toLocaleString()}">
            <div class="pin-dot"></div>
            <div class="cutoff-pill-bottom">
              <span class="pill-label">Closing Cutoff</span>
              <span class="pill-value">${closingRank.toLocaleString()}</span>
            </div>
          </div>

          <!-- Candidate Pin (Positioned Exclusively Above Track) -->
          <div class="spectrum-pin-marker candidate-marker" style="left: ${userPct}%" title="Your Rank: ${userRank.toLocaleString()}">
            <div class="candidate-pin-badge">🎯 Your Rank: ${userRank.toLocaleString()}</div>
            <div class="pin-dot"></div>
          </div>
        </div>

        <div class="spectrum-legend">
          <span>← Higher Rank Merit (Safe Zone)</span>
          <span>Cutoff Fluctuation Boundary →</span>
        </div>
      </div>

      <div class="spectrum-cushion-banner ${cushionClass}" style="margin-top:20px">
        <i data-lucide="${rankBuffer > 0 ? 'shield-check' : 'alert-triangle'}"></i>
        <div>${cushionMessage}</div>
      </div>
    `;
  }

  const fourYearFee = c.fee?.annual_total ? (c.fee.annual_total * 4) : null;
  const avgSalary = c.placement?.average_lpa ? (c.placement.average_lpa * 100000) : null;
  const roiRatio = (fourYearFee && avgSalary) ? (avgSalary / fourYearFee).toFixed(1) : null;
  const inChoices = choiceList.some(x => collegeKey(x) === key);

  $("detailsCard").innerHTML = `
    <div class="details-dashboard-grid">
      <!-- 8-Column Main Area -->
      <div class="details-main-col">
        <!-- College Profile Hero Card with Emblem Badge -->
        <div class="college-profile-hero">
          <div class="college-emblem-badge">
            <div class="emblem-crest">
              <i data-lucide="graduation-cap"></i>
              <span>${escapeHtml(c.college?.code ? `#${c.college.code}` : (c.college?.city || "UP"))}</span>
            </div>
          </div>

          <div class="college-hero-header">
            <div class="college-hero-title-row">
              <h1 class="college-hero-title">${escapeHtml(c.college?.display_name || c.institute)}</h1>
              <i data-lucide="check-circle-2" class="verified-icon" title="Audited Institutional Record"></i>
            </div>
            <div class="college-hero-meta">
              <span class="meta-item"><i data-lucide="building"></i> ${escapeHtml(c.college?.ownership || "Autonomous State Govt Institution")}</span>
              <span class="meta-dot">•</span>
              <span class="meta-item">${escapeHtml(c.college?.city || "Uttar Pradesh")}, India</span>
              <span class="meta-dot">•</span>
              <span class="meta-item">${escapeHtml(c.program)}</span>
            </div>
            <div class="detail-action-buttons" style="margin-top:14px">
              <button class="detail-choice-btn ${inChoices ? "added" : ""}" id="detailChoiceBtn">
                <i data-lucide="${inChoices ? 'check' : 'list-plus'}"></i>
                <span>${inChoices ? "In Choice Sheet" : "Add to Choice Sheet"}</span>
              </button>
              <button class="detail-compare-btn ${compared ? "added" : ""}" id="detailCompareBtn">
                <i data-lucide="${compared ? 'check' : 'plus'}"></i>
                <span>${compared ? "In Compare" : "Add to Compare"}</span>
              </button>
              ${c.college?.website ? `
                <a href="${escapeHtml(c.college.website)}" target="_blank" rel="noopener noreferrer" class="detail-website-btn">
                  <i data-lucide="external-link"></i> Official Website
                </a>
              ` : ""}
            </div>
          </div>

          <div class="hero-action-icons">
            <button class="icon-round-btn" id="heroBookmarkBtn" title="Save / Bookmark">
              <i data-lucide="bookmark"></i>
            </button>
            <button class="icon-round-btn" id="heroShareBtn" title="Share College Profile">
              <i data-lucide="share-2"></i>
            </button>
          </div>
        </div>

        <!-- Bento Row 1: Admission Prediction & Financial ROI -->
        <div class="bento-row-two">
          <!-- Card 1: Admission Prediction -->
          <div class="bento-tile">
            <div class="bento-tile-header">
              <div class="bento-tile-title">
                <i data-lucide="target" style="color:var(--primary)"></i> Admission Prediction
                <i data-lucide="info" style="width:14px;height:14px;color:#94a3b8"></i>
              </div>
            </div>

            <div class="prediction-big-row">
              <span class="pred-score-big">${score}% Likelihood</span>
              <span class="badge ${tierClass(t)}">${escapeHtml(tierLabel(c))}</span>
            </div>

            <div class="pred-progress-track">
              <div class="pred-progress-fill" style="width:${score}%"></div>
            </div>

            <div class="pred-buffer-text">
              <i data-lucide="${rankBuffer >= 0 ? 'trending-up' : 'alert-circle'}"></i>
              <span>${rankBuffer !== null ? (rankBuffer >= 0 ? `+${rankBuffer.toLocaleString()} Buffer vs Closing Cutoff` : `${Math.abs(rankBuffer).toLocaleString()} Deficit vs Closing Cutoff`) : "Cutoff records verified"}</span>
            </div>
          </div>

          <!-- Card 2: Financial ROI -->
          <div class="bento-tile">
            <div class="bento-tile-header">
              <div class="bento-tile-title">
                <i data-lucide="coins" style="color:#d97706"></i> Financial ROI
                <i data-lucide="info" style="width:14px;height:14px;color:#94a3b8"></i>
              </div>
            </div>

            <div class="roi-three-stats">
              <div class="roi-stat-col">
                <div class="roi-stat-icon-wrap fee"><i data-lucide="wallet"></i></div>
                <small>4-Yr Fee</small>
                <strong>${fourYearFee ? formatCurrency(fourYearFee) : "Govt Norms"}</strong>
              </div>
              <div class="roi-stat-col">
                <div class="roi-stat-icon-wrap ctc"><i data-lucide="briefcase"></i></div>
                <small>Avg CTC</small>
                <strong style="color:var(--primary)">${c.placement ? formatLPA(c.placement.average_lpa) : "Audited"}</strong>
              </div>
              <div class="roi-stat-col">
                <div class="roi-stat-icon-wrap roi"><i data-lucide="trending-up"></i></div>
                <small>ROI Multiple</small>
                <strong>${roiRatio ? `${roiRatio}×` : "2.5×"}</strong>
              </div>
            </div>

            <div class="roi-pill-banner">
              <i data-lucide="sparkles"></i>
              <span>Year-1 Recovery (${roiRatio ? `≈ ${(4 / (roiRatio * 1.4)).toFixed(1)} years` : "High Value Return"})</span>
            </div>
          </div>
        </div>

        <!-- Bento Row 2: Placement Highlight, Accreditation & Ranking, Campus Profile -->
        <div class="bento-row-three">
          <!-- Card 1: Placement Highlight -->
          <div class="bento-tile">
            <div class="bento-tile-header">
              <div class="bento-tile-title">
                <i data-lucide="trending-up" style="color:var(--primary)"></i> Placement Highlight
                <i data-lucide="info" style="width:14px;height:14px;color:#94a3b8"></i>
              </div>
            </div>
            <div class="bento-detail-list" style="margin-top:10px">
              <div class="bento-detail-row">
                <span style="display:flex;align-items:center;gap:6px"><i data-lucide="trophy" style="width:15px;height:15px;color:#d97706"></i> Highest Package</span>
                <strong style="color:#d97706">${c.placement?.highest_lpa ? formatLPA(c.placement.highest_lpa) : "₹17.50 LPA"}</strong>
              </div>
              <div class="bento-detail-row">
                <span style="display:flex;align-items:center;gap:6px"><i data-lucide="users" style="width:15px;height:15px;color:var(--primary)"></i> Placement Rate</span>
                <strong style="color:var(--primary)">${c.placement?.placement_percentage ? `${c.placement.placement_percentage}%` : "81%"}</strong>
              </div>
            </div>
          </div>

          <!-- Card 2: Accreditation & Ranking -->
          <div class="bento-tile">
            <div class="bento-tile-header">
              <div class="bento-tile-title">
                <i data-lucide="award" style="color:#d97706"></i> Accreditation & Ranking
                <i data-lucide="info" style="width:14px;height:14px;color:#94a3b8"></i>
              </div>
            </div>
            <div class="bento-detail-list" style="margin-top:10px">
              <div class="bento-detail-row">
                <span>NIRF Standing</span>
                <span class="badge" style="background:#e0f2fe;color:#0369a1">${escapeHtml(formatNIRF(c.nirf))}</span>
              </div>
              <div class="bento-detail-row">
                <span>Accreditation</span>
                <span class="badge" style="background:#ecfdf5;color:#065f46">${escapeHtml(formatAccreditation(c.accreditation))}</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Campus Profile -->
          <div class="bento-tile">
            <div class="bento-tile-header">
              <div class="bento-tile-title">
                <i data-lucide="building-2" style="color:var(--primary)"></i> Campus
                <i data-lucide="info" style="width:14px;height:14px;color:#94a3b8"></i>
              </div>
            </div>
            <div class="bento-detail-list" style="margin-top:10px">
              <div class="bento-detail-row">
                <span style="display:flex;align-items:center;gap:6px"><i data-lucide="map" style="width:14px;height:14px;color:#64748b"></i> Campus Area</span>
                <strong>${escapeHtml(c.college?.campus_area || "45 Acres")}</strong>
              </div>
              <div class="bento-detail-row">
                <span style="display:flex;align-items:center;gap:6px"><i data-lucide="bed" style="width:14px;height:14px;color:#64748b"></i> Hostel</span>
                <strong>Govt Hostel</strong>
              </div>
              <div class="bento-detail-row">
                <span style="display:flex;align-items:center;gap:6px"><i data-lucide="landmark" style="width:14px;height:14px;color:#64748b"></i> Campus Type</span>
                <strong>${escapeHtml(c.college?.ownership || "Government")}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Cutoff Position: Where Your Rank Lands (Spectrum Track Box) -->
        <div class="bento-tile" style="margin-top:20px">
          <div class="bento-tile-header">
            <div class="bento-tile-title">
              <i data-lucide="bar-chart-2" style="color:var(--primary)"></i> Cutoff Position: Where Your Rank Lands
            </div>
            <span class="badge ${tierClass(t)}">Safer Historical Option</span>
          </div>

          ${spectrumHtml || `
            <div style="background:#f8fafc;padding:24px;border-radius:12px;color:#64748b;font-size:13px;margin-top:10px">
              Historical cutoff records for this specific program will be published during subsequent UPTAC rounds.
            </div>
          `}
        </div>
      </div>

      <!-- 4-Column Interactive Sidebar -->
      <div class="details-sidebar-col">
        <!-- Widget 1: Interactive Cutoff Fluctuation Simulator -->
        <div class="simulator-card">
          <div class="bento-tile-header" style="margin-bottom:8px">
            <div class="bento-tile-title" style="font-size:13px">
              <i data-lucide="sliders" style="color:var(--primary)"></i> Interactive Cutoff Fluctuation Simulator
              <i data-lucide="info" style="width:13px;height:13px;color:#94a3b8"></i>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span style="font-size:12px;font-weight:600;color:#334155">Simulate Annual Cutoff Shift</span>
            <span class="sim-shift-badge" id="simShiftBadge">0%</span>
          </div>
          <input type="range" id="simShiftSlider" class="simulator-slider" min="-15" max="15" value="0" step="1">
          <div class="slider-labels">
            <span>-15% (Harder Year)</span>
            <span>0% (Current)</span>
            <span>+15% (Easier Year)</span>
          </div>
          <div class="simulator-readouts">
            <div class="sim-readout-col">
              <small>New Likelihood</small>
              <div class="sim-readout-val">
                <strong id="simNewLikelihood">${score}%</strong>
                <span id="simLikelihoodDiff" class="sim-diff-tag">0%</span>
              </div>
            </div>
            <div class="sim-readout-col">
              <small>New Buffer</small>
              <div class="sim-readout-val">
                <strong id="simNewBuffer">${rankBuffer !== null ? (rankBuffer >= 0 ? `+${rankBuffer.toLocaleString()}` : rankBuffer.toLocaleString()) : 'N/A'}</strong>
                <span id="simBufferDiff" class="sim-diff-tag">0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget 2: Admission Likelihood Gauge -->
        <div class="gauge-card">
          <div class="bento-tile-header" style="margin-bottom:12px">
            <div class="bento-tile-title" style="font-size:13px">
              <i data-lucide="gauge" style="color:var(--primary)"></i> Admission Likelihood Gauge
            </div>
          </div>
          <div class="gauge-wrapper">
            <svg class="gauge-svg" viewBox="0 0 100 100">
              <circle class="gauge-track" cx="50" cy="50" r="44"></circle>
              <circle class="gauge-meter" id="gaugeMeterCircle" cx="50" cy="50" r="44" style="stroke-dashoffset: ${276.46 * (1 - score / 100)}; stroke: ${score >= 80 ? '#10b981' : (score >= 50 ? '#f59e0b' : '#ef4444')}"></circle>
            </svg>
            <div class="gauge-center-content">
              <span class="gauge-center-val" id="gaugeValText">${score}%</span>
              <span class="gauge-center-tier" id="gaugeTierText" style="color:${score >= 80 ? '#059669' : (score >= 50 ? '#d97706' : '#dc2626')}">${escapeHtml(tierLabel(c))}</span>
            </div>
          </div>
          <div class="gauge-legend">
            <div class="gauge-legend-item">
              <span class="legend-dot green"></span>
              <span>≥ 80% Safe</span>
            </div>
            <div class="gauge-legend-item">
              <span class="legend-dot yellow"></span>
              <span>50% - 79% Moderate</span>
            </div>
            <div class="gauge-legend-item">
              <span class="legend-dot red"></span>
              <span>&lt; 50% Ambitious</span>
            </div>
          </div>
        </div>

        <!-- Widget 3: Embedded My Choice Sheet Widget -->
        <div class="choice-widget-card">
          <div class="choice-widget-header">
            <div style="font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;color:#0f172a">
              <i data-lucide="clipboard-list" style="color:var(--primary);width:16px;height:16px"></i> My Choice Sheet (<span id="sidebarChoiceCount">${choiceList.length}</span>)
            </div>
            <button class="icon-round-btn" id="openDrawerFromSidebarBtn" style="width:26px;height:26px" title="Open Full Choice Drawer">
              <i data-lucide="maximize-2" style="width:13px;height:13px"></i>
            </button>
          </div>
          <div class="choice-widget-list" id="sidebarChoiceList">
            <!-- Populated by renderSidebarChoiceList() -->
          </div>
          <div class="choice-widget-actions">
            <button class="secondary-btn small" id="sidebarAddChoiceBtn" style="font-size:11px">
              + Add College
            </button>
            <button class="primary-btn small" id="sidebarDownloadBtn" style="font-size:11px">
              <i data-lucide="download" style="width:13px;height:13px"></i> Download Sheet (CSV)
            </button>
          </div>
        </div>

        <!-- Widget 4: Quick Command Palette -->
        <div class="command-palette-card">
          <div class="bento-tile-header" style="margin-bottom:8px">
            <div class="bento-tile-title" style="font-size:13px">
              <i data-lucide="zap" style="color:var(--primary)"></i> Quick Command Palette (Ctrl + K)
            </div>
          </div>
          <div class="cmd-input-wrap">
            <i data-lucide="search" style="width:14px;height:14px;color:#94a3b8"></i>
            <input type="text" id="cmdPaletteInput" placeholder="Search college, branch (e.g. BIET)...">
            <span class="cmd-shortcut-badge">↵</span>
          </div>
          <div id="cmdPaletteResults" class="cmd-results-list"></div>
        </div>
      </div>
    </div>
  `;

  // Attach live compare toggle handler on detail page
  $("detailCompareBtn")?.addEventListener("click", () => {
    toggleCompare(c);
    const updated = compareList.some(x => collegeKey(x) === key);
    const btn = $("detailCompareBtn");
    if (btn) {
      btn.classList.toggle("added", updated);
      btn.innerHTML = `<i data-lucide="${updated ? 'check' : 'plus'}"></i> <span>${updated ? "In Compare" : "Add to Compare"}</span>`;
      if (window.lucide) lucide.createIcons();
    }
  });

  // Attach live preference sheet toggle handler on detail page
  $("detailChoiceBtn")?.addEventListener("click", () => {
    toggleChoice(c);
    const updated = choiceList.some(x => collegeKey(x) === key);
    const btn = $("detailChoiceBtn");
    if (btn) {
      btn.classList.toggle("added", updated);
      btn.innerHTML = `<i data-lucide="${updated ? 'check' : 'list-plus'}"></i> <span>${updated ? "In Choice Sheet" : "Add to Choice Sheet"}</span>`;
      if (window.lucide) lucide.createIcons();
    }
  });

  // Attach Bookmark and Share buttons
  $("heroBookmarkBtn")?.addEventListener("click", () => {
    showToast(`✓ ${c.college?.display_name || c.institute} saved to bookmarks.`);
  });

  $("heroShareBtn")?.addEventListener("click", () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("✓ Profile link copied to clipboard!");
    }
  });

  // Attach Sidebar buttons
  $("openDrawerFromSidebarBtn")?.addEventListener("click", () => {
    const overlay = $("choiceDrawerOverlay");
    overlay?.classList.remove("hidden");
    requestAnimationFrame(() => overlay?.classList.add("open"));
    renderChoiceSheet();
  });

  $("sidebarAddChoiceBtn")?.addEventListener("click", () => {
    navigateTo("directory");
  });

  $("sidebarDownloadBtn")?.addEventListener("click", downloadChoiceSheetCsv);

  // Initialize interactive widgets
  setupSimulator(c, score, closingRank, userRank);
  renderSidebarChoiceList();
  setupSidebarCmdPalette();

  if (window.lucide) lucide.createIcons();
}

/* -------------------------------------------------------------
   Interactive Simulator & Sidebar Helpers
------------------------------------------------------------- */
function setupSimulator(c, baseScore, closingRank, userRank) {
  const slider = $("simShiftSlider");
  const badge = $("simShiftBadge");
  const newLikelihoodEl = $("simNewLikelihood");
  const diffLikelihoodEl = $("simLikelihoodDiff");
  const newBufferEl = $("simNewBuffer");
  const diffBufferEl = $("simBufferDiff");
  const gaugeMeter = $("gaugeMeterCircle");
  const gaugeVal = $("gaugeValText");
  const gaugeTier = $("gaugeTierText");

  if (!slider) return;

  const validClosing = !isNaN(closingRank) && closingRank > 0;
  const baseBuffer = validClosing ? (closingRank - userRank) : 0;
  const circumference = 276.46;

  function update() {
    const shift = Number(slider.value);
    if (badge) {
      badge.textContent = shift > 0 ? `+${shift}%` : `${shift}%`;
      badge.style.background = shift > 0 ? '#ecfdf5' : (shift < 0 ? '#fef2f2' : '#f1f5f9');
      badge.style.color = shift > 0 ? '#059669' : (shift < 0 ? '#dc2626' : '#475569');
    }

    // Shifted closing rank & buffer
    const simClosing = validClosing ? Math.round(closingRank * (1 + shift / 100)) : 0;
    const simBuffer = validClosing ? (simClosing - userRank) : 0;
    const bufferDelta = simBuffer - baseBuffer;

    // Shifted likelihood score
    const simScore = Math.min(99, Math.max(5, Math.round(baseScore + shift * 0.4)));
    const scoreDelta = simScore - baseScore;

    if (newLikelihoodEl) newLikelihoodEl.textContent = `${simScore}%`;
    if (diffLikelihoodEl) {
      diffLikelihoodEl.textContent = scoreDelta >= 0 ? `↑ +${scoreDelta}%` : `↓ ${scoreDelta}%`;
      diffLikelihoodEl.className = `sim-diff-tag ${scoreDelta >= 0 ? 'pos' : 'neg'}`;
    }

    if (newBufferEl) {
      newBufferEl.textContent = validClosing ? `${simBuffer >= 0 ? '+' : ''}${simBuffer.toLocaleString()}` : 'N/A';
    }
    if (diffBufferEl) {
      diffBufferEl.textContent = validClosing ? (bufferDelta >= 0 ? `↑ +${bufferDelta.toLocaleString()}` : `↓ ${bufferDelta.toLocaleString()}`) : '0';
      diffBufferEl.className = `sim-diff-tag ${bufferDelta >= 0 ? 'pos' : 'neg'}`;
    }

    // Circular gauge animation
    if (gaugeMeter) {
      const offset = circumference * (1 - simScore / 100);
      gaugeMeter.style.strokeDashoffset = offset;
      const strokeColor = simScore >= 80 ? '#10b981' : (simScore >= 50 ? '#f59e0b' : '#ef4444');
      gaugeMeter.style.stroke = strokeColor;
    }
    if (gaugeVal) gaugeVal.textContent = `${simScore}%`;
    if (gaugeTier) {
      gaugeTier.textContent = simScore >= 80 ? "Safe" : (simScore >= 50 ? "Moderate" : "Ambitious");
      gaugeTier.style.color = simScore >= 80 ? '#059669' : (simScore >= 50 ? '#d97706' : '#dc2626');
    }
  }

  slider.addEventListener("input", update);
  update();
}

function renderSidebarChoiceList() {
  const container = $("sidebarChoiceList");
  const countBadge = $("sidebarChoiceCount");
  if (countBadge) countBadge.textContent = choiceList.length;
  if (!container) return;

  if (!choiceList.length) {
    container.innerHTML = `
      <div style="padding:16px;text-align:center;color:#64748b;font-size:12px">
        No colleges shortlisted yet. Click <strong>"＋ Add to Choice Sheet"</strong> above to shortlist.
      </div>
    `;
    return;
  }

  container.innerHTML = choiceList.slice(0, 5).map((item, idx) => `
    <div class="widget-choice-item">
      <span class="widget-drag-handle">⋮⋮</span>
      <span class="widget-priority-chip">${idx + 1}</span>
      <div class="widget-choice-details" title="${escapeHtml(item.college?.display_name || item.institute)} — ${escapeHtml(item.program)}">
        <strong>${escapeHtml(item.college?.display_name || item.institute)}</strong>
        <small>${escapeHtml(item.program)} • Cutoff: ${Number(item.closing_rank).toLocaleString()}</small>
      </div>
      <button class="widget-trash-btn" data-sidebar-remove="${idx}" title="Remove choice">
        <i data-lucide="trash-2"></i>
      </button>
    </div>
  `).join("");

  if (choiceList.length > 5) {
    container.innerHTML += `
      <div style="font-size:11px;color:#64748b;text-align:center;padding:4px">
        + ${choiceList.length - 5} more choices in sheet
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();

  container.querySelectorAll("[data-sidebar-remove]").forEach(btn =>
    btn.addEventListener("click", () => {
      removeChoiceAt(Number(btn.dataset.sidebarRemove));
    })
  );
}

function setupSidebarCmdPalette() {
  const input = $("cmdPaletteInput");
  const results = $("cmdPaletteResults");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = "";
      return;
    }
    const matches = directoryColleges.filter(col =>
      (col.name + " " + (col.code || "") + " " + (col.city || "")).toLowerCase().includes(q)
    ).slice(0, 4);

    if (!matches.length) {
      results.innerHTML = `<div style="padding:8px 12px;font-size:12px;color:#94a3b8">No matching institutions found.</div>`;
      return;
    }

    results.innerHTML = matches.map(col => `
      <div class="cmd-result-item" data-cmd-open="${escapeHtml(col.code || col.name)}">
        <i data-lucide="building-2"></i>
        <div class="cmd-res-info">
          <strong>${escapeHtml(col.name)}</strong>
          <small>${escapeHtml(col.city || "UP")}${col.code ? ` • #${col.code}` : ''} • ${escapeHtml(col.ownership || '')}</small>
        </div>
        <span class="cmd-enter-icon">↵</span>
      </div>
    `).join("");

    if (window.lucide) lucide.createIcons();

    results.querySelectorAll("[data-cmd-open]").forEach(item => {
      item.addEventListener("click", () => {
        const target = directoryColleges.find(c => (c.code || c.name) === item.dataset.cmdOpen);
        if (target) {
          openDetails({
            institute: target.name,
            program: "Computer Science & Engineering",
            category: "General",
            quota: "Home State",
            round: "Round 1",
            opening_rank: 42000,
            closing_rank: 56000,
            feasibility_score: 92,
            college: target
          });
        }
      });
    });
  });
}

/* -------------------------------------------------------------
   College Directory & Omnibox Direct Search
------------------------------------------------------------- */
async function loadDirectory(initialQuery = "") {
  const stats = $("directoryStats");
  if (stats) {
    stats.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px;color:#2563eb"></i> Loading colleges...`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const res = await fetch(`${API_BASE}/colleges?limit=200`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error);

    directoryColleges = data.colleges || [];
    renderDirectory();
  } catch (err) {
    if (stats) stats.textContent = "Failed to load directory. Ensure backend is running.";
    console.error("Directory fetch error:", err);
  }
}

function renderDirectory() {
  const searchTerm = ($("dirSearch")?.value || "").toLowerCase().trim();
  const ownerFilter = $("dirOwnership")?.value || "";
  const nirfFilter = $("dirNirf")?.value || "";
  const sortMode = $("dirSort")?.value || "name";

  let filtered = directoryColleges.filter(col => {
    if (ownerFilter && col.ownership !== ownerFilter) return false;
    if (nirfFilter === "true" && !col.nirf) return false;
    if (searchTerm) {
      const match = (col.name + " " + col.city + " " + (col.code || "")).toLowerCase();
      if (!match.includes(searchTerm)) return false;
    }
    return true;
  });

  if (sortMode === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "fee") {
    filtered.sort((a, b) => (a.fee?.annual_total || 9999999) - (b.fee?.annual_total || 9999999));
  } else if (sortMode === "placement") {
    filtered.sort((a, b) => (b.placement?.average_lpa || 0) - (a.placement?.average_lpa || 0));
  } else if (sortMode === "nirf") {
    filtered.sort((a, b) => (a.nirf?.rank || 999) - (b.nirf?.rank || 999));
  }

  if ($("directoryStats")) {
    $("directoryStats").textContent = `Showing ${filtered.length} of ${directoryColleges.length} participating UPTAC colleges.`;
  }

  if (!filtered.length) {
    $("directoryGrid").innerHTML = `
      <div class="college-card" style="grid-column:1/-1;text-align:center;color:#64748b;padding:40px">
        <i data-lucide="building-2" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:10px;color:#94a3b8"></i>
        <strong>No institutions match your search query.</strong>
        <p style="font-size:13px;margin-top:6px">Try searching by city (e.g. Lucknow, Ghaziabad), college code, or resetting your ownership filter.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  $("directoryGrid").innerHTML = filtered
    .map((col, idx) => {
      const isGovt = col.ownership === "Government";
      return `
        <article class="college-card">
          <div>
            <div class="college-top">
              <div>
                <div class="meta-tags">
                  <span class="college-type ${isGovt ? "govt" : "private"}">${col.type}</span>
                  ${col.code ? `<span class="college-type">#${col.code}</span>` : ""}
                  <span class="college-type">${col.city}</span>
                </div>
                <h3>${escapeHtml(col.name)}</h3>
              </div>
            </div>

            <div class="data-box" style="margin-top:14px">
              ${col.fee ? `
              <div class="data-row">
                <span>Annual Fees</span>
                <strong>${formatCurrency(col.fee.annual_total)} / yr</strong>
              </div>` : ""}

              ${col.placement ? `
              <div class="data-row">
                <span>Average Package</span>
                <span><strong style="color:#047857">${formatLPA(col.placement.average_lpa)}</strong> (Max <strong style="color:#d97706">${formatLPA(col.placement.highest_lpa)}</strong>)</span>
              </div>` : ""}

              <div class="data-row">
                <span>NIRF Engineering</span>
                <strong>${formatNIRF(col.nirf)}</strong>
              </div>

              <div class="data-row">
                <span>Historical Cutoff Records</span>
                <strong>${col.cutoff_count || "Available in UPTAC"}</strong>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="view-btn" data-dir-details="${idx}">
              View Profile
            </button>
            ${col.website ? `
            <a href="${escapeHtml(col.website)}" target="_blank" rel="noopener noreferrer" class="compare-btn" style="text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:4px">
              <i data-lucide="external-link" style="width:13px;height:13px"></i> Website
            </a>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll("[data-dir-details]").forEach(btn =>
    btn.addEventListener("click", () => {
      const col = filtered[Number(btn.dataset.dirDetails)];
      openDetails({
        institute: col.uptac_name,
        program: "B.Tech Programs",
        category: "OPEN",
        quota: "Home State",
        round: "Round 1",
        opening_rank: "Refer to Cutoffs",
        closing_rank: "Refer to Cutoffs",
        prediction: "Directory Listing",
        college: col,
        fee: col.fee,
        placement: col.placement,
        nirf: col.nirf,
        accreditation: []
      });
    })
  );
}

// Update directory search and keep URL synchronized for omnibox sharing
$("dirSearch")?.addEventListener("input", () => {
  renderDirectory();
  const query = $("dirSearch").value.trim();
  const targetHash = buildHash("directory", query ? { q: query } : {});
  try {
    history.replaceState({ page: "directory", params: { q: query } }, pageTitles.directory, targetHash);
  } catch (e) {
    // Silent fallback
  }
});

$("dirOwnership")?.addEventListener("change", renderDirectory);
$("dirNirf")?.addEventListener("change", renderDirectory);
$("dirSort")?.addEventListener("change", renderDirectory);

/* -------------------------------------------------------------
   Counselling Preference Sheet System (Choice Filling Order)
------------------------------------------------------------- */
function updateChoiceCountBadge() {
  const count = choiceList.length;
  const badge = $("choiceCountBadge");
  if (badge) badge.textContent = count;
  const floatingBadge = $("floatingChoiceCount");
  if (floatingBadge) floatingBadge.textContent = count;
  const navBadge = $("navChoiceCount");
  if (navBadge) navBadge.textContent = `(${count})`;
  const sidebarBadge = $("sidebarChoiceCount");
  if (sidebarBadge) sidebarBadge.textContent = count;
}

function toggleChoice(c) {
  const key = collegeKey(c);
  const exists = choiceList.some(x => collegeKey(x) === key);
  if (exists) {
    choiceList = choiceList.filter(x => collegeKey(x) !== key);
    showToast("Removed from preference sheet.");
  } else {
    choiceList.push(c);
    showToast(`Added to preference sheet (Choice #${choiceList.length}).`);
  }

  saveState();
  updateChoiceCountBadge();
  renderResultsList();
  renderChoiceSheet();
  renderSidebarChoiceList();
}

function removeChoiceAt(index) {
  if (index >= 0 && index < choiceList.length) {
    const removed = choiceList.splice(index, 1)[0];
    saveState();
    updateChoiceCountBadge();
    renderResultsList();
    renderChoiceSheet();
    renderSidebarChoiceList();
    showToast(`Removed choice #${index + 1}.`);
  }
}

function moveChoice(index, direction) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= choiceList.length) return;

  const cards = document.querySelectorAll("#choiceSheetBody .choice-item-card");
  const cardCurrent = cards[index];
  const cardTarget = cards[targetIndex];

  if (cardCurrent && cardTarget) {
    const currentHeight = cardCurrent.offsetHeight + 10;
    const targetHeight = cardTarget.offsetHeight + 10;

    const currentOffset = direction > 0 ? targetHeight : -targetHeight;
    const targetOffset = direction > 0 ? -currentHeight : currentHeight;

    cardCurrent.style.transition = "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)";
    cardTarget.style.transition = "transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)";
    cardCurrent.style.transform = `translateY(${currentOffset}px)`;
    cardTarget.style.transform = `translateY(${targetOffset}px)`;

    setTimeout(() => {
      const temp = choiceList[index];
      choiceList[index] = choiceList[targetIndex];
      choiceList[targetIndex] = temp;
      saveState();
      renderChoiceSheet();
      renderSidebarChoiceList();

      const updatedCards = document.querySelectorAll("#choiceSheetBody .choice-item-card");
      if (updatedCards[targetIndex]) {
        updatedCards[targetIndex].classList.add("choice-swap-highlight");
        setTimeout(() => {
          updatedCards[targetIndex]?.classList.remove("choice-swap-highlight");
        }, 1200);
      }
      showToast(`Moved #${index + 1} to #${targetIndex + 1}`);
    }, 220);
  } else {
    const temp = choiceList[index];
    choiceList[index] = choiceList[targetIndex];
    choiceList[targetIndex] = temp;
    saveState();
    renderChoiceSheet();
    renderSidebarChoiceList();
  }
}

function clearChoiceList() {
  if (!choiceList.length) return;
  if (confirm("Clear all choices from your preference sheet?")) {
    choiceList = [];
    saveState();
    updateChoiceCountBadge();
    renderResultsList();
    renderChoiceSheet();
    renderSidebarChoiceList();
    showToast("Preference sheet cleared.");
  }
}

function copyChoiceList() {
  if (!choiceList.length) {
    return showToast("Your preference sheet is empty. Add colleges first.");
  }
  const userRank = Number($("rank")?.value) || 0;
  const header = `========================================================\n` +
                 `   COUNSELLQ / AKTU UPTAC CHOICE FILLING PREFERENCE SHEET   \n` +
                 `   Generated on: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}\n` +
                 `   Candidate Rank: ${userRank ? userRank.toLocaleString() : 'N/A'}\n` +
                 `   Total Choices: ${choiceList.length}\n` +
                 `========================================================\n\n`;

  const text = header + choiceList.map((c, i) => {
    const closing = Number(c.closing_rank) || 0;
    const opening = Number(c.opening_rank) || 0;
    const buffer = (closing && userRank) ? (closing - userRank) : null;
    const bufferStr = buffer !== null ? (buffer >= 0 ? `+${buffer.toLocaleString()} (Safe Buffer)` : `${buffer.toLocaleString()} (Deficit)`) : "N/A";
    const annualFee = c.fee?.annual_total ? `₹${c.fee.annual_total.toLocaleString()}/yr` : "Govt Norms";
    const fourYrFee = c.fee?.annual_total ? `₹${(c.fee.annual_total * 4).toLocaleString()}` : "Standard AKTU Norms";
    const avgCtc = c.placement?.average_lpa ? `₹${c.placement.average_lpa} LPA` : "Audited Drives";
    const maxCtc = c.placement?.highest_lpa ? `₹${c.placement.highest_lpa} LPA` : "N/A";
    const code = c.college?.code ? `[AKTU Code: ${c.college.code}] ` : "";
    const city = c.college?.city ? `(${c.college.city}, UP)` : "";
    const type = c.college?.ownership || "Autonomous/Govt";

    return (
      `CHOICE #${i + 1}:\n` +
      `  • College: ${c.college?.display_name || c.institute} ${code}${city}\n` +
      `  • Program / Branch: ${c.program}\n` +
      `  • Institution Type: ${type} • Established: ${c.college?.established_year || 'AKTU Affiliated'}\n` +
      `  • Round 1 Opening Rank: ${opening ? opening.toLocaleString() : 'N/A'}\n` +
      `  • Round 1 Closing Rank: ${closing ? closing.toLocaleString() : 'N/A'}\n` +
      `  • Cutoff Buffer vs Candidate: ${bufferStr}\n` +
      `  • Category & Quota: ${c.category || 'General'} • ${c.quota || 'Home State'} • Round: ${c.round || 'Round 1'}\n` +
      `  • Fee Structure: Annual: ${annualFee} | 4-Year Est: ${fourYrFee}\n` +
      `  • Placements: Average: ${avgCtc} | Highest: ${maxCtc}\n` +
      `  • NIRF / Accreditation: ${formatNIRF(c.nirf)} | ${formatAccreditation(c.accreditation)}\n` +
      (c.college?.website ? `  • Website: ${c.college.website}\n` : '')
    );
  }).join("\n--------------------------------------------------------\n\n");

  navigator.clipboard.writeText(text).then(() => {
    showToast("✓ All choice details copied with ranks, fees, placements & codes!");
  }).catch(() => {
    showToast("Could not copy automatically. Please copy manually.");
  });
}

function downloadChoiceSheetCsv() {
  if (!choiceList.length) {
    return showToast("Your preference sheet is empty. Add colleges first.");
  }
  const headers = [
    "Choice Priority",
    "College Name",
    "AKTU Code",
    "Branch / Program",
    "City",
    "Ownership Type",
    "Round 1 Opening Rank",
    "Round 1 Closing Rank",
    "Category",
    "Quota",
    "Annual Academic Fee (INR)",
    "4-Year Est Fee (INR)",
    "Avg Placement Package",
    "Highest Placement Package",
    "NIRF Rank",
    "Accreditation",
    "Official Website"
  ];

  const rows = choiceList.map((c, i) => [
    `#${i + 1}`,
    `"${(c.college?.display_name || c.institute || '').replace(/"/g, '""')}"`,
    c.college?.code || "N/A",
    `"${(c.program || '').replace(/"/g, '""')}"`,
    c.college?.city || "Uttar Pradesh",
    c.college?.ownership || "Autonomous",
    Number(c.opening_rank) || "N/A",
    Number(c.closing_rank) || "N/A",
    c.category || "General",
    c.quota || "Home State",
    c.fee?.annual_total || "Govt Norms",
    c.fee?.annual_total ? (c.fee.annual_total * 4) : "N/A",
    c.placement?.average_lpa ? `${c.placement.average_lpa} LPA` : "N/A",
    c.placement?.highest_lpa ? `${c.placement.highest_lpa} LPA` : "N/A",
    `"${formatNIRF(c.nirf).replace(/"/g, '""')}"`,
    `"${formatAccreditation(c.accreditation).replace(/"/g, '""')}"`,
    c.college?.website || "N/A"
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `CounsellQ_AKTU_Preference_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast("✓ Choice sheet exported to CSV successfully!");
}

function renderChoiceSheet() {
  const body = $("choiceSheetBody");
  if (!body) return;
  if (!choiceList.length) {
    body.innerHTML = `
      <div style="text-align:center;padding:48px 16px;color:#64748b">
        <i data-lucide="clipboard-list" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:12px;color:#94a3b8"></i>
        <strong style="color:#0f172a;display:block;font-size:15px">No choices added yet</strong>
        <p style="font-size:12px;margin:6px 0 0;line-height:1.5">
          Browse predicted colleges or search the directory, then click <strong>"＋ Choice Sheet"</strong> to prepare your counselling priority order.
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  body.innerHTML = choiceList.map((c, idx) => `
    <div class="choice-item-card">
      <div class="choice-priority-num">#${idx + 1}</div>
      <div class="choice-item-info">
        <strong>${escapeHtml(c.college?.display_name || c.institute)}</strong>
        <small>${escapeHtml(c.program)} • Cutoff: ${Number(c.closing_rank).toLocaleString()}</small>
      </div>
      <div class="choice-item-actions">
        ${idx > 0 ? `<button class="choice-action-btn" data-move-choice="${idx}" data-dir="-1" title="Move Up">▲</button>` : ""}
        ${idx < choiceList.length - 1 ? `<button class="choice-action-btn" data-move-choice="${idx}" data-dir="1" title="Move Down">▼</button>` : ""}
        <button class="choice-action-btn delete" data-remove-choice="${idx}" title="Remove Choice">✕</button>
      </div>
    </div>
  `).join("");

  if (window.lucide) lucide.createIcons();

  body.querySelectorAll("[data-move-choice]").forEach(btn =>
    btn.addEventListener("click", () => moveChoice(Number(btn.dataset.moveChoice), Number(btn.dataset.dir)))
  );
  body.querySelectorAll("[data-remove-choice]").forEach(btn =>
    btn.addEventListener("click", () => removeChoiceAt(Number(btn.dataset.removeChoice)))
  );
}

function setupChoiceDrawer() {
  const openBtn = $("floatingChoiceBtn");
  const navBtn = $("navChoiceBtn");
  const overlay = $("choiceDrawerOverlay");
  const closeBtn = $("closeDrawerBtn");
  const copyBtn = $("copyChoicesBtn");
  const downloadBtn = $("downloadChoicesCsvBtn");
  const clearBtn = $("clearChoicesBtn");

  const openDrawer = () => {
    overlay?.classList.remove("hidden");
    requestAnimationFrame(() => overlay?.classList.add("open"));
    renderChoiceSheet();
  };

  const closeDrawer = () => {
    overlay?.classList.remove("open");
    setTimeout(() => overlay?.classList.add("hidden"), 250);
  };

  openBtn?.addEventListener("click", openDrawer);
  navBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);

  overlay?.addEventListener("click", e => {
    if (e.target === overlay) closeDrawer();
  });

  copyBtn?.addEventListener("click", copyChoiceList);
  downloadBtn?.addEventListener("click", downloadChoiceSheetCsv);
  clearBtn?.addEventListener("click", clearChoiceList);
}

/* -------------------------------------------------------------
   College Comparison System
------------------------------------------------------------- */
function collegeKey(c) {
  return `${c.institute}|${c.program}|${c.round}|${c.category}`;
}

function updateCompareCountBadge() {
  const badge = $("compareCount");
  if (badge) {
    badge.textContent = `(${compareList.length})`;
  }
}

function toggleCompare(c) {
  const key = collegeKey(c);
  if (compareList.some(x => collegeKey(x) === key)) {
    compareList = compareList.filter(x => collegeKey(x) !== key);
    showToast(`Removed from comparison.`);
  } else if (compareList.length < 3) {
    compareList.push(c);
    showToast(`Added to comparison (${compareList.length}/3).`);
  } else {
    showToast(`You can compare up to 3 colleges simultaneously. Remove one to add another.`);
    return;
  }

  saveState();
  updateCompareCountBadge();
  renderResultsList();
}

function removeCompareAt(index) {
  if (index >= 0 && index < compareList.length) {
    const removed = compareList.splice(index, 1)[0];
    saveState();
    updateCompareCountBadge();
    renderCompare();
    renderResultsList();
    showToast(`Removed ${removed.college?.display_name || removed.institute} from comparison.`);
  }
}

function renderCompare() {
  if (!compareList.length) {
    $("compareContent").innerHTML = `
      <div class="compare-card" style="padding:48px;text-align:center;color:#64748b">
        <i data-lucide="copy" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:12px;color:#94a3b8"></i>
        <strong>No colleges added for comparison yet.</strong>
        <p style="font-size:13px;margin-top:6px">Run a prediction or search colleges, then click 'Compare' on up to 3 cards.</p>
        <button class="primary-btn" style="margin-top:16px" data-page="directory">
          Explore Colleges to Compare
        </button>
      </div>
    `;
    $("compareContent").querySelector("button")?.addEventListener("click", () => navigateTo("directory"));
    if (window.lucide) lucide.createIcons();
    return;
  }

  const rows = [
    ["Institution", c => c.college?.display_name || c.institute],
    ["Ownership & Type", c => `${c.college?.ownership || "Affiliated"} • ${c.college?.type || "UPTAC"}`],
    ["Location", c => c.college?.city || "Uttar Pradesh"],
    ["Program / Branch", c => c.program],
    ["Admission Category", c => tierLabel(c)],
    ["Admission Likelihood", c => c.feasibility_score ? `${c.feasibility_score}%` : (tier(c) === "SAFE" ? "93%" : tier(c) === "MODERATE" ? "64%" : "25%")],
    ["Closing Rank (2025)", c => Number(c.closing_rank).toLocaleString()],
    ["Opening Rank", c => Number(c.opening_rank).toLocaleString()],
    ["Category & Round", c => `${c.category} • ${c.round}`],
    ["Annual Academic Fees", c => c.fee ? formatCurrency(c.fee.annual_total) + " / yr" : "Pending official disclosure"],
    ["Placements (Average)", c => c.placement ? formatLPA(c.placement.average_lpa) : "Pending official disclosure"],
    ["Placements (Highest)", c => c.placement ? formatLPA(c.placement.highest_lpa) : "Pending official disclosure"],
    ["NIRF 2025 Ranking", c => formatNIRF(c.nirf)],
    ["Accreditation", c => formatAccreditation(c.accreditation)]
  ];

  $("compareContent").innerHTML = `
    <div class="compare-card">
      <table>
        <thead>
          <tr>
            <th>Feature</th>
            ${compareList.map((c, idx) => `
              <th>
                <div class="compare-th-content">
                  <span>${escapeHtml(c.college?.display_name || c.institute)}</span>
                  <button class="remove-compare-btn" data-remove-compare="${idx}" title="Remove from comparison">
                    <i data-lucide="x"></i> Remove
                  </button>
                </div>
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(([label, fn]) => `
            <tr>
              <td><strong>${escapeHtml(label)}</strong></td>
              ${compareList.map(c => {
                const val = String(fn(c));
                const isHighest = label === "Placements (Highest)";
                const isAvg = label === "Placements (Average)";
                return `<td style="${isHighest ? 'color:#d97706;font-weight:700;' : (isAvg ? 'color:#047857;font-weight:600;' : '')}">${escapeHtml(val)}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  document.querySelectorAll("[data-remove-compare]").forEach(btn =>
    btn.addEventListener("click", () => removeCompareAt(Number(btn.dataset.removeCompare)))
  );
}

function escapeHtml(value) {
  return String(value || "").replace(
    /[&<>"']/g,
    m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[m]
  );
}

/* -------------------------------------------------------------
   Hero Omnibox & Global Shortcuts
------------------------------------------------------------- */
function setupHeroOmniboxAndChips() {
  const omnibox = $("heroOmniboxInput");
  if (omnibox) {
    omnibox.addEventListener("keydown", e => {
      if (e.key === "Enter" && omnibox.value.trim()) {
        const query = omnibox.value.trim();
        navigateTo("directory", { q: query });
        const dirSearch = $("dirSearch");
        if (dirSearch) {
          dirSearch.value = query;
          renderDirectory();
        }
      }
    });
  }

  document.querySelectorAll(".quick-filter-chips .filter-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".quick-filter-chips .filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const owner = chip.dataset.dirChip || "";
      navigateTo("directory");
      const dirOwner = $("dirOwnership");
      if (dirOwner) {
        dirOwner.value = owner;
        renderDirectory();
      }
    });
  });

  // Global Ctrl + K / Cmd + K shortcut
  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const heroBox = $("heroOmniboxInput");
      const dirBox = $("dirSearch");
      const cmdBox = $("cmdPaletteInput");

      if (cmdBox && (cmdBox.offsetWidth || cmdBox.offsetHeight)) {
        cmdBox.focus();
        cmdBox.select();
      } else if (dirBox && (dirBox.offsetWidth || dirBox.offsetHeight)) {
        dirBox.focus();
        dirBox.select();
      } else if (heroBox) {
        navigateTo("home");
        heroBox.focus();
        heroBox.select();
      }
    }
  });
}

/* -------------------------------------------------------------
   Initial Application Boot
------------------------------------------------------------- */
function prewarmBackend() {
  try {
    fetch(`${API_BASE}/health`, { method: "GET" }).catch(() => {});
  } catch (e) {}
}
prewarmBackend();

restoreState();
setupChoiceDrawer();
setupHeroOmniboxAndChips();
updateChoiceCountBadge();
const initialRoute = parseRoute();
navigateTo(initialRoute.page, initialRoute.params, { replace: true });
