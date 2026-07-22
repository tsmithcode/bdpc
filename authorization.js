(() => {
  'use strict';

  const AUTH_URL = '/bdpc/data/current-authorization.json';
  const DOCTRINE_URL = '/bdpc/data/operating-doctrine.json';
  const CONTROLS_URL = '/bdpc/data/production-controls.json';
  const SOW_URL = '/bdpc/sow/';
  const GOVERNING_PDF_URL = '/bdpc/sow/current/';
  const REPORTS_URL = '/bdpc/reports/';
  const ARCHIVE_URL = '/bdpc/sow/archive/';

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);

  const slug = value => String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const styles = `
    .authorized-banner{width:min(1320px,calc(100% - 28px));margin:18px auto 0;padding:18px 20px;border:1px solid #bfe1cc;border-left:6px solid #147a4b;border-radius:18px;background:linear-gradient(135deg,#f0faf4,#fff);box-shadow:0 12px 32px rgba(11,18,32,.08)}
    .authorized-banner__grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:22px;align-items:center}.authorized-banner__eyebrow,.scope-eyebrow{color:#147a4b;font-size:9px;font-weight:950;letter-spacing:.13em;text-transform:uppercase}.authorized-banner h2{margin:6px 0 7px;font-size:25px;line-height:1.08}.authorized-banner p{margin:0;color:#446253;font-size:12px;line-height:1.55}.authorized-banner__actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
    .authorized-banner__actions a,.scope-actions a,.payment-dock a,.action-center a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:999px;padding:10px 14px;border:1px solid #c9d6df;background:#fff;color:#0b1220;font-size:10px;font-weight:900;text-decoration:none}.authorized-banner__actions a:first-child,.scope-actions a.primary,.payment-dock a,.action-center a.primary{border-color:#147a4b;background:#147a4b;color:#fff}
    .scope-hero{padding:25px;border:1px solid #bfe1cc;border-radius:22px;background:linear-gradient(145deg,#f0faf4,#fff)}.scope-hero__top{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start}.scope-hero h2{margin:7px 0 8px;font-size:34px;line-height:1.02}.scope-hero p{margin:0;color:#446253;font-size:13px;line-height:1.6}.scope-price{font-size:34px;font-weight:950;color:#147a4b}.scope-grid,.evidence-grid,.enterprise-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}.scope-grid article,.evidence-grid article,.enterprise-metrics article{padding:14px;border:1px solid #cfe7d9;border-radius:14px;background:rgba(255,255,255,.86)}.scope-grid span,.evidence-grid span,.enterprise-metrics span{color:#667085;font-size:8px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.scope-grid strong,.evidence-grid strong,.enterprise-metrics strong{display:block;margin-top:6px;font-size:14px;line-height:1.3}.scope-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
    .authorization-table{width:100%;border-collapse:collapse}.authorization-table th,.authorization-table td{padding:10px;border-bottom:1px solid #edf1f5;text-align:left;vertical-align:top;font-size:11px;line-height:1.5}.authorization-table th{background:#f7f9fc;color:#475467;font-size:8px;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}.authorization-table tr:last-child td{border-bottom:0}
    .status-pill{display:inline-flex;align-items:center;border-radius:999px;padding:5px 8px;font-size:8.5px;font-weight:950;white-space:nowrap}.status-pill--good{background:#edf9f3;color:#147a4b}.status-pill--warn{background:#fff8e5;color:#946200}.status-pill--bad{background:#fef3f2;color:#b42318}.status-pill--info{background:#eef8ff;color:#087ea4}.status-pill--neutral{background:#f1f4f7;color:#475467}
    .scope-note{margin-top:18px;padding:13px;border-left:4px solid #946200;background:#fff8e5;color:#684d00;font-size:11px;line-height:1.5}.truth-note{margin-top:18px;padding:14px 16px;border-left:4px solid #087ea4;background:#f1fbfd;color:#315363;font-size:11px;line-height:1.55}
    .check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.check-card{padding:16px;border:1px solid #d9e1ea;border-radius:16px;background:#fff}.check-card h3{margin:0 0 8px;font-size:14px}.check-card p{margin:0;color:#344054;font-size:11px;line-height:1.55}.check-card ul,.check-card ol{margin:0;padding-left:18px}.check-card li{margin:6px 0;font-size:11px;line-height:1.5}
    .enterprise-principle{margin:18px 0;padding:20px;border-radius:18px;background:linear-gradient(145deg,#0b1220,#17243e);color:#fff}.enterprise-principle span{font-size:8px;text-transform:uppercase;letter-spacing:.12em;color:#66ddf5;font-weight:900}.enterprise-principle strong{display:block;margin-top:8px;font-size:23px;line-height:1.18}.enterprise-principle p{margin:8px 0 0;color:#cbd5e1;font-size:11.5px;line-height:1.55}
    .action-center{margin:18px 0;padding:20px;border:1px solid #bfe1cc;border-radius:18px;background:linear-gradient(135deg,#edf9f3,#fff)}.action-center__grid{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}.action-center h3{margin:5px 0 7px;font-size:21px}.action-center p{margin:0;color:#446253;font-size:11.5px;line-height:1.55}.action-center__actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .phase-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;margin:0 0 18px}.phase-grid article{padding:14px;border:1px solid #d9e1ea;border-radius:14px;background:#fff}.phase-grid span{font-size:8px;color:#667085;text-transform:uppercase;letter-spacing:.08em;font-weight:900}.phase-grid strong{display:block;margin-top:7px;font-size:19px}.phase-grid small{display:block;margin-top:4px;color:#667085;font-size:9px;line-height:1.35}
    .report-grid--enterprise{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.report-grid--enterprise .report-card{min-height:155px}
    .payment-dock{position:fixed;right:18px;bottom:18px;z-index:50;display:flex;align-items:center;gap:12px;padding:10px 12px 10px 16px;border:1px solid #bfe1cc;border-radius:999px;background:rgba(255,255,255,.97);box-shadow:0 18px 44px rgba(11,18,32,.2);backdrop-filter:blur(12px)}.payment-dock span{font-size:10px;font-weight:900;color:#344054}.payment-dock small{display:block;color:#667085;font-size:8px;font-weight:700}.error-state{padding:24px;border:1px solid #efc8c8;border-radius:16px;background:#fff5f5;color:#7a271a}
    @media(max-width:1050px){.phase-grid{grid-template-columns:repeat(3,1fr)}.report-grid--enterprise{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:760px){.authorized-banner__grid,.scope-hero__top,.action-center__grid{grid-template-columns:1fr}.authorized-banner__actions,.action-center__actions{justify-content:flex-start}.scope-grid,.evidence-grid,.enterprise-metrics,.check-grid{grid-template-columns:1fr 1fr}.payment-dock{left:10px;right:10px;bottom:10px;justify-content:space-between}.payment-dock span{max-width:48%}}
    @media(max-width:480px){.scope-grid,.evidence-grid,.enterprise-metrics,.check-grid,.phase-grid,.report-grid--enterprise{grid-template-columns:1fr}.payment-dock span{display:none}.payment-dock a{width:100%}}
    @media print{.authorized-banner,.payment-dock{display:none!important}}
  `;

  function installStyles() {
    if (document.getElementById('current-authorization-styles')) return;
    const style = document.createElement('style');
    style.id = 'current-authorization-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function statusTone(status) {
    const value = String(status ?? '').toLowerCase();
    if (/(blocked|prohibited|critical)/.test(value)) return 'bad';
    if (/(awaiting|pending|open|ready after|technical confirmation|required|confirm)/.test(value)) return 'warn';
    if (/(complete|confirmed|active|approved|available|controlled|authorized)/.test(value)) return 'good';
    if (/(ready|planned|supporting|conditional)/.test(value)) return 'info';
    return 'neutral';
  }

  function statusPill(status) {
    return `<span class="status-pill status-pill--${statusTone(status)}">${esc(status)}</span>`;
  }

  function sectionHead(eyebrow, title, copy = '', action = '') {
    return `<div class="section-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${copy ? `<p>${esc(copy)}</p>` : ''}</div>${action}</div>`;
  }

  function table(headers, rows) {
    return `<div class="table-wrap"><table class="authorization-table"><thead><tr>${headers.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => {
      if (cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'status')) return `<td>${statusPill(cell.status)}</td>`;
      return `<td>${esc(cell)}</td>`;
    }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function list(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${items.map(item => `<li>${esc(item)}</li>`).join('')}</${tag}>`;
  }

  function byId(items, ids) {
    const source = Array.isArray(items) ? items : [];
    return ids.map(id => source.find(item => item.id === id)).filter(Boolean);
  }

  function currentHero(auth) {
    return `<div class="scope-hero"><div class="scope-hero__top"><div><span class="scope-eyebrow">Authorized one-sheet trial</span><h2>${esc(auth.scope.deliverable)}</h2><p>Written authorization and the BDPC drafting rules are recorded. The trace package, source roles, and starting template are ready. Final production still needs licensed AutoCAD drafting plus final scale/source confirmation.</p></div><div class="scope-price">$${esc(auth.commercial.fixed_fee_usd)}</div></div><div class="scope-grid"><article><span>Authorization</span><strong>Email authorization</strong></article><article><span>Signature</span><strong>Not executed</strong></article><article><span>Payment</span><strong>${esc(auth.commercial.payment_status)}</strong></article><article><span>Current gate</span><strong>AutoCAD production</strong></article></div><div class="scope-actions"><a class="primary" href="${SOW_URL}">Current SOW V4</a><a href="${GOVERNING_PDF_URL}">Print / Save PDF</a><a href="${ARCHIVE_URL}">Revision archive</a></div></div>`;
  }

  function actionCenter(auth) {
    return `<div class="action-center"><div class="action-center__grid"><div><span class="scope-eyebrow">Current action</span><h3>${esc(auth.zero_friction_activation.acceptance_message)}</h3><p>${esc(auth.zero_friction_activation.client_action)}</p></div><div class="action-center__actions"><a class="primary" href="${SOW_URL}">Open SOW V4</a><a href="${GOVERNING_PDF_URL}">Print / Save PDF</a></div></div></div>`;
  }

  function gates(auth) {
    return table(
      ['Activation item', 'Owner', 'State', 'Evidence / operating rule'],
      auth.activation_gates.map(g => [g.name, g.owner, { status: g.status }, g.evidence])
    );
  }

  function reportCards(auth) {
    return `<div class="report-grid--enterprise">${auth.reports.map(report => `<a class="report-card" href="${esc(report.url)}"><span>${esc(report.id)}</span><h3>${esc(report.name)}</h3><p>${esc(report.summary)}</p><strong>Open control →</strong></a>`).join('')}</div>`;
  }

  function renderOverview(auth) {
    const e = auth.evidence_snapshot;
    return `${currentHero(auth)}
      ${actionCenter(auth)}
      <div class="enterprise-principle"><span>Working rule</span><strong>Use the prepared evidence. Do not invent missing conditions.</strong><p>${esc(auth.truth_boundary)}</p></div>
      <div class="enterprise-metrics">
        <article><span>Protected source inventory</span><strong>${Number(e.source_files).toLocaleString()} files · ${esc(e.source_size_gib)} GiB</strong></article>
        <article><span>Validated scan sessions</span><strong>${esc(e.validated_sessions)} / ${esc(e.scan_sessions)}</strong></article>
        <article><span>Trace master</span><strong>DWG + DXF ready</strong></article>
        <article><span>Starting template</span><strong>Created and evaluated</strong></article>
      </div>
      ${sectionHead('Current status', 'Activation gates', 'Short version of what is complete and what still controls production.')}
      ${gates(auth)}
      <div class="check-grid" style="margin-top:18px"><article class="check-card"><h3>When AutoCAD is available</h3>${list(auth.zero_friction_activation.provider_actions_after_payment, true)}</article><article class="check-card"><h3>Do not proceed if</h3>${list([
        'Brian objects to a listed file role',
        'Scale or source coverage cannot be responsibly locked',
        'A material architectural decision is required',
        'Native dependencies prevent a reproducible DWG/PDF'
      ])}</article></div>`;
  }

  function renderMilestones(auth) {
    const phases = [...new Set(auth.milestone_register.map(item => item.phase))];
    const phaseCards = phases.map(phase => {
      const items = auth.milestone_register.filter(item => item.phase === phase);
      const complete = items.filter(item => /(complete|authorized)/i.test(item.status)).length;
      return `<article><span>${esc(phase)}</span><strong>${complete} / ${items.length}</strong><small>${complete === items.length ? 'Phase accepted' : 'Stage-gated; see ledger'}</small></article>`;
    }).join('');
    return `${sectionHead('Evidence-backed lifecycle', 'Milestones and acceptance states', 'Discovery, evidence, authorization, activation, production, QA, delivery, and closeout remain independently auditable.')}
      <div class="phase-grid">${phaseCards}</div>
      <div class="truth-note"><strong>Reading the ledger:</strong> completed preflight evidence does not imply production completion. Payment is due after delivery; native drawing production still needs licensed AutoCAD access and final scale/source confirmation.</div>
      ${table(['ID', 'Phase', 'Milestone', 'State', 'Acceptance evidence'], auth.milestone_register.map(item => [item.id, item.phase, item.milestone, { status: item.status }, item.acceptance]))}
      <h3 class="subhead">Eight-hour controlled effort plan</h3>
      ${table(['Sequence', 'Workstream', 'Planned hours', 'Current state'], auth.work_plan.map(item => [item.sequence, item.workstream, Number(item.hours).toFixed(2), { status: item.status }]))}
      <div class="scope-note"><strong>Absolute included ceiling:</strong> ${esc(auth.commercial.effort_ceiling_hours)} planned hours. Work stops before unsupported fabrication, hidden schedule slippage, or unapproved overrun.</div>`;
  }

  function renderFiles(auth) {
    const e = auth.evidence_snapshot;
    return `${sectionHead('Public file scope', 'What I am using and what each file is allowed to control', 'This is intentionally short so Brian can correct a file role before production. Confidential raw files remain private and originals remain unchanged.')}
      <div class="evidence-grid">
        <article><span>Files inventoried</span><strong>${Number(e.source_files).toLocaleString()}</strong></article>
        <article><span>Images reviewed</span><strong>${Number(e.reviewed_images).toLocaleString()}</strong></article>
        <article><span>Trace DXFs</span><strong>${esc(e.individual_slice_dxfs)}</strong></article>
        <article><span>Trace master</span><strong>DWG + DXF</strong></article>
      </div>
      <div class="enterprise-principle"><span>Source rule</span><strong>Standards files do not become Dunn geometry.</strong><p>Trace references guide drafting. TCADD and 1419 guide standards and presentation. The area PNG only reconciles gross size/area.</p></div>
      ${table(['File or group', 'Use', 'State', 'Limit'], auth.file_controls.map(item => [item.group, item.role, { status: item.state }, item.control]))}
      <div class="truth-note"><strong>Registration boundary:</strong> ${esc(e.registration_boundary)}</div>`;
  }

  function renderStandards(auth) {
    const activeStandards = byId(auth.standards_register, ['STD-01', 'STD-04', 'STD-07', 'STD-09', 'STD-10', 'STD-13', 'STD-15', 'STD-16']);
    return `${sectionHead('Drafting standards', 'Rules I will apply unless Brian corrects them', 'Condensed to mission-critical drafting decisions for the current existing-condition sheet.')}
      <div class="enterprise-principle"><span>Primary drafting principle</span><strong>Clean, rational, self-checking geometry that BDPC can continue without rework.</strong><p>Do not substitute cosmetic dimension rounding for correct geometry. Do not invent concealed conditions.</p></div>
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Geometry and dimensions</h3>${list([
          'Residential dimensions display no finer than 1/2 inch unless Brian directs otherwise',
          'Typical framed walls start at 3.5 inches unless evidence supports another assembly',
          'Chained and overall dimensions must reconcile',
          'Unsupported rooms, openings, or concealed conditions are disclosed, not invented'
        ])}</article>
        <article class="check-card"><h3>Reference standards</h3>${list([
          'Use TCADD for compatible model-space blocks and drafting logic',
          'Use 1419 Allene/Jurgena for title, sheet, text, dimensions, lineweights, and plotting style',
          'Reuse established BDPC door/window/fixture vocabulary before creating new content',
          'Treat LiDAR and trace vectors as evidence, not automatic truth'
        ])}</article>
      </div>
      <h3 class="subhead">Current standards register</h3>
      ${table(['ID', 'Standard', 'State', 'Rule'], activeStandards.map(item => [item.id, item.standard, { status: item.status }, item.rule]))}
      <div class="truth-note"><strong>Professional boundary:</strong> BDPC retains architectural interpretation, code and permit responsibility, and final professional acceptance. CAD Guardian provides controlled CAD production, automation, and QA.</div>`;
  }

  function renderGlossary(auth) {
    const terms = Array.isArray(auth.glossary_register) ? auth.glossary_register : [];
    const mustWatch = terms.filter(item => /scope|source|delivery|qa/i.test(item.category)).slice(0, 8);
    return `${sectionHead('Glossary', 'Terms to keep final delivery aligned', 'Client-facing definitions for the words that control the DWG/PDF handoff, source authority, QA, and stop conditions.')}
      <div class="enterprise-principle"><span>Alignment rule</span><strong>If a term below sounds wrong, correct it before final AutoCAD drafting.</strong><p>The glossary is here to prevent hidden assumptions, especially around source roles, final delivery, and what is not included.</p></div>
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Terms most likely to affect delivery</h3>${list(mustWatch.map(item => `${item.term}: ${item.meaning}`))}</article>
        <article class="check-card"><h3>Zero-friction rule</h3>${list([
          'Object to any file role that is wrong',
          'Confirm AutoCAD access when available',
          'Expect unsupported conditions to be disclosed instead of invented',
          'Treat final DWG/PDF as complete only after native QA and plot QA pass'
        ])}</article>
      </div>
      <h3 class="subhead">Delivery glossary</h3>
      ${table(['Term', 'Category', 'Meaning', 'Why it matters', 'Action / limit'], terms.map(item => [item.term, item.category, item.meaning, item.delivery_relevance, item.action_or_limit]))}`;
  }

  function renderAutomation(auth) {
    const currentAutomation = byId(auth.automation_register, ['AUT-01', 'AUT-03', 'AUT-04', 'AUT-08', 'AUT-09', 'AUT-11', 'AUT-14']);
    return `${sectionHead('Automation', 'What automation has done and what it is not allowed to decide', 'Only client-relevant controls are shown here. Full internal logs stay out of the public surface.')}
      <div class="enterprise-principle"><span>Human review required</span><strong>Automation prepared references; it does not issue architectural truth.</strong><p>Final CAD linework, unsupported conditions, native QA, and BDPC acceptance remain human-controlled.</p></div>
      ${table(['ID', 'Capability', 'State', 'Use / limit'], currentAutomation.map(item => [item.id, item.capability, { status: item.status }, `${item.production_use}. ${item.human_control}`]))}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Already prepared</h3>${list([
          'Source inventory and image review',
          'Point-cloud statistics, slices, screenshots, and trace references',
          'Master trace DWG/DXF and starting template',
          'Current Codex package and validation checks'
        ])}</article>
        <article class="check-card"><h3>Never automated</h3>${list([
          'Selection of the controlling source',
          'Architectural judgment or design authority',
          'Unsupported dimensions or concealed conditions',
          'Final human CAD review and release',
          'BDPC professional acceptance'
        ])}</article>
      </div>`;
  }

  function renderCadPrep(auth) {
    const prep = byId(auth.cad_prep_register, ['PREP-02', 'PREP-04', 'PREP-05', 'PREP-06', 'PREP-09', 'PREP-10', 'PREP-11', 'PREP-13', 'PREP-14']);
    return `${sectionHead('CAD Prep', 'Execution path from trace package to final DWG/PDF', 'Current prep is trace-ready. The only remaining production gate is licensed AutoCAD drafting, dependency validation, and plot QA.')}
      ${actionCenter(auth)}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Execution path</h3>${list(auth.zero_friction_activation.provider_actions_after_payment, true)}</article>
        <article class="check-card"><h3>Stop and ask Brian if</h3>${list([
          'A listed file role is wrong',
          'The controlling source cannot be identified or frozen',
          'Units, scale, or main-level coverage cannot be responsibly established',
          'Critical fonts, xrefs, object support, plot styles, or title-block dependencies prevent reproducible output',
          'A material conflict requires an architectural decision'
        ])}</article>
      </div>
      <h3 class="subhead">Production-readiness status</h3>
      ${table(['ID', 'Control', 'State', 'What remains'], prep.map(item => [item.id, item.control, { status: item.status }, item.acceptance]))}`;
  }

  function renderDelivery(auth) {
    const criticalQa = byId(auth.qa_register, ['QA-01', 'QA-02', 'QA-03', 'QA-05', 'QA-06', 'QA-07', 'QA-12', 'QA-14', 'QA-15', 'QA-18', 'QA-19', 'QA-20']);
    return `${sectionHead('Delivery + QA', 'What can be delivered after AutoCAD production', 'Existing conditions only. No proposed plan, site plan, demolition plan, or design work is included.', `<a class="button button--secondary" href="${SOW_URL}">Open current SOW</a>`)}
      <div class="enterprise-principle"><span>Issue rule</span><strong>No drawing advances by optimism.</strong><p>Every release condition is explicit: authority, source lock, geometry, standards, dependencies, native openability, plot fidelity, disclosure, and package completeness.</p></div>
      ${table(['Deliverable', 'Format', 'State', 'Target'], auth.scope.formats.map(format => [auth.scope.deliverable, format, { status: format === 'PDF' ? 'awaiting final plot/export' : 'awaiting final AutoCAD production' }, auth.schedule.delivery_due_display]))}
      <h3 class="subhead">Mission-critical QA</h3>
      ${table(['ID', 'Check', 'State', 'Acceptance condition'], criticalQa.map(item => [item.id, item.check, { status: item.status }, item.acceptance]))}
      <div class="scope-note"><strong>Correction allowance:</strong> ${esc(auth.commercial.minor_correction)}.</div>`;
  }

  function renderCommercial(auth) {
    return `${currentHero(auth)}
      ${actionCenter(auth)}
      ${table(['Commercial term', 'Current value', 'Control'], [
        ['Fixed fee', `$${auth.commercial.fixed_fee_usd}.00 USD`, 'One-sheet, one-working-day trial'],
        ['Payment', auth.commercial.payment_requirement, auth.commercial.payment_status],
        ['Effort ceiling', `${Number(auth.commercial.effort_ceiling_hours).toFixed(1)} planned hours maximum`, 'Fixed fee remains controlling; not hourly billing'],
        ['Minor correction', auth.commercial.minor_correction, 'One consolidated response'],
        ['Additional services', auth.commercial.additional_services, 'Written authorization required'],
        ['Validity', `Through ${auth.commercial.valid_through}`, 'Unless extended in writing']
      ])}
      <h3 class="subhead">Activation gates</h3>${gates(auth)}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Included authority</h3>${list(auth.scope.included)}</article>
        <article class="check-card"><h3>Explicitly excluded</h3>${list(auth.scope.excluded)}</article>
      </div>
      <h3 class="subhead">Separate written authorization required</h3>${list(auth.change_control)}
      <div class="scope-note"><strong>Superseded:</strong> the earlier broader proposal remains in the revision archive for transparency and cannot drive current production.</div>`;
  }

  function renderUpdates(auth) {
    const keyRisks = byId(auth.risk_register, ['R-02', 'R-04', 'R-05', 'R-07', 'R-08']);
    return `${sectionHead('Updates', 'Current decisions and risks', 'Only the active one-sheet production issues are shown here.')}
      <h3 class="subhead">Current decisions</h3>
      ${table(['Date', 'Decision', 'Effect'], auth.decision_log.slice(-6).map(item => [item.date, item.decision, item.effect]))}
      <h3 class="subhead">Risks Brian should know about</h3>
      ${table(['ID', 'Risk', 'State', 'Response'], keyRisks.map(item => [item.id, item.risk, { status: item.state }, item.response]))}
      <div class="actions"><a class="button button--secondary" href="${ARCHIVE_URL}">Revision archive</a><a class="button button--secondary" href="${AUTH_URL}">Current JSON</a></div>`;
  }

  function renderRuntime(auth) {
    return `${sectionHead('Runtime', 'What is ready and what still blocks production', 'Trace references and starting template are ready. Final DWG/PDF production still needs licensed AutoCAD drafting and plot QA.', `<a class="button button--secondary" href="${SOW_URL}">SOW V4</a>`)}
      ${table(['Component', 'Version / class', 'State', 'Purpose'], auth.runtime_register.map(item => [item.component, item.version, { status: item.status }, item.purpose]))}
      <h3 class="subhead">Activation gates</h3>${gates(auth)}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Client action</h3><p>${esc(auth.zero_friction_activation.client_action)}</p><div class="scope-actions"><a class="primary" href="${SOW_URL}">Open SOW V4</a></div></article>
        <article class="check-card"><h3>Clock-start rule</h3><p>${esc(auth.schedule.clock_start_rule)}</p></article>
      </div>
      <div class="truth-note"><strong>Deadline control:</strong> ${esc(auth.deadline_control || auth.schedule.clock_start_rule)}</div>`;
  }

  const renderers = {
    overview: renderOverview,
    milestones: renderMilestones,
    files: renderFiles,
    standards: renderStandards,
    glossary: renderGlossary,
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
    window.addEventListener('hashchange', () => activate(location.hash.replace('#', '') || 'overview'));
  }

  function banner(auth) {
    if (document.querySelector('.authorized-banner')) return;
    const wrapper = document.createElement('section');
    wrapper.className = 'authorized-banner';
    wrapper.setAttribute('aria-labelledby', 'authorized-banner-title');
    wrapper.innerHTML = `<div class="authorized-banner__grid"><div><div class="authorized-banner__eyebrow">Current email authorization · SOW V4 one-page release</div><h2 id="authorized-banner-title">${esc(auth.scope.deliverable)}</h2><p>Authorized by ${esc(auth.authorization.authorized_by)} on July 21, 2026 · signature block not executed · Native AutoCAD DWG + PDF · $600 fixed fee. Payment is due after delivery. File roles, BDPC standards, trace references, and starting template are prepared; licensed AutoCAD production remains.</p></div><div class="authorized-banner__actions"><a href="${SOW_URL}">Current SOW V4</a><a href="${GOVERNING_PDF_URL}">Print / Save PDF</a><a href="${ARCHIVE_URL}">Archive</a></div></div>`;
    document.querySelector('.project-bar')?.insertAdjacentElement('afterend', wrapper);
  }

  function paymentDock(auth) {
    if (String(auth.commercial.payment_status).toLowerCase().includes('paid') || String(auth.commercial.payment_status).toLowerCase().includes('after delivery') || document.querySelector('.payment-dock')) return;
    const dock = document.createElement('div');
    dock.className = 'payment-dock';
    dock.innerHTML = `<span>Authorization complete<small>Payment due after delivery</small></span><a href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link</a>`;
    document.body.appendChild(dock);
  }

  function patchStatic(auth) {
    document.querySelector('.project-bar .gate strong')?.replaceChildren(document.createTextNode('Authorized · pre-AutoCAD package ready'));
    document.querySelector('.project-bar .gate small')?.replaceChildren(document.createTextNode('Payment due after delivery. AutoCAD license controls production.'));
    const top = document.getElementById('authorize-top');
    if (top) {
      top.setAttribute('href', SOW_URL);
      top.removeAttribute('target');
      top.removeAttribute('rel');
      top.textContent = 'SOW V4';
    }
    const revision = document.getElementById('revision-label');
    if (revision) revision.textContent = 'Client Service OS · current one-sheet release';
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
      const [authResponse, doctrineResponse, controlsResponse] = await Promise.all([
        fetch(AUTH_URL, { cache: 'no-store' }),
        fetch(DOCTRINE_URL, { cache: 'no-store' }),
        fetch(CONTROLS_URL, { cache: 'no-store' })
      ]);
      if (!authResponse.ok) throw new Error(`Authorization data returned ${authResponse.status}`);
      if (!doctrineResponse.ok) throw new Error(`Operating doctrine returned ${doctrineResponse.status}`);
      if (!controlsResponse.ok) throw new Error(`Production controls returned ${controlsResponse.status}`);
      const [authorization, doctrine, controls] = await Promise.all([
        authResponse.json(), doctrineResponse.json(), controlsResponse.json()
      ]);
      const auth = { ...authorization, ...doctrine, ...controls };
      patchStatic(auth);
      banner(auth);
      paymentDock(auth);
      renderAll(auth);
      activate(location.hash.replace('#', '') || 'overview');
    } catch (error) {
      console.error('Current authorization failed to load', error);
      const panel = document.getElementById('panel-overview');
      if (panel) panel.innerHTML = `<div class="error-state"><strong>Current authorization data could not load.</strong><p>Use the current SOW V4 and revision archive while the workspace data is refreshed.</p><div class="scope-actions"><a href="${SOW_URL}">Open current SOW V4</a><a href="${ARCHIVE_URL}">Open archive</a></div></div>`;
      activate('overview');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
