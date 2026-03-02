import Phaser from "phaser";

import { Game } from "../consts/SceneKeys";
import { PressStart2P } from "../consts/Fonts";

import * as AudioKeys from "../consts/AudioKeys";

// TitleScreen.js - Minimalistic version
export default class TitleScreen extends Phaser.Scene {
  constructor() {
    super({ key: "titlescreen" });
  }

  preload() {}

  create() {
    const { width, height } = this.scale;

    // Clean dark background
    this.cameras.main.setBackgroundColor("#111111");

    // Simple title
    const title = this.add
      .text(width / 2, height * 0.35, "TABLE TENNIS", {
        fontSize: 56,
        fontFamily: "Arial",
        fontWeight: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Simple play button
    const button = this.add
      .text(width / 2, height * 0.6, "PLAY", {
        fontSize: 32,
        fontFamily: "Arial",
        color: "#ffffff",
        backgroundColor: "#333333",
        padding: { x: 40, y: 20 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effect
    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: "#555555" });
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: "#333333" });
    });

    // Start game on button click or spacebar
    button.on("pointerdown", () => {
      this.startGame();
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.startGame();
    });

    // Optional: Simple animation for title
    this.tweens.add({
      targets: title,
      y: height * 0.35 - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  startGame() {
    // Simple fade out
    this.cameras.main.fade(300, 0, 0, 0);

    this.time.delayedCall(300, () => {
      this.scene.start("game");
    });
  }
}
