import Phaser from "phaser";

import { GameBackground, PlayerWin, AIWin } from "../consts/SceneKeys";
import * as Colors from "../consts/Colors";
import { PressStart2P } from "../consts/Fonts";

const GameState = {
  Running: "running",
  GameOver: "game-over",
};

class Game extends Phaser.Scene {
  init() {
    this.leftScore = 0;
    this.rightScore = 0;
    this.scoreToWin = 5;
    this.gameState = GameState.Running;
    this.isBoosting = false;
    this.boostCooldown = false;
    this.scoringLocked = false; // prevents double-counting during reset delay
  }

  // =========================
  // Paddle creation
  // =========================
  createPaddle(x, y, flip = false) {
    const g = this.add.graphics();
    g.fillStyle(0xff2e2e, 1);
    g.fillCircle(40, 40, 40);
    g.lineStyle(4, 0xffffff);
    g.strokeCircle(40, 40, 40);
    g.fillStyle(0x8b5a2b, 1);
    g.fillRoundedRect(32, 80, 16, 40, 5);
    g.lineStyle(3, 0xffffff);
    g.strokeRoundedRect(32, 80, 16, 40, 5);

    const texKey = `paddleTex${x}`;
    g.generateTexture(texKey, 80, 120);
    g.destroy();

    const paddle = this.physics.add.sprite(x, y, texKey);
    paddle.setImmovable(true);
    paddle.setCollideWorldBounds(true);

    if (flip) paddle.setFlipX(true);

    return paddle;
  }

  preload() {
    this.load.audio(
      "pointSound",
      "https://cdn.pixabay.com/audio/2024/07/14/audio_b0a46299ed.mp3",
    );
    this.load.audio(
      "aiPointSound",
      "https://cdn.pixabay.com/audio/2025/01/16/audio_b3e3dd01d1.mp3",
    );
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
    this.scene.run(GameBackground);
    this.scene.sendToBack(GameBackground);

    this.physics.world.setBounds(0, 0, width, height);

    this.input.once("pointerdown", () => this.sound.context.resume());

    // =========================
    // AUDIO
    // =========================
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.3 });
    this.bgMusic.play();

    // =========================
    // BALL (orange)
    // =========================
    this.ballSpeed = 480;
    this.ball = this.add.circle(width / 2, height / 2, 12, Colors.Orange);
    this.physics.add.existing(this.ball);
    this.ball.body.setCircle(12);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.onWorldBounds = true;

    // Only use worldbounds for top/bottom wall sound — NOT for scoring
    this.physics.world.on("worldbounds", (body, up, down) => {
      if (up || down) this.sound.play("ballSound");
    });

    // =========================
    // PLAYER & AI PADDLE
    // =========================
    this.paddleLeft = this.createPaddle(90, height / 2);
    this.paddleRight = this.createPaddle(width - 90, height / 2, true);

    this.paddleRight.body.setMaxVelocity(0, 400);
    this.paddleRight.body.setDragY(1200);

    // Scoring zones: ball crosses these X thresholds = point scored
    // Set just inside the world edge so the ball can never bounce back off the wall first
    this.scoreZoneLeft = 20; // ball passed left wall → AI (right) scores
    this.scoreZoneRight = width - 20; // ball passed right wall → Player (left) scores

    // =========================
    // COLLISIONS
    // =========================
    this.physics.add.collider(
      this.paddleLeft,
      this.ball,
      this.handlePaddleCollision,
      undefined,
      this,
    );

    this.physics.add.collider(
      this.paddleRight,
      this.ball,
      this.handlePaddleCollision,
      undefined,
      this,
    );

    // =========================
    // UI
    // =========================
    const style = { fontSize: 36, fontFamily: PressStart2P, color: "#ffffff" };
    this.leftScoreLabel = this.add
      .text(width * 0.25, 60, "0", style)
      .setOrigin(0.5);
    this.rightScoreLabel = this.add
      .text(width * 0.75, 60, "0", style)
      .setOrigin(0.5);

    // =========================
    // MOUSE CONTROLS
    // =========================
    this.input.mouse.disableContextMenu();
    this.input.on("pointerdown", (pointer) => {
      if (pointer.leftButtonDown()) this.activateBoost();
    });

    this.time.delayedCall(1000, () => this.resetBall());

    // =========================
    // PAUSE BUTTON
    // =========================
    this.isPaused = false;

    this.pauseButton = this.add
      .text(this.scale.width - 100, 30, "PAUSE", {
        fontSize: 24,
        fontFamily: PressStart2P,
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.pauseButton.on("pointerover", () =>
      this.pauseButton.setStyle({ backgroundColor: "#555555" }),
    );
    this.pauseButton.on("pointerout", () =>
      this.pauseButton.setStyle({ backgroundColor: "#333333" }),
    );
    this.pauseButton.on("pointerdown", () => this.togglePause());
    this.input.keyboard.on("keydown-P", () => this.togglePause());

    this.pausedText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "PAUSED", {
        fontSize: 48,
        fontFamily: PressStart2P,
        color: "#ffcc00",
      })
      .setOrigin(0.5)
      .setVisible(false);
  }

  update() {
    if (this.gameState !== GameState.Running || this.isPaused) return;
    this.processMouseMovement();
    this.updateAI();
    this.checkScoreZones();
  }

  // =========================
  // SCORE ZONE CHECK (replaces worldbounds scoring)
  // =========================
  checkScoreZones() {
    if (this.scoringLocked) return;

    const bx = this.ball.x;

    if (bx <= this.scoreZoneLeft) {
      // Ball passed the left wall → AI scores
      this.scoringLocked = true;
      this.incrementRightScore();
    } else if (bx >= this.scoreZoneRight) {
      // Ball passed the right wall → Player scores
      this.scoringLocked = true;
      this.incrementLeftScore();
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.physics.world.pause();
      this.bgMusic.pause();
      this.pausedText.setVisible(true);
      this.pauseButton.setText("START");
    } else {
      this.physics.world.resume();
      this.bgMusic.resume();
      this.pausedText.setVisible(false);
      this.pauseButton.setText("PAUSE");
    }
  }

  // =========================
  // PLAYER MOVEMENT
  // =========================
  processMouseMovement() {
    const pointerY = this.input.activePointer.y;
    this.paddleLeft.y = Phaser.Math.Clamp(pointerY, 60, this.scale.height - 60);
  }

  // =========================
  // AI
  // =========================
  updateAI() {
    const body = this.paddleRight.body;
    const diff = this.ball.y - this.paddleRight.y;

    if (this.ball.body.velocity.x < 0) {
      body.setAccelerationY(0);
      return;
    }
    if (Math.abs(diff) < 18) {
      body.setAccelerationY(0);
      return;
    }

    body.setAccelerationY(diff > 0 ? 1500 : -1500);
  }

  // =========================
  // BOOST
  // =========================
  activateBoost() {
    if (this.boostCooldown) return;

    this.isBoosting = true;
    this.boostCooldown = true;

    this.tweens.add({
      targets: this.paddleLeft,
      tint: { from: 0xffffff, to: 0xffff00 },
      duration: 150,
      yoyo: true,
    });

    this.tweens.add({
      targets: this.paddleLeft,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 150,
      yoyo: true,
    });

    this.time.delayedCall(300, () => (this.isBoosting = false));
    this.time.delayedCall(1200, () => (this.boostCooldown = false));
  }

  // =========================
  // COLLISION
  // =========================
  handlePaddleCollision(paddle, ball) {
    this.sound.play("ballSound");

    const body = ball.body;
    const isLeftPaddle = paddle === this.paddleLeft;

    // Push ball fully outside paddle to prevent tunneling
    const paddleHalfWidth = paddle.displayWidth * 0.5;
    const ballRadius = 14;
    if (isLeftPaddle) {
      ball.x = paddle.x + paddleHalfWidth + ballRadius;
    } else {
      ball.x = paddle.x - paddleHalfWidth - ballRadius;
    }

    const direction = isLeftPaddle ? 1 : -1;
    let speed = this.ballSpeed;
    if (isLeftPaddle && this.isBoosting) speed *= 1.8;

    const newY = Phaser.Math.Clamp(body.velocity.y * 1.1, -500, 500);
    body.setVelocity(direction * speed, newY);

    // Wobble
    this.tweens.add({
      targets: paddle,
      rotation: Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15)),
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      ease: "Power1",
    });

    // Flip animation (both paddles)
    const baseScaleX = isLeftPaddle ? 1 : -1;
    this.tweens.add({
      targets: paddle,
      scaleX: baseScaleX * -1,
      duration: 80,
      yoyo: true,
      ease: "Power1",
      onComplete: () => {
        paddle.scaleX = baseScaleX;
      },
    });

    // Tint flash
    this.tweens.add({
      targets: paddle,
      tint: { from: 0xffffff, to: 0xffaa00 },
      duration: 100,
      yoyo: true,
    });

    // Ball squash/stretch
    this.tweens.add({
      targets: ball,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
      ease: "Power1",
    });

    // Boost pop
    if (isLeftPaddle && this.isBoosting) {
      this.tweens.add({
        targets: paddle,
        scaleY: 1.3,
        scaleX: 1.3,
        duration: 150,
        yoyo: true,
        ease: "Power1",
      });
    }
  }

  // =========================
  // SCORING
  // =========================
  incrementLeftScore() {
    this.leftScore++;
    this.leftScoreLabel.setText(this.leftScore);
    this.sound.play("pointSound");
    this.checkWin();
  }

  incrementRightScore() {
    this.rightScore++;
    this.rightScoreLabel.setText(this.rightScore);
    this.sound.play("aiPointSound");
    this.checkWin();
  }

  checkWin() {
    this.ball.body.setVelocity(0, 0);

    if (this.leftScore >= this.scoreToWin) {
      this.gameState = GameState.GameOver;
      this.bgMusic.stop();
      this.sound.play("winSound");
      this.time.delayedCall(1000, () => this.scene.start(PlayerWin));
      return;
    }

    if (this.rightScore >= this.scoreToWin) {
      this.gameState = GameState.GameOver;
      this.bgMusic.stop();
      this.sound.play("loseSound");
      this.time.delayedCall(1000, () => this.scene.start(AIWin));
      return;
    }

    this.time.delayedCall(800, () => {
      this.scoringLocked = false; // unlock AFTER ball resets safely
      this.resetBall();
    });
  }

  resetBall() {
    const { width, height } = this.scale;
    this.ball.setPosition(width / 2, height / 2);
    this.ball.setScale(1);
    this.ball.rotation = 0;

    const angle = Phaser.Math.Between(-45, 45);
    const direction = Phaser.Math.Between(0, 1) ? 1 : -1;

    const velocity = this.physics.velocityFromAngle(
      direction === 1 ? angle : 180 - angle,
      this.ballSpeed,
    );
    this.ball.body.setVelocity(velocity.x, velocity.y);
  }

  shutdown() {
    if (this.bgMusic) this.bgMusic.stop();
  }
}

export default Game;
