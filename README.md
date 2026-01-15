# Peedeefy - A complete PDF processing suite for the browser

Peedeefy is a browser-based PDF utility suite focused on privacy, simplicity, and correctness.

All PDF processing is performed client-side. Files are never uploaded to a server.

The project is intentionally designed to start as a fully static web application (hosted on GitHub Pages) and evolve into a full SaaAS platform without architectural rewrites.

---

## Project Goals

* Provide reliable, high-quality PDF tools in the browser
* Preserve user privacy by default
* Avoid unnecessary complexity
* Build a foundation that scales into paid offerings

---

## Core Principles

* **Client-side first**: No backend required for MVP
* **Privacy-first**: Files never leave the device
* **Deterministic execution**: Clear scope, no hidden behavior
* **Incremental growth**: MVP → Free → Paid → Enterprise

---

## Feature Scope

The detailed feature breakdown is maintained in:

* `plans.md` — Product plans, MVP scope, free vs paid features

At a high level, Peedeefy provides:

* PDF merge, split, reorder, delete
* PDF compression
* PDF ↔ image conversion
* Page preview and download

---

## Technology Stack

* **Frontend**: Vite + React
* **Language**: TypeScript
* **Styling**: Utility-first CSS (TBD)
* **PDF Processing**: Client-side libraries only
* **Hosting**: GitHub Pages

---

## Repository Structure

```
/
├─ README.md        # Project overview
├─ plans.md         # Product and pricing plans
└─ src/             # Application source (Vite + React)
```

## Development Status

* Product planning: complete
* Architecture: defined
* Implementation: not started

---

## Non-Goals

* No user accounts in MVP
* No cloud storage in MVP
* No collaboration features
* No opaque processing

---

## License

License will be defined before public release.

---

## Final Note

Peedeefy prioritizes correctness, privacy, and clarity over speed of feature delivery.
