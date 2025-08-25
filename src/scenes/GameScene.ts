import Phaser from "phaser";

export default class GameScene extends Phaser.Scene {
    private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

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
        this.load.image("player", "assets/Sprites/Characters/Default/character_beige_idle.png");



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
        this.player = this.physics.add.sprite(100, 100, "player");
        this.player.setCollideWorldBounds(true);
        this.player.setSize(80, 90);        // rộng 20, cao 30
        this.player.setOffset(23, 28);       // dịch hitbox sang phải 6px, xuống 18px
        // Colliders
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.player, hazard, () => {
            this.scene.restart();
        });
        // Giới hạn world theo kích thước map
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();
        console.log("Tilesets:", map.tilesets.map(ts => ts.name));
        console.log("Layers:", map.layers.map(l => l.name));

    }

    update() {
        const speed = 300;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        const jumpForce = -420;
        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(jumpForce);
        }
    }
}
