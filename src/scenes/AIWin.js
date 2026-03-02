import Phaser from "phaser";
import { PressStart2P } from "../consts/Fonts";
import * as SceneKeys from "../consts/SceneKeys";

class AIWin extends Phaser.Scene {
  constructor() {
    super(SceneKeys.AIWin);
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#000000");

    // Title
    this.add
      .text(width / 2, height / 2 - 120, "AI WINS!", {
        fontSize: 40,
        fontFamily: PressStart2P,
        color: "#ff0000",
      })
      .setOrigin(0.5);

    // Play Again Button
    const playAgain = this.createButton(
      width / 2,
      height / 2,
      "PLAY AGAIN",
      () => {
        this.scene.start(SceneKeys.Game);
      },
    );

    // Title Screen Button
    const titleButton = this.createButton(
      width / 2,
      height / 2 + 90,
      "TITLE SCREEN",
      () => {
        this.scene.start(SceneKeys.TitleScreen);
      },
    );
  }

  createButton(x, y, label, callback) {
    const button = this.add
      .text(x, y, label, {
        fontSize: 22,
        fontFamily: PressStart2P,
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => {
      button.setColor("#ffff00");
      button.setScale(1.1);
    });

    button.on("pointerout", () => {
      button.setColor("#ffffff");
      button.setScale(1);
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: callback,
      });
    });

    return button;
  }
}

export default AIWin;
