import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import EndedGameScene from "./scenes/EndGameScene";
import GameOverScene from "./scenes/GameOverScene";
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: { default: "arcade", arcade: { gravity: {
                y: 600,
                x: 0
            }, debug: true } },
    backgroundColor: "#87CEEB",
    scene: [GameScene, EndedGameScene, GameOverScene],
};


new Phaser.Game(config);
