import Phaser from "phaser";
import { Game } from "../consts/SceneKeys";
import { PressStart2P } from "../consts/Fonts";

export default class TitleScreen extends Phaser.Scene {
  constructor() {
    super({ key: "titlescreen" });
  }

  preload() {
    // Load bgMusic here so it's ready before create() runs
    this.load.audio(
      "bgMusic",
      "assets/audio/bgMusic.mp3", // ← keep whatever path your project uses
    );
  }

  createPaddle(x, y, flip = false) {
    const container = this.add.container(x, y);

    const g = this.add.graphics();

    // Paddle head (circle)
    g.fillStyle(0xff2e2e, 1); // red rubber
    g.fillCircle(0, 0, 26);

    // Paddle outline
    g.lineStyle(3, 0xffffff);
    g.strokeCircle(0, 0, 26);

    // Handle
    g.fillStyle(0x8b5a2b, 1); // wood
    g.fillRoundedRect(-6, 22, 12, 30, 4);

    g.lineStyle(2, 0xffffff);
    g.strokeRoundedRect(-6, 22, 12, 30, 4);

    container.add(g);

    if (flip) {
      container.setScale(-1, 1); // mirror for right side
    }

    return container;
  }

  create() {
    const { width, height } = this.scale;

    // 🎾 Court background (retro green)
    this.cameras.main.setBackgroundColor("#0b3d2e");

    // =========================
    // BG MUSIC
    // =========================
    // Resume AudioContext on first interaction (browser autoplay policy)
    this.input.once("pointerdown", () => this.sound.context.resume());

    // Only start music if it isn't already playing (e.g. scene restart)
    if (!this.sound.get("bgMusic")?.isPlaying) {
      this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.3 });
      this.bgMusic.play();
    }

    // =========================
    // PIXEL TENNIS TABLE
    // =========================

    const graphics = this.add.graphics();

    // Outer border
    graphics.lineStyle(6, 0xffffff);
    graphics.strokeRect(40, 80, width - 80, height - 160);

    // Center net line
    graphics.lineStyle(4, 0xffffff);
    graphics.lineBetween(width / 2, 80, width / 2, height - 80);

    // Horizontal center line
    graphics.lineBetween(40, height / 2, width - 40, height / 2);

    // =========================
    // TITLE
    // =========================
    const title = this.add
      .text(width / 2, height * 0.18, "PIXEL PONG", {
        fontSize: 40,
        fontFamily: PressStart2P,
        color: "#ffffff",
      })
      .setOrigin(0.5);

    title.setShadow(0, 0, "#00ff99", 10, true, true);

    // =========================
    // FAKE PADDLES (DECORATION)
    // =========================
    this.createPaddle(90, height / 2);
    this.createPaddle(width - 90, height / 2, true);

    // =========================
    // FLOATING BALL
    // =========================
    const ball = this.add.circle(width / 2, height / 2, 8, 0xffffff);

    this.tweens.add({
      targets: ball,
      x: width / 2 + 120,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // =========================
    // PLAY BUTTON
    // =========================
    const playButton = this.add
      .text(width / 2, height * 0.75, "PRESS SPACE TO PLAY", {
        fontSize: 18,
        fontFamily: PressStart2P,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    playButton.on("pointerover", () => {
      playButton.setColor("#ffff00");
      playButton.setScale(1.05);
    });

    playButton.on("pointerout", () => {
      playButton.setColor("#ffffff");
      playButton.setScale(1);
    });

    playButton.on("pointerdown", () => {
      this.startGame();
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.startGame();
    });

    // Blinking effect
    this.tweens.add({
      targets: playButton,
      alpha: 0,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Floating title animation
    this.tweens.add({
      targets: title,
      y: height * 0.18 - 4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  startGame() {
    // Stop music here — Game.js will start its own instance
    if (this.bgMusic?.isPlaying) this.bgMusic.stop();

    this.cameras.main.fade(300, 0, 0, 0);

    this.time.delayedCall(300, () => {
      this.scene.start(Game);
    });
  }
}
