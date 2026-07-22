(() => {
  'use strict';

  const REPORT_PREFIX = '/bdpc/reports';
  let queued = false;

  function isReportUrl(value) {
    if (!value) return false;
    try {
      const path = new URL(value, window.location.href).pathname.replace(/\/+$/, '');
      return path === REPORT_PREFIX || path.startsWith(`${REPORT_PREFIX}/`);
    } catch {
      return false;
    }
  }

  function retireReportCard(anchor) {
    const card = document.createElement('article');
    card.className = anchor.className;
    card.setAttribute('aria-label', `${anchor.querySelector('h3')?.textContent || 'Reporting capability'} — available with expanded scope`);
    card.innerHTML = anchor.innerHTML;
    const action = card.querySelector('strong');
    if (action) action.textContent = 'Expanded scope';
    anchor.replaceWith(card);
  }

  function applyFocusedScope() {
    document.querySelectorAll('.report-grid--enterprise a.report-card').forEach(retireReportCard);

    document.querySelectorAll('a[href]').forEach(anchor => {
      if (!isReportUrl(anchor.getAttribute('href'))) return;
      if (anchor.matches('.report-card')) retireReportCard(anchor);
      else anchor.remove();
    });

    document.querySelectorAll('.enterprise-metrics article').forEach(article => {
      const label = article.querySelector('span');
      const value = article.querySelector('strong');
      if (label?.textContent.trim() !== 'Supporting reports') return;
      label.textContent = 'Expanded reporting';
      if (value) value.textContent = 'Available by separate scope';
    });

    document.querySelectorAll('.section-head').forEach(head => {
      const title = head.querySelector('h2');
      if (!title || !/client-safe control library/i.test(title.textContent)) return;
      title.textContent = 'Expanded-scope reporting';
      const copy = head.querySelector('p');
      if (copy) copy.textContent = 'Detailed optimized reports are intentionally paused for the current one-sheet trial and can be restored only through separate written authorization.';
      head.querySelectorAll('a').forEach(anchor => anchor.remove());
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      applyFocusedScope();
    });
  }

  new MutationObserver(queue).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queue, { once: true });
  else queue();
})();
