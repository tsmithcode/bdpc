(() => {
  'use strict';
  const D = window.BDPC_DEFAULT_DATA;
  if (D) D.meta.projectName = 'Dunn Residence — Grant Park Floor Plan CAD Pilot';
  window.addEventListener('load', () => {
    if (!window.location.hash || window.location.hash === '#overview') {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
  }, { once: true });
})();
