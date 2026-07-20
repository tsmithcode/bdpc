(() => {
'use strict';
const parts=['01','02','03','04','05','06'].map(n=>`data/sqlite/part-${n}.b64`);
const expected='e9a651522b4655f9df1bd673e9b0bb2453c52175bdc3beb588657819fc344bd0';
function notice(message){const t=document.getElementById('toast');if(!t)return;t.textContent=message;t.classList.add('is-visible');clearTimeout(notice.timer);notice.timer=setTimeout(()=>t.classList.remove('is-visible'),2400);}
async function sha256(bytes){const digest=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function download(){
  notice('Preparing verified SQLite snapshot…');
  const responses=await Promise.all(parts.map(p=>fetch(p,{cache:'no-store'})));
  if(responses.some(r=>!r.ok))throw new Error('part');
  const base64=(await Promise.all(responses.map(r=>r.text()))).join('').replace(/\s/g,'');
  const raw=atob(base64);const bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  if(crypto.subtle && await sha256(bytes)!==expected)throw new Error('checksum');
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.sqlite3'}));
  const a=document.createElement('a');a.href=url;a.download='bdpc_client_os.sqlite';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);notice('Verified SQLite snapshot downloaded.');
}
document.addEventListener('click',e=>{const target=e.target.closest?.('[data-sqlite-download]');if(!target)return;e.preventDefault();e.stopImmediatePropagation();download().catch(()=>notice('SQLite download failed. JSON and schema remain available.'));},true);
})();