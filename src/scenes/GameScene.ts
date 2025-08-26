import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private coins!: Phaser.Physics.Arcade.Group;
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;
    private goal!: Phaser.Physics.Arcade.StaticGroup;
    private gameOver: boolean = false;
    private tileHeight: number = 32;
    private tileWidth: number = 32;
    constructor() {
        super("GameScene");
    }

    preload() {
        this.load.tilemapTiledJSON("level1", "assets/Levels/level1.json");

        // Tiles
        this.load.image("terrain_grass_block", "assets/Sprites/Tiles/Default/terrain_grass_block.png");
        this.load.image("terrain_grass_block_top", "assets/Sprites/Tiles/Default/terrain_grass_block_top.png");
        this.load.image("terrain_grass_block_bottom", "assets/Sprites/Tiles/Default/terrain_grass_block_bottom.png");
        this.load.image("terrain_grass_block_top_left", "assets/Sprites/Tiles/Default/terrain_grass_block_top_left.png");
        this.load.image("terrain_grass_block_top_right", "assets/Sprites/Tiles/Default/terrain_grass_block_top_right.png");
        this.load.image("spikes", "assets/Sprites/Tiles/Default/spikes.png");
        this.load.image("bush", "assets/Sprites/Tiles/Default/bush.png");
        this.load.image("flag_red_a", "assets/Sprites/Tiles/Default/flag_red_a.png");
        this.load.image("flag_red_b", "assets/Sprites/Tiles/Default/flag_red_b.png");

        // Player (nếu chỉ 1 frame → dùng load.image)
        this.load.image("player_idle", "assets/Sprites/Characters/Default/character_beige_idle.png");
        this.load.image("player_walk_a", "assets/Sprites/Characters/Default/character_beige_walk_a.png");
        this.load.image("player_walk_b", "assets/Sprites/Characters/Default/character_beige_walk_b.png");
        this.load.image("player_jump", "assets/Sprites/Characters/Default/character_beige_jump.png");
        // Coin
        this.load.spritesheet("coins", "assets/Sprites/Tiles/Default/coin_gold.png",{
            frameWidth: 64,
            frameHeight: 64
        });


    }

    create() {
        const map = this.make.tilemap({ key: "level1" });

        // Tileset
        const tileset1 = map.addTilesetImage("terrain_grass_block", "terrain_grass_block")!;
        const tileset2 = map.addTilesetImage("terrain_grass_block_top", "terrain_grass_block_top")!;
        const tileset3 = map.addTilesetImage("terrain_grass_block_bottom", "terrain_grass_block_bottom")!;
        const tileset4 = map.addTilesetImage("terrain_grass_block_top_left", "terrain_grass_block_top_left")!;
        const tileset5 = map.addTilesetImage("terrain_grass_block_top_right", "terrain_grass_block_top_right")!;
        const tileset6 = map.addTilesetImage("spikes", "spikes")!;
        const tileset7 = map.addTilesetImage("bush", "bush")!;
        const tileset8 = map.addTilesetImage("flag_red_a", "flag_red_a")!;
        const tileset9 = map.addTilesetImage("flag_red_b", "flag_red_b")!;

        // Layer order
        map.createLayer("Background", [tileset7], 0, 0);

        const ground = map.createLayer("Ground", [tileset1, tileset2, tileset3, tileset4, tileset5], 0, 0)!;
        ground.setCollisionByExclusion([-1]);

        const hazard = map.createLayer("Hazard", [tileset6], 0, 0)!;
        hazard.setCollisionByExclusion([-1]);

        map.createLayer("Object", [tileset8, tileset9], 0, 0);

        // Player
        this.player = this.physics.add.sprite(100, 100, "player_idle");
        this.player.setCollideWorldBounds(true);
        this.player.setSize(80, 90);        // rộng 20, cao 30
        this.player.setOffset(23, 28);       // dịch hitbox sang phải 6px, xuống 18px

        this.anims.create({
            key: "idle",
            frames: [{ key: "player_idle", frame: 0 }],
            frameRate: 10
        });

        this.anims.create({
            key: "run",
            frames: [
                { key: "player_walk_a", frame: 0 },
                { key: "player_walk_b", frame: 0 },
            ],
            frameRate: 5,
            repeat: -1
        });
        this.anims.create({
            key: "jump",
            frames: [{ key: "player_jump", frame: 0 }],
            frameRate: 10,
        })

        // Coin anim
        this.anims.create({
            key: "coins_spin",
            frames: this.anims.generateFrameNumbers("coins", { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        // Tạo coins
        this.coins = this.physics.add.group({
            key: "coins",
            repeat: 10,
            setXY: { x: 128, y: 0, stepX: 192 }
        });

        this.coins.children.iterate((child: any) => {
            return child.play("coins_spin");
        });

        // Overlap player–coin
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
        // Colliders
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.coins, ground);
        this.physics.add.collider(this.player, hazard, this.playerDead, undefined, this);
        // Giới hạn world theo kích thước map
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        // Score
        this.scoreText = this.add.text(16, 16, "Score: 0", {
            fontSize: "32px",
            color: "#ffffff"
        }).setScrollFactor(0);   // cố định theo camera
        // Goal
        this.goal = this.physics.add.staticGroup();
        this.goal.create(this.tileWidth * 78, this.tileHeight * 17, "flag_red_a"); // bạn đặt toạ độ tuỳ ý
        this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);


    }

    update() {

        const speed = 300;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
            this.player.anims.play("run", true);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
            this.player.anims.play("run", true);
            this.player.setFlipX(false);
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play("idle", true);
        }

        const jumpForce = -420;
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(jumpForce);
            this.player.anims.play("jump", true);
        }
    }
    private collectCoin(player: any, coins: any) {
        coins.disableBody(true, true);
        this.score += 10;
        console.log("Score:", this.score);
        this.scoreText.setText("Score: " + this.score);

    }
    private playerDead() {
        this.scene.start("GameOverScene", {score: this.score});
    }
    private reachGoal(player: any, goal: any) {
        this.scene.start("EndGameScene", { score: this.score });
    }

}
