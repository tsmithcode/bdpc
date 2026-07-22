(() => {
  'use strict';

  const AUTH_URL = '/bdpc/data/current-authorization.json';
  const SOW_URL = '/bdpc/sow/';
  const REPORTS_URL = '/bdpc/reports/';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const styles = `
    .authorized-banner{width:min(1180px,calc(100% - 28px));margin:18px auto 0;padding:18px 20px;border:1px solid #bfe1cc;border-left:6px solid #147a4b;border-radius:18px;background:linear-gradient(135deg,#f0faf4,#fff);box-shadow:0 12px 32px rgba(11,18,32,.08)}
    .authorized-banner__grid{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:22px;align-items:center}.authorized-banner__eyebrow{color:#147a4b;font-size:9px;font-weight:950;letter-spacing:.13em;text-transform:uppercase}.authorized-banner h2{margin:6px 0 7px;font-size:25px;line-height:1.08}.authorized-banner p{margin:0;color:#446253;font-size:12px;line-height:1.55}.authorized-banner__actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}.authorized-banner__actions a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:999px;padding:10px 14px;border:1px solid #c9d6df;background:#fff;color:#0b1220;font-size:10px;font-weight:900;text-decoration:none}.authorized-banner__actions a:first-child{border-color:#147a4b;background:#147a4b;color:#fff}.current-scope-hero{padding:24px;border:1px solid #bfe1cc;border-radius:22px;background:linear-gradient(145deg,#f0faf4,#fff)}.current-scope-hero__top{display:grid;grid-template-columns:1fr auto;gap:18px;align-items:start}.current-scope-hero span{color:#147a4b;font-size:9px;font-weight:950;letter-spacing:.13em;text-transform:uppercase}.current-scope-hero h2{margin:7px 0 8px;font-size:34px;line-height:1.02}.current-scope-hero p{margin:0;color:#446253;font-size:13px;line-height:1.6}.current-scope-price{font-size:34px;font-weight:950;color:#147a4b}.current-scope-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:18px}.current-scope-grid article{padding:14px;border:1px solid #cfe7d9;border-radius:14px;background:rgba(255,255,255,.82)}.current-scope-grid article span{color:#667085;font-size:8px}.current-scope-grid article strong{display:block;margin-top:6px;font-size:14px;line-height:1.3}.current-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.current-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;border-radius:999px;padding:10px 14px;border:1px solid #c9d6df;background:#fff;color:#0b1220;font-size:10px;font-weight:900;text-decoration:none}.current-actions a.primary{border-color:#147a4b;background:#147a4b;color:#fff}.authorization-table{width:100%;border-collapse:collapse}.authorization-table th,.authorization-table td{padding:10px;border-bottom:1px solid #edf1f5;text-align:left;vertical-align:top;font-size:11px;line-height:1.5}.authorization-table th{background:#f7f9fc;color:#475467;font-size:8px;text-transform:uppercase;letter-spacing:.08em}.state-complete{color:#147a4b;font-weight:900}.state-open{color:#946200;font-weight:900}.superseded-note{margin-top:18px;padding:13px;border-left:4px solid #946200;background:#fff8e5;color:#684d00;font-size:11px;line-height:1.5}
    @media(max-width:760px){.authorized-banner__grid,.current-scope-hero__top{grid-template-columns:1fr}.authorized-banner__actions{justify-content:flex-start}.current-scope-grid{grid-template-columns:repeat(2,1fr)}}
  `;

  function installStyles() {
    if (document.getElementById('current-authorization-styles')) return;
    const style = document.createElement('style');
    style.id = 'current-authorization-styles';
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function statusLabel(status) {
    const normalized = String(status).toLowerCase();
    return normalized.includes('complete') || normalized.includes('authorized') ? 'state-complete' : 'state-open';
  }

  function banner(auth) {
    const wrapper = document.createElement('section');
    wrapper.className = 'authorized-banner';
    wrapper.setAttribute('aria-labelledby', 'authorized-banner-title');
    wrapper.innerHTML = `<div class="authorized-banner__grid"><div><div class="authorized-banner__eyebrow">Current written authorization</div><h2 id="authorized-banner-title">One Existing Main Level As-Built Floor Plan</h2><p>Authorized by Brian Dillman on July 21, 2026 · Native AutoCAD DWG + PDF · $600 fixed fee · delivery authorized for 4:00 PM EDT on July 22, 2026. Payment and production-runtime setup remain.</p></div><div class="authorized-banner__actions"><a href="${escapeHtml(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600 securely</a><a href="${SOW_URL}">Current SOW</a><a href="${REPORTS_URL}">Reports</a></div></div>`;
    const projectBar = document.querySelector('.project-bar');
    if (projectBar && !document.querySelector('.authorized-banner')) projectBar.insertAdjacentElement('afterend', wrapper);
  }

  function currentHero(auth) {
    return `<div class="current-scope-hero"><div class="current-scope-hero__top"><div><span>Authorized one-day trial</span><h2>Existing Main Level As-Built Floor Plan</h2><p>Written authorization is complete. The contractual delivery is one existing-condition sheet in native AutoCAD DWG and PDF. The earlier three-sheet proposal is superseded and archived.</p></div><div class="current-scope-price">$600</div></div><div class="current-scope-grid"><article><span>Authorization</span><strong>Complete</strong></article><article><span>Payment</span><strong>Awaiting $600</strong></article><article><span>Duration</span><strong>One working day</strong></article><article><span>Delivery</span><strong>4 PM EDT · Jul 22</strong></article></div><div class="current-actions"><a class="primary" href="${escapeHtml(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay and activate production</a><a href="${SOW_URL}">Review current SOW</a><a href="/bdpc/sow/archive/">Open revision archive</a></div></div>`;
  }

  function gatesTable(auth) {
    return `<div class="table-wrap"><table class="authorization-table"><thead><tr><th>Activation item</th><th>State</th><th>Evidence / next action</th></tr></thead><tbody>${auth.activation_gates.map(gate => `<tr><td>${escapeHtml(gate.name)}</td><td class="${statusLabel(gate.status)}">${escapeHtml(gate.status)}</td><td>${escapeHtml(gate.evidence)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function patchPanel(id, html) {
    const panel = document.getElementById(id);
    if (panel) panel.innerHTML = html;
  }

  function patchDynamicPanels(auth) {
    const current = currentHero(auth);
    patchPanel('panel-overview', `${current}<div class="callout"><strong>Supporting evidence remains available:</strong> five validated scan sessions, 91,688,946 analyzed source points, analytical figures, trial slices, native-coordinate overlays, photographic context, and CAD preparation controls remain project-control records—not additional contractual deliverables.</div><div class="actions"><a class="button button--secondary" href="/bdpc/reports/">Open report library</a><a class="button button--secondary" href="/bdpc/reports/cad-prep/">Open CAD Prep</a><a class="button button--secondary" href="/bdpc/data/current-authorization.json">Open authorization data</a></div>`);

    patchPanel('panel-milestones', `<div class="section-head"><div><span class="eyebrow">Current authorization</span><h2>Trial assignment milestones</h2><p>Current contractual progress is separated from the completed preflight record.</p></div></div>${gatesTable(auth)}<h3 class="subhead">Current delivery sequence</h3><div class="table-wrap"><table class="authorization-table"><thead><tr><th>Sequence</th><th>Milestone</th><th>Status</th><th>Acceptance</th></tr></thead><tbody><tr><td>1</td><td>Written one-sheet authorization</td><td class="state-complete">Complete</td><td>Brian Dillman email received July 21, 2026.</td></tr><tr><td>2</td><td>$600 payment</td><td class="state-open">Awaiting payment</td><td>Full payment activates production.</td></tr><tr><td>3</td><td>AutoCAD and standards setup</td><td class="state-open">Pending</td><td>Confirm version, title block, CTB/STB, and BDPC standards; purchase monthly AutoCAD subscription.</td></tr><tr><td>4</td><td>Existing Main Level As-Built Floor Plan</td><td class="state-open">Not started</td><td>Native AutoCAD DWG and PDF delivered after production and QA.</td></tr></tbody></table></div><div class="superseded-note"><strong>Historical record:</strong> completed preflight milestones remain available in the reports and archived data. The three-sheet production milestones are superseded for this trial.</div>`);

    patchPanel('panel-delivery', `<div class="section-head"><div><span class="eyebrow">Authorized delivery</span><h2>One-sheet production and QA</h2><p>Existing conditions only. No proposed plan, site plan, or design work is included.</p></div><a class="button button--secondary" href="${SOW_URL}">Open current SOW</a></div><div class="table-wrap"><table class="authorization-table"><thead><tr><th>Deliverable</th><th>Format</th><th>Status</th><th>Target</th></tr></thead><tbody><tr><td>Existing Main Level As-Built Floor Plan</td><td>Native AutoCAD DWG</td><td class="state-open">Not started</td><td>4:00 PM EDT · July 22, 2026</td></tr><tr><td>Existing Main Level As-Built Floor Plan</td><td>PDF</td><td class="state-open">Not started</td><td>4:00 PM EDT · July 22, 2026</td></tr></tbody></table></div><div class="callout"><strong>QA boundary:</strong> the sheet will be checked against the agreed existing-condition scope and native plotting setup. No survey, registration, code, or professional-certification claim is introduced.</div>`);

    patchPanel('panel-commercial', `${current}${gatesTable(auth)}<div class="superseded-note"><strong>Superseded proposal:</strong> the earlier three-sheet $3,200 scope is retained in the revision archive for transparency but is not current production authority.</div>`);

    patchPanel('panel-updates', `<div class="section-head"><div><span class="eyebrow">Client-safe record</span><h2>Current updates</h2><p>The latest written direction controls the assignment.</p></div></div><div class="table-wrap"><table class="authorization-table"><thead><tr><th>Date</th><th>Update</th><th>Status</th><th>Detail</th></tr></thead><tbody><tr><td>July 21, 2026</td><td>One-day trial authorized</td><td class="state-complete">Authorized</td><td>Brian directed CAD Guardian to proceed with one Existing Main Level As-Built Floor Plan for $600, delivered in AutoCAD and PDF by 4:00 PM July 22.</td></tr><tr><td>July 21, 2026</td><td>Updated SOW and payment link issued</td><td class="state-open">Awaiting payment</td><td>Full payment activates production; CAD Guardian will then purchase and configure the monthly AutoCAD subscription.</td></tr><tr><td>July 21, 2026</td><td>Three-sheet proposal archived</td><td class="state-complete">Superseded</td><td>Prior $3,200 scope remains available for audit history only.</td></tr></tbody></table></div>`);

    patchPanel('panel-runtime', `<div class="section-head"><div><span class="eyebrow">Production activation</span><h2>Runtime and standards setup</h2><p>Written authorization is complete. Payment and native setup remain before drafting begins.</p></div><a class="button button--secondary" href="${escapeHtml(auth.commercial.payment_link)}" target="_blank" rel="noopener">Pay $600</a></div>${gatesTable(auth)}<div class="two-col"><article class="card"><h3>CAD Guardian action after payment</h3><ul><li>Purchase and activate the monthly AutoCAD subscription.</li><li>Configure the agreed AutoCAD version.</li><li>Validate title block, CTB/STB, fonts, and BDPC standards.</li><li>Begin the one-working-day floor-plan production.</li></ul></article><article class="card"><h3>Still requires confirmation</h3><ul><li>Target AutoCAD version</li><li>Controlling title block</li><li>CTB or STB plotting standard</li><li>Applicable BDPC drafting standards and final supporting input set</li></ul></article></div>`);
  }

  function patchStatic(auth) {
    document.querySelector('.project-bar .gate strong')?.replaceChildren(document.createTextNode('Authorized one-day trial'));
    document.querySelector('.project-bar .gate small')?.replaceChildren(document.createTextNode('Payment and runtime setup pending.'));
    const top = document.getElementById('authorize-top');
    if (top) {
      const replacement = top.cloneNode(true);
      replacement.textContent = 'Activate $600 trial';
      replacement.addEventListener('click', () => window.open(auth.commercial.payment_link, '_blank', 'noopener'));
      top.replaceWith(replacement);
    }
    const commercialTab = document.getElementById('tab-commercial');
    if (commercialTab) commercialTab.textContent = 'Authorized Scope';
    const revision = document.getElementById('revision-label');
    if (revision) revision.textContent = 'Client Service OS · authorized trial';
  }

  function waitAndPatch(auth, attempt = 0) {
    const overview = document.getElementById('panel-overview');
    if (overview && !overview.querySelector('.loading')) {
      patchDynamicPanels(auth);
      return;
    }
    if (attempt < 80) setTimeout(() => waitAndPatch(auth, attempt + 1), 100);
  }

  async function init() {
    installStyles();
    try {
      const response = await fetch(AUTH_URL, {cache:'no-store'});
      if (!response.ok) throw new Error('authorization data');
      const auth = await response.json();
      patchStatic(auth);
      banner(auth);
      waitAndPatch(auth);
    } catch (error) {
      console.error('Current authorization overlay failed to load', error);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
