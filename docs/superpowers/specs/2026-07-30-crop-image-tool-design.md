# Image Crop Tool — Design Spec

**Goal:** a single static HTML file, opened directly in a browser (no server, no build step), that lets the user crop any source photo down to an exact 1400×690 pixel JPG before it goes into `src/images/` for the `/add-portfolio` workflow.

**Architecture:** One self-contained file — `tools/crop-image.html` — with inline `<style>` and `<script>`, no external dependencies, no bundler involvement (it's not part of the React app or its webpack build; it's a standalone utility). The whole thing runs client-side via the Canvas API: load the source image into an `<img>`/off-screen bitmap, let the user zoom/pan it behind a fixed 1400:690-ratio crop frame drawn with CSS, then on "Download" render the currently-visible crop region into an offscreen `<canvas>` sized exactly 1400×690 and export it as a JPG via `canvas.toBlob`/an `<a download>` link.

**Tech Stack:** Plain HTML/CSS/vanilla JS. No React, no npm packages, no build tooling — this deliberately stays outside the project's webpack/Babel/Jest pipeline since it's a standalone local tool, not shipped application code.

## Scope

One deliverable: `tools/crop-image.html`. Nothing else in the repo changes (the README's existing 1400×690 recommendation was already correct, confirmed with the user — no doc update needed).

## User flow

1. Open `tools/crop-image.html` directly in a browser (double-click the file, or `open tools/crop-image.html`).
2. Load a source image either by clicking a file-picker button or dragging an image file onto the page.
3. The image appears behind a fixed-size crop frame whose aspect ratio is locked to 1400:690 (displayed at a manageable on-screen size, e.g. scaled to fit within ~700×345 CSS pixels for usability — the frame's *aspect ratio* is fixed, not its on-screen pixel size).
4. The user zooms the image in/out (mouse wheel over the canvas, and a `<input type="range">` slider as a non-scroll-wheel alternative) and pans it by click-dragging, positioning whatever part of the photo they want inside the frame.
5. Clicking "Download" renders exactly what's inside the frame into a 1400×690 output canvas and triggers a browser download of a `.jpg` file (filename: `cropped.jpg` — the user renames/moves it as part of the `/add-portfolio` flow anyway, which already handles renaming to the `<year>-<slug>` convention).
6. The user manually moves the downloaded file into `src/images/` (a plain web page cannot write to an arbitrary filesystem path — this is a browser security boundary, not something this tool can work around; if the user's browser is configured to prompt for a save location on every download, they can navigate straight to `src/images/` in that dialog instead of doing a separate move step).

## Core interaction model (zoom + pan behind a fixed frame)

This is the standard "avatar cropper" pattern (same mental model as Twitter/GitHub profile-photo croppers):

- The crop **frame** is fixed — it never moves or resizes. It's a `position: absolute` box with a fixed CSS aspect-ratio (`aspect-ratio: 1400 / 690`), rendered with a visible border/dimmed overlay outside it so the user can see what's inside vs. outside the crop.
- The **image** is the thing that moves: it's drawn onto a `<canvas>` (or positioned as an `<img>`) that sits at a CSS scale/translate transform. Zooming changes the transform's scale; panning (drag) changes the transform's translate offset. The frame stays put; the image slides and scales underneath/behind it, clipped by the frame's `overflow: hidden`.
- **Minimum zoom** is clamped so the image can never be scaled smaller than "fills the entire frame" (prevents empty/transparent gaps appearing inside the crop area) — computed as `max(frameWidthPx / imageNaturalWidth, frameHeightPx / imageNaturalHeight)`.
- **Panning bounds**: the translate offset is clamped so the image can never be dragged to reveal empty space inside the frame (the image's scaled edges can never move inward past the frame's edges).

## Output rendering

On "Download": create an offscreen `<canvas width="1400" height="690">`, and `drawImage()` the source image onto it using the same scale/translate math the on-screen preview uses (translated from "preview CSS pixels" to "1400×690 output pixels" by a ratio of `outputWidth / previewFrameWidthPx`). This guarantees the exported file is pixel-exact 1400×690 regardless of what on-screen size the frame was displayed at. Export via `canvas.toBlob(callback, 'image/jpeg', 0.9)` (quality 0.9 — visually lossless enough for a portfolio thumbnail, keeps file size down; the `/add-portfolio` skill's own `image-optimize` compression step handles final size optimization anyway, so this tool doesn't need to be aggressive about compression) and trigger the download via a temporary `<a download="cropped.jpg">` click on an object URL.

## Error handling

- **Non-image file dropped/selected**: check `file.type.startsWith('image/')`; if not, show an inline error message and don't attempt to load it.
- **Image smaller than 1400×690 in its original resolution**: still works — the minimum-zoom clamp described above means the image will simply be upscaled to fill the frame at 100% zoom (unusual but not an error; browsers handle this fine, output just won't be sharper than the source). No special-case handling needed beyond the existing zoom-clamp math.
- **No image loaded yet and user clicks Download**: disable the Download button until an image has been successfully loaded.

## Testing / verification approach

No automated test suite for this (it's a standalone HTML tool outside the project's Jest/webpack pipeline, with no test runner wired to plain HTML files). Verification is manual: open the file in a browser, load a real test image, confirm zoom (wheel + slider) and pan both work and stay clamped within bounds, download the result, and open the downloaded file to confirm it's exactly 1400×690 pixels (e.g. via `sips -g pixelWidth -g pixelHeight <file>` on macOS, or any image viewer's info panel).
