const html = document.documentElement;
const BASE = html.dataset.base || '/bdpc/cadguardian-engagement-workflows/';
const view = document.body.dataset.view || 'home';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const list = (items = []) => `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
const pills = (items = [], tone = '') => `<div class="pill-row">${items.map(item => `<span class="pill ${tone}">${escapeHtml(item)}</span>`).join('')}</div>`;
const money = value => typeof value === 'number' ? new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value) : value;

const navItems = [
  ['home','Overview',''],
  ['workflows','Paid workflows','workflows/'],
  ['commercial','Commercial system','commercial/'],
  ['ivr','Phone + IVR','ivr/'],
  ['sales','Sales playbook','sales/'],
  ['opportunity','Enterprise pursuit','opportunity/otis/'],
  ['data','JSON corpus','data/']
];

function siteHeader(){
  return `<a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header"><div class="container nav">
    <a class="brand" href="${BASE}" aria-label="CAD Guardian workflow command center home">
      <img src="${BASE}brand/cad-guardian-shield.svg" width="35" height="42" alt="" aria-hidden="true">
      <span>CAD Guardian<small>Paid engagement system</small></span>
    </a>
    <button class="menu-button" type="button" aria-expanded="false" aria-controls="site-menu">Menu</button>
    <ul class="nav-links" id="site-menu">${navItems.map(([id,label,path]) => `<li><a href="${BASE}${path}" ${view===id?'aria-current="page"':''}>${label}</a></li>`).join('')}</ul>
  </div></header>`;
}

function siteFooter(meta){
  return `<footer class="site-footer"><div class="container footer-grid"><div>
      <a class="brand" href="${BASE}"><img src="${BASE}brand/cad-guardian-shield.svg" width="35" height="42" alt=""><span>CAD Guardian<small>${escapeHtml(meta.positioning)}</small></span></a>
      <p class="footer-note">Commercial and operational guidance for qualified CAD, BIM, PDM and engineering-software engagements. Professional design authority remains with the responsible licensed professionals.</p>
    </div><div><ul class="footer-links"><li><a href="https://cadguardian.com">cadguardian.com</a></li><li><a href="tel:+14044654620">(404) 465-4620</a></li><li><a href="mailto:tsmithcad@gmail.com">Email</a></li><li><a href="${BASE}data/corpus.json">Corpus JSON</a></li></ul></div></div></footer>`;
}

function hero(){
  return `<section class="hero"><div class="container hero-grid"><div class="hero-copy">
    <span class="eyebrow">Sales and delivery operating system</span>
    <h1>You have drawings due. <strong>We keep them moving.</strong></h1>
    <p class="lede">Fourteen paid engagement workflows convert urgent drawing risk, repeated CAD work, fragile engineering tools and broken handoffs into bounded commercial offers.</p>
    <div class="hero-actions"><a class="button primary" href="${BASE}workflows/">Explore paid workflows</a><a class="button secondary" href="tel:+14044654620">Call CAD Guardian</a><a class="button" href="mailto:tsmithcad@gmail.com?subject=CAD%20Guardian%20engagement%20inquiry">Start by email</a></div>
    <p class="muted">Designed for business development, sales, marketing and delivery leadership. Stripe links remain governed until the live product catalog is reconciled.</p>
  </div><div class="hero-mark"><div class="shield-panel"><img src="${BASE}brand/cad-guardian-shield.svg" alt="CAD Guardian shield"><div class="tagline-card">Move the package. Control the risk.<span>CAD · BIM · PDM · .NET</span></div></div></div></div></section>`;
}

function metricStrip(corpus){
  return `<div class="metric-strip"><div class="metric"><strong>${corpus.workflows.length}</strong><span>Paid workflows</span></div><div class="metric"><strong>7</strong><span>Commercial rungs</span></div><div class="metric"><strong>$4.5K</strong><span>Flagship diagnostic</span></div><div class="metric"><strong>3</strong><span>Retainer tiers</span></div></div>`;
}

function workflowCard(w, index, expanded=false){
  const detail = `<div class="detail-panel"><div class="detail-grid">
    <div class="detail-block"><h4>Buyer trigger</h4><p>${escapeHtml(w.trigger)}</p></div>
    <div class="detail-block"><h4>What the buyer fears</h4><p>${escapeHtml(w.fear)}</p></div>
    <div class="detail-block"><h4>Promised business outcome</h4><p>${escapeHtml(w.outcome)}</p></div>
    <div class="detail-block"><h4>Commercial posture</h4><p class="green price">${escapeHtml(w.price)}</p><p>${escapeHtml(w.roi)}</p></div>
    <div class="detail-block"><h4>Scope</h4>${list(w.scope)}</div>
    <div class="detail-block"><h4>Deliverables</h4>${list(w.deliverables)}</div>
    <div class="detail-block"><h4>Discovery questions</h4>${list(w.discovery)}</div>
    <div class="detail-block"><h4>Qualification</h4>${list(w.qualify)}<h4 class="mt-1">Disqualifiers</h4>${list(w.disqualify)}</div>
    <div class="detail-block"><h4>Implementation phases</h4>${list(w.phases)}</div>
    <div class="detail-block"><h4>Scope exclusions</h4>${list(w.exclusions)}</div>
    <div class="detail-block"><h4>Objections</h4>${w.objections.map(o=>`<p><strong>${escapeHtml(o.q)}</strong><br>${escapeHtml(o.a)}</p>`).join('')}</div>
    <div class="detail-block"><h4>Expansion path</h4>${list(w.upsell)}</div>
    <div class="detail-block span-2"><h4>Sales narrative</h4><p>${escapeHtml(w.talkTrack)}</p><div class="button-row mt-1"><a class="button primary" href="mailto:tsmithcad@gmail.com?subject=${encodeURIComponent(w.name)}">${escapeHtml(w.cta)}</a><a class="button" href="tel:+14044654620">Call (404) 465-4620</a></div></div>
  </div></div>`;
  const search = [w.name,w.category,w.priority,w.price,...w.buyer,w.trigger,w.outcome].join(' ').toLowerCase();
  return `<article class="workflow-card" data-category="${escapeHtml(w.category)}" data-search="${escapeHtml(search)}"><div class="workflow-rank">${String(index+1).padStart(2,'0')}</div><details class="workflow-detail" ${expanded?'open':''}><summary><div class="workflow-meta"><span>${escapeHtml(w.category)}</span><span>•</span><span>${escapeHtml(w.priority)}</span></div><h3>${escapeHtml(w.name)}</h3><p>${escapeHtml(w.outcome)}</p>${pills(w.buyer.slice(0,4))}<span class="card-link">Open complete playbook</span></summary>${detail}</details><div class="workflow-price price">${escapeHtml(w.price)}</div></article>`;
}

function workflowCatalog(corpus, options={}){
  const categories = [...new Set(corpus.workflows.map(w=>w.category))].sort();
  return `<section class="section" id="catalog"><div class="container"><div class="section-head"><span class="eyebrow">Offer library</span><h2>Top paid engagement workflows</h2><p>Search by buyer consequence, platform, category or offer. Each workflow contains the full qualification, scope, objection, ROI and expansion logic a BDM needs.</p></div>
    <div class="workflow-toolbar"><label><span class="sr-only">Search workflows</span><input class="field" id="workflow-search" type="search" placeholder="Search: deadline, AutoCAD, Vault, principal…" autocomplete="off"></label><label><span class="sr-only">Filter by category</span><select class="field" id="workflow-category"><option value="">All categories</option>${categories.map(c=>`<option>${escapeHtml(c)}</option>`).join('')}</select></label></div>
    <div class="workflow-list" id="workflow-list">${corpus.workflows.map((w,i)=>workflowCard(w,i,options.expandedId===w.id)).join('')}</div><div class="empty" id="workflow-empty">No workflow matches this filter. Try a buyer consequence or platform.</div></div></section>`;
}

function ladder(corpus){
  return `<section class="section" id="ladder"><div class="container"><div class="section-head"><span class="eyebrow">Commercial architecture</span><h2>Start bounded. Expand on evidence.</h2><p>The ladder prevents free consulting, under-scoped builds and unsupported retainers. Every rung has an explicit gate.</p></div><div class="ladder">${corpus.commercialLadder.map((x,i)=>`<article class="ladder-step"><span class="ladder-index">0${i+1}</span><div><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.duration)} · ${escapeHtml(x.purpose)}</small></div><span class="ladder-price price">${escapeHtml(x.price)}</span></article>`).join('')}</div><div class="callout mt-2"><strong>Commercial rule:</strong> Payment confirms the approved scope; it never expands it. Catalog → SOW → CRM → Stripe → delivery record must agree.</div></div></section>`;
}

function home(corpus, ops){
  const featured = corpus.workflows.slice(0,6);
  return `${hero()}${metricStrip(corpus)}<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Market wedges</span><h2>Sell consequences, not software menus.</h2><p>These are the highest-probability opening conversations for CAD Guardian now.</p></div><div class="grid three">${featured.map((w,i)=>`<article class="card"><span class="card-number">0${i+1} · ${escapeHtml(w.category)}</span><h3>${escapeHtml(w.name)}</h3><p>${escapeHtml(w.trigger)}</p><div class="pill-row"><span class="pill green price">${escapeHtml(w.price)}</span></div><a class="card-link" href="${BASE}workflows/#${escapeHtml(w.id)}">Open playbook</a></article>`).join('')}</div></div></section>${ladder(corpus)}<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Conversion system</span><h2>One signal. One owner. One next paid step.</h2></div><div class="grid three"><article class="card"><span class="kicker">Phone</span><h3>Route by consequence</h3><p>The IVR separates deadline rescue, automation, active clients, partnerships and recruiting so demand data stays clean.</p><a class="card-link" href="${BASE}ivr/">Open IVR architecture</a></article><article class="card"><span class="kicker">Commerce</span><h3>Govern Stripe from the catalog</h3><p>Diagnostics may use Checkout or Payment Links. Blueprints, prototypes and builds use controlled milestone invoices. Retainers use recurring billing after service-envelope acceptance.</p><a class="card-link" href="${BASE}commercial/">Open commercial system</a></article><article class="card"><span class="kicker">Pursuit</span><h3>Turn market signals into offer language</h3><p>The enterprise CAD/.NET pursuit pattern converts a recruiting signal into reusable capability evidence without misrepresenting it as client revenue.</p><a class="card-link" href="${BASE}opportunity/otis/">Open pursuit playbook</a></article></div></div></section><section class="section"><div class="container"><div class="callout"><strong>Primary sales sentence:</strong> CAD Guardian makes drawing packages and repeated CAD work dependable by controlling standards, evidence, automation, review state and release—not by selling anonymous drafting hours.</div></div></section>`;
}

function commercial(corpus, ops){
  const s=ops.stripe;
  return `<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Stripe + commercial control</span><h1>Payment follows commercial truth.</h1><p class="lede">The approved offer catalog governs scope, price, acceptance and payment behavior. No public payment link should activate until its product, price, SOW and CRM mapping agree.</p></div>${ladder(corpus)}<div class="section-head mt-2"><span class="eyebrow">Recommended SKUs</span><h2>Stripe execution map</h2></div><div class="grid two">${s.recommendedSkus.map(x=>`<article class="card"><span class="card-number mono">${escapeHtml(x.sku)}</span><h3>${escapeHtml(x.offer)}</h3><p class="green price">${money(x.amount)}${typeof x.amount==='number'?' USD':''}</p><p><strong>Collection:</strong> ${escapeHtml(x.collection)}</p><p><strong>Stripe path:</strong> ${escapeHtml(x.stripe)}</p>${pills(x.metadata)}</article>`).join('')}</div><div class="section-head mt-2"><span class="eyebrow">Event handling</span><h2>Payment is an operating event</h2></div><div class="flow">${s.events.map(x=>`<article class="flow-step"><h3 class="mono">${escapeHtml(x.event)}</h3><p>${escapeHtml(x.action)}</p></article>`).join('')}</div><div class="callout mt-2"><strong>Current gate:</strong> ${escapeHtml(s.status)}. This site deliberately does not invent live Stripe URLs.</div></div></section>`;
}

function ivr(ops){
  const x=ops.ivr;
  return `<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Inbound conversion</span><h1>Route the call by consequence.</h1><p class="lede">${escapeHtml(x.opening)}</p></div><div class="grid two">${x.routes.map(r=>`<article class="card"><span class="card-number">PRESS ${escapeHtml(r.key)} · ${escapeHtml(r.priority)}</span><h3>${escapeHtml(r.name)}</h3><p><strong>Prompt:</strong> ${escapeHtml(r.prompt)}</p><h4 class="mt-1">Qualification capture</h4>${list(r.questions)}<p><strong>Handoff:</strong> ${escapeHtml(r.handoff)}</p><p><strong>SLA:</strong> ${escapeHtml(r.sla)}</p><div class="callout mt-1"><strong>SMS:</strong> ${escapeHtml(r.sms)}</div></article>`).join('')}</div><div class="grid two mt-2"><article class="card"><span class="kicker">After hours</span><h3>Protect urgency without false promises</h3><p>${escapeHtml(x.afterHours.greeting)}</p>${list(x.afterHours.rules)}</article><article class="card"><span class="kicker">Implementation</span><h3>Provider capability must be verified</h3>${list(x.implementationNotes)}</article></div><div class="section-head mt-2"><span class="eyebrow">Data model</span><h2>Callback record</h2></div>${pills(x.callbackRecord)}<div class="callout mt-2"><strong>Privacy boundary:</strong> callers should send secure invitations for files. Credentials, controlled drawings and confidential attachments should not be collected by SMS.</div></div></section>`;
}

function sales(ops){
  const s=ops.sales;
  return `<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">BDM handoff</span><h1>Operate the revenue loop.</h1><p class="lede">Every conversation should identify a consequence, boundary, authority, evidence set and next action. Technology comes after the buyer’s operating risk is understood.</p></div><div class="grid two">${s.positioningPillars.map(x=>`<article class="card"><span class="kicker">${escapeHtml(x.name)}</span><h3>${escapeHtml(x.message)}</h3></article>`).join('')}</div><div class="section-head mt-2"><span class="eyebrow">Qualification</span><h2>Seven dimensions before proposal</h2></div><div class="grid two">${s.qualificationScorecard.map(x=>`<article class="card"><h3>${escapeHtml(x.dimension)}</h3><p><strong>${escapeHtml(x.question)}</strong></p><p><span class="green">Strong:</span> ${escapeHtml(x.strong)}</p><p><span class="amber">Weak:</span> ${escapeHtml(x.weak)}</p></article>`).join('')}</div><div class="section-head mt-2"><span class="eyebrow">Discovery sequence</span><h2>From signal to paid first step</h2></div><div class="flow">${s.discoverySequence.map(x=>`<article class="flow-step"><h3>${escapeHtml(x)}</h3></article>`).join('')}</div><div class="section-head mt-2"><span class="eyebrow">Objections</span><h2>Hold the commercial boundary</h2></div><div class="grid two">${s.objectionPosture.map(x=>`<article class="card"><h3>${escapeHtml(x.objection)}</h3><p>${escapeHtml(x.response)}</p></article>`).join('')}</div><div class="section-head mt-2"><span class="eyebrow">30-day launch</span><h2>Build market evidence quickly</h2></div><div class="grid four">${s.thirtyDayLaunch.map(x=>`<article class="card"><span class="card-number">WEEK ${x.week}</span><h3>${escapeHtml(x.focus)}</h3>${list(x.actions)}</article>`).join('')}</div></div></section>`;
}

function opportunity(ops){
  const x=ops.opportunityExample;
  return `<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Public-safe pursuit pattern</span><h1>${escapeHtml(x.publicName)}</h1><p class="lede">${escapeHtml(x.signal)}</p></div><div class="callout"><strong>Truth boundary:</strong> ${escapeHtml(x.confidentiality)} ${escapeHtml(x.whyItMatters)}</div><div class="section-head mt-2"><span class="eyebrow">Pursuit stages</span><h2>Convert attention into evidence.</h2></div><div class="flow">${x.pursuitStages.map(s=>`<article class="flow-step"><h3>${escapeHtml(s.stage)}</h3>${list(s.actions)}</article>`).join('')}</div><div class="grid two mt-2"><article class="card"><span class="kicker">Enterprise narrative</span><h3>How to frame the fit</h3><p>${escapeHtml(x.enterpriseNarrative)}</p></article><article class="card"><span class="kicker">Interview discovery</span><h3>Questions that expose the operating system</h3>${list(x.interviewQuestions)}</article></div><div class="section-head mt-2"><span class="eyebrow">CAD Guardian reuse</span><h2>Turn market demand into offers</h2></div>${pills(x.reuseForCadGuardian,'green')}</div></section>`;
}

function dataPage(corpus,ops){
  return `<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">Machine-readable source</span><h1>Static HTML. JSON-backed truth.</h1><p class="lede">The interface is rendered from two public JSON documents so commercial content can be reviewed, versioned and reused without hiding it in page markup.</p></div><div class="grid two"><article class="card"><span class="kicker">Offer corpus</span><h3>corpus.json</h3><p>${corpus.workflows.length} full engagement records, ${corpus.commercialLadder.length} commercial ladder records and proof-governance rules.</p><a class="button primary mt-1" href="${BASE}data/corpus.json">Open raw JSON</a></article><article class="card"><span class="kicker">Operating corpus</span><h3>operations.json</h3><p>${ops.stripe.recommendedSkus.length} Stripe SKU recommendations, ${ops.ivr.routes.length} call routes, qualification logic and the public-safe enterprise pursuit pattern.</p><a class="button primary mt-1" href="${BASE}data/operations.json">Open raw JSON</a></article></div><div class="section-head mt-2"><span class="eyebrow">Schema philosophy</span><h2>Every record answers a commercial question.</h2></div><div class="grid three"><article class="card"><h3>Why now?</h3><p>Trigger, pain, fear and business consequence.</p></article><article class="card"><h3>What is bought?</h3><p>Scope, deliverables, exclusions, phases, price and acceptance.</p></article><article class="card"><h3>Why CAD Guardian?</h3><p>Proof rules, talk track, objections, ROI method, upsell and renewal.</p></article></div></div></section>`;
}

function bindInteractions(){
  const menu=$('.menu-button'); const links=$('.nav-links');
  if(menu&&links){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));links.dataset.open=String(open)});links.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');links.dataset.open='false'})}
  const search=$('#workflow-search'); const category=$('#workflow-category');
  if(search&&category){const filter=()=>{const q=search.value.trim().toLowerCase();const c=category.value;let shown=0;$$('.workflow-card').forEach(card=>{const ok=(!q||card.dataset.search.includes(q))&&(!c||card.dataset.category===c);card.dataset.hidden=String(!ok);if(ok)shown++});$('#workflow-empty').dataset.visible=String(shown===0)};search.addEventListener('input',filter);category.addEventListener('change',filter)}
  if(location.hash){const target=$(location.hash);if(target){target.open=true;setTimeout(()=>target.scrollIntoView({block:'start'}),80)}}
}

async function start(){
  document.body.insertAdjacentHTML('afterbegin',siteHeader());
  const main=$('#main');
  try{
    const [corpus,ops]=await Promise.all([fetch(`${BASE}data/corpus.json`).then(r=>{if(!r.ok)throw new Error(`Corpus ${r.status}`);return r.json()}),fetch(`${BASE}data/operations.json`).then(r=>{if(!r.ok)throw new Error(`Operations ${r.status}`);return r.json()})]);
    const render={home:()=>home(corpus,ops),workflows:()=>workflowCatalog(corpus),commercial:()=>commercial(corpus,ops),ivr:()=>ivr(ops),sales:()=>sales(ops),opportunity:()=>opportunity(ops),data:()=>dataPage(corpus,ops)}[view]||(()=>home(corpus,ops));
    main.innerHTML=render();
    document.body.insertAdjacentHTML('beforeend',siteFooter(corpus.meta));
    $$('.workflow-card').forEach((card,i)=>{const id=corpus.workflows[i]?.id;if(id)card.querySelector('details').id=id});
    bindInteractions();
  }catch(error){main.innerHTML=`<section class="section"><div class="container"><div class="callout"><strong>Corpus load failed.</strong> The static data remains available at <a href="${BASE}data/corpus.json">corpus.json</a> and <a href="${BASE}data/operations.json">operations.json</a>.</div><p class="mono mt-1">${escapeHtml(error.message)}</p></div></section>`;document.body.insertAdjacentHTML('beforeend',siteFooter({positioning:'You have drawings due. We keep them moving.'}));bindInteractions()}
}
start();
