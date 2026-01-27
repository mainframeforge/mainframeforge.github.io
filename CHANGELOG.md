# Changelog

All notable changes to this file will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Changed
- Refactored `home.js` handshake logic to use `async/await` pattern (#16).
- Refactored `home.css` to act as a clean global style base (#18).
### Removed
- Legacy `.system-card` DOM structure from the home page (#18).
- Security handshake/redirect sequence from `js/home.js` (#18).

## [0.1.2] - 2026-01-22
### Added
- Dynamic experience metric calculation (#10).
- SEO configuration (robots/sitemap) (#12).
- Metadata sanitization (#12).
### Changed
- Updated `links.html` metadata and short bio to reflect years of experience.
- Updated cursor position to reflect real spacing when typing.

## [0.1.1] - 2026-01-14
### Added
- Custom domain configuration (`CNAME`) for `mainframeforge.com`.
- Repository governance templates (Issue/PR).
- Security policy (`SECURITY.md`) for vulnerability reporting.
### Fixed
- Restored missing text lines in v0.1.0 release notes section.

## [0.1.0] - 2026-01-01
### Added
- Initial project scaffolding and directory structure.
- Infrastructure branding assets.
- Client-side system boot simulation (`home.js`).
- Developer profile aggregation page (`links.html`).
- Codebase adherence to Google Style Guides (HTML/CSS/JS).
- JSDoc type definitions for core logic.
