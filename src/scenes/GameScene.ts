import Phaser from "phaser";
import Player from "../Player";
import Coin from "../Coin";
import HUD from "../HUD";

export default class GameScene extends Phaser.Scene {
    private player!: Player;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private coins!: Phaser.Physics.Arcade.Group;
    private goal!: Phaser.Physics.Arcade.StaticGroup;
    private hud!: HUD;   // HUD quản lý score
    // private tileHeight: number = 32;
    // private tileWidth: number = 32;

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
        this.load.image("flag_blue_a", "assets/Sprites/Tiles/Default/flag_blue_a.png");
        // Player assets
        this.load.image("player_idle", "assets/Sprites/Characters/Default/character_beige_idle.png");
        this.load.image("player_walk_a", "assets/Sprites/Characters/Default/character_beige_walk_a.png");
        this.load.image("player_walk_b", "assets/Sprites/Characters/Default/character_beige_walk_b.png");
        this.load.image("player_jump", "assets/Sprites/Characters/Default/character_beige_jump.png");

        // Coin spritesheet
        this.load.spritesheet("coins", "assets/Sprites/Tiles/Default/coin_gold.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }

    create() {
        const map = this.make.tilemap({ key: "level1" });
        const tileset1 = map.addTilesetImage("terrain_grass_block", "terrain_grass_block")!;
        const tileset2 = map.addTilesetImage("terrain_grass_block_top", "terrain_grass_block_top")!;
        const tileset3 = map.addTilesetImage("terrain_grass_block_bottom", "terrain_grass_block_bottom")!;
        const tileset4 = map.addTilesetImage("terrain_grass_block_top_left", "terrain_grass_block_top_left")!;
        const tileset5 = map.addTilesetImage("terrain_grass_block_top_right", "terrain_grass_block_top_right")!;
        const tileset6 = map.addTilesetImage("spikes", "spikes")!;
        const tileset7 = map.addTilesetImage("bush", "bush")!;
        const tileset8 = map.addTilesetImage("flag_red_a", "flag_red_a")!;
        const tileset9 = map.addTilesetImage("flag_red_b", "flag_red_b")!;
        const tileset10 = map.addTilesetImage("flag_blue_a", "flag_blue_a")!;

        map.createLayer("Background", [tileset7], 0, 0);
        const ground = map.createLayer("Ground", [tileset1,tileset2,tileset3,tileset4,tileset5], 0, 0)!;
        ground.setCollisionByExclusion([-1]);
        const hazard = map.createLayer("Hazard", [tileset6], 0, 0)!;
        hazard.setCollisionByExclusion([-1]);
        map.createLayer("Object", [tileset8, tileset9], 0, 0);

        // Spawn
        const spawnLayer = map.getObjectLayer("Spawn");
        if (spawnLayer && spawnLayer.objects.length > 0) {
            const spawn = spawnLayer.objects[0];
            this.player = new Player(this, spawn.x!, spawn.y! - spawn.height!);
        } else {
            this.player = new Player(this, 100, 100);
        }

        Player.createAnimations(this);

        // Coins
        Coin.createAnimations(this);
        this.coins = this.physics.add.group({
            classType: Coin,
            runChildUpdate: true
        });
        for (let i = 0; i < 10; i++) {
            this.coins.add(new Coin(this, 128 + i * 192, 0));
        }

        // HUD
        this.hud = new HUD(this);

        // Collisions
        this.physics.add.overlap(this.player, this.coins, (player, coin: any) => {
            coin.disableBody(true, true);
            this.hud.addScore(10);
        });
        this.physics.add.collider(this.player, ground);
        this.physics.add.collider(this.coins, ground);
        this.physics.add.collider(this.player, hazard, () => this.playerDead());

        // Camera
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Input
        this.cursors = this.input.keyboard!.createCursorKeys();


        // Goal
        const goalLayer = map.getObjectLayer("Goal");
        if (goalLayer) {
            this.goal = this.physics.add.staticGroup();

            goalLayer.objects.forEach(obj => {
                const goalSprite = this.goal.create(obj.x!, obj.y! - obj.height!, "flag_red_a");
                goalSprite.setOrigin(0, 0);
            });

            this.physics.add.overlap(this.player, this.goal, () => this.reachGoal());
        }

    }

    update() {
        this.player.update();
    }

    private playerDead() {
        this.scene.start("GameOverScene", { score: this.hud.getScore() });
    }

    private reachGoal() {
        this.scene.start("EndGameScene", { score: this.hud.getScore() });
    }
}
