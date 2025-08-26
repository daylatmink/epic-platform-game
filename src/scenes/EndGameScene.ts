export default class EndGameScene extends Phaser.Scene {
    private finalScore: number = 0;

    constructor() {
        super("EndGameScene");
    }

    init(data: any) {
        this.finalScore = data.score || 0;
    }

    create() {
        this.cameras.main.setBackgroundColor("#000000");

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100, "🎉 YOU WIN 🎉", {
            fontSize: "64px",
            color: "#ff0",
            fontStyle: "bold"
        }).setOrigin(0.5);

        // Hiển thị điểm số
        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, "Final Score: " + this.finalScore, {
            fontSize: "40px",
            color: "#fff"
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 100, "Nhấn SPACE để chơi lại", {
            fontSize: "32px",
            color: "#fff"
        }).setOrigin(0.5);

        this.input.keyboard?.once("keydown-SPACE", () => {
            this.scene.start("GameScene");
        });
    }
}
