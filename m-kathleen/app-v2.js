(() => {
  const app=document.getElementById('app');
  app.innerHTML=window.__mkMarkup||'';
  const photo='data:image/webp;base64,'+(window.__mkPhoto||'');
  document.querySelectorAll('[data-founder-photo]').forEach(img=>{img.src=photo;img.classList.remove('photo-loading')});
  const menuButton=document.querySelector('.menu-button');
  const nav=document.querySelector('.nav-links');
  menuButton?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    const s=menuButton.querySelector('span'); if(s)s.textContent=open?'✕':'☰';
  });
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    nav.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false');
    const s=menuButton?.querySelector('span'); if(s)s.textContent='☰';
  }));
  const year=document.getElementById('year'); if(year)year.textContent=new Date().getFullYear();
  document.getElementById('share-site')?.addEventListener('click',async()=>{
    const data={title:'M. Kathleen, LLC',text:'Experienced, founder-led payroll operations support from Melodie Craig, CPP.',url:'https://tsmithcode.github.io/bdpc/m-kathleen/'};
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(data.url);const b=document.getElementById('share-site');const o=b.textContent;b.textContent='Link copied';setTimeout(()=>b.textContent=o,1600)}}catch(e){if(e?.name!=='AbortError')location.href='mailto:?subject='+encodeURIComponent(data.title)+'&body='+encodeURIComponent(data.text+'\n\n'+data.url)}
  });
  document.documentElement.classList.add('ready');
})();
