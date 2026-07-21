(() => {
  'use strict';

  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const panels = [...document.querySelectorAll('[role="tabpanel"]')];
  const toast = document.getElementById('toast');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const slug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const badge = status => `<span class="badge badge--${slug(status)}">${esc(status)}</span>`;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }

  function activate(id, focus = false) {
    const selected = tabs.some(tab => tab.dataset.tab === id) ? id : 'overview';
    tabs.forEach(tab => {
      const active = tab.dataset.tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    panels.forEach(panel => { panel.hidden = panel.dataset.panel !== selected; });
    history.replaceState(null, '', `#${selected}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next].dataset.tab, true);
    });
  });

  function table(headers, rows) {
    return `<div class="table-wrap"><table><thead><tr>${headers.map(header => `<th>${esc(header)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell && cell.badge ? badge(cell.badge) : esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function head(eyebrow, title, copy = '', action = '') {
    return `<div class="section-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ''}</div>${action}</div>`;
  }

  function renderOverview(data, manifest) {
    const metrics = data.metrics;
    const gates = data.kickoff_gates.map(gate => `<li><strong>${esc(gate.gate)}</strong><span>${badge(gate.status)}</span></li>`).join('');
    const reports = data.reports.map(report => `<a class="report-card" href="${esc(report.url)}"><span>${esc(report.id)}</span><h3>${esc(report.name)}</h3><p>${esc(report.summary)}</p><strong>Open report →</strong></a>`).join('');
    return `<div class="hero-grid"><div><span class="eyebrow">Updated ${esc(data.updated_date)} · ${esc(data.release_marker)}</span><h2>Pre-license evidence and the fixed-fee estimate are ready. Native drawing production has not started.</h2><p class="lede">Five source/working validations passed, 91,688,946 source points were processed in bounded chunks, and the current client-safe review is ready for authorization. Production begins only after every kickoff gate clears.</p><div class="actions"><a class="button button--primary" href="/bdpc/sow/">Review estimate</a><button class="button button--secondary" type="button" data-authorize>Authorize project</button><a class="button button--secondary" href="/bdpc/reports/completion/">Review completion brief</a><button class="button button--secondary" type="button" data-sqlite-download>Download verified SQLite</button></div></div><aside class="decision-card"><span>Kickoff gates</span><h3>All four gates control the production start.</h3><ul class="gate-list">${gates}</ul><p class="decision-note">Check-set target: 3 business days after all kickoff gates.</p></aside></div>
      <div class="metric-grid"><article><span>Confidential source corpus</span><strong>${metrics.source_files} files</strong><small>${metrics.source_size_gib.toFixed(2)} GiB aggregate</small></article><article><span>Validated source points</span><strong>${(metrics.source_points / 1e6).toFixed(2)}M</strong><small>${metrics.validated_sessions} of ${metrics.scan_sessions} validation pairs passed</small></article><article><span>Current analytical evidence</span><strong>${metrics.full_source_figures + metrics.plan_control_slices + metrics.native_overlays} figures</strong><small>${metrics.full_source_figures} full-source · ${metrics.plan_control_slices} slices · ${metrics.native_overlays} overlays</small></article><article><span>Native production</span><strong>Not started</strong><small>No final production drawing or PDF exists</small></article></div>
      ${head('Current truth', 'What is complete—and what is not')}
      <div class="status-grid"><article class="status-card status-card--complete">${badge('Complete')}<h3>Analytical validation</h3><p>Five validations, full-source statistics, current native-coordinate pair evidence, and the estimate package are complete or ready.</p></article><article class="status-card status-card--ready">${badge('Ready')}<h3>Client review</h3><p>The $3,200 estimate, completion brief, and client-safe downloads are ready for human review.</p></article><article class="status-card status-card--awaiting-input">${badge('Awaiting input')}<h3>Authorization and inputs</h3><p>Written authorization, start payment, and controlling-input confirmation remain open.</p></article><article class="status-card status-card--blocked">${badge('Blocked')}<h3>Licensed runtime</h3><p>A licensed compatible Autodesk runtime or approved remote workstation is the hard technical blocker.</p></article></div>
      <div class="callout"><strong>Native-coordinate finding:</strong> ${esc(data.overlap_statement)}</div>
      ${head('Evidence', 'Client-safe report library', '', '<a href="/bdpc/reports/">Open all reports →</a>')}<div class="report-grid">${reports}</div>
      <div class="data-integrity"><span>Verified data snapshot</span><strong>Revision ${esc(data.revision)} · ${Object.values(manifest.table_counts || {}).reduce((sum, count) => sum + count, 0)} database rows · SHA-256 ${esc(manifest.database_sha256 || '').slice(0, 12)}…</strong></div>`;
  }

  function renderMilestones(data) {
    const phase = (title, items, accepted, label) => {
      const value = items.filter(item => accepted.includes(item.status)).length;
      return `<article class="phase-progress"><div><span>${esc(title)}</span><strong>${value} / ${items.length}</strong></div><progress max="${items.length}" value="${value}" aria-label="${esc(title)}: ${esc(label)}"></progress><small>${esc(label)}</small></article>`;
    };
    const evidence = data.milestones.filter(item => item.phase === 'Pre-license evidence');
    const clientReview = data.milestones.filter(item => item.phase === 'Client review');
    const kickoff = data.milestones.filter(item => item.phase === 'Kickoff');
    const production = data.milestones.filter(item => item.phase === 'Production');
    const rows = data.milestones.map(item => [item.id, item.name, { badge: item.status }, item.phase, item.evidence, item.limitation]);
    return `${head('Evidence-backed states', 'Milestones', 'Phase bars report documented acceptance states—not an activity-derived overall completion percentage.')}<div class="phase-progress-grid">${phase('Pre-license evidence', evidence, ['Complete', 'Ready', 'Ready for human review'], `All ${evidence.length} evidence milestones are complete or ready for human review.`)}${phase('Client review package', clientReview, ['Ready'], 'The estimate and supporting package are ready for human review.')}${phase('Kickoff gates', kickoff, ['Complete'], 'No kickoff gate is recorded as cleared; production clock has not started.')}${phase('Native production', production, ['Complete'], 'Native production, QA, review, and closeout have not started.')}</div><div class="callout"><strong>Reading the bars:</strong> readiness, authorization, and production are separate states. A ready analytical item does not mean native production is complete.</div><h3 class="subhead">Milestone ledger</h3>${table(['ID', 'Milestone', 'Status', 'Phase', 'Evidence', 'Limitation'], rows)}`;
  }

  function renderFiles(data) {
    const metrics = data.metrics;
    return `${head('Client-safe aggregate only', 'Source and evidence inventory', 'Confidential source files, filenames, exact address, coordinates, detailed bounds, and private manifests are not published.', '<a class="button button--secondary" href="/bdpc/reports/intake/">Open intake report</a>')}<div class="metric-grid metric-grid--six"><article><span>Source files</span><strong>${metrics.source_files}</strong><small>Metadata inventory</small></article><article><span>Source bytes</span><strong>${metrics.source_bytes.toLocaleString()}</strong><small>${metrics.source_size_gib.toFixed(2)} GiB</small></article><article><span>Sessions</span><strong>${metrics.scan_sessions}</strong><small>Five validation pairs passed</small></article><article><span>Source points</span><strong>${metrics.source_points.toLocaleString()}</strong><small>Bounded all-point processing</small></article><article><span>Current figures</span><strong>${metrics.full_source_figures}</strong><small>Full-source figures published</small></article><article><span>Current controls</span><strong>${metrics.plan_control_slices + metrics.native_overlays}</strong><small>Nine slices and five overlays</small></article></div><div class="callout"><strong>Source integrity:</strong> ${esc(data.source_integrity_statement)}</div><h3 class="subhead">Aggregate file groups</h3>${table(['Group', 'Format family', 'Count', 'State', 'Handling rule'], data.file_groups.map(item => [item.group, item.formats, item.count.toLocaleString(), { badge: item.status }, item.notes]))}<h3 class="subhead">Validated analytical sessions</h3>${table(['Session', 'Generalized role', 'Points', 'Validation', 'Boundary'], data.validation_sessions.map(item => [item.session, item.role, item.points.toLocaleString(), { badge: item.status }, item.limitation]))}<div class="callout"><strong>Working-set rule:</strong> source files remain immutable; bounded derivatives are created only in approved private workspace locations, and publication requires a separate client-safe review.</div>`;
  }

  function renderStandards(data) {
    return `${head('Documented operating rules', 'Standards and decision controls', 'These are the preserved production rules and dependencies. BDPC confirmation—not filename, date, location, or format—establishes which project inputs control.')}<div class="principle"><span>Authority hierarchy</span><strong>Direction first. Confirmed current project inputs second. Reviewed evidence third.</strong><p>Written BDPC decisions control, followed by BDPC-confirmed current CAD and design inputs, reviewed analytical evidence, client-safe derivatives, and reference files for standards context only. Inference is always labeled.</p></div>${table(['Standard or control', 'Status', 'Documented rule', 'Basis'], data.standards.map(item => [item.item, { badge: item.status }, item.rule, item.basis]))}<div class="two-col"><article class="card"><h3>Controlling-input confirmation required</h3><ul><li>Current Dunn project CAD</li><li>Design, redline, or conceptual intent</li><li>Title block and presentation authority</li><li>Fonts, shapes, xrefs, object support, and plot dependencies</li><li>Any additional BDPC drafting standards that control this set</li></ul></article><article class="card"><h3>Technical truth boundary</h3><ul>${data.truth_boundary.map(item => `<li>${esc(item)}</li>`).join('')}</ul></article></div><div class="callout"><strong>Conflict rule:</strong> every material difference is documented and returned for BDPC direction; no conflict is silently resolved and no reference-project geometry controls Dunn work.</div>`;
  }

  function renderAutomation(data) {
    return `${head('Production-first controls', 'Automation register', 'Validated bounded processing supports decisions; it does not replace licensed native production, BDPC authority, or human CAD review.')}<div class="principle"><span>Automation principle</span><strong>Automate evidence and repeatable checks. Keep design authority and issued drawings under human control.</strong><p>Every automation item has an explicit state, tool class, result, and disposition so experimental work cannot quietly become a production dependency.</p></div>${table(['Automation item', 'Status', 'Tool or method', 'Current result', 'Disposition'], data.automation.map(item => [item.item, { badge: item.status }, item.tool, item.result, item.disposition]))}<div class="callout"><strong>Source-protection rule:</strong> automation never writes to confidential source files. Native production automation remains conditional on confirmed inputs and a licensed compatible runtime.</div>`;
  }

  function renderCadPrep(data) {
    return `${head('Production preparation', 'CAD drafter control room', 'A complete, status-driven checklist for the three-sheet scope, backed by public detailed registers and restored photographic context.', '<a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open full CAD Prep report</a>')}<div class="principle"><span>Orientation and authority gate</span><strong>Confirm the controlling input set and normalize every source view before tracing.</strong><p>The reviewed conceptual views use differing displayed orientations. Project north, units, insertion scale, and source-view rotations must be recorded before geometry is compared or inserted.</p></div>${table(['Concern', 'Production item', 'Status', 'Current evidence', 'Next action', 'Owner'], data.cad_preparation.map(item => [item.group, item.item, { badge: item.status }, item.current_evidence, item.next_action, item.owner]))}<h3 class="subhead">Role-specific handoff</h3>${table(['User', 'Primary focus', 'Decision rule'], data.role_views.map(item => [item.role, item.focus, item.decision]))}<h3 class="subhead">Publication controls</h3>${table(['Control', 'Status', 'Rule'], data.access_controls.map(item => [item.control, { badge: item.status }, item.rule]))}<div class="actions"><a class="button button--secondary" href="/bdpc/reports/context-visual/">Open photographic context</a><a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open 46-item drafter checklist</a></div>`;
  }

  function renderDelivery(data) {
    return `${head('Three-sheet scope', 'Delivery and QA', 'The check-set target is three business days after all kickoff gates; total production is four to five business days excluding client review.')}<div class="principle"><span>Issue rule</span><strong>No drawing advances by optimism.</strong><p>Each deliverable advances only when its applicable authority, native-runtime, geometry, annotation, plotting, review, and package checks are satisfied and recorded.</p></div>${table(['Sequence', 'Deliverable', 'Status', 'Scope', 'Format', 'Target'], data.deliverables.map(item => [item.sequence, item.name, { badge: item.status }, item.scope, item.format, item.target]))}<h3 class="subhead">Quality and acceptance gates</h3>${table(['Check', 'Status', 'Evidence or acceptance condition'], data.qa_checks.map(item => [item.check, { badge: item.status }, item.evidence]))}<div class="two-col"><article class="card"><h3>Check-set target</h3><p>Three business days after written authorization, the $1,600 start payment, controlling-input confirmation, and licensed compatible runtime access are all in place.</p></article><article class="card"><h3>Review and final issue</h3><p>One consolidated client review round is included. The four-to-five-business-day production target excludes client review time.</p></article></div>`;
  }

  function renderCommercial(data) {
    return `<div class="commercial-hero"><div><span class="eyebrow">Ready for written authorization</span><h2>$3,200 fixed fee</h2><p>$1,600 start payment · $1,600 final payment · one consolidated review round.</p></div><button class="button button--primary" type="button" data-authorize>Authorize project</button></div>${table(['Commercial term', 'Value', 'Status or trigger'], data.commercial.map(item => [item.term, item.value, item.status]))}<div class="two-col"><article class="card"><h3>Included scope</h3><ul><li>Existing floor plan</li><li>Proposed floor plan</li><li>Site and area plan</li><li>One consolidated BDPC review round</li><li>Native CAD and PDF issue after production and QA</li></ul></article><article class="card"><h3>Excluded or separately authorized</h3><ul><li>Survey, architecture, engineering, code, zoning, permit, structural, MEP, civil, or life-safety certification</li><li>Concealed-condition verification</li><li>Additional revisions or services beyond the included round: $90/hour with written authorization</li><li>Future automation or standards-library development</li></ul></article></div><h3 class="subhead">Production clock starts only after all four gates</h3>${table(['Sequence', 'Kickoff gate', 'Status', 'Owner', 'Requirement'], data.kickoff_gates.map(item => [item.sequence, item.gate, { badge: item.status }, item.owner, item.requirement]))}<div class="actions"><a class="button button--secondary" href="/bdpc/sow/">Open print-optimized estimate and SOW</a></div>`;
  }

  function renderUpdates(data) {
    return `${head('Client-safe record', 'Updates', 'Current release events and next actions; private working logs remain outside the site.')}${table(['Date', 'Update', 'Status', 'Detail'], data.updates.map(item => [item.date, item.title, { badge: item.status }, item.detail]))}`;
  }

  function renderRuntime(data) {
    return `${head('Hard technical gate', 'Runtime and kickoff actions', 'A licensed compatible Autodesk runtime or approved remote workstation is required before native production and fidelity validation.', '<a class="button button--secondary" href="/bdpc/data/manifest.json">Open data manifest</a>')}<div class="principle"><span>Runtime boundary</span><strong>The analytical toolchain is ready. The native production toolchain is not.</strong><p>Open-source and browser checks establish analytical and publication evidence only; they do not establish Autodesk openability, dependency behavior, title-block authority, layout fidelity, or plotting fidelity.</p></div>${table(['Component', 'Version or class', 'Status', 'Availability', 'Purpose'], data.runtime.map(item => [item.component, item.version, { badge: item.status }, item.availability, item.purpose]))}<h3 class="subhead">Kickoff requirements</h3>${table(['Sequence', 'Gate', 'Status', 'Owner', 'Requirement'], data.kickoff_gates.map(item => [item.sequence, item.gate, { badge: item.status }, item.owner, item.requirement]))}<h3 class="subhead">Validated session hierarchy</h3>${table(['Session', 'Generalized role', 'Points', 'Status', 'Limitation'], data.validation_sessions.map(item => [item.session, item.role, item.points.toLocaleString(), { badge: item.status }, item.limitation]))}<h3 class="subhead">Client actions</h3><ol class="action-list">${data.client_actions.map(item => `<li>${esc(item)}</li>`).join('')}</ol><div class="two-col"><article class="card"><h3>Verified downloads</h3><ul><li><button class="text-button" type="button" data-sqlite-download>Download SQLite database</button></li><li><a href="/bdpc/data/project.json" download>Download JSON snapshot</a></li><li><a href="/bdpc/data/schema.sql" download>Download SQL schema</a></li><li><a href="/bdpc/data/manifest.json">Review hashes and table counts</a></li></ul></article><article class="card"><h3>Still requires licensed validation</h3><p>Native openability, xrefs, fonts, object support, title-block authority, layouts, page setup, CTB/STB behavior, viewport scales, and plot fidelity remain unvalidated.</p></article></div>`;
  }

  function authorize() {
    const subject = encodeURIComponent('Dunn Residence — written project authorization');
    const body = encodeURIComponent('Thomas,\n\nBDPC authorizes the Dunn Residence $3,200 fixed-fee scope with one consolidated review round. We will arrange the $1,600 start payment, confirm the controlling CAD/design/title-block/standards inputs, and coordinate licensed runtime access.\n\nPlease confirm when all kickoff gates are complete and the production clock can begin.\n\nBest,\nBrian');
    window.location.href = `mailto:tsmithcad@gmail.com?subject=${subject}&body=${body}`;
  }

  function bindDynamic() {
    document.querySelectorAll('[data-authorize]').forEach(button => button.addEventListener('click', authorize));
    document.querySelectorAll('[data-sqlite-download]').forEach(button => button.addEventListener('click', () => {
      if (window.BDPC_SQLITE_DOWNLOAD) window.BDPC_SQLITE_DOWNLOAD(showToast);
      else showToast('SQLite downloader is still loading. Please try again.');
    }));
  }

  async function load() {
    try {
      const [data, manifest] = await Promise.all([
        fetch('/bdpc/data/project.json', { cache: 'no-store' }).then(response => {
          if (!response.ok) throw new Error('project data');
          return response.json();
        }),
        fetch('/bdpc/data/manifest.json', { cache: 'no-store' }).then(response => {
          if (!response.ok) throw new Error('manifest');
          return response.json();
        })
      ]);
      document.getElementById('revision-label').textContent = `Client Service OS · revision ${data.revision}`;
      document.getElementById('footer-revision').textContent = data.revision;
      document.getElementById('panel-overview').innerHTML = renderOverview(data, manifest);
      document.getElementById('panel-milestones').innerHTML = renderMilestones(data);
      document.getElementById('panel-files').innerHTML = renderFiles(data);
      document.getElementById('panel-standards').innerHTML = renderStandards(data);
      document.getElementById('panel-automation').innerHTML = renderAutomation(data);
      document.getElementById('panel-cad-prep').innerHTML = renderCadPrep(data);
      document.getElementById('panel-delivery').innerHTML = renderDelivery(data);
      document.getElementById('panel-commercial').innerHTML = renderCommercial(data);
      document.getElementById('panel-updates').innerHTML = renderUpdates(data);
      document.getElementById('panel-runtime').innerHTML = renderRuntime(data);
      bindDynamic();
    } catch (error) {
      document.getElementById('panel-overview').innerHTML = '<div class="callout"><strong>Workspace data could not load.</strong> Open the report library or refresh the page.</div>';
    }
  }

  document.getElementById('authorize-top')?.addEventListener('click', authorize);
  activate(location.hash.replace('#', '') || 'overview');
  window.addEventListener('hashchange', () => activate(location.hash.replace('#', '') || 'overview'));
  load();
})();
