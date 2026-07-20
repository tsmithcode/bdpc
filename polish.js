(() => {
  'use strict';

  // Preserve the executive landing view on first load. Tab changes remain handled
  // by the main application after the visitor interacts with the workspace.
  window.addEventListener('load', () => {
    if (!window.location.hash || window.location.hash === '#overview') {
      window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'auto' }));
    }
  }, { once: true });
})();
