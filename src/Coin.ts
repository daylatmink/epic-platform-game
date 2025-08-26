import Phaser from "phaser";

export default class Coin extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "coins");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play("coins_spin");
    }

    static createAnimations(scene: Phaser.Scene) {
        scene.anims.create({
            key: "coins_spin",
            frames: scene.anims.generateFrameNumbers("coins", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });
    }
}
