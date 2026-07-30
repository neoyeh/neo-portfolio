# neo-portfolio

Neo Yeh's personal portfolio site (React 19 + Redux + Three.js). Live at [neoyeh.github.io/neo-portfolio/dist](https://neoyeh.github.io/neo-portfolio/dist/).

## Adding a new portfolio entry

Use the `/add-portfolio` Claude Code skill.

**Before running it:** drop the project's screenshot/photo into `src/images/`. Recommended source resolution: **1400×690** (matches this site's card aspect ratio — other sizes work too, the skill just compresses whatever you give it, but 1400×690 avoids cropping/stretching surprises). That's the only manual step — everything else happens through the skill.

**What it asks for**, all in one message: year, project name, a short description, attributes (Independent Work / Team Work, Scrollmagic / Bootstrap, Responsive / Adaptive, Offline — pick any that apply), and one or more links (live site and/or GitHub/prototype preview). Description and attributes can be left blank — you'll get a menu of previously-used values to pick from instead. If the project name is in Chinese, you'll also be asked for a romanized name to build the image filename from.

**What happens automatically afterward:**
1. The image in `src/images/` is renamed to `<year>-<project-name-slug>.<ext>`.
2. It's compressed via the `image-optimize` skill and written to `dist/img/`.
3. `dist/portfolio.json` gets the new entry, filed under the right year.
4. The change is committed and pushed to `master`.
5. The dev server starts (`npm run start`) and you get the live GitHub Pages URL to check (allow a minute or two for GitHub Pages to catch up after the push).

Full design details: `docs/superpowers/specs/2026-07-30-add-portfolio-design.md`.

---

## 新增作品集項目（中文版）

使用 `/add-portfolio` 這個 Claude Code skill。

**執行前：** 先把作品的截圖／照片放進 `src/images/`。建議的原始圖片解析度是 **1400×690**（跟網站卡片的長寬比一致，避免裁切或拉伸；其他尺寸也能用，skill 一樣會幫你壓縮，只是 1400×690 比較不會有意外的裁切狀況）。這是唯一需要手動做的事，其餘全部由 skill 自動完成。

**會一次問你的內容**（一則訊息問完）：年份、專案名稱、簡短說明、屬性（Independent Work / Team Work、Scrollmagic / Bootstrap、Responsive / Adaptive、Offline，可複選）、以及一個以上的連結（正式網站和／或 GitHub／prototype 預覽連結）。說明跟屬性都可以留空，留空的話會改成選單讓你從以前用過的值裡挑。如果專案名稱是中文，還會另外問你要用什麼英文／羅馬拼音名稱來組出圖片檔名。

**接下來會自動完成的事：**
1. `src/images/` 裡的圖片會被重新命名成 `<年份>-<專案名稱slug>.<副檔名>`。
2. 透過 `image-optimize` skill 壓縮後，輸出到 `dist/img/`。
3. `dist/portfolio.json` 會加上新的一筆資料，歸類到正確的年份。
4. 自動 commit 並 push 到 `master`。
5. 開發伺服器啟動（`npm run start`），並給你 GitHub Pages 的連結（push 後 GitHub Pages 需要一兩分鐘才會更新，請稍等）。

完整設計文件：`docs/superpowers/specs/2026-07-30-add-portfolio-design.md`。
