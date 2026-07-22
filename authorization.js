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

  function currentHero(auth) {
    return `<div class="scope-hero"><div class="scope-hero__top"><div><span class="scope-eyebrow">Authorized enterprise-controlled trial</span><h2>${esc(auth.scope.deliverable)}</h2><p>Written authorization and the BDPC drafting doctrine are complete. The active authority remains one existing-condition sheet in native AutoCAD DWG and PDF. Payment is due after delivery; the remaining production gate is licensed AutoCAD availability plus final scale/source confirmation.</p></div><div class="scope-price">$${esc(auth.commercial.fixed_fee_usd)}</div></div><div class="scope-grid"><article><span>Authorization</span><strong>Complete</strong></article><article><span>Payment</span><strong>${esc(auth.commercial.payment_status)}</strong></article><article><span>Effort ceiling</span><strong>${esc(auth.commercial.effort_ceiling_hours)} hours</strong></article><article><span>Delivery direction</span><strong>4 PM EDT · Jul 22</strong></article></div><div class="scope-actions"><a class="primary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link for closeout</a><a href="${SOW_URL}">Current SOW</a><a href="${GOVERNING_PDF_URL}">Issued V3 PDF</a><a href="${ARCHIVE_URL}">Revision archive</a></div></div>`;
  }

  function actionCenter(auth) {
    return `<div class="action-center"><div class="action-center__grid"><div><span class="scope-eyebrow">Zero-friction acceptance</span><h3>${esc(auth.zero_friction_activation.acceptance_message)}</h3><p>${esc(auth.zero_friction_activation.default_authority)} CAD Guardian handles the remaining production setup and contacts Brian only when a material conflict prevents responsible completion.</p></div><div class="action-center__actions"><a class="primary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link for closeout</a><a href="${GOVERNING_PDF_URL}">Verify governing SOW</a></div></div></div>`;
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
    const openRisks = auth.risk_register.filter(item => !/controlled|closed/i.test(item.state)).length;
    return `${currentHero(auth)}
      ${actionCenter(auth)}
      <div class="enterprise-principle"><span>Operating doctrine</span><strong>Cutting-edge, not bleeding-edge. Automate evidence and repeatable checks; never automate away source authority, judgment, or acceptance.</strong><p>${esc(auth.truth_boundary)}</p></div>
      <div class="enterprise-metrics">
        <article><span>Protected source inventory</span><strong>${Number(e.source_files).toLocaleString()} files · ${esc(e.source_size_gib)} GiB</strong></article>
        <article><span>Validated scan sessions</span><strong>${esc(e.validated_sessions)} / ${esc(e.scan_sessions)}</strong></article>
        <article><span>Analyzed source points</span><strong>${(Number(e.source_points) / 1e6).toFixed(2)}M</strong></article>
        <article><span>Preserved standards</span><strong>${auth.standards_register.length} controlled rules</strong></article>
        <article><span>QA acceptance gates</span><strong>${auth.qa_register.length} explicit checks</strong></article>
        <article><span>Enterprise controls</span><strong>${auth.enterprise_controls.length} active controls</strong></article>
        <article><span>Open risks</span><strong>${openRisks}</strong></article>
        <article><span>Supporting reports</span><strong>${auth.reports.length} client-safe controls</strong></article>
      </div>
      ${sectionHead('Executive control', 'Activation gates', 'Authorization, standards, payment, source freeze, runtime, and scheduling are separate auditable states.')}
      ${gates(auth)}
      ${sectionHead('Business objective', 'What this operating system is designed to accomplish')}
      <div class="check-grid"><article class="check-card"><h3>Executive objectives</h3>${list(auth.executive_objectives)}</article><article class="check-card"><h3>When AutoCAD is available</h3>${list(auth.zero_friction_activation.provider_actions_after_payment, true)}</article></div>
      ${sectionHead('Enterprise governance', 'Control framework', 'Scope reductions must not erase standards, evidence, QA, or decision history.')}
      ${table(['Control ID', 'Enterprise control', 'State', 'Evidence'], auth.enterprise_controls.map(item => [item.id, item.control, { status: item.state }, item.evidence]))}
      ${sectionHead('Evidence access', 'Client-safe control library', 'Supporting evidence remains available without expanding the authorized one-sheet delivery.', `<a href="${REPORTS_URL}">Open all reports →</a>`)}
      ${reportCards(auth)}`;
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
    return `${sectionHead('Source authority', 'Files, evidence, and production-baseline controls', 'Only the frozen controlling package may drive production. Confidential raw files remain private and originals remain immutable.', `<a class="button button--secondary" href="/bdpc/reports/intake/">Open intake report</a>`)}
      <div class="evidence-grid">
        <article><span>Files inventoried</span><strong>${Number(e.source_files).toLocaleString()}</strong></article>
        <article><span>Protected source size</span><strong>${esc(e.source_size_gib)} GiB</strong></article>
        <article><span>Source points processed</span><strong>${Number(e.source_points).toLocaleString()}</strong></article>
        <article><span>Derived controls</span><strong>${e.full_source_figures + e.plan_control_slices + e.native_overlays}</strong></article>
      </div>
      <div class="enterprise-principle"><span>Authority hierarchy</span><strong>Direction first. Project-specific evidence second. Measured evidence third. Standards references never silently become project geometry.</strong><p>Every material discrepancy is documented and escalated; inference is never issued as fact.</p></div>
      <h3 class="subhead">Approved source hierarchy</h3>
      ${table(['Priority', 'Source', 'Role', 'Operating rule'], auth.source_hierarchy.map(item => [item.priority, item.source, item.role, item.rule]))}
      <h3 class="subhead">File-role register</h3>
      ${table(['File group', 'Assigned role', 'State', 'Control'], auth.file_controls.map(item => [item.group, item.role, { status: item.state }, item.control]))}
      <div class="truth-note"><strong>Registration boundary:</strong> ${esc(e.registration_boundary)}</div>
      <div class="actions"><a class="button button--secondary" href="${REPORTS_URL}">Open evidence library</a><a class="button button--secondary" href="/bdpc/data/archive/index.json">Open revision catalog</a></div>`;
  }

  function renderStandards(auth) {
    return `${sectionHead('Preserved production doctrine', 'BDPC residential CAD standards and decision controls', 'These detailed rules survive scope changes. The current one-sheet trial uses every active rule that applies; future-only graphics remain clearly labeled rather than deleted.')}
      <div class="enterprise-principle"><span>Primary drafting principle</span><strong>Clean, rational, self-checking geometry that BDPC can continue without rework.</strong><p>Use Brian's preferred model-space logic and current BDPC presentation standard. Do not substitute cosmetic dimension rounding for correct geometry.</p></div>
      ${table(['ID', 'Category', 'Standard', 'State', 'Applicability', 'Documented rule', 'Basis'], auth.standards_register.map(item => [item.id, item.category, item.standard, { status: item.status }, item.applicability, item.rule, item.basis]))}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Dimensional and wall doctrine</h3>${list([
          'Residential dimensions display no finer than 1/2 inch unless Brian directs otherwise',
          'Internal geometry remains accurate; rounding may not hide avoidable errors',
          'Typical 2×4 framed walls begin at 3.5 inches',
          'Other wall thicknesses require evidence or direction',
          'Chained and overall dimensions reconcile for rapid self-checking'
        ])}</article>
        <article class="check-card"><h3>Block and presentation doctrine</h3>${list([
          'Reuse established doors, windows, fixtures, appliances, and symbols before inventing new content',
          'Audit exploded blocks, scale, layers, attributes, and insertion behavior',
          'Use TCADD for compatible model-space vocabulary and drafting logic',
          'Use the current BDPC drawing for title block, paper space, fonts, dimensions, plotting, and sheet flow',
          'Treat LiDAR as measured evidence and disclose unresolved conflicts'
        ])}</article>
      </div>
      <div class="truth-note"><strong>Professional boundary:</strong> BDPC retains architectural interpretation, code and permit responsibility, and final professional acceptance. CAD Guardian provides controlled CAD production, automation, and QA.</div>`;
  }

  function renderAutomation(auth) {
    return `${sectionHead('Human-reviewed acceleration', 'Enterprise automation register', 'Automation is governed by explicit status, production use, and human-control fields so experiments cannot quietly become release dependencies.')}
      <div class="enterprise-principle"><span>Cutting-edge control</span><strong>Use automation to reduce repetitive work and increase evidence—not to take shortcuts through uncertainty.</strong><p>Source selection, architectural judgment, concealed conditions, final CAD review, and BDPC acceptance remain human-controlled.</p></div>
      ${table(['ID', 'Capability', 'State', 'Production use', 'Human control'], auth.automation_register.map(item => [item.id, item.capability, { status: item.status }, item.production_use, item.human_control]))}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>High-leverage authorized acceleration</h3>${list([
          'Read-only source inventory and integrity validation',
          'Point-cloud statistics, figures, slices, and overlap controls',
          'Block extraction and exploded-content audits',
          'Candidate geometry and dimension reconciliation checks',
          'Layer, dependency, viewport, page-setup, and plot validation',
          'Controlled publish and dependency manifests'
        ])}</article>
        <article class="check-card"><h3>Never automated away</h3>${list([
          'Selection of the controlling source',
          'Architectural judgment or design authority',
          'Acceptance of unsupported dimensions or concealed conditions',
          'Final human CAD review and release',
          'BDPC professional acceptance'
        ])}</article>
      </div>`;
  }

  function renderCadPrep(auth) {
    return `${sectionHead('One-sheet production control', 'CAD preparation and execution runbook', 'The production runbook is detailed enough to execute without ambiguity but remains constrained to the one-sheet scope and eight-hour ceiling.', `<a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open detailed CAD Prep report</a>`)}
      ${actionCenter(auth)}
      <h3 class="subhead">Time-boxed work plan</h3>
      ${table(['Sequence', 'Workstream', 'Hours', 'State'], auth.work_plan.map(item => [item.sequence, item.workstream, Number(item.hours).toFixed(2), { status: item.status }]))}
      <h3 class="subhead">Production-readiness register</h3>
      ${table(['ID', 'Control', 'Owner', 'State', 'Acceptance condition'], auth.cad_prep_register.map(item => [item.id, item.control, item.owner, { status: item.status }, item.acceptance]))}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Proceed by default when AutoCAD is available</h3>${list(auth.zero_friction_activation.provider_actions_after_payment, true)}</article>
        <article class="check-card"><h3>Stop-work triggers</h3>${list([
          'The controlling source cannot be identified or frozen',
          'Units, scale, or main-level coverage cannot be responsibly established',
          'Critical fonts, xrefs, object support, plot styles, or title-block dependencies prevent reproducible output',
          'A material conflict requires an architectural decision',
          'Continuing would require unsupported fabrication or exceed the eight-hour ceiling'
        ])}</article>
      </div>`;
  }

  function renderDelivery(auth) {
    return `${sectionHead('Authorized delivery', 'One-sheet production, QA, and acceptance', 'Existing conditions only. No proposed plan, site plan, demolition plan, or design work is included.', `<a class="button button--secondary" href="${SOW_URL}">Open current SOW</a>`)}
      <div class="enterprise-principle"><span>Issue rule</span><strong>No drawing advances by optimism.</strong><p>Every release condition is explicit: authority, source lock, geometry, standards, dependencies, native openability, plot fidelity, disclosure, and package completeness.</p></div>
      ${table(['Deliverable', 'Format', 'State', 'Target'], auth.scope.formats.map(format => [auth.scope.deliverable, format, { status: 'not started' }, auth.schedule.delivery_due_display]))}
      <h3 class="subhead">Contract acceptance criteria</h3>
      <div class="check-grid">${auth.acceptance_criteria.map((criterion, index) => `<article class="check-card"><h3>AC-${String(index + 1).padStart(2, '0')}</h3><p>${esc(criterion)}</p></article>`).join('')}</div>
      <h3 class="subhead">Detailed QA register</h3>
      ${table(['ID', 'Domain', 'Check', 'State', 'Acceptance condition'], auth.qa_register.map(item => [item.id, item.domain, item.check, { status: item.status }, item.acceptance]))}
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
      <div class="scope-note"><strong>Superseded:</strong> the earlier three-sheet $3,200 proposal remains in the revision archive for transparency and cannot drive current production.</div>`;
  }

  function renderUpdates(auth) {
    return `${sectionHead('Controlling record', 'Decisions, updates, risks, and responses', 'The current release preserves why each rule exists and how open risks are controlled.')}
      <h3 class="subhead">Decision log</h3>
      ${table(['Date', 'Decision', 'Authority', 'Effect'], auth.decision_log.map(item => [item.date, item.decision, item.authority, item.effect]))}
      <h3 class="subhead">Risk register</h3>
      ${table(['ID', 'Risk', 'Severity', 'State', 'Response'], auth.risk_register.map(item => [item.id, item.risk, { status: item.severity }, { status: item.state }, item.response]))}
      <div class="actions"><a class="button button--secondary" href="${ARCHIVE_URL}">Open SOW revision archive</a><a class="button button--secondary" href="/bdpc/data/archive/index.json">Open data revision catalog</a><a class="button button--secondary" href="${AUTH_URL}">Open current authorization JSON</a></div>`;
  }

  function renderRuntime(auth) {
    return `${sectionHead('Production activation', 'Runtime, governance, and kickoff controls', 'The analytical and client-facing control plane is ready. Native production remains blocked until compatible AutoCAD runtime activation and final scale/source confirmation.', `<a class="button button--secondary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link</a>`)}
      ${table(['Component', 'Version / class', 'State', 'Purpose'], auth.runtime_register.map(item => [item.component, item.version, { status: item.status }, item.purpose]))}
      <h3 class="subhead">Activation gates</h3>${gates(auth)}
      <h3 class="subhead">Enterprise control plane</h3>
      ${table(['ID', 'Control', 'State', 'Evidence'], auth.enterprise_controls.map(item => [item.id, item.control, { status: item.state }, item.evidence]))}
      <div class="check-grid" style="margin-top:18px">
        <article class="check-card"><h3>Client action</h3><p>${esc(auth.zero_friction_activation.client_action)}</p><div class="scope-actions"><a class="primary" href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link for closeout</a></div></article>
        <article class="check-card"><h3>Clock-start rule</h3><p>${esc(auth.schedule.clock_start_rule)}</p></article>
      </div>
      <div class="truth-note"><strong>Deadline control:</strong> ${esc(auth.deadline_control || auth.schedule.clock_start_rule)}</div>`;
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
    wrapper.innerHTML = `<div class="authorized-banner__grid"><div><div class="authorized-banner__eyebrow">Current written authorization · pre-AutoCAD trace-ready release</div><h2 id="authorized-banner-title">${esc(auth.scope.deliverable)}</h2><p>Authorized by ${esc(auth.authorization.authorized_by)} on July 21, 2026 · Native AutoCAD DWG + PDF · $600 fixed fee · ${esc(auth.schedule.delivery_due_display)}. Payment is due after delivery. BDPC standards, crawl registers, and trace references are prepared; native AutoCAD activation remains.</p></div><div class="authorized-banner__actions"><a href="${esc(auth.commercial.payment_link)}" target="_blank" rel="noopener">Payment link</a><a href="${SOW_URL}">Current SOW</a><a href="${GOVERNING_PDF_URL}">Issued PDF</a><a href="${REPORTS_URL}">Reports</a></div></div>`;
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
    if (revision) revision.textContent = 'Client Service OS · enterprise control release';
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
      if (panel) panel.innerHTML = `<div class="error-state"><strong>Current authorization data could not load.</strong><p>Use the current SOW, governing PDF, and report library while the workspace data is refreshed.</p><div class="scope-actions"><a href="${SOW_URL}">Open current SOW</a><a href="${GOVERNING_PDF_URL}">Open issued PDF</a><a href="${REPORTS_URL}">Open reports</a></div></div>`;
      activate('overview');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
