(() => {
  'use strict';

  const STORAGE_KEY = 'bdpc-client-service-os-v1';
  const ACTIVE_TAB_KEY = 'bdpc-client-service-os-active-tab';
  const STATUS_GOOD = new Set(['Complete', 'Confirmed', 'Ready', 'Yes', 'Reviewed', 'Reference', 'Extracted']);
  const STATUS_WARN = new Set(['In review', 'In progress', 'Awaiting input', 'Awaiting estimate', 'Planned', 'Proposed', 'To verify', 'High-level', 'Current']);
  const STATUS_BAD = new Set(['Blocked', 'No', 'Unusable']);

  let editing = false;
  let state = loadState();
  let activeTab = resolveInitialTab();

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeData(base, saved) {
    if (saved === undefined || saved === null) return clone(base);
    if (Array.isArray(base)) {
      if (!Array.isArray(saved)) return clone(base);
      const keyed = base.every(item => item && typeof item === 'object' && 'id' in item);
      if (!keyed) return clone(saved);
      const savedMap = new Map(saved.map(item => [item.id, item]));
      const merged = base.map(item => mergeData(item, savedMap.get(item.id)));
      const baseIds = new Set(base.map(item => item.id));
      saved.filter(item => !baseIds.has(item.id)).forEach(item => merged.push(clone(item)));
      return merged;
    }
    if (base && typeof base === 'object') {
      const result = {};
      const keys = new Set([...Object.keys(base), ...Object.keys(saved || {})]);
      keys.forEach(key => {
        if (key in base) result[key] = mergeData(base[key], saved?.[key]);
        else result[key] = clone(saved[key]);
      });
      return result;
    }
    return saved;
  }

  function loadState() {
    const defaults = clone(window.BDPC_DEFAULT_DATA);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const saved = JSON.parse(raw);
      return mergeData(defaults, saved);
    } catch (error) {
      console.warn('Unable to load local workspace state.', error);
      return defaults;
    }
  }

  function saveState(message = 'Saved locally') {
    state.meta.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    showToast(message);
    updateHero();
  }

  function resolveInitialTab() {
    const hash = location.hash.replace('#', '');
    if (window.BDPC_DEFAULT_DATA.tabs.some(tab => tab.id === hash)) return hash;
    const saved = localStorage.getItem(ACTIVE_TAB_KEY);
    if (window.BDPC_DEFAULT_DATA.tabs.some(tab => tab.id === saved)) return saved;
    return 'overview';
  }

  function esc(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function tone(status = '') {
    if (STATUS_GOOD.has(status)) return 'good';
    if (STATUS_BAD.has(status)) return 'bad';
    if (STATUS_WARN.has(status)) return 'warn';
    if (['Future', 'TBD', 'Not started', 'Not yet', 'N/A', 'Backlog'].includes(status)) return 'neutral';
    return 'info';
  }

  function badge(status) {
    return `<span class="badge" data-tone="${tone(status)}">${esc(status)}</span>`;
  }

  function statusSelect(value, path, options = state.statusOptions) {
    const unique = [...new Set([value, ...options])];
    return `<select class="compact-select" data-edit-path="${esc(path)}" ${editing ? '' : 'disabled'} aria-label="Status">
      ${unique.map(option => `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}
    </select>`;
  }

  function editableText(value, path, tag = 'span', className = '') {
    return `<${tag} class="editable ${className}" data-edit-path="${esc(path)}" contenteditable="${editing ? 'true' : 'false'}" spellcheck="true">${esc(value || '')}</${tag}>`;
  }

  function renderTabs() {
    const list = $('#tab-list');
    list.innerHTML = state.tabs.map(tab => `
      <button class="tab" id="tab-${tab.id}" type="button" role="tab" aria-controls="panel-${tab.id}" aria-selected="${activeTab === tab.id}" tabindex="${activeTab === tab.id ? '0' : '-1'}" data-tab="${tab.id}">
        ${esc(tab.label)}
      </button>`).join('');

    const panels = $('#tab-panels');
    panels.innerHTML = state.tabs.map(tab => `
      <section class="tab-panel" id="panel-${tab.id}" role="tabpanel" aria-labelledby="tab-${tab.id}" aria-hidden="${activeTab !== tab.id}">
        ${renderPanel(tab.id)}
      </section>`).join('');

    $$('.tab', list).forEach(button => {
      button.addEventListener('click', () => activateTab(button.dataset.tab));
      button.addEventListener('keydown', handleTabKeydown);
    });
    bindPanelEvents();
  }

  function activateTab(id, setHash = true) {
    activeTab = id;
    localStorage.setItem(ACTIVE_TAB_KEY, id);
    $$('.tab').forEach(tab => {
      const selected = tab.dataset.tab === id;
      tab.setAttribute('aria-selected', selected);
      tab.tabIndex = selected ? 0 : -1;
    });
    $$('.tab-panel').forEach(panel => panel.setAttribute('aria-hidden', panel.id !== `panel-${id}`));
    if (setHash) history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: Math.max(0, $('.tabs').offsetTop - 70), behavior: 'smooth' });
  }

  function handleTabKeydown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = $$('.tab');
    const current = tabs.indexOf(event.currentTarget);
    let next = current;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    tabs[next].focus();
    activateTab(tabs[next].dataset.tab);
  }

  function renderPanel(id) {
    switch (id) {
      case 'overview': return renderOverview();
      case 'milestones': return renderMilestones();
      case 'files': return renderFiles();
      case 'standards': return renderStandards();
      case 'automation': return renderAutomation();
      case 'delivery': return renderDelivery();
      case 'commercial': return renderCommercial();
      case 'updates': return renderUpdates();
      default: return '<div class="empty">Section unavailable.</div>';
    }
  }

  function panelHead(kicker, title, intro) {
    return `<div class="panel-head"><div><div class="kicker">${esc(kicker)}</div><h2>${esc(title)}</h2></div><div class="panel-intro">${intro}</div></div>`;
  }

  function list(items) {
    return `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
  }

  function getMilestoneMetrics() {
    const total = state.milestones.length;
    const complete = state.milestones.filter(item => item.status === 'Complete').length;
    const pilot = state.milestones.filter(item => item.group === 'Pilot');
    const pilotComplete = pilot.filter(item => item.status === 'Complete').length;
    const active = state.milestones.filter(item => ['In review', 'In progress', 'Ready'].includes(item.status)).length;
    const clientAction = state.milestones.filter(item => item.owner === 'BDPC' && ['Awaiting input', 'Ready'].includes(item.status)).length;
    return { total, complete, percent: Math.round((complete / total) * 100), pilotTotal: pilot.length, pilotComplete, pilotPercent: Math.round((pilotComplete / pilot.length) * 100), active, clientAction };
  }

  function renderOverview() {
    const m = getMilestoneMetrics();
    return `
      ${panelHead('01 · Current signal', 'Overview', 'Everything Brian needs to know today—without reopening files, reading a long email chain, or attending another status meeting.')}
      <div class="grid grid-4">
        <div class="metric"><div class="metric__label">Lifetime milestones</div><div class="metric__value">${m.percent}%</div><div class="metric__note">${m.complete} of ${m.total} complete</div><div class="progress"><div class="progress__bar" style="width:${m.percent}%"></div></div></div>
        <div class="metric"><div class="metric__label">Pilot milestones</div><div class="metric__value">${m.pilotPercent}%</div><div class="metric__note">${m.pilotComplete} of ${m.pilotTotal} complete</div><div class="progress"><div class="progress__bar" style="width:${m.pilotPercent}%"></div></div></div>
        <div class="metric"><div class="metric__label">Active workstreams</div><div class="metric__value">${m.active}</div><div class="metric__note">Currently in review or execution</div></div>
        <div class="metric"><div class="metric__label">Client actions due</div><div class="metric__value">${m.clientAction}</div><div class="metric__note">No action unless a focused question is issued</div></div>
      </div>
      <div class="grid grid-3 section-block">
        <article class="card card--accent"><h3>Now</h3>${list(state.overview.now)}</article>
        <article class="card card--good"><h3>Next</h3>${list(state.overview.next)}</article>
        <article class="card card--warn"><h3>Waiting on</h3>${list(state.overview.waitingOn)}</article>
      </div>
      <div class="section-block">
        <div class="section-title"><h3>Project facts</h3><p>Public-safe summary</p></div>
        <div class="grid grid-3">
          ${state.overview.facts.map((fact, index) => `<article class="card card--soft"><div class="kicker">${esc(fact.label)}</div><h3>${editableText(fact.value, `overview.facts.${index}.value`)}</h3></article>`).join('')}
        </div>
      </div>
      <div class="callout section-block"><strong>Client-time protocol:</strong> CAD Guardian will consolidate questions, present options with consequences, and request decisions only when they materially affect accuracy, scope, schedule, fee, or professional responsibility.</div>`;
  }

  function renderMilestones() {
    const m = getMilestoneMetrics();
    const groups = [...new Set(state.milestones.map(item => item.group))];
    return `
      ${panelHead('02 · Customer lifetime', 'Milestones', 'A single traceable sequence from first alignment through accepted delivery, reusable standards, and future BDPC capacity.')}
      <div class="progress-row"><div><strong>${m.complete} of ${m.total} milestones complete</strong><div class="progress-row__summary">Local status edits can be exported for publishing.</div></div><div class="metric__value">${m.percent}%</div></div>
      <div class="progress"><div class="progress__bar" style="width:${m.percent}%"></div></div>
      ${groups.map(group => `
        <div class="section-block">
          <div class="section-title"><h3>${esc(group)}</h3><p>${state.milestones.filter(item => item.group === group).length} milestones</p></div>
          <div class="table-wrap"><table>
            <thead><tr><th>Milestone</th><th>Owner</th><th>Status</th><th>Date</th><th>Evidence / output</th><th>Note</th></tr></thead>
            <tbody>${state.milestones.map((item, index) => item.group === group ? `<tr>
              <td>${esc(item.title)}</td>
              <td>${editableText(item.owner, `milestones.${index}.owner`)}</td>
              <td>${statusSelect(item.status, `milestones.${index}.status`)}</td>
              <td>${editableText(item.date || '—', `milestones.${index}.date`)}</td>
              <td>${editableText(item.evidence, `milestones.${index}.evidence`)}</td>
              <td>${editableText(item.note, `milestones.${index}.note`)}</td>
            </tr>` : '').join('')}</tbody>
          </table></div>
        </div>`).join('')}`;
  }

  function renderFiles() {
    return `
      ${panelHead('03 · Source control', 'Files', 'Receipt is not the same as openability, and openability is not the same as usability. This register keeps those signals separate.')}
      <div class="callout"><strong>Confidentiality boundary:</strong> private links, exact filenames, drawing content, scan data, exact addresses, credentials, and client correspondence are never published here.</div>
      ${state.fileGroups.map((group, groupIndex) => `
        <div class="section-block">
          <div class="section-title"><div><h3>${esc(group.title)}</h3><p>${esc(group.note)}</p></div></div>
          <div class="table-wrap"><table>
            <thead><tr><th>Source / output</th><th>Expected</th><th>Received</th><th>Opened</th><th>Reviewed</th><th>Usable</th><th>Next review action</th></tr></thead>
            <tbody>${group.items.map((item, itemIndex) => `<tr>
              <td>${esc(item.name)}</td>
              <td>${item.expected ? badge('Yes') : badge('As available')}</td>
              <td>${statusSelect(item.received, `fileGroups.${groupIndex}.items.${itemIndex}.received`, ['Yes','No','To verify','N/A'])}</td>
              <td>${statusSelect(item.opened, `fileGroups.${groupIndex}.items.${itemIndex}.opened`, ['Yes','No','Not yet','In review','Extracted','N/A'])}</td>
              <td>${statusSelect(item.reviewed, `fileGroups.${groupIndex}.items.${itemIndex}.reviewed`, ['Not yet','In review','High-level','Complete','N/A'])}</td>
              <td>${statusSelect(item.usable, `fileGroups.${groupIndex}.items.${itemIndex}.usable`, ['TBD','Reference','Usable','Partially usable','Unusable','N/A'])}</td>
              <td>${editableText(item.action, `fileGroups.${groupIndex}.items.${itemIndex}.action`)}</td>
            </tr>`).join('')}</tbody>
          </table></div>
        </div>`).join('')}
      <div class="callout callout--warn section-block"><strong>Completion gate:</strong> the source package is review-ready only when all expected items are present, accessible, open in the agreed tools, and their dependencies and coordinate relationships are understood.</div>`;
  }

  function renderStandards() {
    return `
      ${panelHead('04 · BDPC drafting language', 'Standards', 'The pilot should feel native to BDPC: the legacy drawing supplies rational drafting logic, while the current set supplies contemporary presentation and publishing standards.')}
      <div class="grid grid-2">
        ${state.standards.lanes.map((lane, laneIndex) => `<article class="card"><h3>${esc(lane.title)}</h3>${lane.items.map((item, itemIndex) => `
          <div class="list-check"><input type="checkbox" ${item.status === 'Complete' ? 'checked' : ''} ${editing ? '' : 'disabled'} data-check-path="standards.lanes.${laneIndex}.items.${itemIndex}.status"><div class="list-check__main"><div class="list-check__title">${esc(item.title)}</div><div class="list-check__meta">${statusSelect(item.status, `standards.lanes.${laneIndex}.items.${itemIndex}.status`)}</div></div></div>`).join('')}</article>`).join('')}
      </div>
      <div class="section-block">
        <div class="section-title"><h3>Confirmed working rules</h3><p>Subject to source review and BDPC direction</p></div>
        <div class="grid grid-2">
          ${state.standards.confirmedRules.map((rule, index) => `<article class="card card--soft"><div class="kicker">Rule ${String(index + 1).padStart(2, '0')}</div><p>${editableText(rule, `standards.confirmedRules.${index}`)}</p></article>`).join('')}
        </div>
      </div>
      <div class="callout section-block"><strong>LiDAR standard:</strong> scan data is measured evidence, not automatic truth. Scale, registration, coverage, and independent source agreement must be checked before the scan governs drafting.</div>`;
  }

  function renderAutomation() {
    const tiers = [...new Set(state.automation.queue.map(item => item.tier))];
    return `
      ${panelHead('05 · High-return leverage', 'Automation', 'Automate repeatable inspection, reporting, and packaging first. Keep architectural judgment, ambiguous geometry, and final issue authority human-controlled.')}
      <div class="grid grid-2">
        <article class="card card--dark"><h3>Operating principles</h3>${list(state.automation.principles)}</article>
        <article class="card card--soft"><h3>Agent execution boundary</h3><ul><li>Read-only or copy-based inputs</li><li>No source overwrites or silent renaming</li><li>Machine-readable output manifest</li><li>Explicit human review gate</li><li>No confidential output published to this site</li></ul><div class="inline-actions" style="margin-top:12px"><button class="small-button" id="download-manifest" type="button">Download task manifest</button></div></article>
      </div>
      ${tiers.map(tier => `<div class="section-block"><div class="section-title"><h3>${esc(tier)}</h3><p>${tier === 'Frontier' ? 'Experimental and reversible' : 'Production-aligned'}</p></div><div class="table-wrap"><table>
        <thead><tr><th>Automation</th><th>ROI</th><th>Status</th><th>Output</th><th>Human gate</th></tr></thead>
        <tbody>${state.automation.queue.map((item, index) => item.tier === tier ? `<tr><td>${esc(item.name)}</td><td><span class="roi">${esc(item.roi)}</span></td><td>${statusSelect(item.status, `automation.queue.${index}.status`)}</td><td>${editableText(item.output, `automation.queue.${index}.output`)}</td><td>${editableText(item.humanGate, `automation.queue.${index}.humanGate`)}</td></tr>` : '').join('')}</tbody>
      </table></div></div>`).join('')}
      <div class="callout callout--dark section-block"><strong>Frontier rule:</strong> experimental methods run only on copies, produce measurable outputs, remain reversible, and may not delay or contaminate the production path.</div>`;
  }

  function renderDelivery() {
    return `
      ${panelHead('06 · Output control', 'Delivery + QA', 'A bounded production outcome, explicit exclusions, five quality gates, and a communication pattern designed to minimize Brian’s time.')}
      <div class="grid grid-2">
        <article class="card card--good"><h3>Included pilot outcome</h3>${list(state.delivery.scope)}</article>
        <article class="card card--warn"><h3>Explicit exclusions</h3>${list(state.delivery.exclusions)}</article>
      </div>
      <div class="section-block"><div class="section-title"><h3>Five QA gates</h3><p>Every gate must be visibly satisfied or exceptioned</p></div><div class="grid grid-3">${state.delivery.qaGates.map((gate, index) => `<article class="card card--accent"><div class="kicker">Gate ${index + 1}</div><h3>${esc(gate.title)}</h3><p>${esc(gate.detail)}</p></article>`).join('')}</div></div>
      <div class="section-block"><div class="section-title"><h3>Client-time protection</h3><p>Consolidated interactions only</p></div><div class="grid grid-4">${state.delivery.clientTime.map((item, index) => `<article class="card card--soft"><div class="kicker">Touchpoint ${index + 1}</div><p>${esc(item)}</p></article>`).join('')}</div></div>`;
  }

  function renderCommercial() {
    return `
      ${panelHead('07 · Commercial readiness', 'Commercial', `Current stage: <strong>${esc(state.commercial.stage)}</strong>. Values remain intentionally blank until source review makes them responsible.`)}
      <div class="table-wrap"><table>
        <thead><tr><th>Commercial field</th><th>Current value</th><th>Status</th></tr></thead>
        <tbody>${state.commercial.fields.map((field, index) => `<tr><td>${esc(field.label)}</td><td>${editableText(field.value, `commercial.fields.${index}.value`)}</td><td>${statusSelect(field.status, `commercial.fields.${index}.status`)}</td></tr>`).join('')}</tbody>
      </table></div>
      <div class="section-block"><div class="section-title"><h3>Recommended sales progression</h3><p>Earn expansion through delivery evidence</p></div><div class="step-grid">${state.commercial.strategy.map(step => `<article class="step"><div class="step__number">${esc(step.step)}</div><h3>${esc(step.title)}</h3><p>${esc(step.detail)}</p></article>`).join('')}</div></div>
      <div class="callout callout--warn section-block"><strong>Estimate discipline:</strong> complimentary review stops at receipt, extraction, openability, top-level inventory, and determining whether a reliable estimate is possible. Substantial repair, scan analysis, standards harvesting, or production is separately authorized.</div>`;
  }

  function renderUpdates() {
    const sorted = [...state.updates].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
    return `
      ${panelHead('08 · Shared record', 'Updates', 'A reverse-chronological client log of verified facts, work in progress, dependencies, next actions, and decisions. Each entry stays concise.')}
      <div id="updates-list">${sorted.map(update => renderUpdateCard(update)).join('')}</div>
      <form class="form only-edit" id="update-form">
        <h3>Add a local update</h3><div class="form__intro">This saves to the current browser. Export the workspace JSON when the entry is ready for publication.</div>
        <div class="form-grid">
          <div class="form-field"><label for="update-date">Date</label><input id="update-date" name="date" type="date" required></div>
          <div class="form-field"><label for="update-author">Author</label><input id="update-author" name="author" value="CAD Guardian" required></div>
          <div class="form-field"><label for="update-title">Title</label><input id="update-title" name="title" required></div>
          <div class="form-field form-field--wide"><label for="update-completed">Completed</label><textarea id="update-completed" name="completed"></textarea></div>
          <div class="form-field"><label for="update-in-progress">In progress</label><textarea id="update-in-progress" name="inProgress"></textarea></div>
          <div class="form-field"><label for="update-waiting">Waiting on</label><textarea id="update-waiting" name="waitingOn"></textarea></div>
          <div class="form-field"><label for="update-next">Next action</label><textarea id="update-next" name="next"></textarea></div>
          <div class="form-field"><label for="update-decision">Decision</label><textarea id="update-decision" name="decision"></textarea></div>
        </div>
        <div class="form-actions"><button class="small-button small-button--primary" type="submit">Add update locally</button></div>
      </form>`;
  }

  function renderUpdateCard(update) {
    return `<article class="update-card"><div class="update-card__head"><div><div class="update-card__title">${esc(update.title)}</div><div class="update-card__meta">${formatDate(update.date)} · ${esc(update.author)}</div></div>${badge('Verified update')}</div><div class="update-grid">
      <div class="update-field"><div class="update-field__label">Completed</div><div class="update-field__value">${esc(update.completed || '—')}</div></div>
      <div class="update-field"><div class="update-field__label">In progress</div><div class="update-field__value">${esc(update.inProgress || '—')}</div></div>
      <div class="update-field"><div class="update-field__label">Waiting on</div><div class="update-field__value">${esc(update.waitingOn || '—')}</div></div>
      <div class="update-field"><div class="update-field__label">Next action / decision</div><div class="update-field__value">${esc(update.next || '—')}${update.decision ? `<br><strong>Decision:</strong> ${esc(update.decision)}` : ''}</div></div>
    </div></article>`;
  }

  function formatDate(value) {
    if (!value) return 'Undated';
    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  }

  function bindPanelEvents() {
    $$('[data-edit-path]').forEach(element => {
      if (element.matches('select')) {
        element.addEventListener('change', () => {
          setByPath(element.dataset.editPath, element.value);
          saveState();
          rerenderCurrent();
        });
      } else {
        element.addEventListener('blur', () => {
          if (!editing) return;
          setByPath(element.dataset.editPath, element.textContent.trim() === '—' ? '' : element.textContent.trim());
          saveState();
        });
      }
    });

    $$('[data-check-path]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        setByPath(checkbox.dataset.checkPath, checkbox.checked ? 'Complete' : 'Not started');
        saveState();
        rerenderCurrent();
      });
    });

    $('#download-manifest')?.addEventListener('click', downloadTaskManifest);
    $('#update-form')?.addEventListener('submit', addUpdate);
  }

  function setByPath(path, value) {
    const parts = path.split('.');
    let target = state;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = /^\d+$/.test(parts[index]) ? Number(parts[index]) : parts[index];
      target = target[key];
    }
    const finalKey = /^\d+$/.test(parts.at(-1)) ? Number(parts.at(-1)) : parts.at(-1);
    target[finalKey] = value;
  }

  function rerenderCurrent() {
    const panel = $(`#panel-${activeTab}`);
    if (!panel) return;
    panel.innerHTML = renderPanel(activeTab);
    bindPanelEvents();
    document.body.classList.toggle('edit-mode', editing);
  }

  function updateHero() {
    $('#current-gate').textContent = state.meta.currentGate;
    $('#current-gate-note').textContent = state.meta.gateNote;
    $('#hero-status').innerHTML = [
      state.meta.publishedStatus,
      `Authorization · ${state.meta.currentAuthorization}`,
      `Production · ${state.meta.productionStatus}`,
      `Client action · ${state.meta.clientAction}`
    ].map(text => `<span class="pill">${esc(text)}</span>`).join('');
  }

  function toggleEditing() {
    editing = !editing;
    document.body.classList.toggle('edit-mode', editing);
    const button = $('#edit-toggle');
    button.setAttribute('aria-pressed', editing);
    button.textContent = editing ? 'Finish local edits' : 'Edit locally';
    renderTabs();
    activateTab(activeTab, false);
    showToast(editing ? 'Local editing enabled' : 'Local editing closed');
  }

  function addUpdate(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const update = {
      id: `u${Date.now()}`,
      date: form.get('date'),
      author: form.get('author'),
      title: form.get('title'),
      completed: form.get('completed'),
      inProgress: form.get('inProgress'),
      waitingOn: form.get('waitingOn'),
      next: form.get('next'),
      decision: form.get('decision')
    };
    state.updates.push(update);
    saveState('Update added locally');
    rerenderCurrent();
  }

  function buildStatusText() {
    const m = getMilestoneMetrics();
    const latest = [...state.updates].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))[0];
    return `${state.meta.workspaceName}\n\nProject: ${state.meta.projectName}\nUpdated: ${formatDate(state.meta.updatedAt.slice(0,10))}\nCurrent gate: ${state.meta.currentGate}\nStatus: ${state.meta.publishedStatus}\nAuthorization: ${state.meta.currentAuthorization}\nProduction: ${state.meta.productionStatus}\nClient action: ${state.meta.clientAction}\nMilestones: ${m.complete} of ${m.total} complete (${m.percent}%)\n\nLatest update — ${latest.title}\nCompleted: ${latest.completed}\nIn progress: ${latest.inProgress}\nWaiting on: ${latest.waitingOn}\nNext: ${latest.next}\n\nConfidentiality: ${state.meta.confidentiality}`;
  }

  async function copyStatus() {
    const text = buildStatusText();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Client status copied');
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      showToast('Client status copied');
    }
  }

  function exportData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      workspace: state.meta.workspaceName,
      projectCode: state.meta.projectCode,
      data: state
    };
    downloadJson(`bdpc-client-update-${new Date().toISOString().slice(0,10)}.json`, payload);
    showToast('Workspace update exported');
  }

  function importData(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const imported = parsed.data || parsed;
        state = mergeData(window.BDPC_DEFAULT_DATA, imported);
        saveState('Imported workspace update');
        renderTabs();
        updateHero();
      } catch (error) {
        showToast('Import failed: invalid JSON');
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!confirm('Reset all local workspace changes on this browser? The published GitHub baseline will not be changed.')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = clone(window.BDPC_DEFAULT_DATA);
    editing = false;
    document.body.classList.remove('edit-mode');
    $('#edit-toggle').setAttribute('aria-pressed', 'false');
    $('#edit-toggle').textContent = 'Edit locally';
    renderTabs();
    updateHero();
    showToast('Local changes reset');
  }

  function downloadTaskManifest() {
    const manifest = {
      task_id: `${state.meta.projectCode}-TASK`,
      purpose: 'Describe one autonomous CAD review or reporting operation',
      inputs: ['approved private source folder or explicit file list'],
      allowed_actions: ['read files', 'extract metadata', 'analyze copies', 'generate reports'],
      forbidden_actions: ['overwrite source files', 'rename client files', 'publish confidential content', 'make architectural decisions', 'issue client drawings without review'],
      outputs: ['machine-readable report', 'human-readable summary', 'exception log'],
      human_gate: 'CAD Guardian review before BDPC delivery',
      status: 'not_started',
      public_workspace_rule: 'Only sanitized status and conclusions may be published.'
    };
    downloadJson(`${state.meta.projectCode.toLowerCase()}-task-manifest.json`, manifest);
  }

  function downloadJson(filename, object) {
    const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  let toastTimer;
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2300);
  }

  function init() {
    updateHero();
    renderTabs();
    activateTab(activeTab, false);
    $('#edit-toggle').addEventListener('click', toggleEditing);
    $('#copy-update').addEventListener('click', copyStatus);
    $('#print-workspace').addEventListener('click', () => window.print());
    $('#export-data').addEventListener('click', exportData);
    $('#import-data').addEventListener('change', event => {
      const [file] = event.target.files;
      if (file) importData(file);
      event.target.value = '';
    });
    $('#reset-data').addEventListener('click', resetData);
    window.addEventListener('hashchange', () => {
      const id = location.hash.replace('#', '');
      if (state.tabs.some(tab => tab.id === id)) activateTab(id, false);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
