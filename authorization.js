(() => {
  'use strict';

  const AUTH_URL = '/bdpc/data/current-authorization.json';
  const SOW_URL = '/bdpc/sow/';
  const REPORTS_URL = '/bdpc/reports/';
  const ARCHIVE_URL = '/bdpc/sow/archive/';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  const styles = `
    .authorized-banner{width:min(1180px,calc(100% - 28px));margin:18px auto 0;padding:18px 20px;border:1px solid #bfe1cc;border-left:6px solid #147a4b;border-radius:18px;background:linear-gradient(135deg,#f0faf4,#fff);box-shadow:0 12px 32px rgba(11,18,32,.08)}
    .authorized-banner__grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:22px;align-items:center}.authorized-banner__eyebrow,.scope-eyebrow{color:#147a4b;font-size:9px;font-weight:950;letter-spacing:.13em;text-transform:uppercase}.authorized-banner h2{margin:6px 0 7px;font-size:25px;line-height:1.08}.authorized-banner p{margin:0;color:#446253;font-size:12px;line-height:1.55}.authorized-banner__actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
    .authorized-banner__actions a,.scope-actions a,.payment-dock a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:999px;padding:10px 14px;border:1px solid #c9d6df;background:#fff;color:#0b1220;font-size:10px;font-weight:900;text-decoration:none}.authorized-banner__actions a:first-child,.scope-actions a.primary,.payment-dock a{border-color:#147a4b;background:#147a4b;color:#fff}
    .scope-hero{padding:24px;border:1px solid #bfe1cc;border-radius:22px;background:linear-gradient(145deg,#f0faf4,#fff)}.scope-hero__top{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start}.scope-hero h2{margin:7px 0 8px;font-size:34px;line-height:1.02}.scope-hero p{margin:0;color:#446253;font-size:13px;line-height:1.6}.scope-price{font-size:34px;font-weight:950;color:#147a4b}.scope-grid,.evidence-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}.scope-grid article,.evidence-grid article{padding:14px;border:1px solid #cfe7d9;border-radius:14px;background:rgba(255,255,255,.82)}.scope-grid span,.evidence-grid span{color:#667085;font-size:8px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.scope-grid strong,.evidence-grid strong{display:block;margin-top:6px;font-size:14px;line-height:1.3}.scope-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
    .authorization-table{width:100%;border-collapse:collapse}.authorization-table th,.authorization-table td{padding:10px;border-bottom:1px solid #edf1f5;text-align:left;vertical-align:top;font-size:11px;line-height:1.5}.authorization-table th{background:#f7f9fc;color:#475467;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.authorization-table tr:last-child td{border-bottom:0}.state-complete{color:#147a4b;font-weight:900}.state-open{color:#946200;font-weight:900}.scope-note{margin-top:18px;padding:13px;border-left:4px solid #946200;background:#fff8e5;color:#684d00;font-size:11px;line-height:1.5}
    .check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.check-card{padding:16px;border:1px solid #d9e1ea;border-radius:16px;background:#fff}.check-card h3{margin:0 0 8px;font-size:14px}.check-card ul,.check-card ol{margin:0;padding-left:18px}.check-card li{margin:6px 0;font-size:11px;line-height:1.5}.payment-dock{position:fixed;right:18px;bottom:18px;z-index:50;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border:1px solid #bfe1cc;border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 18px 44px rgba(11,18,32,.2);backdrop-filter:blur(12px)}.payment-dock span{font-size:10px;font-weight:900;color:#344054}.payment-dock small{display:block;color:#667085;font-size:8px;font-weight:700}.error-state{padding:24px;border:1px solid #efc8c8;border-radius:16px;background:#fff5f5;color:#7a271a}
    @media(max-width:760px){.authorized-banner__grid,.scope-hero__top{grid-template-columns:1fr}.authorized-banner__actions{justify-content:flex-start}.scope-grid,.evidence-grid,.check-grid{grid-template-columns:1fr 1fr}.payment-dock{left:10px;right:10px;bottom:10px;justify-content:space-between}.payment-dock span{max-width:48%}}
    @media(max-width:480px){.scope-grid,.evidence-grid,.check-grid{grid-template-columns:1fr}.payment-dock span{display:none}.payment-dock a{width:100%}}
    @media print{.authorized-banner,.payment-dock{display:none!important}}
  `;

  function installStyles() {
    if (document.getElementById('current-authorization-styles')) return;
    const style = document.createElement('style');
    style.id = 'current-authorization-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function stateClass(status) {
    const normalized = String(status).toLowerCase();
    return normalized.includes('complete') || normalized.includes('authorized') ? 'state-complete' : 'state-open';
  }

  function sectionHead(eyebrow, title, copy = '', action = '') {
    return `<div class="section-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ''}</div>${action}</div>`;
  }

  function table(headers, rows) {
    return `<div class="table-wrap"><table class="authorization-table"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => {
      if (cell && typeof cell === 'object' && 'status' in cell) return `<td class="${stateClass(cell.status)}">${esc(cell.status)}</td>`;
      return `<td>${esc(cell)}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function list(items) {
    return `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }

  function currentHero(auth) {
    return `<div class="scope-hero"><div class="scope-hero__top"><div><span class="scope-eyebrow">Authorized one-day trial</span><h2>${esc(auth.scope.deliverable)}</h2><p>Written authorization is complete. The active commercial authority is one existing-condition sheet in native AutoCAD DWG and PDF. The earlier three-sheet proposal is superseded and archived.</p></div><div class="scope-price">$${esc(auth.commercial.fixed_fee_usd)}</div></div><div class="scope-grid"><article><span>Authorization</span><strong>Complete</strong></article><article><span>Payment</span><strong>${esc(auth.commercial.payment_status)}</strong></article><article><span>Effort ceiling</span><strong>${esc(auth.commercial.effort_ceiling_hours)} hours</strong></article><article><span>Delivery</span><strong>4 PM EDT · Jul 22</strong></article></div><div class="scope-actions"><a class="primary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600 and activate</a><a href="${SOW_URL}">Review current SOW</a><a href="${ARCHIVE_URL}">Revision archive</a></div></div>`;
  }

  function gates(auth) {
    return table(
      ['Activation item', 'Owner', 'State', 'Evidence / next action'],
      auth.activation_gates.map(g => [g.name, g.owner, {status:g.status}, g.evidence])
    );
  }

  function renderOverview(auth) {
    const e = auth.evidence_snapshot;
    return `${currentHero(auth)}
      <div class="evidence-grid">
        <article><span>Protected source inventory</span><strong>${Number(e.source_files).toLocaleString()} files · ${esc(e.source_size_gib)} GiB</strong></article>
        <article><span>Validated scan sessions</span><strong>${esc(e.validated_sessions)} / ${esc(e.scan_sessions)}</strong></article>
        <article><span>Analyzed source points</span><strong>${(Number(e.source_points)/1e6).toFixed(2)}M</strong></article>
        <article><span>Supporting reports</span><strong>${esc(e.reports)} client-safe controls</strong></article>
      </div>
      <div class="callout"><strong>Contract boundary:</strong> the report library remains supporting evidence and production control. It does not expand the contractual delivery beyond the authorized one-sheet trial.</div>
      <div class="actions"><a class="button button--secondary" href="${REPORTS_URL}">Open report library</a><a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open CAD Prep</a><a class="button button--secondary" href="${AUTH_URL}">Open authorization JSON</a></div>`;
  }

  function renderMilestones(auth) {
    const rows = [
      ['1', 'Written authorization', {status:'Complete'}, 'Brian Dillman email received July 21, 2026'],
      ['2', '$600 payment', {status:auth.commercial.payment_status}, 'Full payment activates production'],
      ['3', 'Controlling inputs and standards', {status:'Confirm before production'}, 'Point cloud, support package, AutoCAD version, title block, CTB/STB, fonts, xrefs, and BDPC standards'],
      ['4', 'Licensed native runtime', {status:'Awaiting activation'}, 'Monthly AutoCAD subscription and compatible production environment'],
      ['5', auth.scope.deliverable, {status:'Not started'}, auth.schedule.delivery_due_display]
    ];
    return `${sectionHead('Current authorization', 'Trial assignment milestones', 'Current contractual progress is separated from completed preflight evidence.')}
      ${table(['Sequence','Milestone','Status','Acceptance / next action'], rows)}
      <h3 class="subhead">Assignment-ready effort plan</h3>
      ${table(['Sequence','Workstream','Planned hours','Current state'], auth.work_plan.map(w => [w.sequence,w.workstream,w.hours.toFixed(2),{status:w.status}]))}
      <div class="scope-note"><strong>Absolute included ceiling:</strong> ${esc(auth.commercial.effort_ceiling_hours)} planned hours. Work pauses before unsupported fabrication or unapproved overrun.</div>`;
  }

  function renderFiles(auth) {
    const e = auth.evidence_snapshot;
    return `${sectionHead('Source authority', 'Files and evidence controls', 'Only the confirmed controlling package may drive production. Confidential raw files remain private and are not published.', `<a class="button button--secondary" href="/bdpc/reports/intake/">Open intake report</a>`)}
      <div class="check-grid">
        <article class="check-card"><h3>Controlling production inputs</h3>${list([
          'Exact point cloud selected by BDPC',
          'Confirmed supporting drawings, images, redlines, and room-name information',
          'Target AutoCAD/DWG version and native dependencies',
          'Title block, CTB/STB, layer/style standards, fonts, xrefs, and naming requirements'
        ])}</article>
        <article class="check-card"><h3>Protected evidence inventory</h3>${list([
          `${Number(e.source_files).toLocaleString()} files / ${e.source_size_gib} GiB inventoried`,
          `${Number(e.source_points).toLocaleString()} source points analyzed`,
          `${e.validated_sessions} of ${e.scan_sessions} scan sessions validated`,
          `${e.full_source_figures} full-source figures, ${e.plan_control_slices} plan-control slices, and ${e.native_overlays} native overlays`
        ])}</article>
      </div>
      <div class="callout"><strong>Registration boundary:</strong> ${esc(e.registration_boundary)}</div>
      <div class="actions"><a class="button button--secondary" href="/bdpc/reports/">Open evidence library</a><a class="button button--secondary" href="/bdpc/data/archive/index.json">Open revision catalog</a></div>`;
  }

  function renderStandards(auth) {
    return `${sectionHead('Native production basis', 'Standards and decision controls', 'BDPC-confirmed standards and later written project correspondence control. Conflicts are returned for direction rather than silently resolved.')}
      <div class="check-grid">
        <article class="check-card"><h3>Required confirmations</h3>${list(auth.standards_required)}</article>
        <article class="check-card"><h3>Authority hierarchy</h3>${list([
          'Later written project correspondence mutually accepted by the parties',
          'Current authorized SOW and current-authorization.json',
          'Confirmed assignment brief and source-of-truth register',
          'BDPC-confirmed native files and standards',
          'Analytical reports and visual references as supporting evidence only'
        ])}</article>
      </div>
      <div class="callout"><strong>Professional boundary:</strong> BDPC retains architectural interpretation, code and permit responsibility, and final professional acceptance. CAD Guardian provides controlled CAD production and QA.</div>`;
  }

  function renderAutomation(auth) {
    return `${sectionHead('Human-reviewed acceleration', 'Automation controls', 'Automation may accelerate extraction, drafting, and QA without transferring authority or weakening the evidence boundary.')}
      ${table(['Control','Current rule'], auth.automation_controls.map((rule,index)=>[`A-${String(index+1).padStart(2,'0')}`,rule]))}
      <div class="check-grid">
        <article class="check-card"><h3>Authorized acceleration</h3>${list([
          'Point-cloud validation and bounded analytical processing',
          'Plan-density and slice references',
          'Candidate geometry generation and reconciliation',
          'AutoCAD API, property, dependency, audit, and plotting checks',
          'AI-assisted visual review followed by human verification'
        ])}</article>
        <article class="check-card"><h3>Never automated away</h3>${list([
          'Selection of the controlling source',
          'Architectural judgment or design authority',
          'Acceptance of unsupported dimensions or concealed conditions',
          'Final human review and release',
          'BDPC professional acceptance'
        ])}</article>
      </div>`;
  }

  function renderCadPrep(auth) {
    const prepRows = auth.work_plan.map(w => [
      `TRI-${String(w.sequence).padStart(3,'0')}`,
      w.workstream,
      w.hours.toFixed(2),
      {status:w.status}
    ]);
    return `${sectionHead('One-sheet production control', 'CAD drafter preparation', 'The active checklist is constrained to the Existing Main Level As-Built Floor Plan and the eight-hour ceiling.', `<a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open detailed CAD Prep</a>`)}
      ${table(['Control group','Assignment','Hours','State'], prepRows)}
      <div class="check-grid">
        <article class="check-card"><h3>Before drafting</h3>${list([
          'Lock the controlling point cloud and support package',
          'Protect originals and create a controlled working set',
          'Confirm units, level band, AutoCAD version, title block, CTB/STB, layers, styles, fonts, xrefs, and file naming',
          'Record unresolved conflicts before geometry production'
        ])}</article>
        <article class="check-card"><h3>Before release</h3>${list([
          'Resolve gaps, duplicates, joins, candidate geometry, and unsupported assumptions',
          'Run native open, audit, layer/property, xref/font, viewport, page-setup, and plot QA',
          'Confirm the PDF matches the final visible DWG and contains no clipping',
          'Package one DWG and one PDF with any unresolved-condition note'
        ])}</article>
      </div>`;
  }

  function renderDelivery(auth) {
    return `${sectionHead('Authorized delivery', 'One-sheet production and QA', 'Existing conditions only. No proposed plan, site plan, or design work is included.', `<a class="button button--secondary" href="${SOW_URL}">Open current SOW</a>`)}
      ${table(['Deliverable','Format','Status','Target'], auth.scope.formats.map(format => [auth.scope.deliverable,format,{status:'Not started'},auth.schedule.delivery_due_display]))}
      <h3 class="subhead">Acceptance criteria</h3>
      <div class="check-grid">${auth.acceptance_criteria.map((criterion,index)=>`<article class="check-card"><h3>AC-${String(index+1).padStart(2,'0')}</h3><p>${esc(criterion)}</p></article>`).join('')}</div>
      <div class="callout"><strong>Correction allowance:</strong> ${esc(auth.commercial.minor_correction)}.</div>`;
  }

  function renderCommercial(auth) {
    return `${currentHero(auth)}
      ${table(['Commercial term','Current value','Control'], [
        ['Fixed fee', `$${auth.commercial.fixed_fee_usd}.00 USD`, 'One-sheet, one-working-day trial'],
        ['Payment', auth.commercial.payment_requirement, auth.commercial.payment_status],
        ['Effort ceiling', `${auth.commercial.effort_ceiling_hours.toFixed(1)} planned hours maximum`, 'Fixed fee remains controlling; not hourly billing'],
        ['Minor correction', auth.commercial.minor_correction, 'One consolidated response'],
        ['Additional services', auth.commercial.additional_services, 'Written authorization required'],
        ['Validity', `Through ${auth.commercial.valid_through}`, 'Unless extended in writing']
      ])}
      <h3 class="subhead">Activation gates</h3>${gates(auth)}
      <h3 class="subhead">Separate authorization required</h3>${list(auth.change_control)}
      <div class="scope-note"><strong>Superseded:</strong> the earlier three-sheet $3,200 proposal is retained in the revision archive for transparency and is not current production authority.</div>`;
  }

  function renderUpdates(auth) {
    return `${sectionHead('Controlling correspondence', 'Current updates', 'The latest written direction controls the assignment.')}
      ${table(['Date','Update','Status','Detail'], [
        ['July 21, 2026','One-day trial authorized',{status:'Authorized'},auth.authorization.statement],
        ['July 21, 2026','SOW Version 3 issued',{status:'Current terms'},'One Existing Main Level As-Built Floor Plan; native AutoCAD DWG and PDF; $600 fixed fee; eight-hour ceiling; one minor correction pass.'],
        ['July 21, 2026','Secure payment link issued',{status:auth.commercial.payment_status},'Full payment is required before production begins.'],
        ['July 21, 2026','Three-sheet proposal archived',{status:'Superseded'},'Prior commercial scope remains available for audit history only.']
      ])}
      <div class="actions"><a class="button button--secondary" href="${ARCHIVE_URL}">Open SOW revision archive</a><a class="button button--secondary" href="/bdpc/data/archive/index.json">Open data revision catalog</a></div>`;
  }

  function renderRuntime(auth) {
    return `${sectionHead('Production activation', 'Runtime and kickoff actions', 'Written authorization is complete. Payment, controlling-input confirmation, and compatible native setup remain.', `<a class="button button--secondary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600</a>`)}
      ${gates(auth)}
      <div class="check-grid">
        <article class="check-card"><h3>CAD Guardian after payment</h3>${list([
          'Purchase and activate the monthly AutoCAD subscription',
          'Configure the agreed target AutoCAD version',
          'Validate title block, CTB/STB, layers, styles, fonts, xrefs, page setup, and plotting',
          'Create the protected native working set',
          'Begin the one-working-day production and QA sequence'
        ])}</article>
        <article class="check-card"><h3>Stop-work triggers</h3>${list([
          'Controlling source cannot be identified',
          'Units or scale cannot be confirmed',
          'Main-level coverage is materially incomplete',
          'Files are corrupt, inaccessible, or require unsupported transformation',
          'Critical standards or dependencies prevent responsible plotting',
          'Continuing would require unsupported fabrication'
        ])}</article>
      </div>
      <div class="callout"><strong>Clock-start rule:</strong> ${esc(auth.schedule.clock_start_rule)}</div>`;
  }

  const renderers = {
    overview: renderOverview,
    milestones: renderMilestones,
    files: renderFiles,
    standards: renderStandards,
    automation: renderAutomation,
    'cad-prep': renderCadPrep,
    delivery: renderDelivery,
    commercial: renderCommercial,
    updates: renderUpdates,
    runtime: renderRuntime
  };

  function activate(id, focus = false) {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    const panels = [...document.querySelectorAll('[role="tabpanel"]')];
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

  function bindTabs() {
    const tabs = [...document.querySelectorAll('[role="tab"]')];
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset.tab));
      tab.addEventListener('keydown', event => {
        if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        activate(tabs[next].dataset.tab, true);
      });
    });
    window.addEventListener('hashchange', () => activate(location.hash.replace('#','') || 'overview'));
  }

  function banner(auth) {
    if (document.querySelector('.authorized-banner')) return;
    const wrapper = document.createElement('section');
    wrapper.className = 'authorized-banner';
    wrapper.setAttribute('aria-labelledby','authorized-banner-title');
    wrapper.innerHTML = `<div class="authorized-banner__grid"><div><div class="authorized-banner__eyebrow">Current written authorization</div><h2 id="authorized-banner-title">${esc(auth.scope.deliverable)}</h2><p>Authorized by ${esc(auth.authorization.authorized_by)} on July 21, 2026 · Native AutoCAD DWG + PDF · $600 fixed fee · ${esc(auth.schedule.delivery_due_display)}. Payment and final native setup remain.</p></div><div class="authorized-banner__actions"><a href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600 securely</a><a href="${SOW_URL}">Current SOW</a><a href="${REPORTS_URL}">Reports</a></div></div>`;
    document.querySelector('.project-bar')?.insertAdjacentElement('afterend',wrapper);
  }

  function paymentDock(auth) {
    if (auth.commercial.payment_status.toLowerCase().includes('paid') || document.querySelector('.payment-dock')) return;
    const dock = document.createElement('div');
    dock.className = 'payment-dock';
    dock.innerHTML = `<span>Authorized trial<small>Payment activates production</small></span><a href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600 securely</a>`;
    document.body.appendChild(dock);
  }

  function patchStatic(auth) {
    document.querySelector('.project-bar .gate strong')?.replaceChildren(document.createTextNode('Authorized one-day trial'));
    document.querySelector('.project-bar .gate small')?.replaceChildren(document.createTextNode('Payment and native setup pending.'));
    const top = document.getElementById('authorize-top');
    if (top) {
      const anchor = document.createElement('a');
      anchor.id = 'authorize-top';
      anchor.className = top.className;
      anchor.href = auth.commercial.payment_link;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.textContent = 'Pay $600 securely';
      top.replaceWith(anchor);
    }
    const revision = document.getElementById('revision-label');
    if (revision) revision.textContent = 'Client Service OS · authorized trial';
    const footer = document.getElementById('footer-revision');
    if (footer) footer.textContent = auth.revision;
  }

  function renderAll(auth) {
    Object.entries(renderers).forEach(([key, renderer]) => {
      const panel = document.getElementById(`panel-${key}`);
      if (panel) panel.innerHTML = renderer(auth);
    });
  }

  async function init() {
    installStyles();
    bindTabs();
    try {
      const response = await fetch(AUTH_URL, {cache:'no-store'});
      if (!response.ok) throw new Error(`Authorization data returned ${response.status}`);
      const auth = await response.json();
      patchStatic(auth);
      banner(auth);
      paymentDock(auth);
      renderAll(auth);
      activate(location.hash.replace('#','') || 'overview');
    } catch (error) {
      console.error('Current authorization failed to load', error);
      const panel = document.getElementById('panel-overview');
      if (panel) panel.innerHTML = `<div class="error-state"><strong>Current authorization data could not load.</strong><p>Use the current SOW and report library while the workspace data is refreshed.</p><div class="scope-actions"><a href="${SOW_URL}">Open current SOW</a><a href="${REPORTS_URL}">Open reports</a></div></div>`;
      activate('overview');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();