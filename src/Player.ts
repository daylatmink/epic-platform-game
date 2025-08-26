import Phaser from "phaser";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "player_idle");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setSize(80, 90);
        this.setOffset(23, 28);

        // Input
        this.cursors = scene.input.keyboard!.createCursorKeys();
    }

    static createAnimations(scene: Phaser.Scene) {
        scene.anims.create({
            key: "idle",
            frames: [{ key: "player_idle", frame: 0 }],
            frameRate: 10
        });

        scene.anims.create({
            key: "run",
            frames: [
                { key: "player_walk_a", frame: 0 },
                { key: "player_walk_b", frame: 0 },
            ],
            frameRate: 5,
            repeat: -1
        });

        scene.anims.create({
            key: "jump",
            frames: [{ key: "player_jump", frame: 0 }],
            frameRate: 10,
        });
    }

    update() {
        const speed = 300;
        if (this.cursors.left.isDown) {
            this.setVelocityX(-speed);
            this.anims.play("run", true);
            this.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.setVelocityX(speed);
            this.anims.play("run", true);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
            this.anims.play("idle", true);
        }

        const jumpForce = -420;
        // @ts-ignore
        if (this.cursors.up.isDown && this.body.blocked.down) {
            this.setVelocityY(jumpForce);
            this.anims.play("jump", true);
        }
    }
}
