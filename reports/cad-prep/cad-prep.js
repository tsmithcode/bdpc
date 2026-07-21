(() => {
  'use strict';

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let value = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const character = text[index];
      const next = text[index + 1];
      if (quoted && character === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = !quoted;
      } else if (!quoted && character === ',') {
        row.push(value);
        value = '';
      } else if (!quoted && (character === '\n' || character === '\r')) {
        if (character === '\r' && next === '\n') index += 1;
        row.push(value);
        if (row.some(cell => cell.length)) rows.push(row);
        row = [];
        value = '';
      } else {
        value += character;
      }
    }
    if (value.length || row.length) {
      row.push(value);
      rows.push(row);
    }
    return rows;
  }

  async function renderCsv(filename, headId, bodyId) {
    const response = await fetch(`../data/${filename}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${filename}: ${response.status}`);
    const rows = parseCsv(await response.text());
    const headers = rows.shift() || [];
    document.getElementById(headId).innerHTML = headers.map(header => `<th scope="col">${escapeHtml(header.replaceAll('_', ' '))}</th>`).join('');
    document.getElementById(bodyId).innerHTML = rows.map(row => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] || '')}</td>`).join('')}</tr>`).join('');
  }

  Promise.all([
    renderCsv('cad-drafter-checklist.csv', 'checklist-head', 'checklist-body'),
    renderCsv('cad-area-room-register.csv', 'areas-head', 'areas-body'),
    renderCsv('cad-asset-block-register.csv', 'assets-head', 'assets-body'),
    renderCsv('cad-orientation-register.csv', 'orientation-head', 'orientation-body'),
  ]).catch(error => {
    document.getElementById('checklist-body').innerHTML = `<tr><td>Unable to load public CAD-prep data: ${escapeHtml(error.message)}</td></tr>`;
  });
})();
