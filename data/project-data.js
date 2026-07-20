window.BDPC_DEFAULT_DATA = {
  meta: {
    schemaVersion: 1,
    workspaceName: "BDPC × CAD Guardian Client Service OS",
    projectCode: "BDPC-GP-001",
    projectName: "Grant Park Residential CAD Transfer",
    updatedAt: "2026-07-20T16:30:00-04:00",
    publishedStatus: "Source review in progress",
    currentGate: "Source package review",
    gateNote: "The conceptual package and 8.8 GB source archive were received. CAD Guardian is validating completeness, openability, standards, scan usability, and estimating effort.",
    currentAuthorization: "Review source package and prepare estimate",
    productionStatus: "Not started",
    clientAction: "No action required unless CAD Guardian sends a focused question",
    confidentiality: "Public status and conclusions only. Confidential source files remain in approved private channels."
  },
  tabs: [
    { id: "overview", label: "Overview", short: "Now" },
    { id: "milestones", label: "Milestones", short: "Progress" },
    { id: "files", label: "Files", short: "Source" },
    { id: "standards", label: "Standards", short: "Rules" },
    { id: "automation", label: "Automation", short: "Leverage" },
    { id: "delivery", label: "Delivery + QA", short: "Output" },
    { id: "commercial", label: "Commercial", short: "Terms" },
    { id: "updates", label: "Updates", short: "Log" }
  ],
  overview: {
    now: [
      "Conceptual package received and reviewed at a high level.",
      "8.8 GB source archive received and extracted.",
      "Detailed CAD, PDF, LiDAR, dependency, and standards review is in progress."
    ],
    next: [
      "Complete the file inventory and openability check.",
      "Extract reusable model-space blocks and paper-space standards.",
      "Assess LiDAR scale, registration, coverage, and floor-plate alignment.",
      "Return focused questions, assumptions, risks, and a bounded effort estimate."
    ],
    waitingOn: [
      "No client action is currently required.",
      "CAD Guardian will request only consolidated clarification that materially affects scope, accuracy, schedule, or fee."
    ],
    facts: [
      { label: "Current assignment", value: "Three-sheet residential CAD transfer" },
      { label: "Current phase", value: "Source review + estimate preparation" },
      { label: "Source package", value: "Conceptual PDF + 8.8 GB archive received" },
      { label: "Primary tools", value: "AutoCAD, ReCap / point-cloud review, PDF review" },
      { label: "BDPC review authority", value: "Brian Dillman / BDPC Architects" },
      { label: "Published workspace", value: "Client-safe status and decisions only" }
    ]
  },
  milestones: [
    { id: "m01", group: "Relationship", title: "Discovery and capability alignment", owner: "BDPC + CAD Guardian", status: "Complete", date: "2026-07-20", evidence: "Alignment call and screen-share completed", note: "Pilot scope and review-first workflow established." },
    { id: "m02", group: "Relationship", title: "Shared client workspace established", owner: "CAD Guardian", status: "Complete", date: "2026-07-20", evidence: "Public client-safe project workspace", note: "GitHub Pages is the published baseline." },
    { id: "m03", group: "Pilot", title: "Source package received", owner: "BDPC", status: "Complete", date: "2026-07-20", evidence: "Conceptual package and 8.8 GB source archive", note: "Receipt confirmed; source content remains private." },
    { id: "m04", group: "Pilot", title: "Archive extracted and inventoried", owner: "CAD Guardian", status: "In review", date: "", evidence: "File inventory and size/type report", note: "Extraction confirmed; inventory is being normalized." },
    { id: "m05", group: "Pilot", title: "All expected files opened successfully", owner: "CAD Guardian", status: "In review", date: "", evidence: "Openability and dependency report", note: "DWG, PDF, LiDAR, fonts, plot styles, and xrefs are being checked." },
    { id: "m06", group: "Pilot", title: "Reusable model-space blocks retrieved", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Approved / review / reject block catalog", note: "Includes intact-versus-exploded integrity checks." },
    { id: "m07", group: "Pilot", title: "Paper-space standards retrieved", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Title block, layouts, styles, page setups, and plot standards", note: "Current BDPC presentation standard will govern output." },
    { id: "m08", group: "Pilot", title: "LiDAR package evaluated", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Scan intake and usability report", note: "Scale, registration, bounds, density, and coverage will be documented." },
    { id: "m09", group: "Pilot", title: "City floor plate aligned and checked", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Scale/orientation comparison", note: "Used as an independent anchor where reliable." },
    { id: "m10", group: "Pilot", title: "Source conflicts and questions documented", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Consolidated issue and assumption register", note: "Only material questions will be sent to Brian." },
    { id: "m11", group: "Commercial", title: "Effort estimate issued", owner: "CAD Guardian", status: "Awaiting estimate", date: "", evidence: "Bounded proposal with assumptions and exclusions", note: "Estimate follows verified source review." },
    { id: "m12", group: "Commercial", title: "Production authorization received", owner: "BDPC", status: "Not started", date: "", evidence: "Written approval", note: "Scope, fee, schedule, deliverables, and review cycle locked." },
    { id: "m13", group: "Delivery", title: "Three-sheet first draft completed", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Review PDF and agreed native files", note: "Produced to approved BDPC standards." },
    { id: "m14", group: "Delivery", title: "CAD Guardian QA completed", owner: "CAD Guardian", status: "Not started", date: "", evidence: "QA checklist and issue resolution", note: "Geometry, dimensions, standards, dependencies, and plotting checked." },
    { id: "m15", group: "Delivery", title: "BDPC review completed", owner: "BDPC", status: "Not started", date: "", evidence: "Consolidated redlines", note: "One proposed consolidated review cycle." },
    { id: "m16", group: "Delivery", title: "Consolidated revisions incorporated", owner: "CAD Guardian", status: "Not started", date: "", evidence: "Corrected issue package", note: "Out-of-scope design changes are separately authorized." },
    { id: "m17", group: "Delivery", title: "Final package accepted", owner: "BDPC", status: "Not started", date: "", evidence: "Acceptance confirmation", note: "Native files, PDFs, dependencies, and manifests delivered." },
    { id: "m18", group: "Relationship", title: "Reusable assets archived", owner: "CAD Guardian", status: "Not started", date: "", evidence: "BDPC residential standards library", note: "Client-approved reusable content only." },
    { id: "m19", group: "Relationship", title: "Next project or support model identified", owner: "BDPC + CAD Guardian", status: "Future", date: "", evidence: "Follow-on scope or capacity plan", note: "Triggered only after the pilot establishes fit and value." }
  ],
  fileGroups: [
    {
      id: "standards-source",
      title: "Standards references",
      note: "Sources used to recover BDPC drafting logic and current presentation standards.",
      items: [
        { id: "f01", name: "Preferred legacy model-space DWG", expected: true, received: "Yes", opened: "In review", reviewed: "Not yet", usable: "TBD", action: "Extract units, blocks, wall logic, dimensions, and reusable content." },
        { id: "f02", name: "Current BDPC project-set example", expected: true, received: "Yes", opened: "In review", reviewed: "Not yet", usable: "TBD", action: "Extract paper-space, title block, fonts, dimensions, lineweights, and plotting." },
        { id: "f03", name: "Plot styles, fonts, xrefs, and page setups", expected: true, received: "To verify", opened: "Not yet", reviewed: "Not yet", usable: "TBD", action: "Identify missing dependencies before production." }
      ]
    },
    {
      id: "project-source",
      title: "Current project sources",
      note: "Sanitized status only; source materials remain in the approved private transfer location.",
      items: [
        { id: "f04", name: "Conceptual project PDF", expected: true, received: "Yes", opened: "Yes", reviewed: "High-level", usable: "Reference", action: "Reconcile scope, three-sheet intent, addition/deck geometry, and notes." },
        { id: "f05", name: "8.8 GB source archive", expected: true, received: "Yes", opened: "Extracted", reviewed: "In review", usable: "TBD", action: "Complete inventory, dependency, and openability checks." },
        { id: "f06", name: "Current project CAD files", expected: true, received: "Yes", opened: "In review", reviewed: "Not yet", usable: "TBD", action: "Confirm units, scale, geometry, layers, layouts, and source relationships." },
        { id: "f07", name: "LiDAR / point-cloud folders", expected: true, received: "Yes", opened: "In review", reviewed: "Not yet", usable: "TBD", action: "Confirm formats, registration, scale, bounds, density, and coverage." },
        { id: "f08", name: "City floor-plate reference", expected: true, received: "Yes", opened: "Yes", reviewed: "High-level", usable: "Reference", action: "Compare footprint, orientation, and dimensions against scan and CAD sources." },
        { id: "f09", name: "Supporting photos, sketches, and notes", expected: false, received: "To verify", opened: "Not yet", reviewed: "Not yet", usable: "TBD", action: "Map each item to a floor, room, or condition; flag gaps rather than infer." }
      ]
    },
    {
      id: "review-output",
      title: "Review outputs",
      note: "Client-facing conclusions produced by CAD Guardian before the estimate.",
      items: [
        { id: "f10", name: "File inventory", expected: true, received: "N/A", opened: "N/A", reviewed: "In progress", usable: "TBD", action: "Publish count, type, size, and review-state summary." },
        { id: "f11", name: "Openability and dependency report", expected: true, received: "N/A", opened: "N/A", reviewed: "In progress", usable: "TBD", action: "List missing fonts, xrefs, plot styles, proxies, or unsupported formats." },
        { id: "f12", name: "Source conflict and assumption register", expected: true, received: "N/A", opened: "N/A", reviewed: "Not started", usable: "TBD", action: "Consolidate only material questions affecting accuracy, scope, schedule, or fee." },
        { id: "f13", name: "Effort-estimation basis", expected: true, received: "N/A", opened: "N/A", reviewed: "Not started", usable: "TBD", action: "Quantify sheet effort, cleanup burden, scan usability, QA, and review allowance." }
      ]
    }
  ],
  standards: {
    confirmedRules: [
      "Dimension residential geometry to one-half-inch precision unless BDPC directs otherwise.",
      "Model accurately; do not use display precision to conceal avoidable geometric error.",
      "Use 3.5 inches as the base convention for typical 2×4 framed walls.",
      "Increase wall thickness only when source evidence or BDPC direction supports another assembly.",
      "Reuse established door, window, fixture, appliance, and symbol blocks when appropriate.",
      "Use the preferred legacy drawing for drafting logic and the current BDPC set for paper-space presentation.",
      "Treat LiDAR as measured evidence, not automatic truth; compare independent sources before resolving conflict.",
      "Do not infer concealed conditions, independent design decisions, or professional conclusions outside the agreed production scope."
    ],
    lanes: [
      {
        id: "model-space",
        title: "Model-space extraction",
        items: [
          { id: "s01", title: "Drawing units and insertion scale", status: "In review" },
          { id: "s02", title: "Typical wall conventions", status: "In review" },
          { id: "s03", title: "Door and window blocks", status: "Not started" },
          { id: "s04", title: "Fixture and appliance blocks", status: "Not started" },
          { id: "s05", title: "Stair, room, and annotation symbols", status: "Not started" },
          { id: "s06", title: "Dimension logic and self-checking patterns", status: "Not started" },
          { id: "s07", title: "Exploded-versus-intact block integrity", status: "Not started" },
          { id: "s08", title: "Approved / review / reject block catalog", status: "Not started" }
        ]
      },
      {
        id: "paper-space",
        title: "Paper-space extraction",
        items: [
          { id: "s09", title: "BDPC title block and attributes", status: "In review" },
          { id: "s10", title: "Sheet size and page setup", status: "Not started" },
          { id: "s11", title: "Viewport scales and locking", status: "Not started" },
          { id: "s12", title: "CTB / STB and lineweights", status: "Not started" },
          { id: "s13", title: "Text and dimension styles", status: "Not started" },
          { id: "s14", title: "Existing / demolition / new graphics", status: "Not started" },
          { id: "s15", title: "Sheet numbering and revision conventions", status: "Not started" },
          { id: "s16", title: "Publishing and dependency packaging", status: "Not started" }
        ]
      }
    ]
  },
  automation: {
    principles: [
      "Production remains the priority; automation must not delay the three-sheet pilot.",
      "Automated operations run on copies or read-only inputs and never overwrite client sources.",
      "Every autonomous task produces a report, preserves traceability, and ends at a defined human review gate.",
      "Experimental methods must be measurable, reversible, and clearly separated from issued client work."
    ],
    queue: [
      { id: "a01", tier: "Tier 1", name: "Source-package inventory", roi: "Immediate", status: "In progress", output: "File manifest by type, size, date, and review state", humanGate: "Confirm expected package" },
      { id: "a02", tier: "Tier 1", name: "DWG preflight", roi: "Immediate", status: "Planned", output: "Units, extents, layers, xrefs, fonts, plot styles, proxy objects, and layout report", humanGate: "Review critical issues" },
      { id: "a03", tier: "Tier 1", name: "Block catalog extractor", roi: "High", status: "Planned", output: "Block names, dimensions, layers, attributes, counts, integrity, and reuse classification", humanGate: "Approve reusable blocks" },
      { id: "a04", tier: "Tier 1", name: "Paper-space standards extractor", roi: "High", status: "Planned", output: "Layouts, title blocks, page setups, viewport scales, styles, and plot standard report", humanGate: "Confirm BDPC standard" },
      { id: "a05", tier: "Tier 1", name: "LiDAR intake report", roi: "High", status: "Planned", output: "Formats, file count, scale, bounds, registration, density, and coverage observations", humanGate: "Confirm usable scan set" },
      { id: "a06", tier: "Tier 1", name: "PDF / DWG sheet reconciler", roi: "Medium", status: "Backlog", output: "Sheet-name, revision, and content comparison", humanGate: "Resolve mismatches" },
      { id: "a07", tier: "Tier 2", name: "Wall-thickness QA", roi: "High", status: "Backlog", output: "Walls outside approved dimensional conventions", humanGate: "Approve exceptions" },
      { id: "a08", tier: "Tier 2", name: "Geometry cleanup report", roi: "High", status: "Backlog", output: "Duplicates, gaps, open polylines, overlaps, and nonorthogonal conditions", humanGate: "Approve corrections" },
      { id: "a09", tier: "Tier 2", name: "Dimension-integrity audit", roi: "High", status: "Backlog", output: "Overrides, nonassociative dimensions, and geometric mismatches", humanGate: "Resolve discrepancies" },
      { id: "a10", tier: "Tier 2", name: "Door and window inventory", roi: "Medium", status: "Backlog", output: "Opening schedule and block usage", humanGate: "Confirm special conditions" },
      { id: "a11", tier: "Tier 2", name: "Layer-standard validator", roi: "Medium", status: "Backlog", output: "Nonstandard or misplaced entities", humanGate: "Approve remediation" },
      { id: "a12", tier: "Tier 2", name: "Sheet publisher + package builder", roi: "High", status: "Backlog", output: "Consistent PDFs, native files, naming, and dependency package", humanGate: "Final issue approval" },
      { id: "a13", tier: "Frontier", name: "Scan-versus-drawing variance map", roi: "Experimental", status: "Future", output: "Visual map of measured-source disagreement", humanGate: "BDPC interpretation" },
      { id: "a14", tier: "Frontier", name: "Point-cloud-assisted wall suggestions", roi: "Experimental", status: "Future", output: "Candidate wall centerlines and confidence flags", humanGate: "Human drafting decision" },
      { id: "a15", tier: "Frontier", name: "BDPC standards recommendation engine", roi: "Long-term", status: "Future", output: "Approved block and style suggestions from prior completed work", humanGate: "BDPC standards approval" }
    ]
  },
  delivery: {
    scope: [
      "Transfer the three identified residential sheets into CAD after review and written authorization.",
      "Represent the existing residence and proposed rear addition / deck information supplied by BDPC.",
      "Use the approved legacy drafting logic and current BDPC paper-space standard.",
      "Return native CAD files, review PDFs, source/dependency manifest, and issue/assumption log."
    ],
    exclusions: [
      "Architect-of-record services, seal, stamp, or independent architectural design authority.",
      "Professional land surveying, scan certification, or legal as-built certification.",
      "Independent code, zoning, structural, civil, MEP, or fire-protection design.",
      "Inference of concealed conditions or geometry unsupported by the source package.",
      "Unlimited revisions or changes arising from later design decisions outside the approved scope."
    ],
    qaGates: [
      { title: "Source traceability", detail: "Important geometry and dimensions are traceable to a scan, drawing, floor plate, note, or BDPC direction." },
      { title: "Geometry integrity", detail: "No unexplained gaps, overlaps, duplicates, or artificial dimension corrections remain." },
      { title: "Standards compliance", detail: "Layers, blocks, dimensions, text, sheets, lineweights, and plotting follow the approved reference." },
      { title: "Portability", detail: "BDPC can open, plot, edit, and continue the package without missing dependencies." },
      { title: "Licensed review", detail: "BDPC retains architectural decisions, code authority, professional responsibility, and final issue approval." }
    ],
    clientTime: [
      "One consolidated clarification list after source review.",
      "One coordinated review PDF package rather than fragmented sheet requests.",
      "One consolidated redline cycle proposed for the pilot.",
      "One final acceptance request with complete files and a concise change summary."
    ]
  },
  commercial: {
    stage: "Awaiting source review and effort estimate",
    fields: [
      { id: "c01", label: "Source-access confirmation", value: "Included before estimate", status: "Confirmed" },
      { id: "c02", label: "Diagnostic requirement", value: "TBD after openability review", status: "TBD" },
      { id: "c03", label: "Three-sheet production fee", value: "—", status: "Awaiting estimate" },
      { id: "c04", label: "Deposit / authorization amount", value: "—", status: "TBD" },
      { id: "c05", label: "Target turnaround", value: "—", status: "TBD" },
      { id: "c06", label: "Included review cycles", value: "One proposed", status: "Proposed" },
      { id: "c07", label: "Additional revisions", value: "Separately approved", status: "Proposed" },
      { id: "c08", label: "Expedited delivery", value: "—", status: "TBD" },
      { id: "c09", label: "Invoice terms", value: "—", status: "TBD" },
      { id: "c10", label: "Follow-on production model", value: "Per-project or reserved capacity", status: "Future" },
      { id: "c11", label: "Automation / standards support", value: "Separate future option", status: "Future" }
    ],
    strategy: [
      { step: "1", title: "Complimentary access confirmation", detail: "Confirm receipt, extraction, openability, and whether a reliable estimate is possible. Deep analysis and repairs are not hidden inside free estimating." },
      { step: "2", title: "Paid source diagnostic when required", detail: "Use only when substantial scan, dependency, cleanup, or standards investigation is needed. Credit the diagnostic toward production when practical." },
      { step: "3", title: "Fixed-fee three-sheet pilot", detail: "Quote a defined outcome with verified inputs, explicit outputs, one consolidated review cycle, schedule, exclusions, and change control." },
      { step: "4", title: "Repeatable BDPC delivery model", detail: "After a successful pilot, offer per-sheet pricing, project blocks, reserved monthly capacity, standards maintenance, and drawing-QA automation." }
    ]
  },
  updates: [
    { id: "u01", date: "2026-07-20", author: "BDPC + CAD Guardian", title: "Production alignment completed", completed: "Brian demonstrated the project, preferred legacy CAD logic, current BDPC sheet standard, LiDAR workflow, and requested a three-sheet transfer estimate.", inProgress: "Source package transfer.", waitingOn: "Completion of file upload.", next: "Confirm receipt and begin source review.", decision: "Review-first authorization established." },
    { id: "u02", date: "2026-07-20", author: "CAD Guardian", title: "Source package received", completed: "Conceptual project PDF received and reviewed at a high level. The 8.8 GB source archive was received and extracted.", inProgress: "File inventory, openability, standards, CAD, PDF, LiDAR, and dependency review.", waitingOn: "No client action currently required.", next: "Return focused questions, assumptions, risks, and a bounded effort estimate.", decision: "Production remains gated pending review and written authorization." }
  ],
  statusOptions: ["Not started", "Awaiting input", "In review", "Blocked", "Ready", "Complete", "Not applicable", "Awaiting estimate", "Planned", "In progress", "Backlog", "Future", "TBD", "Confirmed", "Proposed"]
};
