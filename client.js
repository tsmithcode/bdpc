(() => {
  'use strict';
  const subject = encodeURIComponent('Dunn Residence — production authorization');
  const body = encodeURIComponent(`Thomas,\n\nBDPC authorizes CAD Guardian to begin the Dunn Residence three-sheet CAD pilot under the published $3,200 fixed-fee scope.\n\nConfirmed deliverables:\n1. Existing floor plan\n2. Proposed floor plan\n3. Site and area plan\n\nReview allowance: one consolidated BDPC redline cycle.\n\nPlease confirm the production start date and any final dependency request.\n\nBest,\nBrian`);
  function authorize(){window.location.href=`mailto:thomas@tsmithcode.ai?subject=${subject}&body=${body}`;}
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('authorize-top')?.addEventListener('click',authorize);document.getElementById('authorize-bottom')?.addEventListener('click',authorize);});
})();