---
name: web-asset-finder
description: Find and integrate web-sourced images, audio, fonts, and game assets when a project needs external media. Verify the exact asset license and record its provenance; use for asset sourcing, not for creating original artwork.
---

# Web Asset Finder

Find an asset that fits the project's visual or audio needs, then add it with enough source and license information for future contributors to identify it.

## Workflow

1. Clarify the asset's role, style, palette, dimensions, file format, animation needs, and intended project folder from the request and existing project.
2. Search for candidate assets using descriptive terms. Prefer the creator's own catalog and the individual asset page over search result thumbnails or third-party re-uploads. Useful starting points include [Kenney](https://kenney.nl/assets), [OpenGameArt](https://opengameart.org/), [Freesound](https://freesound.org/), [Google Fonts](https://fonts.google.com/), and [Openverse](https://openverse.org/).
3. Open the original asset page. Verify the specific asset's license, creator, download format, and any attribution, modification, redistribution, or noncommercial conditions. Do not infer an asset's license from a search result, an aggregator, or a different item on the same site.
4. Compare candidates for visual fit, usable resolution, transparency, animation frames, file size, and license requirements. Prefer an asset that works in the project without avoidable conversion or cropping.
5. Download only when the user asks to add or test an asset. If the user asks only to find options, return the source links and license notes without adding files.
6. Put selected files in the existing asset folders, grouped by source when it helps, such as `assets/images/<source>/<pack>/`, `assets/audio/<source>/`, or `assets/fonts/<source>/`. Keep an original archive under `assets/sources/<source>/` when retaining the full pack is useful.
7. Add an entry to `assets/ASSET_CREDITS.md` with the asset name, creator, original page URL, exact license and license URL, required credit text, local file path, any edits, and the date added. Record provenance even when attribution is optional.
8. Integrate the local file using the project's existing loader and path conventions. For this Phaser project, asset URLs are rooted at the site's `index.html`; use `this.load.image`, `this.load.spritesheet`, or `this.load.audio` as appropriate.
9. Rebuild and open the game locally. Confirm the requested asset appears and that its file loads from the project's own asset folder.

If the license is unclear, conflicts with the intended public distribution, or cannot be verified on the original source page, do not add the asset; present the source and the unresolved detail instead.
