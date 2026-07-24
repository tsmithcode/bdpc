(function () {
  "use strict";

  const status = window.BDPC_STATUS;
  const $ = (selector) => document.querySelector(selector);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const label = (key) => key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const slug = (value) => String(value || "not-started").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function heading(kicker, title, text) {
    return `<div class="section-head"><div><span class="eyebrow">${esc(kicker)}</span><h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ""}</div></div>`;
  }

  function metrics(items) {
    return `<div class="metric-grid">${items.map((item) => `<article><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong><small>${esc(item.detail)}</small></article>`).join("")}</div>`;
  }

  function table(items, columns) {
    if (!items || !items.length) return `<div class="callout">No public records are available for this section.</div>`;
    const keys = columns || Object.keys(items[0]);
    return `<div class="table-wrap"><table><thead><tr>${keys.map((key) => `<th>${esc(label(key))}</th>`).join("")}</tr></thead><tbody>${items.map((item) => `<tr>${keys.map((key) => `<td>${key === "status" ? `<span class="badge badge--${slug(item[key])}">${esc(item[key])}</span>` : esc(item[key])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function readiness() {
    return `<div class="phase-progress-grid">${status.readiness_history.map((item) => `<article class="phase-progress"><div><span>${esc(item.stage)}</span><strong>${esc(item.percent)}%</strong></div><progress max="100" value="${Number(item.percent)}">${esc(item.percent)}%</progress><small>${esc(item.date)}</small></article>`).join("")}</div>`;
  }

  function renderOverview() {
    return `${heading("Current public status", "A101 is review-ready", status.project.status_summary)}
      ${readiness()}
      ${metrics(status.dashboard_metrics)}
      <div class="two-col">
        <article class="card"><h3>Current controlled sheet</h3><p><img src="assets/dunn-model-space.svg" alt="Evidence-supported Dunn Residence main-level model space" style="display:block;width:100%;height:auto;border:1px solid #d8e2ec"></p><p>Porch-left / deck-right orientation. Fourteen City controls remain native dimensions. Unknown room use is labeled ROOM.</p></article>
        <article class="decision-card"><span>Issuance gate</span><h3>${esc(status.project.current_state)}</h3><p class="decision-note">${esc(status.project.remaining_gate)}</p><ul class="gate-list"><li><span>Native DWG audit</span><strong>0 errors</strong></li><li><span>PDF visual QA</span><strong>Complete</strong></li><li><span>BDPC dependencies</span><strong>Pending</strong></li></ul></article>
      </div>
      <div class="callout"><strong>Scope boundary:</strong> ${esc(status.project.scope_boundary)}</div>`;
  }

  const renders = {
    overview: renderOverview,
    commercial: () => `${heading("Contract boundary", "Authorized one-sheet scope", "Execution status changed; the written scope did not.")}${metrics(status.scope_metrics)}${table(status.scope_terms)}`,
    files: () => `${heading("Controlled evidence", "Files and deliverable roles", "Source evidence remains confidential and outside the client package.")}${table(status.files)}`,
    standards: () => `${heading("Drawing controls", "A101 standards", "Current source hierarchy, client decisions, and known dependency exceptions.")}${table(status.standards)}`,
    "cad-prep": () => `${heading("Native production", "CAD completion pass", status.project.production_status)}${metrics(status.cad_metrics)}${table(status.cad_preparation)}`,
    delivery: () => `${heading("Acceptance evidence", "QA and controlled delivery", "Review-ready means technically checked, with BDPC-native graphic dependencies still open.")}${metrics(status.delivery_metrics)}${table(status.qa)}<div class="actions"><button class="button button--secondary" id="download-status-db" type="button">Download current SQLite status</button></div>` ,
    updates: () => `${heading("Controlling direction", "Confirmed decisions", "Brian's latest written direction controls this pass.")}${table(status.confirmed_decisions)}${heading("Status log", "Decision history", "Public execution record.")}${table(status.decisions_log)}`,
    runtime: () => `${heading("Environment", "Dependencies", "ObjectARX is installed but was not used or required by this native 2D build.")}${table(status.dependencies)}`,
    glossary: () => `${heading("Plain-language reference", "Project glossary", "Terms used in the public status and QA record.")}${table(status.glossary)}`,
    milestones: () => `${heading("Project sequence", "Timeline and readiness", "The status dataset records the 68% pre-pass and 92% post-pass states.")}${readiness()}${table(status.timeline)}`,
    automation: () => `${heading("Human-controlled aids", "Automation register", "Automation accelerated evidence review and QA without authoring unsupported conditions.")}${table(status.automation)}`
  };

  function activate(name, focus) {
    document.querySelectorAll("[data-tab]").forEach((tab) => {
      const active = tab.dataset.tab === name;
      tab.setAttribute("aria-selected", String(active));
      if (active && focus) tab.focus();
    });
    document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== name; });
    history.replaceState(null, "", name === "overview" ? location.pathname : `#${name}`);
  }

  function init() {
    if (!status) {
      $("#panel-overview").innerHTML = `<div class="callout">The current status dataset could not be loaded.</div>`;
      return;
    }
    Object.entries(renders).forEach(([name, render]) => { $(`#panel-${name}`).innerHTML = render(); });
    $("#revision-label").textContent = `Project Workspace · ${status.revision}`;
    $("#footer-revision").textContent = status.revision;
    const gate = $(".gate");
    gate.innerHTML = `<span>Current state</span><strong>${esc(status.project.current_state)}</strong><small>${esc(status.project.remaining_gate)}</small>`;
    document.querySelectorAll("[data-tab]").forEach((tab) => tab.addEventListener("click", () => activate(tab.dataset.tab, false)));
    document.querySelectorAll("[role=tab]").forEach((tab) => tab.addEventListener("keydown", (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      const tabs = [...document.querySelectorAll("[role=tab]")];
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      activate(tabs[(tabs.indexOf(tab) + delta + tabs.length) % tabs.length].dataset.tab, true);
    }));
    $("#download-status-db").addEventListener("click", () => window.BDPC_SQLITE_DOWNLOAD?.());
    const initial = location.hash.slice(1);
    activate(renders[initial] ? initial : "overview", false);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
