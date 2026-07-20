# Automation Lane

Automation supports delivery; it does not replace BDPC architectural judgment or CAD Guardian review.

## Required controls

- Run against copies or read-only inputs.
- Never overwrite or rename client source files.
- Produce both machine-readable and human-readable outputs.
- Record exceptions and assumptions.
- End at a named human review gate.
- Publish only sanitized conclusions to the public workspace.

## Highest-priority operations

1. Source-package inventory
2. DWG preflight
3. Block catalog extraction
4. Paper-space standards extraction
5. LiDAR intake reporting
6. PDF/DWG reconciliation
7. Geometry and dimension QA
8. Publishing and dependency packaging

Use `manifests/task-template.json` as the execution contract for ChatGPT, Codex, AutoLISP, C#, Python, or other automation.
