(() => {
  'use strict';

  const hex = buffer => [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('');

  async function sha256(bytes) {
    return hex(await crypto.subtle.digest('SHA-256', bytes));
  }

  async function fetchText(path) {
    const response = await fetch(`/bdpc/${path}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not fetch ${path}`);
    return response.text();
  }

  async function download(showStatus = () => {}) {
    try {
      showStatus('Preparing and verifying SQLite snapshot…');
      const manifestResponse = await fetch('/bdpc/data/manifest.json', { cache: 'no-store' });
      if (!manifestResponse.ok) throw new Error('Could not fetch the data manifest');
      const manifest = await manifestResponse.json();
      const parts = await Promise.all(manifest.database_transport.map(fetchText));
      const encoded = parts.join('').replace(/\s+/g, '');
      const encoder = new TextEncoder();
      const transportHash = await sha256(encoder.encode(encoded));
      if (transportHash !== manifest.database_transport_sha256) {
        throw new Error('Transport checksum mismatch');
      }
      const decoded = atob(encoded);
      const bytes = new Uint8Array(decoded.length);
      for (let index = 0; index < decoded.length; index += 1) bytes[index] = decoded.charCodeAt(index);
      const databaseHash = await sha256(bytes);
      if (databaseHash !== manifest.database_sha256) {
        throw new Error('Database checksum mismatch');
      }
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.sqlite3' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = manifest.database_download_name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showStatus('Verified SQLite snapshot downloaded.');
    } catch (error) {
      showStatus(`SQLite download failed verification: ${error.message}`);
    }
  }

  window.BDPC_SQLITE_DOWNLOAD = download;
})();
