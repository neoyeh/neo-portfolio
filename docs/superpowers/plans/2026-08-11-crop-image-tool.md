# Image Crop Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `tools/crop-image.html`, a single static HTML file (no server, no build step) that lets a user zoom/pan any source photo behind a fixed 1400:690 crop frame and download an exact 1400×690 pixel JPG for the `/add-portfolio` workflow.

**Architecture:** One self-contained file with inline `<style>` and `<script>`. Vanilla JS drives a state object (`naturalWidth`, `naturalHeight`, `scale`, `minScale`, `maxScale`, `translateX`, `translateY`); an `<img>` element is absolutely positioned/sized in pixels (no CSS `transform`, to avoid transform-composition ambiguity) to render the live crop preview; on download, the same position/size formulas are re-scaled to an offscreen `1400×690` `<canvas>` and exported via `canvas.toBlob`.

**Tech Stack:** Plain HTML/CSS/vanilla JS only. No React, no npm packages, no bundler — this file is never processed by webpack/Babel and is opened directly via `file://` or a double-click.

**Design reference:** `docs/superpowers/specs/2026-07-30-crop-image-tool-design.md`

## Global Constraints

- Single deliverable file: `tools/crop-image.html`. No other files in the repo change.
- No external dependencies, no CDN `<script>`/`<link>` tags, no build tooling of any kind.
- Output is always exactly `1400×690` pixels, JPEG, quality `0.9`.
- Downloaded filename format: `cropped-<unix-ms>.jpg` (e.g. `cropped-1737936421123.jpg`), so multiple crops in one session never collide.
- Crop frame aspect ratio is CSS-locked to `1400 / 690`; minimum zoom is the "cover" fit (`max(frameWidth/naturalWidth, frameHeight/naturalHeight)`); panning is clamped so the image can never reveal empty space inside the frame.
- After every successful export, render the exported blob into a separate, always-updated "result preview" `<img>` so a user on a browser where the automatic download doesn't fire (older Safari on `file://`) can right-click *that* element and "Save Image As" — the original zoom/pan preview shows the untransformed source image and must never be suggested as the fallback target.
- UI copy is Traditional Chinese, matching the rest of this project's UI (see `README.md`, `src/components/Portfolio/index.js`).
- This tool ships with **no automated test suite** (confirmed in the design spec) — do not add a test runner, `package.json` entry, or CI step for it. Each task below is still verified with a throwaway Playwright script (per the `webapp-testing` skill's `static_html_automation.py` pattern) run against the `file://` URL of the in-progress file; **that script is never committed** — write it to `/tmp` (or the session scratchpad), run it, then delete it. Only `tools/crop-image.html` is committed each task.
- Every commit in this repo must NOT include a `Co-Authored-By: Claude` trailer, in any form — this is a standing repo-wide rule, not optional.

### Shared test fixture (all tasks)

Every task's verification script needs a real image file on disk to feed to `<input type="file">` / drag-and-drop. Use this exact 1×1 pixel black PNG in every script (decode once at the top of the script):

```python
import base64
from pathlib import Path

FIXTURE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8A"
    "AQUBAScY42YAAAAASUVORK5CYII="
)


def write_fixture(path):
    Path(path).write_bytes(base64.b64decode(FIXTURE_PNG_B64))
```

Pixel content doesn't matter for any assertion below (dimensions come from the fixed `1400×690` output canvas, not the source), so the same 1×1 fixture is reused for every task.

---

## File Structure

Single file, built up cumulatively across four tasks:

- `tools/crop-image.html` — created in Task 1 (structure + CSS only), then extended in place by Task 2 (image loading), Task 3 (zoom/pan), Task 4 (export/download). Each task's step gives the **complete file content** to write — always replace the whole file, don't hand-patch fragments.

---

### Task 1: Static skeleton (structure + CSS, no interaction)

**Files:**
- Create: `tools/crop-image.html`

**Interfaces:**
- Produces: the DOM element IDs every later task depends on — `file-input`, `choose-file-btn`, `crop-frame`, `placeholder`, `preview-image`, `zoom-slider`, `download-btn`, `error-message`, `result-section`, `result-preview`. Task 2+ must not rename these.

- [ ] **Step 1: Write the verification script**

Save to `/tmp/verify-task1.py`:

```python
import base64
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML_PATH = Path(__file__).resolve().parents[1] / "develop/mywork/neo-portfolio/tools/crop-image.html"
# Resolve relative to the repo instead, so this works regardless of cwd:
HTML_PATH = Path("/Users/neoyeh/develop/mywork/neo-portfolio/tools/crop-image.html").resolve()


def main():
    assert HTML_PATH.exists(), f"missing {HTML_PATH}"
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(HTML_PATH.as_uri())

        # Structure present
        assert page.locator("#crop-frame").count() == 1
        assert page.locator("#placeholder").count() == 1
        assert page.locator("#preview-image").count() == 1
        assert page.locator("#file-input").count() == 1
        assert page.locator("#choose-file-btn").count() == 1
        assert page.locator("#zoom-slider").count() == 1
        assert page.locator("#download-btn").count() == 1
        assert page.locator("#error-message").count() == 1
        assert page.locator("#result-section").count() == 1
        assert page.locator("#result-preview").count() == 1

        # Initial disabled/hidden state
        assert page.locator("#download-btn").is_disabled()
        assert page.locator("#zoom-slider").is_disabled()
        assert page.locator("#preview-image").is_hidden()
        assert page.locator("#error-message").is_hidden()
        assert page.locator("#result-section").is_hidden()
        assert page.locator("#placeholder").is_visible()

        # Frame aspect ratio is locked to 1400:690
        box = page.locator("#crop-frame").bounding_box()
        ratio = box["width"] / box["height"]
        assert abs(ratio - (1400 / 690)) < 0.01, f"got ratio {ratio}"

        browser.close()
    print("TASK 1 OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `python3 /tmp/verify-task1.py`
Expected: `AssertionError` (or file-not-found) — `tools/crop-image.html` doesn't exist yet.

- [ ] **Step 3: Write the file**

Create `tools/crop-image.html` with exactly this content:

```html
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>圖片裁切工具</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
    max-width: 760px;
    margin: 40px auto;
    padding: 0 20px;
    color: #222;
  }
  h1 { font-size: 20px; }
  .crop-frame {
    position: relative;
    width: 100%;
    max-width: 700px;
    aspect-ratio: 1400 / 690;
    margin: 16px 0;
    overflow: hidden;
    border: 2px dashed #999;
    background: #f4f4f4;
    cursor: grab;
    touch-action: none;
  }
  .crop-frame.drag-over {
    border-color: #0a7;
    background: #eafaf3;
  }
  .crop-frame:active {
    cursor: grabbing;
  }
  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #777;
    padding: 20px;
    pointer-events: none;
  }
  .preview-image {
    position: absolute;
    top: 0;
    left: 0;
    max-width: none;
    user-select: none;
    -webkit-user-drag: none;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
  }
  .controls input[type="range"] {
    flex: 1;
  }
  .error-message {
    color: #c00;
    font-weight: 600;
  }
  #result-section img {
    max-width: 350px;
    width: 100%;
    border: 1px solid #ccc;
    margin-top: 8px;
  }
</style>
</head>
<body>
  <h1>圖片裁切工具(1400×690)</h1>
  <p>選擇或拖曳一張圖片,縮放、拖曳調整位置,裁切成 1400×690 的 JPG。</p>

  <input type="file" id="file-input" accept="image/*" hidden />
  <button id="choose-file-btn" type="button">選擇圖片</button>

  <p id="error-message" class="error-message" hidden></p>

  <div id="crop-frame" class="crop-frame">
    <div id="placeholder" class="placeholder">拖曳圖片到這裡,或點擊上方「選擇圖片」</div>
    <img id="preview-image" class="preview-image" alt="" hidden />
  </div>

  <div class="controls">
    <label for="zoom-slider">縮放</label>
    <input type="range" id="zoom-slider" min="1" max="1" step="0.01" value="1" disabled />
  </div>

  <button id="download-btn" type="button" disabled>下載裁切結果</button>

  <div id="result-section" hidden>
    <p>若沒有自動開始下載,請右鍵下方圖片另存新檔:</p>
    <img id="result-preview" alt="裁切結果預覽" />
  </div>

  <script>
    // Interaction logic added in later tasks.
  </script>
</body>
</html>
```

- [ ] **Step 4: Run the verification script to confirm it passes**

Run: `python3 /tmp/verify-task1.py`
Expected: `TASK 1 OK`

- [ ] **Step 5: Delete the verification script and commit**

```bash
rm /tmp/verify-task1.py
git add tools/crop-image.html
git commit -m "feat: add crop-image tool skeleton"
```

---

### Task 2: Image loading (file picker + drag-and-drop, with validation)

**Files:**
- Modify: `tools/crop-image.html`

**Interfaces:**
- Consumes: element IDs from Task 1 (`file-input`, `choose-file-btn`, `crop-frame`, `placeholder`, `preview-image`, `zoom-slider`, `download-btn`, `error-message`).
- Produces: `state` object (`naturalWidth`, `naturalHeight`, `scale`, `minScale`, `maxScale`, `translateX`, `translateY`), `getFrameSize()`, `render()`, `loadFile(file)` — Task 3 and Task 4 call these by name.

- [ ] **Step 1: Write the verification script**

Save to `/tmp/verify-task2.py`:

```python
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

FIXTURE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8A"
    "AQUBAScY42YAAAAASUVORK5CYII="
)
HTML_PATH = Path("/Users/neoyeh/develop/mywork/neo-portfolio/tools/crop-image.html").resolve()


def write_fixture(path):
    Path(path).write_bytes(base64.b64decode(FIXTURE_PNG_B64))


def main():
    png_path = "/tmp/crop-fixture.png"
    txt_path = "/tmp/crop-fixture.txt"
    write_fixture(png_path)
    Path(txt_path).write_text("not an image")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(HTML_PATH.as_uri())

        # --- Non-image file: rejected ---
        page.locator("#file-input").set_input_files(txt_path)
        assert page.locator("#error-message").is_visible()
        assert page.locator("#download-btn").is_disabled()
        assert page.locator("#preview-image").is_hidden()

        # --- Valid image via file input: loads ---
        page.locator("#file-input").set_input_files(png_path)
        assert page.locator("#error-message").is_hidden()
        assert page.locator("#preview-image").is_visible()
        assert page.locator("#placeholder").is_hidden()
        assert not page.locator("#download-btn").is_disabled()
        assert not page.locator("#zoom-slider").is_disabled()

        min_scale = float(page.locator("#zoom-slider").get_attribute("min"))
        value = float(page.locator("#zoom-slider").get_attribute("value"))
        assert abs(value - min_scale) < 1e-6, "slider should start at min (cover) scale"

        # Preview must actually cover the frame (no visible gaps) at initial load
        frame_box = page.locator("#crop-frame").bounding_box()
        img_box = page.locator("#preview-image").bounding_box()
        assert img_box["x"] <= frame_box["x"] + 0.5
        assert img_box["y"] <= frame_box["y"] + 0.5
        assert img_box["x"] + img_box["width"] >= frame_box["x"] + frame_box["width"] - 0.5
        assert img_box["y"] + img_box["height"] >= frame_box["y"] + frame_box["height"] - 0.5

        # --- choose-file-btn triggers the hidden input ---
        clicked = page.evaluate(
            """() => {
                return new Promise((resolve) => {
                    const input = document.getElementById('file-input');
                    const original = input.click.bind(input);
                    input.click = () => { resolve(true); };
                    document.getElementById('choose-file-btn').click();
                    setTimeout(() => resolve(false), 500);
                });
            }"""
        )
        assert clicked is True

        # --- Drag-and-drop path also loads the image (fresh page, no prior state) ---
        page.reload()

        with open(png_path, "rb") as f:
            bytes_list = list(f.read())

        page.evaluate(
            """(bytes) => {
                const buffer = new Uint8Array(bytes);
                const file = new File([buffer], 'fixture.png', { type: 'image/png' });
                const dt = new DataTransfer();
                dt.items.add(file);
                const frame = document.getElementById('crop-frame');
                const dropEvent = new DragEvent('drop', { bubbles: true, cancelable: true });
                Object.defineProperty(dropEvent, 'dataTransfer', { value: dt });
                frame.dispatchEvent(dropEvent);
            }""",
            bytes_list,
        )
        page.wait_for_function(
            "document.getElementById('preview-image').hidden === false"
        )
        assert not page.locator("#download-btn").is_disabled()

        browser.close()
    print("TASK 2 OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `python3 /tmp/verify-task2.py`
Expected: fails — `#file-input` accepts the file but nothing happens yet (no JS wired).

- [ ] **Step 3: Replace the file content**

Replace the entire content of `tools/crop-image.html` with (identical to Task 1 except the `<script>` block):

```html
<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>圖片裁切工具</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
    max-width: 760px;
    margin: 40px auto;
    padding: 0 20px;
    color: #222;
  }
  h1 { font-size: 20px; }
  .crop-frame {
    position: relative;
    width: 100%;
    max-width: 700px;
    aspect-ratio: 1400 / 690;
    margin: 16px 0;
    overflow: hidden;
    border: 2px dashed #999;
    background: #f4f4f4;
    cursor: grab;
    touch-action: none;
  }
  .crop-frame.drag-over {
    border-color: #0a7;
    background: #eafaf3;
  }
  .crop-frame:active {
    cursor: grabbing;
  }
  .placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #777;
    padding: 20px;
    pointer-events: none;
  }
  .preview-image {
    position: absolute;
    top: 0;
    left: 0;
    max-width: none;
    user-select: none;
    -webkit-user-drag: none;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
  }
  .controls input[type="range"] {
    flex: 1;
  }
  .error-message {
    color: #c00;
    font-weight: 600;
  }
  #result-section img {
    max-width: 350px;
    width: 100%;
    border: 1px solid #ccc;
    margin-top: 8px;
  }
</style>
</head>
<body>
  <h1>圖片裁切工具(1400×690)</h1>
  <p>選擇或拖曳一張圖片,縮放、拖曳調整位置,裁切成 1400×690 的 JPG。</p>

  <input type="file" id="file-input" accept="image/*" hidden />
  <button id="choose-file-btn" type="button">選擇圖片</button>

  <p id="error-message" class="error-message" hidden></p>

  <div id="crop-frame" class="crop-frame">
    <div id="placeholder" class="placeholder">拖曳圖片到這裡,或點擊上方「選擇圖片」</div>
    <img id="preview-image" class="preview-image" alt="" hidden />
  </div>

  <div class="controls">
    <label for="zoom-slider">縮放</label>
    <input type="range" id="zoom-slider" min="1" max="1" step="0.01" value="1" disabled />
  </div>

  <button id="download-btn" type="button" disabled>下載裁切結果</button>

  <div id="result-section" hidden>
    <p>若沒有自動開始下載,請右鍵下方圖片另存新檔:</p>
    <img id="result-preview" alt="裁切結果預覽" />
  </div>

  <script>
    (function () {
      var dropZone = document.getElementById('crop-frame');
      var fileInput = document.getElementById('file-input');
      var chooseFileBtn = document.getElementById('choose-file-btn');
      var placeholder = document.getElementById('placeholder');
      var previewImage = document.getElementById('preview-image');
      var zoomSlider = document.getElementById('zoom-slider');
      var downloadBtn = document.getElementById('download-btn');
      var errorMessage = document.getElementById('error-message');

      var MAX_ZOOM_MULTIPLIER = 4;

      var state = {
        naturalWidth: 0,
        naturalHeight: 0,
        scale: 1,
        minScale: 1,
        maxScale: 1,
        translateX: 0,
        translateY: 0,
      };

      function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
      }

      function clearError() {
        errorMessage.hidden = true;
        errorMessage.textContent = '';
      }

      function getFrameSize() {
        var rect = dropZone.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }

      function render() {
        var frame = getFrameSize();
        var drawWidth = state.naturalWidth * state.scale;
        var drawHeight = state.naturalHeight * state.scale;
        previewImage.style.width = drawWidth + 'px';
        previewImage.style.height = drawHeight + 'px';
        previewImage.style.left = (frame.width / 2 - drawWidth / 2 + state.translateX) + 'px';
        previewImage.style.top = (frame.height / 2 - drawHeight / 2 + state.translateY) + 'px';
      }

      function loadFile(file) {
        clearError();
        if (!file || file.type.indexOf('image/') !== 0) {
          showError('請選擇圖片檔案(jpg、png 等)。');
          return;
        }
        var objectUrl = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          state.naturalWidth = img.naturalWidth;
          state.naturalHeight = img.naturalHeight;
          previewImage.src = objectUrl;
          placeholder.hidden = true;
          previewImage.hidden = false;

          var frame = getFrameSize();
          state.minScale = Math.max(frame.width / state.naturalWidth, frame.height / state.naturalHeight);
          state.maxScale = state.minScale * MAX_ZOOM_MULTIPLIER;
          state.scale = state.minScale;
          state.translateX = 0;
          state.translateY = 0;

          zoomSlider.min = String(state.minScale);
          zoomSlider.max = String(state.maxScale);
          zoomSlider.step = String((state.maxScale - state.minScale) / 200 || 0.001);
          zoomSlider.value = String(state.scale);
          zoomSlider.disabled = false;
          downloadBtn.disabled = false;

          render();
        };
        img.onerror = function () {
          showError('圖片載入失敗,請換一張試試。');
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      }

      chooseFileBtn.addEventListener('click', function () {
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) {
          loadFile(fileInput.files[0]);
        }
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
        });
      });

      dropZone.addEventListener('drop', function (e) {
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          loadFile(file);
        }
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Step 4: Run the verification script to confirm it passes**

Run: `python3 /tmp/verify-task2.py`
Expected: `TASK 2 OK`

- [ ] **Step 5: Delete the verification script and commit**

```bash
rm /tmp/verify-task2.py /tmp/crop-fixture.png /tmp/crop-fixture.txt
git add tools/crop-image.html
git commit -m "feat: wire up image loading via file picker and drag-and-drop"
```

---

### Task 3: Zoom (wheel + slider) and pan (drag), both clamped

**Files:**
- Modify: `tools/crop-image.html`

**Interfaces:**
- Consumes: `state`, `getFrameSize()`, `render()` from Task 2.
- Produces: `clampScale(scale)`, `clampTranslate(tx, ty, scale, frame)`, `setScale(newScale)`, `setTranslate(newX, newY)` — Task 4's export handler reuses `getFrameSize()`/`state` directly and does not need these, but keep the names in case a future change reuses them.

- [ ] **Step 1: Write the verification script**

Save to `/tmp/verify-task3.py`:

```python
import base64
from pathlib import Path
from playwright.sync_api import sync_playwright

FIXTURE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8A"
    "AQUBAScY42YAAAAASUVORK5CYII="
)
HTML_PATH = Path("/Users/neoyeh/develop/mywork/neo-portfolio/tools/crop-image.html").resolve()


def no_gap_invariant(page):
    frame_box = page.locator("#crop-frame").bounding_box()
    img_box = page.locator("#preview-image").bounding_box()
    assert img_box["x"] <= frame_box["x"] + 0.5, "gap on left"
    assert img_box["y"] <= frame_box["y"] + 0.5, "gap on top"
    assert img_box["x"] + img_box["width"] >= frame_box["x"] + frame_box["width"] - 0.5, "gap on right"
    assert img_box["y"] + img_box["height"] >= frame_box["y"] + frame_box["height"] - 0.5, "gap on bottom"


def main():
    png_path = "/tmp/crop-fixture3.png"
    Path(png_path).write_bytes(base64.b64decode(FIXTURE_PNG_B64))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(HTML_PATH.as_uri())
        page.locator("#file-input").set_input_files(png_path)
        page.wait_for_function("document.getElementById('preview-image').hidden === false")

        initial_width = page.locator("#preview-image").bounding_box()["width"]

        # --- Slider zoom: dragging to max should scale up, stay clamped, no gaps ---
        max_scale = float(page.locator("#zoom-slider").get_attribute("max"))
        page.evaluate(
            """(maxScale) => {
                const slider = document.getElementById('zoom-slider');
                slider.value = String(maxScale);
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }""",
            max_scale,
        )
        zoomed_width = page.locator("#preview-image").bounding_box()["width"]
        assert zoomed_width > initial_width, "slider zoom should increase preview size"
        no_gap_invariant(page)

        # --- Wheel zoom: large zoom-in delta must clamp at maxScale, not exceed it ---
        frame_center = page.locator("#crop-frame").bounding_box()
        page.mouse.move(
            frame_center["x"] + frame_center["width"] / 2,
            frame_center["y"] + frame_center["height"] / 2,
        )
        for _ in range(20):
            page.mouse.wheel(0, -400)
        clamped_width = page.locator("#preview-image").bounding_box()["width"]
        naturalWidth = page.evaluate(
            "document.getElementById('preview-image').naturalWidth"
        )
        assert clamped_width <= naturalWidth * max_scale + 1, "wheel zoom exceeded maxScale"
        no_gap_invariant(page)

        # --- Wheel zoom out: large zoom-out delta must clamp at minScale (still covers frame) ---
        for _ in range(40):
            page.mouse.wheel(0, 400)
        no_gap_invariant(page)
        min_scale = float(page.locator("#zoom-slider").get_attribute("min"))
        floor_width = page.locator("#preview-image").bounding_box()["width"]
        assert abs(floor_width - naturalWidth * min_scale) < 1.5, "wheel zoom-out should clamp at minScale"

        # --- Pan: zoom in first so there's room to pan, then drag, verify no gaps ---
        page.evaluate(
            """(maxScale) => {
                const slider = document.getElementById('zoom-slider');
                slider.value = String(maxScale);
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }""",
            max_scale,
        )
        box_before = page.locator("#preview-image").bounding_box()
        frame_box = page.locator("#crop-frame").bounding_box()
        cx = frame_box["x"] + frame_box["width"] / 2
        cy = frame_box["y"] + frame_box["height"] / 2
        page.mouse.move(cx, cy)
        page.mouse.down()
        page.mouse.move(cx + 500, cy + 500, steps=10)
        page.mouse.up()
        box_after = page.locator("#preview-image").bounding_box()
        assert (box_after["x"], box_after["y"]) != (box_before["x"], box_before["y"]), "pan should move the image"
        no_gap_invariant(page)

        # --- Pan clamp: try to drag far past the edge, must still have no gaps ---
        page.mouse.move(cx, cy)
        page.mouse.down()
        page.mouse.move(cx - 5000, cy - 5000, steps=10)
        page.mouse.up()
        no_gap_invariant(page)

        browser.close()
    print("TASK 3 OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `python3 /tmp/verify-task3.py`
Expected: fails — the slider `input` event and `wheel`/pointer events on `#crop-frame` have no listeners yet, so `preview-image` never changes size.

- [ ] **Step 3: Replace the `<script>` block**

Replace only the `<script>...</script>` block in `tools/crop-image.html` (everything else stays identical to Task 2) with:

```html
  <script>
    (function () {
      var dropZone = document.getElementById('crop-frame');
      var fileInput = document.getElementById('file-input');
      var chooseFileBtn = document.getElementById('choose-file-btn');
      var placeholder = document.getElementById('placeholder');
      var previewImage = document.getElementById('preview-image');
      var zoomSlider = document.getElementById('zoom-slider');
      var downloadBtn = document.getElementById('download-btn');
      var errorMessage = document.getElementById('error-message');

      var MAX_ZOOM_MULTIPLIER = 4;

      var state = {
        naturalWidth: 0,
        naturalHeight: 0,
        scale: 1,
        minScale: 1,
        maxScale: 1,
        translateX: 0,
        translateY: 0,
        dragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragOriginX: 0,
        dragOriginY: 0,
      };

      function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
      }

      function clearError() {
        errorMessage.hidden = true;
        errorMessage.textContent = '';
      }

      function getFrameSize() {
        var rect = dropZone.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }

      function render() {
        var frame = getFrameSize();
        var drawWidth = state.naturalWidth * state.scale;
        var drawHeight = state.naturalHeight * state.scale;
        previewImage.style.width = drawWidth + 'px';
        previewImage.style.height = drawHeight + 'px';
        previewImage.style.left = (frame.width / 2 - drawWidth / 2 + state.translateX) + 'px';
        previewImage.style.top = (frame.height / 2 - drawHeight / 2 + state.translateY) + 'px';
      }

      function clampScale(scale) {
        return Math.min(state.maxScale, Math.max(state.minScale, scale));
      }

      function clampTranslate(tx, ty, scale, frame) {
        var drawWidth = state.naturalWidth * scale;
        var drawHeight = state.naturalHeight * scale;
        var maxOffsetX = Math.max(0, (drawWidth - frame.width) / 2);
        var maxOffsetY = Math.max(0, (drawHeight - frame.height) / 2);
        return {
          x: Math.min(maxOffsetX, Math.max(-maxOffsetX, tx)),
          y: Math.min(maxOffsetY, Math.max(-maxOffsetY, ty)),
        };
      }

      function setScale(newScale) {
        var frame = getFrameSize();
        state.scale = clampScale(newScale);
        var clamped = clampTranslate(state.translateX, state.translateY, state.scale, frame);
        state.translateX = clamped.x;
        state.translateY = clamped.y;
        zoomSlider.value = String(state.scale);
        render();
      }

      function setTranslate(newX, newY) {
        var frame = getFrameSize();
        var clamped = clampTranslate(newX, newY, state.scale, frame);
        state.translateX = clamped.x;
        state.translateY = clamped.y;
        render();
      }

      function loadFile(file) {
        clearError();
        if (!file || file.type.indexOf('image/') !== 0) {
          showError('請選擇圖片檔案(jpg、png 等)。');
          return;
        }
        var objectUrl = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          state.naturalWidth = img.naturalWidth;
          state.naturalHeight = img.naturalHeight;
          previewImage.src = objectUrl;
          placeholder.hidden = true;
          previewImage.hidden = false;

          var frame = getFrameSize();
          state.minScale = Math.max(frame.width / state.naturalWidth, frame.height / state.naturalHeight);
          state.maxScale = state.minScale * MAX_ZOOM_MULTIPLIER;
          state.scale = state.minScale;
          state.translateX = 0;
          state.translateY = 0;

          zoomSlider.min = String(state.minScale);
          zoomSlider.max = String(state.maxScale);
          zoomSlider.step = String((state.maxScale - state.minScale) / 200 || 0.001);
          zoomSlider.value = String(state.scale);
          zoomSlider.disabled = false;
          downloadBtn.disabled = false;

          render();
        };
        img.onerror = function () {
          showError('圖片載入失敗,請換一張試試。');
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      }

      chooseFileBtn.addEventListener('click', function () {
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) {
          loadFile(fileInput.files[0]);
        }
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
        });
      });

      dropZone.addEventListener('drop', function (e) {
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          loadFile(file);
        }
      });

      zoomSlider.addEventListener('input', function () {
        if (!state.naturalWidth) return;
        setScale(parseFloat(zoomSlider.value));
      });

      dropZone.addEventListener('wheel', function (e) {
        if (!state.naturalWidth) return;
        e.preventDefault();
        var zoomFactor = Math.exp(-e.deltaY * 0.001);
        setScale(state.scale * zoomFactor);
      }, { passive: false });

      dropZone.addEventListener('pointerdown', function (e) {
        if (!state.naturalWidth) return;
        state.dragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragOriginX = state.translateX;
        state.dragOriginY = state.translateY;
        dropZone.setPointerCapture(e.pointerId);
      });

      dropZone.addEventListener('pointermove', function (e) {
        if (!state.dragging) return;
        var dx = e.clientX - state.dragStartX;
        var dy = e.clientY - state.dragStartY;
        setTranslate(state.dragOriginX + dx, state.dragOriginY + dy);
      });

      function endDrag() {
        state.dragging = false;
      }
      dropZone.addEventListener('pointerup', endDrag);
      dropZone.addEventListener('pointercancel', endDrag);
      dropZone.addEventListener('pointerleave', endDrag);
    })();
  </script>
```

- [ ] **Step 4: Run the verification script to confirm it passes**

Run: `python3 /tmp/verify-task3.py`
Expected: `TASK 3 OK`

Note: Playwright's synthetic `page.mouse.wheel()` dispatches native `wheel` events in Chromium, so the `{ passive: false }` handler above receives real `deltaY` values — no special-casing needed for the test.

- [ ] **Step 5: Delete the verification script and commit**

```bash
rm /tmp/verify-task3.py /tmp/crop-fixture3.png
git add tools/crop-image.html
git commit -m "feat: add clamped zoom (wheel + slider) and pan (drag) to crop tool"
```

---

### Task 4: Export and download (1400×690 canvas, JPEG, timestamped filename, result-preview fallback)

**Files:**
- Modify: `tools/crop-image.html`

**Interfaces:**
- Consumes: `state`, `getFrameSize()` from Task 3.
- Produces: click handler on `#download-btn` that populates `#result-preview` and `#result-section` — nothing downstream depends on this (final task).

- [ ] **Step 1: Write the verification script**

Save to `/tmp/verify-task4.py`:

```python
import base64
import re
from pathlib import Path
from playwright.sync_api import sync_playwright

FIXTURE_PNG_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8A"
    "AQUBAScY42YAAAAASUVORK5CYII="
)
HTML_PATH = Path("/Users/neoyeh/develop/mywork/neo-portfolio/tools/crop-image.html").resolve()


def main():
    png_path = "/tmp/crop-fixture4.png"
    Path(png_path).write_bytes(base64.b64decode(FIXTURE_PNG_B64))

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # accept_downloads is on by default in modern Playwright, but be explicit.
        context = browser.new_context(accept_downloads=True)
        page = context.new_page()
        page.goto(HTML_PATH.as_uri())
        page.locator("#file-input").set_input_files(png_path)
        page.wait_for_function("document.getElementById('preview-image').hidden === false")

        with page.expect_download() as download_info:
            page.locator("#download-btn").click()
        download = download_info.value

        assert re.match(r"^cropped-\d+\.jpg$", download.suggested_filename), (
            "unexpected filename: " + download.suggested_filename
        )

        # Result-preview fallback must appear and be the exact output size
        assert page.locator("#result-section").is_visible()
        page.wait_for_function(
            "document.getElementById('result-preview').complete "
            "&& document.getElementById('result-preview').naturalWidth > 0"
        )
        width = page.evaluate("document.getElementById('result-preview').naturalWidth")
        height = page.evaluate("document.getElementById('result-preview').naturalHeight")
        assert width == 1400, f"expected width 1400, got {width}"
        assert height == 690, f"expected height 690, got {height}"

        # Saving the actual downloaded file also confirms exact pixel dimensions
        saved_path = "/tmp/crop-download-check.jpg"
        download.save_as(saved_path)
        saved_width = page.evaluate(
            """(path) => new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(img.naturalWidth);
                img.src = path;
            })""",
            Path(saved_path).as_uri(),
        )
        assert saved_width == 1400, f"downloaded file width {saved_width}"

        browser.close()
    print("TASK 4 OK")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `python3 /tmp/verify-task4.py`
Expected: fails — `#download-btn` has no click handler yet, so no download event fires and `page.expect_download()` times out.

- [ ] **Step 3: Add the download handler**

In `tools/crop-image.html`, add these two constants near the top of the `<script>` IIFE (right after `var MAX_ZOOM_MULTIPLIER = 4;`):

```js
      var OUTPUT_WIDTH = 1400;
      var OUTPUT_HEIGHT = 690;
```

And add this block at the end of the IIFE, immediately before the closing `})();`:

```js
      downloadBtn.addEventListener('click', function () {
        if (!state.naturalWidth) return;

        var frame = getFrameSize();
        var outputScale = OUTPUT_WIDTH / frame.width;
        var exportScale = state.scale * outputScale;
        var drawWidth = state.naturalWidth * exportScale;
        var drawHeight = state.naturalHeight * exportScale;
        var drawX = OUTPUT_WIDTH / 2 - drawWidth / 2 + state.translateX * outputScale;
        var drawY = OUTPUT_HEIGHT / 2 - drawHeight / 2 + state.translateY * outputScale;

        var canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(previewImage, drawX, drawY, drawWidth, drawHeight);

        canvas.toBlob(function (blob) {
          if (!blob) {
            showError('產生圖片失敗,請重試一次。');
            return;
          }
          var filename = 'cropped-' + Date.now() + '.jpg';
          var url = URL.createObjectURL(blob);

          var link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          var resultPreview = document.getElementById('result-preview');
          var resultSection = document.getElementById('result-section');
          resultPreview.src = url;
          resultSection.hidden = false;
        }, 'image/jpeg', 0.9);
      });
```

The full `<script>` block should now read (for reference — this is the complete file's script section after this edit):

```html
  <script>
    (function () {
      var dropZone = document.getElementById('crop-frame');
      var fileInput = document.getElementById('file-input');
      var chooseFileBtn = document.getElementById('choose-file-btn');
      var placeholder = document.getElementById('placeholder');
      var previewImage = document.getElementById('preview-image');
      var zoomSlider = document.getElementById('zoom-slider');
      var downloadBtn = document.getElementById('download-btn');
      var errorMessage = document.getElementById('error-message');

      var MAX_ZOOM_MULTIPLIER = 4;
      var OUTPUT_WIDTH = 1400;
      var OUTPUT_HEIGHT = 690;

      var state = {
        naturalWidth: 0,
        naturalHeight: 0,
        scale: 1,
        minScale: 1,
        maxScale: 1,
        translateX: 0,
        translateY: 0,
        dragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragOriginX: 0,
        dragOriginY: 0,
      };

      function showError(message) {
        errorMessage.textContent = message;
        errorMessage.hidden = false;
      }

      function clearError() {
        errorMessage.hidden = true;
        errorMessage.textContent = '';
      }

      function getFrameSize() {
        var rect = dropZone.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }

      function render() {
        var frame = getFrameSize();
        var drawWidth = state.naturalWidth * state.scale;
        var drawHeight = state.naturalHeight * state.scale;
        previewImage.style.width = drawWidth + 'px';
        previewImage.style.height = drawHeight + 'px';
        previewImage.style.left = (frame.width / 2 - drawWidth / 2 + state.translateX) + 'px';
        previewImage.style.top = (frame.height / 2 - drawHeight / 2 + state.translateY) + 'px';
      }

      function clampScale(scale) {
        return Math.min(state.maxScale, Math.max(state.minScale, scale));
      }

      function clampTranslate(tx, ty, scale, frame) {
        var drawWidth = state.naturalWidth * scale;
        var drawHeight = state.naturalHeight * scale;
        var maxOffsetX = Math.max(0, (drawWidth - frame.width) / 2);
        var maxOffsetY = Math.max(0, (drawHeight - frame.height) / 2);
        return {
          x: Math.min(maxOffsetX, Math.max(-maxOffsetX, tx)),
          y: Math.min(maxOffsetY, Math.max(-maxOffsetY, ty)),
        };
      }

      function setScale(newScale) {
        var frame = getFrameSize();
        state.scale = clampScale(newScale);
        var clamped = clampTranslate(state.translateX, state.translateY, state.scale, frame);
        state.translateX = clamped.x;
        state.translateY = clamped.y;
        zoomSlider.value = String(state.scale);
        render();
      }

      function setTranslate(newX, newY) {
        var frame = getFrameSize();
        var clamped = clampTranslate(newX, newY, state.scale, frame);
        state.translateX = clamped.x;
        state.translateY = clamped.y;
        render();
      }

      function loadFile(file) {
        clearError();
        if (!file || file.type.indexOf('image/') !== 0) {
          showError('請選擇圖片檔案(jpg、png 等)。');
          return;
        }
        var objectUrl = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          state.naturalWidth = img.naturalWidth;
          state.naturalHeight = img.naturalHeight;
          previewImage.src = objectUrl;
          placeholder.hidden = true;
          previewImage.hidden = false;

          var frame = getFrameSize();
          state.minScale = Math.max(frame.width / state.naturalWidth, frame.height / state.naturalHeight);
          state.maxScale = state.minScale * MAX_ZOOM_MULTIPLIER;
          state.scale = state.minScale;
          state.translateX = 0;
          state.translateY = 0;

          zoomSlider.min = String(state.minScale);
          zoomSlider.max = String(state.maxScale);
          zoomSlider.step = String((state.maxScale - state.minScale) / 200 || 0.001);
          zoomSlider.value = String(state.scale);
          zoomSlider.disabled = false;
          downloadBtn.disabled = false;

          render();
        };
        img.onerror = function () {
          showError('圖片載入失敗,請換一張試試。');
          URL.revokeObjectURL(objectUrl);
        };
        img.src = objectUrl;
      }

      chooseFileBtn.addEventListener('click', function () {
        fileInput.click();
      });

      fileInput.addEventListener('change', function () {
        if (fileInput.files && fileInput.files[0]) {
          loadFile(fileInput.files[0]);
        }
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropZone.addEventListener(eventName, function (e) {
          e.preventDefault();
          dropZone.classList.remove('drag-over');
        });
      });

      dropZone.addEventListener('drop', function (e) {
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          loadFile(file);
        }
      });

      zoomSlider.addEventListener('input', function () {
        if (!state.naturalWidth) return;
        setScale(parseFloat(zoomSlider.value));
      });

      dropZone.addEventListener('wheel', function (e) {
        if (!state.naturalWidth) return;
        e.preventDefault();
        var zoomFactor = Math.exp(-e.deltaY * 0.001);
        setScale(state.scale * zoomFactor);
      }, { passive: false });

      dropZone.addEventListener('pointerdown', function (e) {
        if (!state.naturalWidth) return;
        state.dragging = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        state.dragOriginX = state.translateX;
        state.dragOriginY = state.translateY;
        dropZone.setPointerCapture(e.pointerId);
      });

      dropZone.addEventListener('pointermove', function (e) {
        if (!state.dragging) return;
        var dx = e.clientX - state.dragStartX;
        var dy = e.clientY - state.dragStartY;
        setTranslate(state.dragOriginX + dx, state.dragOriginY + dy);
      });

      function endDrag() {
        state.dragging = false;
      }
      dropZone.addEventListener('pointerup', endDrag);
      dropZone.addEventListener('pointercancel', endDrag);
      dropZone.addEventListener('pointerleave', endDrag);

      downloadBtn.addEventListener('click', function () {
        if (!state.naturalWidth) return;

        var frame = getFrameSize();
        var outputScale = OUTPUT_WIDTH / frame.width;
        var exportScale = state.scale * outputScale;
        var drawWidth = state.naturalWidth * exportScale;
        var drawHeight = state.naturalHeight * exportScale;
        var drawX = OUTPUT_WIDTH / 2 - drawWidth / 2 + state.translateX * outputScale;
        var drawY = OUTPUT_HEIGHT / 2 - drawHeight / 2 + state.translateY * outputScale;

        var canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(previewImage, drawX, drawY, drawWidth, drawHeight);

        canvas.toBlob(function (blob) {
          if (!blob) {
            showError('產生圖片失敗,請重試一次。');
            return;
          }
          var filename = 'cropped-' + Date.now() + '.jpg';
          var url = URL.createObjectURL(blob);

          var link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          var resultPreview = document.getElementById('result-preview');
          var resultSection = document.getElementById('result-section');
          resultPreview.src = url;
          resultSection.hidden = false;
        }, 'image/jpeg', 0.9);
      });
    })();
  </script>
```

- [ ] **Step 4: Run the verification script to confirm it passes**

Run: `python3 /tmp/verify-task4.py`
Expected: `TASK 4 OK`

- [ ] **Step 5: Delete the verification script and commit**

```bash
rm /tmp/verify-task4.py /tmp/crop-fixture4.png /tmp/crop-download-check.jpg
git add tools/crop-image.html
git commit -m "feat: export crop as 1400x690 JPEG download with result-preview fallback"
```

---

## Manual smoke test (after Task 4)

Automated coverage above proves the geometry and export contract. Before calling the tool done, do one manual pass per the spec's verification section:

1. `open tools/crop-image.html` in a real browser.
2. Drag in a real photo, zoom with the mouse wheel and the slider, pan by dragging.
3. Click "下載裁切結果", confirm a `cropped-<timestamp>.jpg` downloads.
4. Run `sips -g pixelWidth -g pixelHeight <downloaded file>` and confirm `1400`/`690`.
