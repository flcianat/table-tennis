import Phaser from "phaser";

import { TitleScreen } from "../consts/SceneKeys";

import WebFontFile from "./WebFontFile";

export default class Preload extends Phaser.Scene {
  preload() {
    const fonts = new WebFontFile(this.load, "Press Start 2P");
    this.load.addFile(fonts);

    this.load.audio(
      "ballSound",
      "https://cdn.pixabay.com/audio/2025/08/07/audio_390fc80f40.mp3",
    );

    this.load.audio("bgMusic", [
      "https://cdn.phaserfiles.com/v385/assets/audio/oedipus_wizball_highscore.ogg",
      "https://cdn.phaserfiles.com/v385/assets/audio/oedipus_wizball_highscore.mp3",
    ]);

    this.load.audio(
      "winSound",
      "https://cdn.pixabay.com/audio/2025/10/21/audio_65cfef2766.mp3",
    );

    this.load.audio(
      "loseSound",
      "https://cdn.pixabay.com/audio/2025/06/25/audio_8e180ca508.mp3",
    );

    this.load.audio(
      "pointSound",
      "https://cdn.pixabay.com/audio/2024/07/14/audio_b0a46299ed.mp3",
    );

    this.load.audio(
      "aiPointSound",
      "https://cdn.pixabay.com/audio/2025/01/16/audio_b3e3dd01d1.mp3",
    );

    this.load.on("filecomplete-audio-ballSound", () => {
      console.log("BALL SOUND LOADED SUCCESSFULLY");
    });
  }

  create() {
    this.scene.start(TitleScreen);
  }
}
