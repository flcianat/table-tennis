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
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");

    this.scene.run(GameBackground);
    this.scene.sendToBack(GameBackground);

    this.physics.world.setBounds(0, 0, width, height);

    // =========================
    // BALL
    // =========================
    this.ballSpeed = 480;

    this.ball = this.add.circle(width / 2, height / 2, 10, Colors.White);
    this.physics.add.existing(this.ball);

    this.ball.body.setCircle(10);
    this.ball.body.setBounce(1, 1);
    this.ball.body.setCollideWorldBounds(true);
    this.ball.body.onWorldBounds = true;

    this.physics.world.on("worldbounds", this.handleWorldBounds, this);

    // =========================
    // PLAYER PADDLE
    // =========================
    this.paddleLeft = this.add.rectangle(50, height / 2, 20, 100, Colors.White);
    this.physics.add.existing(this.paddleLeft);

    this.paddleLeft.body.setImmovable(true);
    this.paddleLeft.body.setCollideWorldBounds(true);

    // =========================
    // AI PADDLE
    // =========================
    this.paddleRight = this.add.rectangle(
      width - 50,
      height / 2,
      20,
      100,
      Colors.White,
    );

    this.physics.add.existing(this.paddleRight);

    this.paddleRight.body.setImmovable(true);
    this.paddleRight.body.setCollideWorldBounds(true);
    this.paddleRight.body.setMaxVelocity(0, 400);
    this.paddleRight.body.setDragY(1200);

    this.aiAcceleration = 1500;
    this.aiDeadZone = 18;

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
    const style = {
      fontSize: 36,
      fontFamily: PressStart2P,
      color: "#ffffff",
    };

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
      if (pointer.leftButtonDown()) {
        this.activateBoost();
      }
    });

    this.time.delayedCall(1000, () => this.resetBall());
  }

  update() {
    if (this.gameState !== GameState.Running) return;

    this.processMouseMovement();
    this.updateAI();
  }

  // =========================
  // PLAYER MOVEMENT
  // =========================

  processMouseMovement() {
    const pointerY = this.input.activePointer.y;

    this.paddleLeft.y = Phaser.Math.Clamp(
      pointerY,
      this.paddleLeft.height / 2,
      this.scale.height - this.paddleLeft.height / 2,
    );
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

    if (Math.abs(diff) < this.aiDeadZone) {
      body.setAccelerationY(0);
      return;
    }

    body.setAccelerationY(
      diff > 0 ? this.aiAcceleration : -this.aiAcceleration,
    );
  }

  // =========================
  // BOOST
  // =========================

  activateBoost() {
    if (this.boostCooldown) return;

    this.isBoosting = true;
    this.boostCooldown = true;

    this.time.delayedCall(300, () => {
      this.isBoosting = false;
    });

    this.time.delayedCall(1200, () => {
      this.boostCooldown = false;
    });
  }

  // =========================
  // COLLISION
  // =========================

  handlePaddleCollision(paddle, ball) {
    const body = ball.body;
    const direction = body.velocity.x > 0 ? 1 : -1;

    let speed = this.ballSpeed;

    if (paddle === this.paddleLeft && this.isBoosting) {
      speed *= 1.8;
    }

    const newY = Phaser.Math.Clamp(body.velocity.y * 1.1, -500, 500);

    body.setVelocity(direction * speed, newY);
  }

  // =========================
  // SCORING
  // =========================

  handleWorldBounds(body, up, down, left, right) {
    if (left) this.incrementRightScore();
    if (right) this.incrementLeftScore();
  }

  incrementLeftScore() {
    this.leftScore++;
    this.leftScoreLabel.setText(this.leftScore);
    this.checkWin();
  }

  incrementRightScore() {
    this.rightScore++;
    this.rightScoreLabel.setText(this.rightScore);
    this.checkWin();
  }

  checkWin() {
    this.ball.body.setVelocity(0, 0);

    if (this.leftScore >= this.scoreToWin) {
      this.gameState = GameState.GameOver;

      this.time.delayedCall(1000, () => {
        this.scene.start("player-win");
      });
      return;
    }

    if (this.rightScore >= this.scoreToWin) {
      this.gameState = GameState.GameOver;

      this.time.delayedCall(1000, () => {
        this.scene.start("ai-win");
      });
      return;
    }

    this.time.delayedCall(800, () => this.resetBall());
  }

  resetBall() {
    const { width, height } = this.scale;

    this.ball.setPosition(width / 2, height / 2);

    const angle = Phaser.Math.Between(-45, 45);
    const direction = Phaser.Math.Between(0, 1) ? 1 : -1;

    const velocity = this.physics.velocityFromAngle(
      direction === 1 ? angle : 180 - angle,
      this.ballSpeed,
    );

    this.ball.body.setVelocity(velocity.x, velocity.y);
  }
}

export default Game;
