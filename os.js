(() => {
'use strict';
const tabs=[...document.querySelectorAll('[role="tab"]')];
const panels=[...document.querySelectorAll('[role="tabpanel"]')];
const toast=document.getElementById('toast');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=v=>String(v).toLowerCase().replace(/\s+/g,'-');
const badge=s=>`<span class="badge badge--${slug(s)}">${esc(s)}</span>`;
function showToast(message){if(!toast)return;toast.textContent=message;toast.classList.add('is-visible');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('is-visible'),2200);}
function activate(id,focus=false){
  const valid=tabs.some(t=>t.dataset.tab===id)?id:'overview';
  tabs.forEach(t=>{const active=t.dataset.tab===valid;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;if(active&&focus)t.focus();});
  panels.forEach(p=>p.hidden=p.dataset.panel!==valid);
  history.replaceState(null,'',`#${valid}`);
  window.scrollTo({top:Math.max(0,document.querySelector('.project-bar').offsetTop-70),behavior:'instant'});
}
tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>activate(tab.dataset.tab));
  tab.addEventListener('keydown',e=>{
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;
    e.preventDefault();let n=i;
    if(e.key==='ArrowRight')n=(i+1)%tabs.length;
    if(e.key==='ArrowLeft')n=(i-1+tabs.length)%tabs.length;
    if(e.key==='Home')n=0;if(e.key==='End')n=tabs.length-1;
    activate(tabs[n].dataset.tab,true);
  });
});
const subject=encodeURIComponent('Dunn Residence — production authorization');
const body=encodeURIComponent(`Thomas,\n\nBDPC authorizes CAD Guardian to begin the Dunn Residence three-sheet CAD pilot under the published $3,200 fixed-fee scope.\n\nConfirmed deliverables:\n1. Existing floor plan\n2. Proposed floor plan\n3. Site and area plan\n\nReview allowance: one consolidated BDPC redline cycle.\n\nPlease confirm the production start date and any final dependency request.\n\nBest,\nBrian`);
function authorize(){window.location.href=`mailto:tsmithcad@gmail.com?subject=${subject}&body=${body}`;}
document.getElementById('authorize-top')?.addEventListener('click',authorize);

function table(headers,rows){
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c?.badge?badge(c.badge):esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
const head=(eyebrow,title,copy,action='')=>`<div class="section-head"><div><span class="eyebrow">${esc(eyebrow)}</span><h2>${esc(title)}</h2>${copy?`<p>${esc(copy)}</p>`:''}</div>${action}</div>`;

function renderOverview(d,m){
  const reports=d.reports.map(r=>`<a class="report-card" href="${r.url}"><span>${esc(r.id)}</span><h3>${esc(r.name)}</h3><p>${esc(r.summary)}</p><strong>Open report →</strong></a>`).join('');
  return `<div class="hero-grid"><div><span class="eyebrow">Updated ${esc(d.updated_date)}</span><h2>Preflight is complete. Drawing production is ready to start when the runtime and commercial gates clear.</h2><p class="lede">All five LiDAR sessions were analyzed, the source hierarchy is mapped, five reports are published, and the three-sheet production sequence is defined. Floor-plan completion remains the controlling priority; optional automation cannot delay delivery.</p><div class="actions"><a class="button button--primary" href="/bdpc/reports/">Open report library</a><a class="button button--secondary" href="/bdpc/sow/">Open printable SOW</a><a class="button button--secondary" href="/bdpc/data/project.json" download>Download JSON</a><button class="button button--secondary" type="button" data-sqlite-download>Download SQLite</button></div></div><aside class="decision-card"><span>Next controlled action</span><h3>Activate AutoCAD/ReCap → confirm native scan alignment → begin existing floor plan.</h3><dl><div><dt>Preflight</dt><dd>${m.preflight_percent}%</dd></div><div><dt>Production</dt><dd>${m.production_percent}%</dd></div><div><dt>Overall milestones</dt><dd>${m.milestones_complete} / ${m.milestones_total}</dd></div><div><dt>BDPC install required</dt><dd>None</dd></div></dl></aside></div>
  <div class="metric-grid"><article><span>Source package</span><strong>${m.files} files</strong><small>${m.source_size_gb.toFixed(2)} GB inventoried</small></article><article><span>LiDAR analyzed</span><strong>${(m.point_count/1e6).toFixed(2)}M points</strong><small>${m.scan_sessions} scan sessions · zero read errors</small></article><article><span>Reports</span><strong>${m.reports} complete</strong><small>Client-safe and accessible</small></article><article><span>Production scope</span><strong>3 sheets</strong><small>Existing · proposed · site/area</small></article></div>
  ${head('Status summary','Current project state','')}
  <div class="status-grid"><article class="status-card status-card--complete">${badge('Complete')}<h3>Source and LiDAR preflight</h3><p>Intake, visual index, header, core geometry and registration analyses are complete.</p></article><article class="status-card status-card--awaiting-input">${badge('Awaiting input')}<h3>Licensed runtime</h3><p>AutoCAD and ReCap licenses are pending on CAD Guardian's execution environment.</p></article><article class="status-card status-card--awaiting-input">${badge('Awaiting input')}<h3>BDPC authorization</h3><p>Approve the $3,200 fixed-fee three-sheet scope and one review cycle.</p></article><article class="status-card status-card--not-started">${badge('Not started')}<h3>Drawing production</h3><p>The existing floor plan is the first production deliverable after both gates clear.</p></article></div>
  ${head('Evidence','Published reports','',`<a href="/bdpc/reports/">View report library →</a>`)}<div class="report-grid">${reports}</div>
  <div class="data-integrity" id="data-integrity"><span>Data snapshot verified</span><strong>Revision ${esc(d.revision)} · ${Object.values(m.table_counts||{}).reduce((a,b)=>a+b,0)||'client-safe'} database records · SHA-256 ${esc(m.database_sha256||'pending').slice(0,12)}…</strong></div>`;
}
function renderMilestones(d){
  const complete=d.milestones.filter(x=>x.status==='Complete').length;
  const rows=d.milestones.map(x=>[x.sequence,x.name,{badge:x.status},x.phase,x.detail,x.completed_date||'—']);
  return `${head('20 controlled gates','Milestones',`${complete} preflight milestones are complete. Runtime, standards dependencies and authorization remain open.`)}<div class="progress-block"><div><span>Overall milestone completion</span><strong>${Math.round(complete/d.milestones.length*100)}%</strong></div><progress value="${complete}" max="${d.milestones.length}"></progress></div>${table(['#','Milestone','Status','Phase','Definition','Completed'],rows)}`;
}
function renderFiles(d){
  const m=d.metrics;const rows=d.file_groups.map(x=>[x.group,x.extensions,x.count,{badge:x.status},x.notes]);
  return `${head('Client-safe inventory','Files','The workspace exposes counts, roles and readiness—not raw design files, exact address, local paths or private source filenames.',`<a class="button button--secondary" href="/bdpc/reports/intake/">Open intake report</a>`)}<div class="metric-grid metric-grid--six"><article><span>Total</span><strong>${m.files}</strong><small>Files inventoried</small></article><article><span>Required groups</span><strong>${m.required_groups_present} / ${m.required_groups_total}</strong><small>Present</small></article><article><span>CAD</span><strong>3</strong><small>DWG candidates</small></article><article><span>PDF</span><strong>2</strong><small>Conceptual/reference</small></article><article><span>LiDAR</span><strong>5</strong><small>LAS files</small></article><article><span>Duplicates</span><strong>${m.duplicate_groups}</strong><small>Expected calibration groups</small></article></div>${table(['Client-safe group','Extensions','Count','Status','Control note'],rows)}<div class="callout"><strong>Working-set rule:</strong> originals remain read-only. Controlled copies are created only after licensed DWG openability and dependency checks.</div>`;
}
function renderStandards(d){return `${head('Drawing controls','Standards','Confirmed project rules and remaining dependency checks. Architectural judgment stays with BDPC.')}${table(['Standard / boundary','Status','Current rule','Basis'],d.standards.map(x=>[x.item,{badge:x.status},x.rule,x.basis]))}`;}
function renderAutomation(d){return `${head('Production-first tooling','Automation','Automation is permitted only when it reduces current-cycle effort or risk. No exploratory tool may delay the three drawing deliverables.')}<div class="principle"><span>Controlling rule</span><strong>Floor-plan completion outranks automation.</strong><p>Read-only preflight tools are complete. Runtime tools remain bounded, reversible and human-reviewed.</p></div>${table(['Tool / operation','Status','Runtime','Verified result or boundary','Disposition'],d.automation.map(x=>[x.item,{badge:x.status},x.tool,x.result,x.disposition]))}`;}
function renderDelivery(d){return `${head('Drawing production','Delivery + QA','Three coordinated sheets, one consolidated review cycle, and a final native DWG/PDF package.')}<h3 class="subhead">Deliverables</h3>${table(['Sequence','Deliverable','Status','Scope','Format','Target'],d.deliverables.map(x=>[x.sequence,x.name,{badge:x.status},x.scope,x.format,x.target]))}<h3 class="subhead">Quality gates</h3>${table(['QA check','Status','Evidence / acceptance condition'],d.qa_checks.map(x=>[x.check,{badge:x.status},x.evidence]))}<div class="callout"><strong>Schedule rule:</strong> the production clock begins only after licenses, required dependencies and written authorization are complete.</div>`;}
function renderCommercial(d){return `<div class="commercial-hero"><div><span class="eyebrow">Scope ready for approval</span><h2>$3,200 fixed fee</h2><p>Three coordinated sheets, one consolidated BDPC review cycle, and final DWG/PDF issue.</p></div><button class="button button--primary" id="authorize-commercial" type="button">Authorize by email</button></div>${table(['Commercial term','Value','Status / trigger'],d.commercial.map(x=>[x.term,x.value,x.status]))}<div class="two-col"><article class="card"><h3>Included</h3><ul><li>Existing floor plan</li><li>Proposed floor plan</li><li>Site and area plan</li><li>LiDAR/source reconciliation required for drafting</li><li>One consolidated review cycle</li><li>Final native DWG/PDF issue package</li></ul></article><article class="card"><h3>Excluded</h3><ul><li>Additional sheets, elevations, sections, RCPs, details or schedules</li><li>Structural, MEP, civil, survey or field-verification services</li><li>Permit administration</li><li>Independent architectural or code decisions</li><li>Software or automation delivered as a client product</li></ul></article></div><div class="actions"><a class="button button--secondary" href="/bdpc/sow/">Open printable SOW</a></div>`;}
function renderUpdates(d){return `${head('Project record','Updates','Current client-safe activity log. Raw source-path details remain private.')}${table(['Date','Update','Status','Details'],d.updates.map(x=>[x.date,x.title,{badge:x.status},x.detail]))}`;}
function renderRuntime(d){return `${head('Execution environment','Runtime','BDPC installs nothing. CAD Guardian provides and controls the licensed production environment, local working copies, QA tooling and final packaging.',`<a class="button button--secondary" href="/bdpc/data/manifest.json">Open data manifest</a>`)}${table(['Component','Version','Status','Availability','Purpose'],d.runtime.map(x=>[x.component,x.version,{badge:x.status},x.availability,x.purpose]))}<h3 class="subhead">Scan-session source hierarchy</h3>${table(['Session','Role','Points','Size','Raw extent','Robust core extent','Production interpretation'],d.scan_sessions.map(x=>[x.session,x.role,x.points.toLocaleString(),x.size,x.raw_extent,x.core_extent,x.interpretation]))}<div class="two-col"><article class="card"><h3>Required before drafting</h3><ol><li>Activate AutoCAD and ReCap licenses.</li><li>Confirm optional CTB/STB, fonts and title block dependencies.</li><li>Approve the fixed-fee scope in writing.</li><li>Open working copies and validate scan alignment at native coordinates.</li></ol></article><article class="card"><h3>Client-safe data snapshot</h3><p>The SQLite file is the canonical tabular snapshot. GitHub Pages is static, so the interface renders from the synchronized JSON export.</p><ul><li><button class="text-button" type="button" data-sqlite-download>Download SQLite database</button></li><li><a href="/bdpc/data/project.json" download>JSON export</a></li><li><a href="/bdpc/data/schema.sql" download>SQL schema + dump</a></li><li><a href="/bdpc/data/manifest.json">Checksums + table counts</a></li></ul></article></div>`;}

async function downloadSqlite(){
  try{showToast('Preparing SQLite snapshot…');const res=await fetch('data/bdpc_client_os.sqlite.b64',{cache:'no-store'});if(!res.ok)throw new Error('download');const raw=atob((await res.text()).trim());const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.sqlite3'}));const a=document.createElement('a');a.href=url;a.download='bdpc_client_os.sqlite';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('SQLite snapshot downloaded.');}catch(e){showToast('SQLite download failed. Use the SQL dump or JSON export.');}
}
function bindDynamic(){document.querySelectorAll('[data-sqlite-download]').forEach(el=>el.addEventListener('click',downloadSqlite));document.getElementById('authorize-commercial')?.addEventListener('click',authorize);}
async function load(){
  try{
    const [d,m]=await Promise.all([fetch('data/project.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error();return r.json()}),fetch('data/manifest.json',{cache:'no-store'}).then(r=>r.ok?r.json():{})]);
    d.metrics={...d.metrics,...m};
    document.getElementById('revision-label').textContent=`Client Service OS · revision ${d.revision}`;
    document.getElementById('footer-revision').textContent=d.revision;
    document.getElementById('panel-overview').innerHTML=renderOverview(d,d.metrics);
    document.getElementById('panel-milestones').innerHTML=renderMilestones(d);
    document.getElementById('panel-files').innerHTML=renderFiles(d);
    document.getElementById('panel-standards').innerHTML=renderStandards(d);
    document.getElementById('panel-automation').innerHTML=renderAutomation(d);
    document.getElementById('panel-delivery').innerHTML=renderDelivery(d);
    document.getElementById('panel-commercial').innerHTML=renderCommercial(d);
    document.getElementById('panel-updates').innerHTML=renderUpdates(d);
    document.getElementById('panel-runtime').innerHTML=renderRuntime(d);
    bindDynamic();
  }catch(e){document.getElementById('panel-overview').innerHTML='<div class="callout"><strong>Workspace data could not load.</strong> Open the report library or refresh the page.</div>';}
}
const initial=location.hash.replace('#','')||'overview';activate(initial);
window.addEventListener('hashchange',()=>activate(location.hash.replace('#','')||'overview'));
load();
})();