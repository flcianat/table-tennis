import Phaser from "phaser";

import TitleScreen from "./scenes/TitleScreen";
import Game from "./scenes/Game";
import GameBackground from "./scenes/GameBackground";
import PlayerWin from "./scenes/PlayerWin";
import AIWin from "./scenes/AIWin";
import Preload from "./scenes/Preload";

import * as SceneKeys from "./consts/SceneKeys";

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#000000",
  parent: "game-container",

  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

// ✅ Register scenes
game.scene.add(SceneKeys.TitleScreen, TitleScreen);
game.scene.add(SceneKeys.Game, Game);
game.scene.add(SceneKeys.GameBackground, GameBackground);
game.scene.add(SceneKeys.PlayerWin, PlayerWin);
game.scene.add(SceneKeys.AIWin, AIWin);
game.scene.add(SceneKeys.Preload, Preload);

// 🚀 Start game
game.scene.start(SceneKeys.Preload);
