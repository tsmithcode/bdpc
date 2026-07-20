async function loadSections(){
  const host=document.getElementById('page-sections');
  try{
    const fragments=await Promise.all(window.BDPC_SECTION_FILES.map(async file=>{
      const response=await fetch(`sections/${file}`,{cache:'no-store'});
      if(!response.ok) throw new Error(`${file}: ${response.status}`);
      return response.text();
    }));
    host.innerHTML=fragments.join('\n');
  }catch(error){
    host.innerHTML=`<section><div class="alert"><strong>Unable to load the project status.</strong><br>${String(error.message||error)}</div></section>`;
  }
}
function summaryText(){
  return `BDPC × CAD Guardian — Project Status\n\nUpdated: July 20, 2026\nProject: Grant Park residential addition / renovation; exact address to be confirmed from the uploaded project set.\nCurrent status: Awaiting completion of the shared Dropbox upload, including the remaining LiDAR scans.\nCurrent authorization: Confirm access and openability, audit the source package, identify gaps, and return a bounded effort estimate. CAD production has not begun.\nRequested outcome: Transfer the existing residence, proposed rear addition, outdoor deck, and related site / floor-plan information into the three CAD sheets shown by Brian. Exact sheet names are to be confirmed from the source package.\nExpected source package: preferred legacy DWG / block and dimension reference; current BDPC paper-space and title-block example; current project DWG/PDF/sketch/redlines; approximately four to five LiDAR scans; City of Atlanta floor plate; supporting photographs and notes.\nDrafting alignment: dimension to one-half-inch precision; use a 3.5-inch framed-wall base convention unless source evidence or BDPC direction requires another assembly; reuse source door/window blocks and sizes; use the current BDPC title block and paper-space format; do not invent geometry or concealed conditions.\nNext action: After the upload completes, Thomas will confirm the package opens successfully, inventory and audit the files, send focused questions and assumptions, and provide an effort estimate before written production authorization.\n\nProfessional boundary: CAD Guardian owns the agreed production execution after authorization. BDPC retains architectural decisions, licensed review, code authority, consultant direction, and final issue approval.`;
}
async function copyStatus(){
  const text=summaryText();
  try{await navigator.clipboard.writeText(text);alert('Project status copied.');}
  catch{const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();alert('Project status copied.');}
}
window.copyStatus=copyStatus;
window.addEventListener('DOMContentLoaded',loadSections);