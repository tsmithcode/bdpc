# Codex / ChatGPT Handoff — Dunn Residence

## Objective
Prepare the licensed CAD production session without modifying client originals.

## Source snapshot
- Files: 908
- Total size: 8.20 GB
- Required source groups present: 2 of 2
- Duplicate groups: 2
- Scan errors: 0

## Missing required groups
- None detected by filename and extension rules.

## Highest-priority review
1. Read `readiness.json`.
2. Review `inventory.csv` rows with `version_ambiguity`, `temporary_or_backup_file`, or `path_length_over_240`.
3. Resolve exact duplicates before establishing the controlled working set.
4. Treat edge-signature matches as probable only.
5. Confirm CTB/STB, SHX/TTF/OTF, xref, image, and point-cloud dependencies.
6. Keep confidential source outside the public `tsmithcode/bdpc` repository.
7. Wait for compatible CAD runtime before geometry, plotting, xref, or sheet conclusions.

## Agent permissions
Allowed: summarize inventory, draft a source-selection matrix, draft BDPC questions, generate read-only scripts, create QA checklists.
Forbidden: modify originals, infer concealed conditions, publish client files or exact addresses, approve geometry or sheets without human CAD review.
