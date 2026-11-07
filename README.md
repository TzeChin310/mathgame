# 數學勇者｜星星島闖關

以 Phaser 4 製作的國小數學平台闖關小遊戲，共五關。答對加 10 分，答錯扣 5 分；每關蒐集正確答案星球後即可前往下一關。

## 開始遊戲

GitHub Pages 根目錄的 `index.html` 直接就是遊戲。`game.bundle.js` 已隨專案提供，可直接用瀏覽器開啟遊玩。修改 `src/game.js` 後，執行 `npm install` 與 `npm run build` 重新產生遊戲檔。

## 操作方式

- 鍵盤：`←` / `→` 或 `A` / `D` 移動，`↑`、`W` 或空白鍵跳躍；空中可再跳一次。
- 觸控：使用畫面下方的左右與跳躍按鈕；左右按鈕可輕點，也可按住連續移動。
- 答案星球放在三座跳台上；跳上平台並靠近正確答案即可蒐集。跳台較低，並支援二段跳。
- 答錯會扣 5 分並播放爆炸動畫；點擊「重新開始」後，分數會歸零並回到第一關。

## 檔案

- `index.html`：GitHub Pages 首頁，直接顯示遊戲。
- `src/game.js`：Phaser 場景、題目、角色操作與計分。
- `src/styles.css`：版面、色彩與行動裝置排版。
- `src/scenes/`、`src/entities/`、`src/systems/`、`src/ui/`、`src/config/`：遊戲程式的擴充位置。
- `assets/images/`、`assets/audio/`、`assets/fonts/`、`assets/data/`：圖片、音訊、字型與遊戲資料素材。
- `.agents/skills/`：Phaser 官方提供的 28 份遊戲開發技能說明。
- `game.bundle.js`：GitHub Pages 使用的 Phaser 4 遊戲包。
