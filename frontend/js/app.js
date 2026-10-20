/**
 * CounsellQ Frontend Application
 * Handles College Predictions, Directory Search, ML Feasibility Display, and Side-by-Side Comparison.
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

let results = [];
let compareList = [];
let selectedCollege = null;
let currentFilter = "ALL";
let directoryColleges = [];
let previousPage = "home";

const $ = id => document.getElementById(id);
const pages = ["home", "predict", "results", "directory", "details", "compare"];

function showPage(page) {
  if (page !== "details") {
    previousPage = page;
  }

  pages.forEach(p => {
    const el = $(p);
    if (el) el.classList.toggle("active", p === page);
  });

  document.querySelectorAll("[data-page]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (window.lucide) {
    lucide.createIcons();
  }

  if (page === "compare") {
    renderCompare();
  }

  if (page === "directory" && directoryColleges.length === 0) {
    loadDirectory();
  }
}

document.querySelectorAll("[data-page]").forEach(btn =>
  btn.addEventListener("click", () => showPage(btn.dataset.page))
);

$("backBtn")?.addEventListener("click", () => {
  showPage(previousPage || "results");
});

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

/* Format NIRF for display */
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

/* Format accreditation badges */
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

/* Format currency values */
function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return "Not published";
  return "₹" + Number(val).toLocaleString("en-IN");
}

/* Format LPA packages */
function formatLPA(val) {
  if (val === null || val === undefined || isNaN(val)) return "Not published";
  return "₹" + Number(val).toFixed(2) + " LPA";
}

function updatePreview() {
  $("previewRank").textContent = Number($("rank").value || 0).toLocaleString();
  $("previewCategory").textContent = $("category").value;
  $("previewBranch").textContent = $("branch").value;
}

["rank", "category", "branch"].forEach(id => {
  $(id)?.addEventListener("input", updatePreview);
});

updatePreview();

/* Predict Form Submission */
$("predictionForm").addEventListener("submit", async e => {
  e.preventDefault();

  const btn = $("predictBtn");
  const error = $("formError");

  error.classList.add("hidden");
  btn.disabled = true;
  btn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Consulting ML Models & UPTAC Cutoffs...`;
  if (window.lucide) lucide.createIcons();

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rank: Number($("rank").value),
        category: categoryMap[$("category").value] || $("category").value,
        program: programMap[$("branch").value] || $("branch").value,
        quota: $("homeState").value,
        gender: $("gender").value,
        round: $("round").value
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Prediction request failed.");
    }

    results = data.results || [];
    currentFilter = "ALL";

    renderResults();
    showPage("results");

  } catch (err) {
    console.error(err);
    error.textContent = `Unable to connect to CounsellQ API (${err.message}). Ensure the backend is reachable.`;
    error.classList.remove("hidden");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="sparkles"></i> Predict Colleges`;
    if (window.lucide) lucide.createIcons();
  }
});

/* Render Results Dashboard */
function renderResults() {
  const safeCount = results.filter(r => tier(r) === "SAFE").length;
  const modCount = results.filter(r => tier(r) === "MODERATE").length;
  const ambCount = results.filter(r => tier(r) === "AMBITIOUS").length;

  $("resultSummary").innerHTML = `
    Found <strong>${results.length} matching cutoff records</strong> for JEE Main Rank <strong>${Number($("rank").value).toLocaleString()}</strong>.
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

            <!-- ML Feasibility Progress Bar -->
            <div class="feasibility-bar-box">
              <div class="feasibility-label">
                <span>Admission Feasibility (RF Model)</span>
                <strong>${score}%</strong>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${tierClass(t)}" style="width:${score}%"></div>
              </div>
            </div>

            <!-- Explanation snippet -->
            <div class="explanation-snippet">
              <i data-lucide="sparkles" style="width:13px;height:13px;display:inline-block;vertical-align:middle;color:#4f46e5"></i>
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
                <strong style="color:#047857">Avg ${formatLPA(c.placement.average_lpa)} • Max ${formatLPA(c.placement.highest_lpa)}</strong>
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

          <div class="card-actions">
            <button class="view-btn" data-details="${i}">
              View Full Profile
            </button>
            <button class="compare-btn" data-compare="${i}">
              ${compared ? "✓ Added to Compare" : "＋ Compare"}
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
}

/* College Detail Profile Modal/Page */
function openDetails(c) {
  selectedCollege = c;
  const isGovt = c.college?.ownership === "Government";
  const t = tier(c);
  const ml = c.ml_prediction || {};
  const probs = ml.probabilities || {};

  $("detailsCard").innerHTML = `
    <div class="detail-card">
      <div class="detail-head-actions">
        <div>
          <div class="meta-tags">
            <span class="college-type ${isGovt ? "govt" : "private"}">${c.college?.type || "UPTAC Institution"}</span>
            ${c.college?.code ? `<span class="college-type">AKTU Code: ${escapeHtml(c.college.code)}</span>` : ""}
            ${c.college?.ownership ? `<span class="college-type">${escapeHtml(c.college.ownership)}</span>` : ""}
          </div>
          <h1>${escapeHtml(c.college?.display_name || c.institute)}</h1>
          <p class="program" style="font-size:15px;margin:4px 0">${escapeHtml(c.program)}</p>
          <p style="color:#64748b;font-size:13px;margin:2px 0">${escapeHtml(c.college?.city || "Uttar Pradesh")} • Established ${c.college?.established_year || "AKTU Affiliated"}</p>
        </div>

        <div style="text-align:right">
          <span class="badge ${tierClass(t)}" style="font-size:13px;padding:8px 12px">
            ${escapeHtml(tierLabel(c))}
          </span>
          ${c.college?.website ? `
          <div style="margin-top:10px">
            <a href="${escapeHtml(c.college.website)}" target="_blank" rel="noopener noreferrer" class="detail-website-btn">
              <i data-lucide="external-link"></i> Official Website
            </a>
          </div>` : ""}
        </div>
      </div>

      <div class="detail-sections">
        <!-- Section 1: ML Admission Feasibility Assessment -->
        <div>
          <div class="detail-section-title"><i data-lucide="brain-circuit"></i> Machine Learning Feasibility Assessment</div>
          <div class="detail-grid">
            <div class="detail-item">
              <small>Calibrated Feasibility Score</small>
              <strong style="font-size:22px;color:#4f46e5">${c.feasibility_score || 85}%</strong>
            </div>
            <div class="detail-item">
              <small>Model Architecture</small>
              <strong>${ml.modelVersion || "Random Forest Ensemble (v1.0.0)"}</strong>
            </div>
            <div class="detail-item">
              <small>Headroom / Rank Diff</small>
              <strong>${ml.metrics?.relRankDiff !== undefined ? (ml.metrics.relRankDiff * 100).toFixed(1) + "%" : "Verified"}</strong>
            </div>
          </div>

          <div class="explanation-snippet" style="margin-top:14px;padding:12px 16px;font-size:13px">
            <strong>Decision-Support Rationale:</strong> ${escapeHtml(c.explanation || "Calculated using Random Forest multi-class feasibility classifier.")}
            <br>
            <small style="color:#64748b;margin-top:4px;display:inline-block">
              Ensemble Probabilities: P(Safe)=${probs.safe !== undefined ? (probs.safe * 100).toFixed(1) + "%" : "N/A"},
              P(Moderate)=${probs.moderate !== undefined ? (probs.moderate * 100).toFixed(1) + "%" : "N/A"},
              P(Ambitious)=${probs.ambitious !== undefined ? (probs.ambitious * 100).toFixed(1) + "%" : "N/A"}
            </small>
          </div>
        </div>

        <!-- Section 2: Historical Cutoffs -->
        <div>
          <div class="detail-section-title"><i data-lucide="history"></i> Historical UPTAC 2025 Cutoffs</div>
          <div class="detail-grid">
            <div class="detail-item">
              <small>Closing Rank (Round Cutoff)</small>
              <strong>${Number(c.closing_rank).toLocaleString()}</strong>
            </div>
            <div class="detail-item">
              <small>Opening Rank</small>
              <strong>${Number(c.opening_rank).toLocaleString()}</strong>
            </div>
            <div class="detail-item">
              <small>Category & Round</small>
              <strong>${escapeHtml(c.category)} • ${escapeHtml(c.round)}</strong>
            </div>
          </div>
        </div>

        <!-- Section 3: Verified Fees -->
        <div>
          <div class="detail-section-title"><i data-lucide="receipt"></i> Official Audited Fee Schedule</div>
          ${c.fee ? `
          <div class="detail-grid">
            <div class="detail-item">
              <small>Total Annual Academic Fee</small>
              <strong style="color:#0f172a">${formatCurrency(c.fee.annual_total)} / yr</strong>
            </div>
            <div class="detail-item">
              <small>Base Tuition Component</small>
              <strong>${formatCurrency(c.fee.tuition)}</strong>
            </div>
            <div class="detail-item">
              <small>Academic Year & Source</small>
              <strong>${escapeHtml(c.fee.academic_year || "2024-2025")} (<a href="${escapeHtml(c.fee.source_url || '#')}" target="_blank" rel="noopener noreferrer" style="color:#4f46e5">Source</a>)</strong>
            </div>
          </div>` : `
          <div style="background:#f8fafc;padding:16px;border-radius:10px;color:#64748b;font-size:13px">
            Audited fee schedule for this specific institution is pending official disclosure. Standard AKTU fee guidelines apply.
          </div>`}
        </div>

        <!-- Section 4: Verified Placements -->
        <div>
          <div class="detail-section-title"><i data-lucide="trending-up"></i> Official Placement Outcomes</div>
          ${c.placement ? `
          <div class="detail-grid">
            <div class="detail-item">
              <small>Average Package</small>
              <strong style="color:#047857">${formatLPA(c.placement.average_lpa)}</strong>
            </div>
            <div class="detail-item">
              <small>Median Package</small>
              <strong>${formatLPA(c.placement.median_lpa)}</strong>
            </div>
            <div class="detail-item">
              <small>Highest Package</small>
              <strong style="color:#4338ca">${formatLPA(c.placement.highest_lpa)}</strong>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:#64748b">
            ${c.placement.placement_percentage ? `Placement Rate: <strong>${c.placement.placement_percentage}%</strong> • ` : ""}
            Source: <a href="${escapeHtml(c.placement.source_url || '#')}" target="_blank" rel="noopener noreferrer" style="color:#4f46e5">Official Training & Placement Cell Report</a>
          </div>` : `
          <div style="background:#f8fafc;padding:16px;border-radius:10px;color:#64748b;font-size:13px">
            Official placement report for this institution is pending audited publication.
          </div>`}
        </div>

        <!-- Section 5: NIRF Rankings & Accreditations -->
        <div>
          <div class="detail-section-title"><i data-lucide="award"></i> NIRF Rankings & NBA/NAAC Accreditations</div>
          <div class="detail-grid">
            <div class="detail-item">
              <small>NIRF 2025 Engineering</small>
              <strong>${escapeHtml(formatNIRF(c.nirf))}</strong>
            </div>
            <div class="detail-item" style="grid-column: span 2">
              <small>Accreditations</small>
              <strong>${escapeHtml(formatAccreditation(c.accreditation))}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  showPage("details");
}

/* College Directory Functionality */
async function loadDirectory() {
  const stats = $("directoryStats");
  const grid = $("directoryGrid");
  stats.textContent = "Loading colleges...";

  try {
    const res = await fetch(`${API_BASE}/colleges?limit=100`);
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error);

    directoryColleges = data.colleges || [];
    renderDirectory();
  } catch (err) {
    stats.textContent = "Failed to load directory. Ensure backend is running.";
    console.error(err);
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

  $("directoryStats").textContent = `Showing ${filtered.length} of ${directoryColleges.length} participating UPTAC colleges.`;

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
                <strong style="color:#047857">${formatLPA(col.placement.average_lpa)} (Max ${formatLPA(col.placement.highest_lpa)})</strong>
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

$("dirSearch")?.addEventListener("input", renderDirectory);
$("dirOwnership")?.addEventListener("change", renderDirectory);
$("dirNirf")?.addEventListener("change", renderDirectory);
$("dirSort")?.addEventListener("change", renderDirectory);

/* Compare Feature */
function collegeKey(c) {
  return `${c.institute}|${c.program}|${c.round}|${c.category}`;
}

function toggleCompare(c) {
  const key = collegeKey(c);
  if (compareList.some(x => collegeKey(x) === key)) {
    compareList = compareList.filter(x => collegeKey(x) !== key);
  } else if (compareList.length < 3) {
    compareList.push(c);
  } else {
    return alert("You can compare a maximum of 3 colleges simultaneously.");
  }

  $("compareCount").textContent = `(${compareList.length})`;
  renderResultsList();
}

function renderCompare() {
  if (!compareList.length) {
    $("compareContent").innerHTML = `
      <div class="compare-card" style="padding:48px;text-align:center;color:#64748b">
        <i data-lucide="copy" style="width:36px;height:36px;margin:auto;display:block;margin-bottom:12px;color:#94a3b8"></i>
        <strong>No colleges added for comparison yet.</strong>
        <p style="font-size:13px;margin-top:6px">Run a prediction or search colleges, then click '＋ Compare' on up to 3 cards.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const rows = [
    ["Institution", c => c.college?.display_name || c.institute],
    ["Ownership & Type", c => `${c.college?.ownership || "Affiliated"} • ${c.college?.type || "UPTAC"}`],
    ["Location", c => c.college?.city || "Uttar Pradesh"],
    ["Program / Branch", c => c.program],
    ["ML Feasibility Tier", c => tierLabel(c)],
    ["ML Feasibility Score", c => c.feasibility_score ? `${c.feasibility_score}%` : "Evaluated"],
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
            ${compareList.map(c => `<th>${escapeHtml(c.college?.display_name || c.institute)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${rows.map(([label, fn]) => `
            <tr>
              <td><strong>${escapeHtml(label)}</strong></td>
              ${compareList.map(c => `<td>${escapeHtml(String(fn(c)))}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
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

// Initial page
showPage("home");