async function loadSections(){
  const host=document.getElementById('page-sections');
  try{
    const fragments=await Promise.all(window.BDPC_SECTION_FILES.map(async file=>{
      const response=await fetch(`sections/${file}`,{cache:'no-store'});
      if(!response.ok) throw new Error(`${file}: ${response.status}`);
      return response.text();
    }));
    host.innerHTML=fragments.join('\n');
    initializeMeetingTools();
  }catch(error){
    host.innerHTML=`<section><div class="alert"><strong>Unable to load the meeting brief.</strong><br>${String(error.message||error)}</div></section>`;
  }
}
function initializeMeetingTools(){
  const fields=[...document.querySelectorAll('[data-save]')];
  fields.forEach(el=>{
    const key='bdpc_meeting_'+el.dataset.save;
    const saved=localStorage.getItem(key);
    if(saved!==null) el.value=saved;
    el.addEventListener('input',()=>localStorage.setItem(key,el.value));
  });
  const search=document.getElementById('glossarySearch');
  const terms=[...document.querySelectorAll('.term')];
  search?.addEventListener('input',()=>{
    const q=search.value.trim().toLowerCase();
    terms.forEach(term=>term.hidden=Boolean(q)&&!term.textContent.toLowerCase().includes(q));
  });
}
function val(key){
  const el=document.querySelector(`[data-save="${key}"]`);
  return (el?.value||'').trim() || '[not confirmed]';
}
function summaryText(){
  return `BDPC × CAD Guardian — Meeting Recap\n\nProject / address: ${val('project')}\nPhase: ${val('phase')}\nDeadline / consequence: ${val('deadline')}\nExact deliverable: ${val('deliverable')}\nIncluded area / sheets: ${val('included')}\nExplicit exclusions: ${val('excluded')}\nSource package: ${val('source')}\nSoftware / version: ${val('software')}\nReviewer: ${val('reviewer')}\nAcceptance standard: ${val('acceptance')}\nIncluded review cycles: ${val('cycles')}\nPaid block / terms: ${val('commercial')}\nAccess transfer: ${val('access')}\nOpen questions / blockers: ${val('blockers')}\nAgreed next action: ${val('next')}\n\nProfessional boundary: CAD Guardian owns the agreed production execution. BDPC retains architectural decisions, licensed review, code authority, consultant direction, and final issue approval.`;
}
async function copySummary(){
  const text=summaryText();
  try{await navigator.clipboard.writeText(text);alert('Meeting recap copied.');}
  catch{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();alert('Meeting recap copied.');}
}
function clearCapture(){
  if(!confirm('Clear all locally saved meeting entries?')) return;
  document.querySelectorAll('[data-save]').forEach(el=>{localStorage.removeItem('bdpc_meeting_'+el.dataset.save);el.value='';});
}
window.copySummary=copySummary;
window.clearCapture=clearCapture;
window.addEventListener('DOMContentLoaded',loadSections);
