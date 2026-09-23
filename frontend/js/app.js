const API_URL = "https://counsellq-backend.onrender.com/api/predict";

const categoryMap = {
  "General": "OPEN",
  "OBC": "BC",
  "SC": "SC",
  "ST": "ST",
  "EWS": "EWS(OPEN)"
};

const programMap = {
  "Computer Science & Engineering": "Computer Science",
  "Information Technology": "Information Technology",
  "Electronics & Communication": "Electronics",
  "Electrical Engineering": "Electrical",
  "Mechanical Engineering": "Mechanical"
};

let results = [];
let compareList = [];
let selectedCollege = null;
let currentFilter = "ALL";

const $ = id => document.getElementById(id);
const pages = ["home", "predict", "results", "details", "compare"];

function showPage(page) {
  pages.forEach(p => $(p).classList.toggle("active", p === page));

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
}

document.querySelectorAll("[data-page]").forEach(btn =>
  btn.addEventListener("click", () => showPage(btn.dataset.page))
);

function tier(prediction) {
  if (prediction === "Safer Chance") return "SAFE";
  if (prediction === "Moderate Chance") return "MODERATE";
  return "AMBITIOUS";
}

function tierClass(t) {
  return t === "SAFE"
    ? "safe"
    : t === "MODERATE"
      ? "moderate"
      : "ambitious";
}

/*
 * Format NIRF information for display.
 *
 * Exact rank:
 *   NIRF #60
 *
 * Rank band:
 *   NIRF Rank Band 101-150
 *
 * No verified NIRF record:
 *   NIRF: Not ranked
 */
function formatNIRF(nirf) {
  if (!nirf) {
    return "Not ranked";
  }

  if (nirf.rank !== null && nirf.rank !== undefined) {
    return `#${nirf.rank}`;
  }

  if (nirf.rank_band) {
    return `Rank Band ${nirf.rank_band}`;
  }

  return "Listed";
}

function updatePreview() {
  $("previewRank").textContent =
    Number($("rank").value || 0).toLocaleString();

  $("previewCategory").textContent =
    $("category").value;

  $("previewBranch").textContent =
    $("branch").value;
}

["rank", "category", "branch"].forEach(id =>
  $(id).addEventListener("input", updatePreview)
);

updatePreview();

$("predictionForm").addEventListener("submit", async e => {
  e.preventDefault();

  const btn = $("predictBtn");
  const error = $("formError");

  error.classList.add("hidden");

  btn.disabled = true;
  btn.textContent = "Analyzing Cutoffs...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rank: Number($("rank").value),
        category:
          categoryMap[$("category").value] ||
          $("category").value,
        program:
          programMap[$("branch").value] ||
          $("branch").value,
        quota: "Home State",
        round: $("round").value
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Prediction failed"
      );
    }

    results = data.results || [];
    currentFilter = "ALL";

    renderResults();
    showPage("results");

  } catch (err) {
    console.error(err);

    error.textContent =
      "Unable to connect to CounsellQ backend. Make sure the backend is running on port 5000.";

    error.classList.remove("hidden");

  } finally {
    btn.disabled = false;
    btn.textContent = "Predict Colleges";
  }
});

function renderResults() {
  $("resultSummary").textContent =
    `${results.length} matching cutoff record${results.length === 1 ? "" : "s"} for rank ${Number($("rank").value).toLocaleString()}.`;

  const filters = [
    ["ALL", "All"],
    ["SAFE", "Safer Chance"],
    ["MODERATE", "Moderate Chance"],
    ["AMBITIOUS", "Lower Chance"]
  ];

  $("filters").classList.toggle(
    "hidden",
    results.length === 0
  );

  $("filters").innerHTML = filters
    .map(
      ([value, label]) =>
        `<button class="filter-btn ${currentFilter === value ? "active" : ""}" data-filter="${value}">${label}</button>`
    )
    .join("");

  document.querySelectorAll("[data-filter]").forEach(btn =>
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      renderResults();
    })
  );

  const visible = results.filter(
    c =>
      currentFilter === "ALL" ||
      tier(c.prediction) === currentFilter
  );

  if (!visible.length) {
    $("resultsGrid").innerHTML = `
      <div
        class="college-card"
        style="grid-column:1/-1;text-align:center;color:#64748b"
      >
        No matching records found.
      </div>
    `;

    return;
  }

  $("resultsGrid").innerHTML = visible
    .map((c, i) => {
      const t = tier(c.prediction);
      const key = collegeKey(c);

      const compared = compareList.some(
        x => collegeKey(x) === key
      );

      return `
        <article class="college-card">

          <div class="college-top">

            <div>
              <span class="college-type">
                UPTAC Institution
              </span>

              <h3>
                ${escapeHtml(c.institute)}
              </h3>

              <div class="program">
                ${escapeHtml(c.program)}
              </div>
            </div>

            <span class="badge ${tierClass(t)}">
              ${escapeHtml(c.prediction)}
            </span>

          </div>

          <div class="data-box">

            <div class="data-row">
              <span>Opening Rank</span>
              <strong>
                ${Number(c.opening_rank).toLocaleString()}
              </strong>
            </div>

            <div class="data-row">
              <span>Closing Rank</span>
              <strong>
                ${Number(c.closing_rank).toLocaleString()}
              </strong>
            </div>

            <div class="data-row">
              <span>Category</span>
              <strong>
                ${escapeHtml(c.category)}
              </strong>
            </div>

            <div class="data-row">
              <span>Quota</span>
              <strong>
                ${escapeHtml(c.quota)}
              </strong>
            </div>

            <div class="data-row">
              <span>Round</span>
              <strong>
                ${escapeHtml(c.round)}
              </strong>
            </div>

            <div class="data-row">
              <span>NIRF 2025</span>
              <strong>
                ${escapeHtml(formatNIRF(c.nirf))}
              </strong>
            </div>

          </div>

          <div class="card-actions">

            <button
              class="view-btn"
              data-details="${i}"
            >
              View Details
            </button>

            <button
              class="compare-btn"
              data-compare="${i}"
            >
              ${compared ? "Added" : "＋ Compare"}
            </button>

          </div>

        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-details]").forEach(btn =>
    btn.addEventListener("click", () =>
      openDetails(
        visible[Number(btn.dataset.details)]
      )
    )
  );

  document.querySelectorAll("[data-compare]").forEach(btn =>
    btn.addEventListener("click", () =>
      toggleCompare(
        visible[Number(btn.dataset.compare)]
      )
    )
  );
}

function openDetails(c) {
  selectedCollege = c;

  $("detailsCard").innerHTML = `
    <div class="detail-card">

      <span class="college-type">
        UPTAC Institution
      </span>

      <h1>
        ${escapeHtml(c.institute)}
      </h1>

      <p class="program">
        ${escapeHtml(c.program)}
      </p>

      <div class="detail-grid">

        ${[
          [
            "Opening Rank",
            Number(c.opening_rank).toLocaleString()
          ],

          [
            "Closing Rank",
            Number(c.closing_rank).toLocaleString()
          ],

          [
            "Category",
            c.category
          ],

          [
            "Quota",
            c.quota
          ],

          [
            "Round",
            c.round
          ],

          [
            "Prediction",
            c.prediction
          ],

          [
            "NIRF 2025",
            formatNIRF(c.nirf)
          ]

        ]
          .map(
            ([label, value]) =>
              `
              <div class="detail-item">
                <small>
                  ${escapeHtml(label)}
                </small>

                <strong>
                  ${escapeHtml(String(value))}
                </strong>
              </div>
              `
          )
          .join("")}

      </div>

    </div>
  `;

  showPage("details");
}

function collegeKey(c) {
  return `${c.institute}|${c.program}|${c.round}|${c.category}`;
}

function toggleCompare(c) {
  const key = collegeKey(c);

  if (
    compareList.some(
      x => collegeKey(x) === key
    )
  ) {
    compareList = compareList.filter(
      x => collegeKey(x) !== key
    );

  } else if (compareList.length < 3) {
    compareList.push(c);

  } else {
    return alert(
      "You can compare a maximum of 3 colleges."
    );
  }

  $("compareCount").textContent =
    `(${compareList.length})`;

  renderResults();
}

function renderCompare() {
  if (!compareList.length) {

    $("compareContent").innerHTML = `
      <div
        class="compare-card"
        style="padding:40px;text-align:center;color:#64748b"
      >
        No colleges added yet. Run a prediction and add colleges to compare.
      </div>
    `;

    return;
  }

  const rows = [
    [
      "Program",
      c => c.program
    ],

    [
      "Opening Rank",
      c => Number(c.opening_rank).toLocaleString()
    ],

    [
      "Closing Rank",
      c => Number(c.closing_rank).toLocaleString()
    ],

    [
      "Category",
      c => c.category
    ],

    [
      "Quota",
      c => c.quota
    ],

    [
      "Round",
      c => c.round
    ],

    [
      "Prediction",
      c => c.prediction
    ],

    [
      "NIRF 2025",
      c => formatNIRF(c.nirf)
    ]
  ];

  $("compareContent").innerHTML = `
    <div class="compare-card">

      <table>

        <thead>

          <tr>

            <th>
              Feature
            </th>

            ${compareList
              .map(
                c =>
                  `
                  <th>
                    ${escapeHtml(c.institute)}
                  </th>
                  `
              )
              .join("")}

          </tr>

        </thead>

        <tbody>

          ${rows
            .map(
              ([label, fn]) =>
                `
                <tr>

                  <td>
                    <strong>
                      ${escapeHtml(label)}
                    </strong>
                  </td>

                  ${compareList
                    .map(
                      c =>
                        `
                        <td>
                          ${escapeHtml(
                            String(fn(c))
                          )}
                        </td>
                        `
                    )
                    .join("")}

                </tr>
                `
            )
            .join("")}

        </tbody>

      </table>

    </div>
  `;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    m =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[m]
  );
}

showPage("home");