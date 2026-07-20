(() => {
  'use strict';
  const subject = encodeURIComponent('Dunn Residence — production authorization');
  const body = encodeURIComponent(`Thomas,

BDPC authorizes CAD Guardian to begin the Dunn Residence three-sheet CAD pilot under the published $3,200 fixed-fee scope.

Confirmed deliverables:
1. Existing floor plan
2. Proposed floor plan
3. Site and area plan

Review allowance: one consolidated BDPC redline cycle.

Please confirm the production start date and any final dependency request.

Best,
Brian`);
  function authorize(){ window.location.href=`mailto:tsmithcad@gmail.com?subject=${subject}&body=${body}`; }
  document.addEventListener('DOMContentLoaded',()=>{
    document.getElementById('authorize-top')?.addEventListener('click',authorize);
    document.getElementById('authorize-bottom')?.addEventListener('click',authorize);
  });
})();