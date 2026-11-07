# 數學勇者｜星星島闖關

以 Phaser 4 製作的數學平台闖關小遊戲。題庫共有 40 題，涵蓋小學四則運算、分數與小數，國中百分比、比例、方程式與幾何，高中二次方程式與三角函數，以及大學微分與定積分。每輪從十個難度階段各抽一題，從簡單到困難；重玩會換掉上一輪同階段的題目。答對加 10 分；答錯扣 5 分並播放爆炸，點擊重新開始後會抽取新題目。

## 開始遊戲

GitHub Pages 根目錄的 `index.html` 直接就是遊戲。`game.bundle.js` 已隨專案提供，可直接用瀏覽器開啟遊玩。修改 `src/game.js` 後，執行 `npm install` 與 `npm run build` 重新產生遊戲檔。

## 操作方式

- 鍵盤：`←` / `→` 或 `A` / `D` 移動，`↑`、`W` 或空白鍵跳躍；空中可再跳一次。
- 觸控：使用畫面下方的左右與跳躍按鈕；左右按鈕可輕點，也可按住連續移動。
- 螢幕自動適配：所有裝置都使用橫向跳台；手機直向時提示橫拿，並保留固定在畫面下方的大型觸控按鈕；手機橫向時會收緊版面並固定操作按鈕。
- 答案星球放在三座跳台上；跳上平台並靠近正確答案即可蒐集。跳台較低，並支援二段跳。
- 答錯會扣 5 分並播放爆炸動畫；點擊「重新開始」後，分數會歸零並回到第一關。

## 檔案

- `index.html`：GitHub Pages 首頁，直接顯示遊戲。
- `src/game.js`：Phaser 場景、題目、角色操作與計分。
- `src/data/questions.js`：由簡到難的十道數學題與答案選項。
- `src/styles.css`：版面、色彩與行動裝置排版。
- `src/scenes/`、`src/entities/`、`src/systems/`、`src/ui/`、`src/config/`：遊戲程式的擴充位置。
- `assets/images/`、`assets/audio/`、`assets/fonts/`、`assets/data/`：圖片、音訊、字型與遊戲資料素材。
- `assets/images/kenney/abstract-platformer/`：遊戲角色使用的 Kenney 站立、行走與跳躍素材；來源和 CC0 授權記錄於 `assets/ASSET_CREDITS.md`。
- `assets/sources/kenney/abstract-platformer.zip`：原始 Kenney 素材包；授權檔另存於同目錄。
- `.agents/skills/`：Phaser 官方提供的 28 份遊戲開發技能說明。
- `.agents/skills/web-asset-finder/`、`.agents/skills/kenney-asset-finder/`：專案用的網頁素材搜尋與 Kenney 素材下載技能。
- `game.bundle.js`：GitHub Pages 使用的 Phaser 4 遊戲包。
