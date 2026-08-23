(() => {
  'use strict';

  const base = document.documentElement.dataset.base || '/bdpc/cadguardian-engagement-workflows/';
  const release = '20260823.2';

  // Safari and embedded browsers can throw a DOMException when a text fragment
  // or malformed hash is passed directly to querySelector. The app only needs
  // hash lookup by element id, so neutralize invalid selectors before startup.
  if (window.location.hash) {
    try {
      document.querySelector(window.location.hash);
    } catch {
      try {
        history.replaceState(null, '', `${location.pathname}${location.search}`);
      } catch {
        // A failed history update is non-critical; the selector guard below
        // still prevents a malformed hash from taking down the interface.
      }
    }
  }

  const nativeDocumentQuerySelector = Document.prototype.querySelector;
  Document.prototype.querySelector = function querySelectorCompat(selector) {
    try {
      return nativeDocumentQuerySelector.call(this, selector);
    } catch (error) {
      if (typeof selector === 'string' && selector.startsWith('#')) {
        let id = selector.slice(1);
        if (!id) return null;
        try {
          id = decodeURIComponent(id);
        } catch {
          return null;
        }
        return this.getElementById(id);
      }
      throw error;
    }
  };

  // Normalize root-relative fetch inputs for iOS embedded-browser variants.
  const nativeFetch = typeof window.fetch === 'function' ? window.fetch.bind(window) : null;
  if (nativeFetch) {
    window.fetch = (input, init) => {
      const resolved = typeof input === 'string' && input.startsWith('/')
        ? `${window.location.origin}${input}`
        : input;
      return nativeFetch(resolved, init);
    };
  }

  const script = document.createElement('script');
  script.src = `${base}app.js?v=${release}`;
  script.async = false;
  script.dataset.release = release;
  script.onerror = () => {
    const main = document.getElementById('main');
    if (!main) return;
    main.innerHTML = `<section class="section"><div class="container"><div class="callout"><strong>Interface script unavailable.</strong> Open the public <a href="${base}data/corpus.json">corpus.json</a> and <a href="${base}data/operations.json">operations.json</a> while the interface retries.</div></div></section>`;
  };
  document.head.appendChild(script);
})();
