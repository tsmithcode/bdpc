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
    anchor.remove();
  }

  function applyFocusedScope() {
    document.querySelectorAll('.report-grid--enterprise a.report-card').forEach(retireReportCard);

    document.querySelectorAll('a[href]').forEach(anchor => {
      if (!isReportUrl(anchor.getAttribute('href'))) return;
      if (anchor.matches('.report-card')) retireReportCard(anchor);
      else anchor.remove();
    });

    document.querySelectorAll('.section-head').forEach(head => {
      const title = head.querySelector('h2');
      if (!title || !/client-safe control library/i.test(title.textContent)) return;
      head.remove();
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
