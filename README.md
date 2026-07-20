# BDPC × CAD Guardian Client Service OS

A public, client-safe, database-free workspace for BDPC Architects and CAD Guardian.

## Live workspace

GitHub Pages publishes the `gh-pages` branch at:

`https://tsmithcode.github.io/bdpc/`

## Operating model

- **GitHub is the published baseline.**
- **Browser edits are local only.** They persist through `localStorage` on the current device.
- **Export update** downloads a JSON snapshot.
- **Import update** loads an exported JSON snapshot into another browser.
- Approved changes should be committed to GitHub before they are treated as the shared client record.

## Public-data rule

This repository is public. Never commit:

- Client DWGs, PDFs, Revit files, scans, point clouds, photographs, or marked-up drawings
- Dropbox, Drive, SharePoint, or private download links
- Exact project addresses when not intentionally public
- Credentials, tokens, private correspondence, contracts, invoices, or private commercial details
- Source paths, machine names, or personally identifying client data

The workspace publishes status, decisions, sanitized standards, milestones, and conclusions only.

## Repository structure

```text
.
├── index.html
├── styles.css
├── app.js
├── data/
│   └── project-data.js
├── docs/
│   ├── CLIENT_DATA_POLICY.md
│   └── OPERATING_MODEL.md
├── automation/
│   ├── README.md
│   └── manifests/
│       └── task-template.json
├── .gitignore
├── .nojekyll
└── 404.html
```

## Updating the published baseline

1. Edit the sanitized public data in `data/project-data.js`.
2. Review all copy for client safety.
3. Test locally with a static server.
4. Commit to `main`.
5. Move or deploy `gh-pages` to the approved commit.
6. Verify the public URL before sending it to the client.

## Local preview

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.
