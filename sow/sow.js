(() => {
  'use strict';

  const detailsRoot = document.getElementById('effort-details');
  const loadState = document.getElementById('effort-load-state');
  const formatHours = value => Number(value).toFixed(2).replace(/\.00$/, '.0').replace(/(\.\d)0$/, '$1');

  function cell(value, className = '') {
    const node = document.createElement('td');
    node.textContent = String(value ?? '');
    if (className) node.className = className;
    return node;
  }

  function renderEffortPlan(items) {
    const groups = new Map();
    items.forEach(item => {
      if (!groups.has(item.workstream)) groups.set(item.workstream, []);
      groups.get(item.workstream).push(item);
    });

    groups.forEach((rows, name) => {
      const hours = rows.reduce((sum, item) => sum + Number(item.hours), 0);
      const details = document.createElement('details');
      details.className = 'workstream';
      details.open = true;

      const summary = document.createElement('summary');
      const label = document.createElement('span');
      const allocation = document.createElement('strong');
      label.textContent = name;
      allocation.textContent = `${formatHours(hours)} hours`;
      summary.append(label, allocation);

      const wrap = document.createElement('div');
      wrap.className = 'table-wrap';
      const table = document.createElement('table');
      table.setAttribute('aria-label', `${name} work packages`);
      const head = document.createElement('thead');
      const headRow = document.createElement('tr');
      ['Package', 'Assignment', 'Hours', 'Owner', 'Starts after', 'Required handoff', 'Acceptance evidence'].forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        headRow.append(th);
      });
      head.append(headRow);
      const body = document.createElement('tbody');
      rows.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.workPackage = item.id;
        row.append(
          cell(item.id),
          cell(item.task),
          cell(formatHours(item.hours), 'hours'),
          cell(item.owner),
          cell(item.dependency),
          cell(item.handoff),
          cell(item.acceptance)
        );
        body.append(row);
      });
      table.append(head, body);
      wrap.append(table);
      details.append(summary, wrap);
      detailsRoot.append(details);
    });
  }

  async function loadEffortPlan() {
    try {
      const response = await fetch('../data/project.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Project record returned ${response.status}`);
      const project = await response.json();
      const items = project.sow_effort_plan;
      if (!Array.isArray(items) || items.length !== 31) throw new Error('Expected 31 work packages');
      const total = items.reduce((sum, item) => sum + Number(item.hours), 0);
      if (Math.abs(total - 40) > 0.001) throw new Error(`Expected a 40-hour ceiling; found ${total}`);
      renderEffortPlan(items);
      loadState.textContent = '31 work packages loaded from the verified project record.';
      loadState.hidden = true;
      document.documentElement.dataset.effortPlan = 'ready';
    } catch (error) {
      loadState.innerHTML = '<strong>Detailed work packages could not be loaded.</strong> Use the complete CAD effort plan CSV linked below; the 40-hour allocation above remains the controlling summary.';
      loadState.dataset.state = 'error';
      console.error('SOW effort plan:', error);
    }
  }

  const subject = encodeURIComponent('Dunn Residence — SOW authorization');
  const body = encodeURIComponent('Thomas,\n\nBDPC authorizes the Dunn Residence $3,200 fixed-fee scope, 40-hour absolute effort ceiling, and one consolidated review round. We will arrange the $1,600 start payment, confirm the controlling CAD/design/title-block/standards inputs, and coordinate licensed runtime access.\n\nPlease confirm when all kickoff gates are complete and the production clock can begin.\n\nBest,\nBrian');
  document.querySelectorAll('[data-authorize]').forEach(link => {
    link.href = `mailto:tsmithcad@gmail.com?subject=${subject}&body=${body}`;
  });

  loadEffortPlan();
})();
