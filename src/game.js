import * as Phaser from 'phaser';
import { questions } from './data/questions.js';

(() => {
  'use strict';

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
    overlayAction.hidden = false;
    overlayAction.dataset.action = 'start';
    overlayAction.innerHTML = `${action} <span aria-hidden="true">→</span>`;
    overlay.classList.remove('is-hidden');
    overlay.removeAttribute('aria-hidden');
    overlayCard.classList.remove('is-complete');
    void overlayCard.offsetWidth;
    overlayCard.classList.add('is-complete');
    restartTop.hidden = true;
  }

  function updateHud(scene) {
    const question = questions[scene.levelIndex];
    const level = scene.levelIndex + 1;
    document.getElementById('level-label').textContent = `第 ${level} 題`;
    document.getElementById('progress-caption').textContent = `題目 ${level} / ${questions.length}`;
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
      if (!isJump) controls[controlName] = true;
      button.classList.add('is-pressed');
      if (!isJump && button.setPointerCapture && event.pointerId !== undefined) {
        try { button.setPointerCapture(event.pointerId); } catch (_) { /* Pointer may already be released. */ }
      }
    };
    const release = () => {
      if (!isJump) controls[controlName] = false;
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
    ArrowLeft: 'left', Left: 'left', arrowleft: 'left', KeyA: 'left', a: 'left',
    ArrowRight: 'right', Right: 'right', arrowright: 'right', KeyD: 'right', d: 'right',
    ArrowUp: 'jump', Up: 'jump', arrowup: 'jump', KeyW: 'jump', w: 'jump',
    Space: 'jump', space: 'jump', ' ': 'jump',
  };
  window.addEventListener('keydown', (event) => {
    const control = keyBindings[event.code] || keyBindings[event.key] || keyBindings[event.key.toLowerCase()];
    if (!control) return;
    event.preventDefault();
    if (control === 'jump') {
      if (!event.repeat) sceneRef?.requestJump();
    } else {
      controls[control] = true;
    }
  }, { passive: false });
  window.addEventListener('keyup', (event) => {
    const control = keyBindings[event.code] || keyBindings[event.key] || keyBindings[event.key.toLowerCase()];
    if (control && control !== 'jump') controls[control] = false;
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

    preload() {
      const base = 'assets/images/kenney/abstract-platformer/';
      this.load.image('kenney-hero-stand', `${base}hero-stand.png`);
      this.load.image('kenney-hero-walk-1', `${base}hero-walk-1.png`);
      this.load.image('kenney-hero-walk-2', `${base}hero-walk-2.png`);
      this.load.image('kenney-hero-walk-3', `${base}hero-walk-3.png`);
      this.load.image('kenney-hero-fall', `${base}hero-fall.png`);
    }

    create(data = {}) {
      this.levelIndex = 0;
      this.score = 0;
      this.running = false;
      this.drawBackdrop();
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
          kicker: '十題數學挑戰',
          title: '準備好出發了嗎？',
          message: '從小學到大學，題目依序加難。答對 +10 分，答錯 −5 分，蒐集正確答案前往下一題。',
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
        [292, 409, 166],
        [548, 376, 172],
        [799, 409, 168],
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
      this.jumpsRemaining = 2;
      this.hero = this.physics.add.sprite(70, 408, 'kenney-hero-stand').setDepth(6);
      this.hero.setBodySize(27, 39).setOffset(9, 12);
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
        { x: 292, y: 371 },
        { x: 548, y: 338 },
        { x: 799, y: 371 },
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
      this.hero.setTexture('kenney-hero-stand');
      this.jumpsRemaining = 2;
      this.hero.clearTint();
    }

    startPlaying() {
      if (this.running) return;
      this.running = true;
      overlayAction.hidden = false;
      overlayAction.dataset.action = 'start';
      overlay.classList.add('is-hidden');
      overlay.setAttribute('aria-hidden', 'true');
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
      if (!this.running || this.jumpsRemaining <= 0) return;
      this.hero.setVelocityY(-560);
      this.jumpsRemaining -= 1;
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
        updateHud(this);
        this.explodeAndRestart();
        return;
      }

      this.running = false;
      this.score += 10;
      updateHud(this);
      showFeedback('答對了！挑戰下一題。　+10 分', 'success');
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
        showFeedback('下一題難度升級，繼續加油！');
      });
    }

    explodeAndRestart() {
      this.running = false;
      const x = this.hero.x;
      const y = this.hero.y;
      this.hero.setVelocity(0, 0);
      this.hero.setVisible(false);
      this.hero.body.setEnable(false);
      this.cameras.main.shake(420, 0.012);

      const flash = this.add.circle(x, y, 12, 0xffed9a).setDepth(30);
      const shockwave = this.add.circle(x, y, 16, 0xffffff, 0).setStrokeStyle(5, 0xff7955, 1).setDepth(29);
      this.tweens.add({ targets: flash, scale: 6, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => flash.destroy() });
      this.tweens.add({
        targets: shockwave,
        scale: 5,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => shockwave.destroy(),
      });

      const sparkColors = [0xff704d, 0xffc44f, 0xfff0a0, 0x71d1bc];
      for (let i = 0; i < 9; i += 1) {
        const angle = (Math.PI * 2 * i) / 9;
        const spark = this.add.star(x, y, 5, 4, 10, sparkColors[i % sparkColors.length]).setDepth(31);
        this.tweens.add({
          targets: spark,
          x: x + Math.cos(angle) * 76,
          y: y + Math.sin(angle) * 64,
          angle: 300,
          scale: 0,
          alpha: 0,
          duration: 640,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy(),
        });
      }

      this.answerGroup.getChildren().forEach((token) => {
        if (!token.active) return;
        if (token.answerLabel?.active) token.answerLabel.destroy();
        this.tweens.add({ targets: token, alpha: 0, scale: 0.3, duration: 360, onComplete: () => token.destroy() });
      });

      document.getElementById('overlay-art').textContent = '💥';
      document.getElementById('overlay-kicker').textContent = '答錯了！扣 5 分';
      document.getElementById('overlay-title').textContent = '轟！遊戲重新開始';
      document.getElementById('overlay-message').textContent = '小勇者需要重新出發，點擊按鈕回到第一關。';
      document.getElementById('scoring-note').hidden = true;
      overlayAction.hidden = false;
      overlayAction.innerHTML = '重新開始 <span aria-hidden="true">↻</span>';
      overlayAction.dataset.action = 'restart';
      overlay.classList.remove('is-hidden');
      overlay.removeAttribute('aria-hidden');
      restartTop.hidden = true;
      showFeedback('答錯了！−5 分　💥　準備重新開始', 'error');
    }

    finishGame() {
      this.running = false;
      this.physics.world.pause();
      const stars = this.score >= 90 ? '★★★' : this.score >= 70 ? '★★☆' : '★☆☆';
      document.getElementById('overlay-art').textContent = stars;
      document.getElementById('overlay-kicker').textContent = '十題挑戰全部完成';
      document.getElementById('overlay-title').textContent = '闖關成功！';
      document.getElementById('overlay-message').textContent = `小勇者得到 ${this.score} 分，帶著星星回家吧！`;
      document.getElementById('scoring-note').hidden = true;
      overlayAction.dataset.action = 'restart';
      overlayAction.innerHTML = '再玩一次 <span aria-hidden="true">↻</span>';
      overlay.classList.remove('is-hidden');
      overlay.removeAttribute('aria-hidden');
      restartTop.hidden = true;
      showFeedback('太棒了，你完成了全部十題！', 'success');
    }

    restartGame() {
      controls.left = false;
      controls.right = false;
      controls.jump = false;
      this.tapMoveDirection = null;
      this.levelIndex = 0;
      this.score = 0;
      this.hero.body.setEnable(true);
      this.hero.setActive(true).setVisible(true).setTexture('kenney-hero-stand');
      this.setupRound();
      updateHud(this);
      this.physics.world.resume();
      this.startPlaying();
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
      if (left === right) {
        this.hero.setVelocityX(0);
      } else if (left) {
        this.hero.setVelocityX(-280);
        this.hero.setFlipX(true);
      } else {
        this.hero.setVelocityX(280);
        this.hero.setFlipX(false);
      }

      const grounded = this.isHeroGrounded();
      if (grounded && this.hero.body.velocity.y > -30) this.jumpsRemaining = 2;

      if (!grounded && this.hero.body.velocity.y > 30) {
        this.hero.setTexture('kenney-hero-fall');
      } else if (!grounded) {
        this.hero.setTexture('kenney-hero-stand');
      } else if (left !== right) {
        const walkFrame = (Math.floor(this.time.now / 120) % 3) + 1;
        this.hero.setTexture(`kenney-hero-walk-${walkFrame}`);
      } else {
        this.hero.setTexture('kenney-hero-stand');
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
    if (overlayAction.dataset.action === 'restart') {
      sceneRef.restartGame();
      return;
    }
    if (sceneRef?.running === false) sceneRef.startPlaying();
  });
  restartTop.addEventListener('click', () => sceneRef?.restartGame());

})();
