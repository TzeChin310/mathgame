---
name: kenney-asset-finder
description: Find, download, inspect, and integrate 2D, 3D, UI, audio, or font assets from Kenney's official asset catalog. Use when the user requests Kenney assets; use web-asset-finder for other sources.
---

# Kenney Asset Finder

Use Kenney's official asset pages to find a fitting pack and bring only the useful files into the game project.

## Workflow

1. Search [Kenney Assets](https://kenney.nl/assets) by category and tags such as `2D`, `platformer`, `UI`, `character`, `font`, or `audio`. Compare the pack preview with the project's existing art direction before choosing it.
2. Open the individual pack page and check its category, tags, preview, file count, and displayed license. Verify the license again in the downloaded archive's `License.txt`; do not assume every pack has the same terms.
3. Download from the official Kenney page. For a free pack, use the site's continue-without-donating option when shown; do not choose a paid bundle unless the user requests it.
4. Keep the original archive at `assets/sources/kenney/<pack-slug>.zip` when the project should retain the full pack. Inspect it in a temporary staging folder and select only the files needed by the game.
5. Copy selected files into `assets/images/kenney/<pack-slug>/`, `assets/audio/kenney/<pack-slug>/`, or `assets/fonts/kenney/`, keeping filenames recognizable and avoiding unused duplicate copies.
6. Record the pack page, Kenney as creator, the exact license and license URL, the archive's `License.txt`, selected local files, and any changes in `assets/ASSET_CREDITS.md`. Kenney pages commonly identify packs as CC0, but verify the selected pack's page and archive each time; keep the credit record even when credit is optional.
7. Inspect image dimensions, transparency, and animation frames before wiring files into Phaser. Load local assets from the site's `index.html` root, use the matching Phaser loader, and update the scene to use the asset rather than leaving an unused download in the project.
8. Run the project's build and verify the game shows the selected asset from its local path.

If Kenney's official page or the archive does not provide enough license information, stop before integrating the pack and report what is missing.
