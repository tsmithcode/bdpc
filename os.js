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
    const rows = data.milestones.map(item => [item.id, item.name, { badge: item.status }, item.phase, item.evidence, item.limitation]);
    return `${head('Evidence-backed states', 'Milestones', 'Statuses are reported by acceptance state; no activity-derived overall percentage is used.')}${table(['ID', 'Milestone', 'Status', 'Phase', 'Evidence', 'Limitation'], rows)}`;
  }

  function renderFiles(data) {
    const metrics = data.metrics;
    return `${head('Client-safe aggregate only', 'Source and evidence inventory', 'Confidential source files, filenames, exact address, coordinates, detailed bounds, and private manifests are not published.', '<a class="button button--secondary" href="/bdpc/reports/intake/">Open intake report</a>')}<div class="metric-grid metric-grid--six"><article><span>Source files</span><strong>${metrics.source_files}</strong><small>Metadata inventory</small></article><article><span>Source bytes</span><strong>${metrics.source_bytes.toLocaleString()}</strong><small>${metrics.source_size_gib.toFixed(2)} GiB</small></article><article><span>Sessions</span><strong>${metrics.scan_sessions}</strong><small>Five validation pairs passed</small></article><article><span>Source points</span><strong>${metrics.source_points.toLocaleString()}</strong><small>Bounded all-point processing</small></article><article><span>Current figures</span><strong>${metrics.full_source_figures}</strong><small>Full-source figures generated</small></article><article><span>Current controls</span><strong>${metrics.plan_control_slices + metrics.native_overlays}</strong><small>Slices and overlays</small></article></div><div class="callout"><strong>Source integrity:</strong> ${esc(data.source_integrity_statement)}</div>${table(['Session', 'Generalized role', 'Points', 'Validation', 'Boundary'], data.validation_sessions.map(item => [item.session, item.role, item.points.toLocaleString(), { badge: item.status }, item.limitation]))}`;
  }

  function renderStandards(data) {
    return `${head('Authority and limitations', 'Controlling standards', 'BDPC confirmation—not filename, date, location, or format—establishes which inputs control production.')}<div class="two-col"><article class="card"><h3>Controlling-input confirmation required</h3><ul><li>Current project CAD</li><li>Design/redline or conceptual intent</li><li>Title block</li><li>Standards and dependency inputs</li></ul></article><article class="card"><h3>Truth boundary</h3><ul>${data.truth_boundary.map(item => `<li>${esc(item)}</li>`).join('')}</ul></article></div><div class="callout"><strong>Conflict rule:</strong> unresolved differences are documented and returned for BDPC direction; they are never silently resolved.</div>`;
  }

  function renderAutomation(data) {
    return `${head('Production-first controls', 'Analytical and automation state', 'Validated bounded processing supports decisions; it does not replace licensed native production or professional review.')}<div class="status-grid"><article class="status-card status-card--complete">${badge('Complete')}<h3>Bounded point processing</h3><p>${data.metrics.source_points.toLocaleString()} source points were processed and reconciled without regenerating source data.</p></article><article class="status-card status-card--complete">${badge('Complete')}<h3>Client-safe release data</h3><p>JSON, CSV, SQLite, multipart transport, and manifest hashes share one canonical build.</p></article><article class="status-card status-card--blocked">${badge('Blocked')}<h3>Native validation</h3><p>Openability, dependencies, layouts, title-block behavior, and plot fidelity await a licensed compatible runtime.</p></article><article class="status-card status-card--not-started">${badge('Not started')}<h3>Drawing production</h3><p>Native drawing work begins only when the four kickoff gates clear.</p></article></div>`;
  }

  function renderDelivery(data) {
    return `${head('Three-sheet scope', 'Delivery and QA', 'The check-set target is three business days after all kickoff gates; total production is four to five business days excluding client review.')}${table(['Sequence', 'Deliverable', 'Status', 'Scope', 'Format', 'Target'], data.deliverables.map(item => [item.sequence, item.name, { badge: item.status }, item.scope, item.format, item.target]))}<h3 class="subhead">Quality gates</h3>${table(['Check', 'Status', 'Evidence or acceptance condition'], data.qa_checks.map(item => [item.check, { badge: item.status }, item.evidence]))}<div class="callout"><strong>Review allowance:</strong> one consolidated client review round is included.</div>`;
  }

  function renderCommercial(data) {
    return `<div class="commercial-hero"><div><span class="eyebrow">Ready for written authorization</span><h2>$3,200 fixed fee</h2><p>$1,600 start payment · $1,600 final payment · one consolidated review round.</p></div><button class="button button--primary" type="button" data-authorize>Authorize project</button></div>${table(['Commercial term', 'Value', 'Status or trigger'], data.commercial.map(item => [item.term, item.value, item.status]))}<div class="two-col"><article class="card"><h3>Included</h3><ul><li>Existing floor plan</li><li>Proposed floor plan</li><li>Site and area plan</li><li>One consolidated review round</li><li>Final native CAD and PDF issue after QA</li></ul></article><article class="card"><h3>Schedule starts after</h3><ol>${data.kickoff_gates.map(item => `<li>${esc(item.gate)}</li>`).join('')}</ol></article></div><div class="actions"><a class="button button--secondary" href="/bdpc/sow/">Open printable estimate and SOW</a></div>`;
  }

  function renderUpdates(data) {
    return `${head('Client-safe record', 'Updates', 'Current release events and next actions; private working logs remain outside the site.')}${table(['Date', 'Update', 'Status', 'Detail'], data.updates.map(item => [item.date, item.title, { badge: item.status }, item.detail]))}`;
  }

  function renderRuntime(data) {
    return `${head('Hard technical gate', 'Runtime and kickoff actions', 'A licensed compatible Autodesk runtime or approved remote workstation is required before native production and fidelity validation.', '<a class="button button--secondary" href="/bdpc/data/manifest.json">Open data manifest</a>')}${table(['Sequence', 'Gate', 'Status', 'Owner', 'Requirement'], data.kickoff_gates.map(item => [item.sequence, item.gate, { badge: item.status }, item.owner, item.requirement]))}<h3 class="subhead">Client actions</h3><ol class="action-list">${data.client_actions.map(item => `<li>${esc(item)}</li>`).join('')}</ol><div class="two-col"><article class="card"><h3>Verified downloads</h3><ul><li><button class="text-button" type="button" data-sqlite-download>Download SQLite database</button></li><li><a href="/bdpc/data/project.json" download>Download JSON snapshot</a></li><li><a href="/bdpc/data/schema.sql" download>Download SQL schema</a></li><li><a href="/bdpc/data/manifest.json">Review hashes and table counts</a></li></ul></article><article class="card"><h3>Not yet validated</h3><p>Native openability, references, fonts, object support, title-block authority, layouts, page setup, and plot fidelity remain pending the licensed runtime.</p></article></div>`;
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
