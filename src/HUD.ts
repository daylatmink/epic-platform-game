import Phaser from "phaser";

export default class HUD {
    private scoreText: Phaser.GameObjects.Text;
    private score: number = 0;

    constructor(scene: Phaser.Scene) {
        this.scoreText = scene.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            color: "#ffffff"
        }).setScrollFactor(0);
    }

    addScore(points: number) {
        this.score += points;
        this.scoreText.setText("Score: " + this.score);
    }

    getScore() {
        return this.score;
    }
}
