(() => {
  'use strict';

  const questions = [
    { name: '加法森林', skill: '加法練習', prompt: '7 + 5 = ?', answer: 12, choices: [10, 12, 13], sky: 0xc8edfb, hill: 0x8bd2b4, ground: 0x48a87e },
    { name: '減法溪谷', skill: '減法練習', prompt: '18 − 9 = ?', answer: 9, choices: [7, 9, 11], sky: 0xcdeafb, hill: 0x91c9b6, ground: 0x449c82 },
    { name: '乘法山丘', skill: '乘法練習', prompt: '6 × 4 = ?', answer: 24, choices: [20, 24, 28], sky: 0xc9e6fc, hill: 0x90c5bb, ground: 0x448f84 },
    { name: '除法雲頂', skill: '除法練習', prompt: '35 ÷ 5 = ?', answer: 7, choices: [5, 6, 7], sky: 0xcdeaf9, hill: 0x8fcbbd, ground: 0x3f9a87 },
    { name: '星星數學塔', skill: '終極挑戰', prompt: '36 ÷ 4 + 8 = ?', answer: 17, choices: [16, 17, 18], sky: 0xc5e5fa, hill: 0x8ac7b4, ground: 0x3d927b },
  ];

  const controls = { left: false, right: false, jump: false };
  const overlay = document.getElementById('game-overlay');
  const overlayCard = document.getElementById('overlay-card');
  const overlayAction = document.getElementById('overlay-action');
  const feedback = document.getElementById('feedback');
  const restartTop = document.getElementById('restart-top');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const scoreValue = document.getElementById('score-value');
  let sceneRef;

  function showFeedback(message, type = '') {
    feedback.textContent = message;
    feedback.className = `feedback ${type}`.trim();
  }

  function setOverlay({ art, kicker, title, message, action, complete = false }) {
    document.getElementById('overlay-art').textContent = art;
    document.getElementById('overlay-kicker').textContent = kicker;
    document.getElementById('overlay-title').textContent = title;
    document.getElementById('overlay-message').textContent = message;
    document.getElementById('scoring-note').hidden = complete;
    overlayAction.innerHTML = `${action} <span aria-hidden="true">→</span>`;
    overlay.classList.remove('is-hidden');
    overlayCard.classList.remove('is-complete');
    void overlayCard.offsetWidth;
    overlayCard.classList.add('is-complete');
    restartTop.hidden = complete;
  }

  function updateHud(scene) {
    const question = questions[scene.levelIndex];
    const level = scene.levelIndex + 1;
    document.getElementById('level-label').textContent = `第 ${level} 關`;
    document.getElementById('progress-caption').textContent = `島嶼 ${level} / ${questions.length}`;
    document.getElementById('stage-name').textContent = question.name;
    document.getElementById('question-text').textContent = question.prompt;
    scoreValue.textContent = String(scene.score);
    progressFill.style.width = `${(level / questions.length) * 100}%`;
    progressBar.setAttribute('aria-valuenow', String(level));
  }

  function bindHoldButton(id, controlName, isJump = false) {
    const button = document.getElementById(id);
    const press = (event) => {
      event.preventDefault();
      controls[controlName] = true;
      button.classList.add('is-pressed');
      if (!isJump && button.setPointerCapture && event.pointerId !== undefined) {
        try { button.setPointerCapture(event.pointerId); } catch (_) { /* Pointer may already be released. */ }
      }
    };
    const release = () => {
      controls[controlName] = false;
      button.classList.remove('is-pressed');
    };
    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('click', () => {
      if (isJump) sceneRef?.requestJump();
      else sceneRef?.tapMove(controlName);
    });
    button.addEventListener('contextmenu', (event) => event.preventDefault());
  }

  bindHoldButton('move-left', 'left');
  bindHoldButton('move-right', 'right');
  bindHoldButton('jump-button', 'jump', true);

  const keyBindings = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
  };
  window.addEventListener('keydown', (event) => {
    const control = keyBindings[event.code];
    if (!control) return;
    event.preventDefault();
    if (control === 'jump') {
      if (!event.repeat) controls.jump = true;
    } else {
      controls[control] = true;
    }
  }, { passive: false });
  window.addEventListener('keyup', (event) => {
    const control = keyBindings[event.code];
    if (control) controls[control] = false;
  });
  window.addEventListener('blur', () => {
    controls.left = false;
    controls.right = false;
    controls.jump = false;
  });

  class MathIslandScene extends Phaser.Scene {
    constructor() {
      super('MathIslandScene');
      this.levelIndex = 0;
      this.score = 0;
      this.running = false;
    }

    create(data = {}) {
      this.levelIndex = 0;
      this.score = 0;
      this.running = false;
      this.drawBackdrop();
      this.makeHeroTexture();
      this.makeOrbTexture();
      this.physics.world.setBounds(0, 0, 960, 460);
      this.physics.world.pause();
      this.setupArena();
      this.setupRound();
      updateHud(this);
      sceneRef = this;
      showFeedback('碰到錯誤答案會扣分，想清楚再出發！');

      if (data.quickStart) {
        this.startPlaying();
      } else {
        setOverlay({
          art: '🚀',
          kicker: '五座島嶼等你探索',
          title: '準備好出發了嗎？',
          message: '在島上左右移動，碰到正確答案星球就能前往下一關。也可以跳上平台探索。',
          action: '開始冒險',
        });
      }
    }

    drawBackdrop() {
      this.backdrop = this.add.graphics();
      this.backdrop.fillStyle(0xc8edfb, 1);
      this.backdrop.fillRect(0, 0, 960, 460);
      this.backdrop.fillStyle(0xffffff, 0.34);
      this.backdrop.fillCircle(805, 82, 44);
      this.backdrop.fillStyle(0xfff2bd, 0.95);
      this.backdrop.fillCircle(805, 82, 31);
      this.drawCloud(112, 89, 0.9);
      this.drawCloud(450, 80, 0.63);
      this.drawCloud(655, 155, 0.52);
      this.backdrop.fillStyle(0xa9d9d2, 1);
      this.backdrop.fillTriangle(0, 356, 183, 179, 388, 356);
      this.backdrop.fillTriangle(283, 356, 508, 162, 739, 356);
      this.backdrop.fillTriangle(634, 356, 836, 187, 1030, 356);
      this.backdrop.fillStyle(0xbce4d2, 0.8);
      this.backdrop.fillTriangle(0, 380, 233, 253, 448, 380);
      this.backdrop.fillTriangle(459, 378, 738, 232, 1000, 378);
      this.add.rectangle(480, 433, 960, 54, 0x48a87e).setDepth(1);
      this.add.rectangle(480, 408, 960, 9, 0x83d29e).setDepth(1);
      this.add.rectangle(480, 449, 960, 22, 0x388b72).setDepth(1);
      this.add.rectangle(480, 421, 960, 2, 0xb3e6a8).setDepth(1);

      for (let x = 26; x < 960; x += 82) {
        const tuft = this.add.graphics().setDepth(2);
        tuft.fillStyle(x % 2 ? 0x9fe3a0 : 0xb7e5a4, 0.9);
        tuft.fillTriangle(x, 414, x + 6, 402, x + 12, 414);
        tuft.fillTriangle(x + 7, 414, x + 14, 404, x + 20, 414);
      }

      this.add.text(28, 20, '✦', { fontFamily: 'Arial', fontSize: '16px', color: '#fff8ce' }).setAlpha(0.85);
      this.add.text(894, 187, '✦', { fontFamily: 'Arial', fontSize: '19px', color: '#fff5bd' }).setAlpha(0.9);
      this.add.text(421, 212, '·', { fontFamily: 'Arial', fontSize: '29px', color: '#ffffff' }).setAlpha(0.65);
    }

    drawCloud(x, y, scale) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0xffffff, 0.78);
      cloud.fillEllipse(x, y + 10 * scale, 86 * scale, 27 * scale);
      cloud.fillCircle(x - 20 * scale, y + 2 * scale, 17 * scale);
      cloud.fillCircle(x + 3 * scale, y - 4 * scale, 23 * scale);
      cloud.fillCircle(x + 25 * scale, y + 3 * scale, 16 * scale);
    }

    makeHeroTexture() {
      if (this.textures.exists('little-hero')) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x304a68, 0.18);
      g.fillEllipse(24, 55, 33, 6);
      g.fillStyle(0xf4a145, 1);
      g.fillRoundedRect(12, 28, 24, 25, 8);
      g.fillStyle(0x438bd0, 1);
      g.fillRoundedRect(7, 30, 32, 22, 9);
      g.fillStyle(0xffd36f, 1);
      g.fillRoundedRect(4, 33, 8, 15, 4);
      g.fillStyle(0xffd9ae, 1);
      g.fillCircle(23, 21, 16);
      g.fillStyle(0x53434a, 1);
      g.fillRoundedRect(8, 7, 30, 11, 6);
      g.fillStyle(0x5f4a4b, 1);
      g.fillCircle(12, 16, 6);
      g.fillCircle(34, 15, 5);
      g.fillStyle(0x29394c, 1);
      g.fillCircle(18, 22, 1.8);
      g.fillCircle(28, 22, 1.8);
      g.lineStyle(2, 0xb76b53, 1);
      g.beginPath(); g.arc(23, 25, 5, 0.15, Math.PI - 0.15, false); g.strokePath();
      g.fillStyle(0x3d5270, 1);
      g.fillRoundedRect(10, 48, 10, 8, 3);
      g.fillRoundedRect(26, 48, 10, 8, 3);
      g.fillStyle(0xf3f1db, 1);
      g.fillRoundedRect(7, 53, 14, 5, 2);
      g.fillRoundedRect(24, 53, 14, 5, 2);
      g.generateTexture('little-hero', 48, 60);
      g.destroy();
    }

    makeOrbTexture() {
      if (this.textures.exists('answer-star')) return;
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xf8c64b, 0.24);
      g.fillCircle(32, 32, 31);
      g.fillStyle(0xedae36, 1);
      g.fillCircle(32, 32, 25);
      g.fillStyle(0xffdf77, 1);
      g.fillCircle(26, 24, 17);
      g.fillStyle(0xfff5c8, 0.85);
      g.fillCircle(21, 19, 5);
      g.lineStyle(3, 0xfff2bd, 0.92);
      g.strokeCircle(32, 32, 28);
      g.generateTexture('answer-star', 64, 64);
      g.destroy();
    }

    setupArena() {
      this.platforms = this.physics.add.staticGroup();
      const platformSpecs = [
        [292, 356, 166],
        [548, 311, 172],
        [799, 356, 168],
      ];
      this.supportSurfaces = [{ left: 0, right: 960, top: 436 }];
      for (const [x, y, width] of platformSpecs) {
        const platform = this.add.rectangle(x, y, width, 18, 0x4b9d83).setDepth(3);
        this.physics.add.existing(platform, true);
        platform.body.setSize(width, 18);
        this.platforms.add(platform);
        this.supportSurfaces.push({ left: x - width / 2, right: x + width / 2, top: y - 9 });
        this.add.rectangle(x, y - 7, width - 4, 5, 0xb3e6a8).setDepth(4);
        this.add.rectangle(x, y + 7, width - 6, 3, 0x337e70).setDepth(4);
        this.add.circle(x - width / 2 + 17, y - 13, 3, 0xe9f4d4).setDepth(4);
        this.add.circle(x + width / 2 - 17, y - 13, 3, 0xe9f4d4).setDepth(4);
      }

      const floor = this.add.rectangle(480, 449, 960, 25, 0x388b72).setDepth(2);
      this.physics.add.existing(floor, true);
      this.hero = this.physics.add.sprite(70, 408, 'little-hero').setDepth(6);
      this.hero.setBodySize(27, 39).setOffset(10, 15);
      this.hero.setCollideWorldBounds(true);
      this.hero.setMaxVelocity(300, 760);
      this.hero.body.setBoundsRectangle(new Phaser.Geom.Rectangle(0, 0, 960, 460));
      this.physics.add.collider(this.hero, floor);
      this.physics.add.collider(this.hero, this.platforms);
      this.add.text(20, 375, '出發！', { fontFamily: 'Noto Sans TC, sans-serif', fontSize: '12px', color: '#27785f', fontStyle: 'bold' }).setDepth(5);
    }

    setupRound() {
      if (this.answerGroup) {
        this.answerGroup.clear(true, true);
      }
      if (this.answerLabels) {
        this.answerLabels.forEach((label) => label.destroy());
      }
      this.answerLabels = [];
      this.answerGroup = this.add.group();
      const question = questions[this.levelIndex];
      const choices = Phaser.Utils.Array.Shuffle([...question.choices]);
      const spots = [
        { x: 220, y: 398 },
        { x: 490, y: 398 },
        { x: 760, y: 398 },
      ];
      choices.forEach((value, index) => {
        const spot = spots[index];
        const orb = this.add.image(spot.x, spot.y, 'answer-star').setDepth(5);
        orb.setDisplaySize(59, 59);
        orb.answerValue = value;
        orb.collected = false;
        const label = this.add.text(spot.x, spot.y, String(value), {
          fontFamily: 'Nunito, Noto Sans TC, sans-serif',
          fontSize: '23px',
          fontStyle: '900',
          color: '#fffdf5',
          stroke: '#c28318',
          strokeThickness: 3,
          align: 'center',
        }).setOrigin(0.5).setDepth(7);
        orb.answerLabel = label;
        this.answerLabels.push(label);
        this.answerGroup.add(orb);
      });
      this.hero.setPosition(70, 408);
      this.hero.setVelocity(0, 0);
      this.hero.clearTint();
    }

    startPlaying() {
      if (this.running) return;
      this.running = true;
      overlay.classList.add('is-hidden');
      restartTop.hidden = false;
      this.physics.world.resume();
      this.hero.setVelocity(0, 0);
      this.hero.setPosition(70, 408);
      this.game.canvas.tabIndex = 0;
      this.game.canvas.setAttribute('aria-label', '遊戲操作區：方向鍵或 A、D 移動，空白鍵或向上鍵跳躍');
      this.game.canvas.focus({ preventScroll: true });
      showFeedback('出發！蒐集正確答案星球。');
    }

    tapMove(direction) {
      if (!this.running) return;
      this.tapMoveDirection = direction;
      this.tapMoveUntil = this.time.now + 230;
    }

    requestJump() {
      if (this.running) controls.jump = true;
    }

    isHeroGrounded() {
      const body = this.hero.body;
      if (body.blocked.down || body.touching.down) return true;
      const bodyBottom = body.bottom;
      return body.velocity.y > -30 && this.supportSurfaces.some((surface) =>
        Math.abs(bodyBottom - surface.top) <= 7
        && body.right > surface.left + 4
        && body.left < surface.right - 4,
      );
    }

    collectAnswer(orb) {
      if (!this.running || !orb.active || orb.collected) return;
      orb.collected = true;
      const correct = orb.answerValue === questions[this.levelIndex].answer;
      if (!correct) {
        this.score -= 5;
        orb.answerLabel.destroy();
        this.tweens.add({
          targets: orb,
          alpha: 0,
          scale: 0.2,
          duration: 230,
          onComplete: () => orb.destroy(),
        });
        this.hero.setTint(0xffc0a8);
        this.time.delayedCall(260, () => this.hero.clearTint());
        updateHud(this);
        showFeedback('差一點！再找找看。　−5 分', 'error');
        return;
      }

      this.running = false;
      this.score += 10;
      updateHud(this);
      showFeedback('答對了！星星島亮起來了。　+10 分', 'success');
      this.physics.world.pause();
      this.answerGroup.getChildren().forEach((token) => {
        if (!token.active) return;
        if (token.answerLabel.active) token.answerLabel.destroy();
        this.tweens.add({ targets: token, alpha: 0, scale: 0.25, duration: 260, onComplete: () => token.destroy() });
      });

      this.time.delayedCall(950, () => {
        if (this.levelIndex === questions.length - 1) {
          this.finishGame();
          return;
        }
        this.levelIndex += 1;
        updateHud(this);
        this.setupRound();
        this.running = true;
        this.physics.world.resume();
        showFeedback('下一座島嶼，繼續加油！');
      });
    }

    finishGame() {
      this.running = false;
      this.physics.world.pause();
      const stars = this.score >= 45 ? '★★★' : this.score >= 30 ? '★★☆' : '★☆☆';
      document.getElementById('overlay-art').textContent = stars;
      document.getElementById('overlay-kicker').textContent = '五座島嶼全數點亮';
      document.getElementById('overlay-title').textContent = '闖關成功！';
      document.getElementById('overlay-message').textContent = `小勇者得到 ${this.score} 分，帶著星星回家吧！`;
      document.getElementById('scoring-note').hidden = true;
      overlayAction.innerHTML = '再玩一次 <span aria-hidden="true">↻</span>';
      overlay.classList.remove('is-hidden');
      restartTop.hidden = true;
      showFeedback('太棒了，你完成了全部五關！', 'success');
    }

    restartGame() {
      controls.left = false;
      controls.right = false;
      controls.jump = false;
      this.scene.restart({ quickStart: true });
    }

    update() {
      if (!this.running || !this.hero?.body) return;
      for (const token of this.answerGroup.getChildren()) {
        if (!token.active || token.collected) continue;
        if (Math.abs(this.hero.x - token.x) <= 43 && Math.abs(this.hero.y - token.y) <= 48) {
          this.collectAnswer(token);
          if (!this.running) return;
        }
      }
      const tapIsActive = this.tapMoveDirection && this.time.now < this.tapMoveUntil;
      const left = controls.left || (tapIsActive && this.tapMoveDirection === 'left');
      const right = controls.right || (tapIsActive && this.tapMoveDirection === 'right');
      const jumpPressed = controls.jump;
      controls.jump = false;

      if (left === right) {
        this.hero.setVelocityX(0);
      } else if (left) {
        this.hero.setVelocityX(-235);
        this.hero.setFlipX(true);
      } else {
        this.hero.setVelocityX(235);
        this.hero.setFlipX(false);
      }

      if (jumpPressed && this.isHeroGrounded()) {
        this.hero.setVelocityY(-470);
      }
    }
  }

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game-stage',
    width: 960,
    height: 460,
    backgroundColor: '#c8edfb',
    render: { antialias: true, pixelArt: false, roundPixels: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1000 }, debug: false } },
    scene: [MathIslandScene],
    audio: { noAudio: true },
  });
  game.canvas.tabIndex = 0;
  game.canvas.setAttribute('aria-label', '遊戲操作區：方向鍵或 A、D 移動，空白鍵或向上鍵跳躍');

  overlayAction.addEventListener('click', () => {
    if (sceneRef?.running === false && overlayAction.textContent.includes('再玩一次')) {
      sceneRef.restartGame();
      return;
    }
    if (sceneRef?.running === false) sceneRef.startPlaying();
  });
  restartTop.addEventListener('click', () => sceneRef?.restartGame());

})();
