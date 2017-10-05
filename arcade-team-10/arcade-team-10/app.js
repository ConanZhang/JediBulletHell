//   ▄██████▄     ▄████████   ▄▄▄▄███▄▄▄▄      ▄████████ 
//  ███    ███   ███    ███ ▄██▀▀▀███▀▀▀██▄   ███    ███ 
//  ███    █▀    ███    ███ ███   ███   ███   ███    █▀  
// ▄███          ███    ███ ███   ███   ███  ▄███▄▄▄     
//▀▀███ ████▄  ▀███████████ ███   ███   ███ ▀▀███▀▀▀     
//  ███    ███   ███    ███ ███   ███   ███   ███    █▄  
//  ███    ███   ███    ███ ███   ███   ███   ███    ███ 
//  ████████▀    ███    █▀   ▀█   ███   █▀    ██████████ 
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window.onload = function () {
    //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
    //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
    //  Be sure to replace it with an updated version before you start experimenting with adding your own code.
    var game = new Phaser.Game(1920, 1080, Phaser.AUTO, '', { preload: preload, create: create, update: update });
    var keyState;
    var player;
    var enemies;
    //let walls: Phaser.Group;
    var bossRoom;
    var background;
    var lives;
    var healthDrops;
    var hud;
    var bossHud;
    var pClearCircle;
    var map;
    var layer;
    var laserGate1;
    var laserGate2;
    var laserGate3;
    var laserGate4;
    var boss;
    var healthBar;
    var healthBarCrop;
    var bossHealthText;
    var enemyKillCount;
    var music;
    function preload() {
        game.stage.backgroundColor = '#eee';
        game.load.spritesheet('pSprite', 'assets/PlayerSpritesheet.png', 156, 128, 54, 0, 2);
        game.load.image('bulletGreen', 'assets/BulletGreen.png');
        game.load.image('bulletRed', 'assets/BulletRed.png');
        game.load.image('bulletBlue', 'assets/BulletBlue.png');
        game.load.image('laser', 'assets/Laser.png');
        game.load.tilemap('map', 'assets/BossRoom.csv', null, Phaser.Tilemap.CSV);
        game.load.image('background', 'assets/BossRoom.png');
        game.load.image('heart', 'assets/Heart.png');
        game.load.spritesheet('laserH', 'assets/LaserH.png', 256, 64, 6, 0, 0);
        game.load.spritesheet('BossLaserH', 'assets/longLaser.png', 1536, 64, 6, 0, 0);
        game.load.spritesheet('eSprite', 'assets/EnemySpriteSheet.png', 32, 53, 4, 0, 2);
        game.load.image('boss', 'assets/Boss.png');
        game.load.image('bossHealth', 'assets/BossHealth.png');
        game.load.image('bossHealthBG', 'assets/BossHealthBG.png');
        game.load.audio('music', 'assets/audio/Ricochet.mp3');
        game.load.audio('slash', 'assets/audio/Slash.wav');
        game.load.audio('laserOn', 'assets/audio/LaserOn.wav');
        game.load.audio('laserOff', 'assets/audio/LaserOff.wav');
        game.load.audio('enemyDeath', 'assets/audio/EnemyDeath.wav');
    }
    function create() {
        music = game.add.audio('music', 1, true);
        music.play();
        fullScreen();
        game.physics.startSystem(Phaser.Physics.ARCADE);
        background = game.add.sprite(0, 0, 'background');
        map = game.add.tilemap('map', 64, 64);
        layer = map.createLayer(0);
        layer.alpha = 0;
        layer.resizeWorld();
        map.setCollision(0, true, layer);
        //layer.debug = true;
        bossRoom = new Room(0, 0, 1920, 1480, game);
        player = new Player(1000, 2000, game);
        game.add.existing(player);
        game.world.setBounds(0, 0, 1920, 2432);
        game.camera.follow(player);
        game.renderer.renderSession.roundPixels = true;
        healthDrops = game.add.group();
        healthDrops.enableBody = true;
        healthDrops.physicsBodyType = Phaser.Physics.ARCADE;
        for (var i = 0; i < 3; i++) {
            healthDrops.add(new Phaser.Sprite(game, -1, -1, 'heart'));
            healthDrops.children[i].scale.setTo(1.5, 1.5);
            healthDrops.children[i].kill();
        }
        enemies = game.add.group();
        enemies.enableBody = true;
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        createEnemies();
        boss = new Boss(960, 225, player, game);
        pClearCircle = game.add.sprite(player.body.position.x, player.body.position.y);
        pClearCircle.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(pClearCircle);
        pClearCircle.body.setCircle(player.body.width * 4);
        pClearCircle.body.immovable = true;
        pClearCircle.kill();
        laserGate1 = new Barrier(832, 1410, 1, 1, "laserH", game);
        laserGate2 = new Barrier(832, 1475, 1, 1, "laserH", game);
        laserGate3 = new Barrier(832, 1540, 1, 1, "laserH", game);
        laserGate4 = new Barrier(192, 350, 1, 1, "BossLaserH", game);
        laserGate4.activate();
        hud = game.add.group();
        hud.fixedToCamera = true;
        hud.enableBody = false;
        for (var i = 0; i < player.maxHealth; i++) {
            hud.add(new Phaser.Sprite(game, 0, 0, 'heart'));
            hud.children[i].scale.setTo(1.5, 1.5);
            hud.children[i].position.set((hud.children[i].width * i + (i * 10)) + (hud.children[i].width / 2), hud.children[i].height / 2);
        }
        bossHud = game.add.group();
        bossHud.fixedToCamera = true;
        bossHud.enableBody = false;
        bossHud.add(new Phaser.Sprite(game, 0, 0, "bossHealthBG"));
        bossHud.children[0].scale.setTo(6.5, 2);
        bossHud.children[0].position.set(game.camera.width / 4, game.camera.height / 1.2, 5);
        bossHud.children[0].alpha = 0;
        bossHud.add(new Phaser.Sprite(game, 0, 0, "bossHealth"));
        bossHud.children[1].scale.setTo(6.5, 2);
        bossHud.children[1].position.set(game.camera.width / 4, game.camera.height / 1.2, 5);
        bossHud.children[1].alpha = 0;
        var style = { font: "bold 32px Arial", fill: '#fff', align: "right", boundsAlignH: "right" };
        bossHealthText = game.add.text(game.camera.width / 3.3, game.camera.height / 1.25, 'D3AD M30W', style);
        bossHealthText.setTextBounds(0, 0, 100, 100);
        bossHealthText.fixedToCamera = true;
        bossHealthText.alpha = 0;
        enemyKillCount = 0;
    }
    function update() {
        var deltaTime = game.time.elapsed / 10;
        keyState = game.input.keyboard;
        player.pUpdate(deltaTime, keyState);
        enemies.forEach(function (enemy) {
            enemy.eUpdate(deltaTime);
        }, this);
        game.physics.arcade.collide(player, layer);
        game.physics.arcade.collide(enemies, layer);
        game.physics.arcade.collide(enemies, laserGate1);
        game.physics.arcade.collide(enemies, laserGate4);
        game.physics.arcade.overlap(player, bossRoom, activateBossRoom);
        //game.physics.arcade.collide(player, walls);
        //game.physics.arcade.collide(enemies, walls);
        game.physics.arcade.overlap(player, healthDrops, pickupHealth);
        game.physics.arcade.collide(player.weapon.bullets, layer, killBullet);
        //game.physics.arcade.collide(player.weapon.bullets, walls, killBullet);
        game.physics.arcade.overlap(player, enemies, enemyHitPlayer);
        game.physics.arcade.collide(player, boss);
        game.physics.arcade.collide(enemies, enemies);
        game.physics.arcade.overlap(player.weapon.bullets, enemies, bulletHitEnemy, null, this);
        for (var i = 0; i < enemies.children.length; i++) {
            if (player.canDamage) {
                game.physics.arcade.overlap(enemies.children[i].weapon.bullets, player, bulletHitPlayer, null, this);
            }
            game.physics.arcade.collide(enemies.children[i].weapon.bullets, layer, killBullet);
            game.physics.arcade.overlap(enemies.children[i].weapon.bullets, pClearCircle, clearBullet);
            if (laserGate1.isActivated) {
                game.physics.arcade.collide(enemies.children[i].weapon.bullets, laserGate1, killBulletGate);
            }
            if (laserGate4.isActivated) {
                game.physics.arcade.collide(enemies.children[i].weapon.bullets, laserGate4, killBulletGate);
            }
            if (player.alive) {
                for (var j = 0; j < player.saberHitBoxes.children.length; j++) {
                    if (enemies.children[i].eType != 3) {
                        game.physics.arcade.overlap(player.saberHitBoxes.children[j], enemies.children[i].weapon.bullets, bulletHitSaber, null, this);
                    }
                    game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss, saberHitBoss, null, this);
                    if (boss.bossStage == boss.bossStageEnum.STAGE_2) {
                        game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.headsetL.bullets, bulletHitSaber);
                        game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.headsetR.bullets, bulletHitSaber);
                        game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.speakerL.bullets, bulletHitSaber);
                        game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.speakerR.bullets, bulletHitSaber);
                    }
                }
            }
        }
        for (var j = 0; j < player.saberHitBoxes.children.length; j++) {
            game.physics.arcade.overlap(player.saberHitBoxes.children[j], enemies, saberHitEnemy, null, this);
        }
        if (laserGate1.isActivated) {
            game.physics.arcade.collide(player, laserGate1);
        }
        else {
            game.physics.arcade.overlap(player, laserGate1, activateGate, null, this);
        }
        if (laserGate2.isActivated) {
            game.physics.arcade.collide(player, laserGate2);
        }
        else {
            game.physics.arcade.overlap(player, laserGate2, activateGate, null, this);
        }
        if (laserGate3.isActivated) {
            game.physics.arcade.collide(player, laserGate3);
        }
        else {
            game.physics.arcade.overlap(player, laserGate3, activateGate, null, this);
        }
        if (laserGate4.isActivated) {
            game.physics.arcade.collide(player, laserGate4);
        }
        laserGate1.update();
        laserGate2.update();
        laserGate3.update();
        laserGate4.update();
        if (boss.bossStage == boss.bossStageEnum.STAGE_1) {
            if (enemyKillCount >= 8) {
                boss.bossStage = boss.bossStageEnum.STAGE_2;
                boss.canDamage = true;
                boss.fireTimerSL = game.time.now + game.rnd.integerInRange(2000, 4000);
                boss.fireTimerSR = game.time.now + game.rnd.integerInRange(2500, 4500);
                boss.fireTimerCH = game.time.now + game.rnd.integerInRange(10000, 15000);
                laserGate4.deactivate();
            }
        }
        else if (boss.bossStage == boss.bossStageEnum.STAGE_2) {
            if (boss.health <= 70) {
                boss.bossStage = boss.bossStageEnum.STAGE_3;
                boss.canDamage = false;
                laserGate4.activate();
            }
            game.physics.arcade.collide(boss.headsetL.bullets, layer, killBullet);
            game.physics.arcade.collide(boss.headsetR.bullets, layer, killBullet);
            game.physics.arcade.collide(boss.speakerL.bullets, layer, killBullet);
            game.physics.arcade.collide(boss.speakerR.bullets, layer, killBullet);
            game.physics.arcade.overlap(boss.headsetL.bullets, player, bulletHitPlayer);
            game.physics.arcade.overlap(boss.headsetR.bullets, player, bulletHitPlayer);
            game.physics.arcade.overlap(boss.speakerL.bullets, player, bulletHitPlayer);
            game.physics.arcade.overlap(boss.speakerR.bullets, player, bulletHitPlayer);
            game.physics.arcade.overlap(player.weapon.bullets, boss, bulletHitBoss);
        }
        boss.update();
        //render();
    }
    function render() {
        //if (pClearCircle.alive)
        //{
        //	game.debug.bodyInfo(pClearCircle, 32, 32);
        //	game.debug.body(pClearCircle);
        //}
        game.debug.bodyInfo(player, 32, 32);
        game.debug.body(player);
        //for (var i = 0; i < enemies.children.length; i++)
        //{
        //	game.debug.bodyInfo(enemies.children[i], 32, 32);
        //	game.debug.body(enemies.children[i]);
        //}
    }
    function fullScreen() {
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.setGameSize(1920, 1080);
    }
    // -------------------------------------------------------------------------------------------- Enemy Gets Hit
    function saberHitEnemy(saber, enemy) {
        enemy.kill();
        enemyKillCount++;
        dropHealth(enemy.position.x, enemy.position.y);
    }
    function bulletHitEnemy(enemy, bullet) {
        bullet.kill();
        enemy.kill();
        enemyKillCount++;
        dropHealth(enemy.position.x, enemy.position.y);
    }
    // -------------------------------------------------------------------------------------------- Stuff Hits Player
    function bulletHitPlayer(player, bullet) {
        bullet.kill();
        damagePlayer(player, 1);
    }
    function bossHitPlayer(player, boss) {
        damagePlayer(player, 1);
    }
    function enemyHitPlayer(player, enemy) {
        damagePlayer(player, 1);
    }
    function bulletHitSaber(saber, bullet) {
        bullet.body.velocity.x = -bullet.body.velocity.x;
        bullet.body.velocity.y = -bullet.body.velocity.y;
        player.weapon.bullets.add(bullet);
        bullet.rotation += Math.PI;
    }
    // -------------------------------------------------------------------------------------------- Gate
    function activateGate(player, laserGate) {
        if (player.body.position.y < laserGate.position.y) {
            laserGate.activate();
        }
    }
    // -------------------------------------------------------------------------------------------- Player Damage
    function damagePlayer(player, dNum) {
        if (player.canDamage) {
            player.damage(dNum);
            hud.children[player.health].visible = false;
            if (player.health != 0) {
                playerInvuln();
                playerVisible();
                game.time.events.repeat(200, 3, playerVisible, this);
                game.time.events.add(1000, playerInvuln, this);
            }
            playerClear();
        }
    }
    function playerVisible() {
        player.alpha = (player.alpha + 1) % 2;
    }
    function playerInvuln() {
        player.canDamage = !player.canDamage;
    }
    // -------------------------------------------------------------------------------------------- Boss Stuff
    function activateBossRoom(player, room) {
        if (!bossRoom.active) {
            bossRoom.active = true;
            bossHud.children[0].alpha = 1;
            bossHud.children[1].alpha = 1;
            bossHealthText.alpha = 1;
            boss.bossStage = boss.bossStageEnum.STAGE_1;
        }
    }
    function bulletHitBoss(boss, bullet) {
        bullet.kill();
        boss.damage(1);
        bossHud.children[1].scale.setTo(6.5 * (boss.health / boss.maxHealth), 2);
        console.log(boss.health);
        if (boss.health != 0) {
            bossInvuln();
            game.time.events.add(100, bossInvuln, this);
        }
    }
    function saberHitBoss(saber, temp) {
        if (boss.canDamage) {
            boss.damage(1);
            bossHud.children[1].scale.setTo(6.5 * (boss.health / boss.maxHealth), 2);
            console.log(boss.health);
            if (boss.health != 0) {
                bossInvuln();
                game.time.events.add(300, bossInvuln, this);
            }
        }
    }
    function bossInvuln() {
        boss.canDamage = !boss.canDamage;
    }
    // -------------------------------------------------------------------------------------------- Player Clear When Hit
    function playerClear() {
        pClearCircle.revive();
        pClearCircle.position.x = player.body.position.x - (player.body.width * 4);
        pClearCircle.position.y = player.body.position.y - (player.body.width * 4);
        game.time.events.add(2000, endClear, this);
    }
    function endClear() {
        pClearCircle.kill();
    }
    // -------------------------------------------------------------------------------------------- Bullet Stuff
    function killBullet(bullet, other) {
        bullet.kill();
    }
    function clearBullet(bullet, clear) {
        clear.kill();
    }
    function killBulletGate(bullet, layer) {
        layer.kill();
    }
    // -------------------------------------------------------------------------------------------- Player Health Stuff
    function dropHealth(x, y) {
        var rand = game.rnd.integerInRange(1, 100);
        if (rand > 97) {
            for (var i = 0; i < 3; i++) {
                if (healthDrops.children[i].alive == false) {
                    healthDrops.children[i].revive();
                    healthDrops.children[i].position.x = x;
                    healthDrops.children[i].position.y = y;
                    break;
                }
            }
        }
    }
    function healPlayer(player, hNum) {
        hud.children[player.health].visible = true;
        player.heal(hNum);
    }
    function pickupHealth(player, healthDrop) {
        if (player.health != player.maxHealth) {
            healPlayer(player, 1);
            healthDrop.kill();
        }
    }
    function increaseHealth(player) {
        player.maxHealth += 1;
        player.heal(1);
        hud.add(new Phaser.Sprite(game, (hud.children[0].width * (player.maxHealth - 1)) + (hud.children[0].width / 2), hud.children[0].height / 2, 'heart'));
    }
    // -------------------------------------------------------------------------------------------- Kill Player
    function killPlayer(player) {
        var life = lives.getFirstAlive();
        if (life) {
            life.kill();
            player.kill();
            player.lives--;
            player.reset(300, 300, 1);
        }
        if (player.lives < 1) {
            player.kill();
        }
    }
    //   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄           ▄████████    ▄███████▄    ▄████████  ▄█     █▄  ███▄▄▄▄        
    //  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄        ███    ███   ███    ███   ███    ███ ███     ███ ███▀▀▀██▄      
    //  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███        ███    █▀    ███    ███   ███    ███ ███     ███ ███   ███      
    // ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███        ███          ███    ███   ███    ███ ███     ███ ███   ███      
    //▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ▀███████████ ▀█████████▀  ▀███████████ ███     ███ ███   ███      
    //  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███               ███   ███          ███    ███ ███     ███ ███   ███      
    //  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███         ▄█    ███   ███          ███    ███ ███ ▄█▄ ███ ███   ███      
    //  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀        ▄████████▀   ▄████▀        ███    █▀   ▀███▀███▀   ▀█   █▀                                                                                                                                   
    function createEnemies() {
        var enemy1 = new Enemy(700, 700, 0, player, bossRoom, game);
        enemies.add(enemy1);
        var enemy2 = new Enemy(1000, 700, 0, player, bossRoom, game);
        enemies.add(enemy2);
        var enemy3 = new Enemy(1300, 700, 0, player, bossRoom, game);
        enemies.add(enemy3);
        var enemy4 = new Enemy(800, 600, 1, player, bossRoom, game);
        enemies.add(enemy4);
        var enemy5 = new Enemy(600, 800, 2, player, bossRoom, game);
        enemies.add(enemy5);
        var enemy6 = new Enemy(1400, 800, 2, player, bossRoom, game);
        enemies.add(enemy6);
        var enemy7 = new Enemy(1000, 500, 3, player, bossRoom, game);
        enemies.add(enemy7);
        var enemy8 = new Enemy(1200, 600, 1, player, bossRoom, game);
        enemies.add(enemy8);
    }
};
//▀█████████▄     ▄████████    ▄████████    ▄████████  ▄█     ▄████████    ▄████████ 
//  ███    ███   ███    ███   ███    ███   ███    ███ ███    ███    ███   ███    ███ 
//  ███    ███   ███    ███   ███    ███   ███    ███ ███▌   ███    █▀    ███    ███ 
// ▄███▄▄▄██▀    ███    ███  ▄███▄▄▄▄██▀  ▄███▄▄▄▄██▀ ███▌  ▄███▄▄▄      ▄███▄▄▄▄██▀ 
//▀▀███▀▀▀██▄  ▀███████████ ▀▀███▀▀▀▀▀   ▀▀███▀▀▀▀▀   ███▌ ▀▀███▀▀▀     ▀▀███▀▀▀▀▀   
//  ███    ██▄   ███    ███ ▀███████████ ▀███████████ ███    ███    █▄  ▀███████████ 
//  ███    ███   ███    ███   ███    ███   ███    ███ ███    ███    ███   ███    ███ 
//▄█████████▀    ███    █▀    ███    ███   ███    ███ █▀     ██████████   ███    ███ 
//                            ███    ███   ███    ███                     ███    ███ 
var Barrier = (function (_super) {
    __extends(Barrier, _super);
    function Barrier(xPos, yPos, width, height, key, game) {
        var _this = _super.call(this, game, xPos, yPos, key) || this;
        game.physics.arcade.enable(_this);
        _this.body.immovable = true;
        _this.scale.setTo(width, height);
        game.add.existing(_this);
        _this.isActivated = false;
        _this.frame = 1;
        _this.off = _this.animations.add('off', [5], 15, true);
        _this.switch = _this.animations.add('switch', [1, 2, 3, 4], 15, false);
        _this.on = _this.animations.add('on', [1, 2], 15, true);
        _this.play("off");
        _this.laserOn = _this.game.add.audio('laserOn');
        _this.laserOff = _this.game.add.audio('laserOff');
        return _this;
    }
    Barrier.prototype.activate = function () {
        this.isActivated = true;
        this.play("switch");
        this.laserOn.play();
    };
    Barrier.prototype.deactivate = function () {
        this.isActivated = false;
        this.play("switch");
        this.laserOff.play();
    };
    Barrier.prototype.update = function () {
        if (this.isActivated) {
            if (this.animations.currentAnim.isFinished) {
                this.play("on");
            }
        }
        else if (!this.isActivated) {
            if (this.animations.currentAnim.isFinished) {
                this.play("off");
            }
        }
    };
    return Barrier;
}(Phaser.Sprite));
//   ▄████████  ▄██████▄   ▄██████▄    ▄▄▄▄███▄▄▄▄   
//  ███    ███ ███    ███ ███    ███ ▄██▀▀▀███▀▀▀██▄ 
//  ███    ███ ███    ███ ███    ███ ███   ███   ███ 
// ▄███▄▄▄▄██▀ ███    ███ ███    ███ ███   ███   ███ 
//▀▀███▀▀▀▀▀   ███    ███ ███    ███ ███   ███   ███ 
//▀███████████ ███    ███ ███    ███ ███   ███   ███ 
//  ███    ███ ███    ███ ███    ███ ███   ███   ███ 
//  ███    ███  ▀██████▀   ▀██████▀   ▀█   ███   █▀  
//  ███    ███                                       
var Room = (function (_super) {
    __extends(Room, _super);
    function Room(x, y, width, height, game) {
        var _this = _super.call(this, game, x, y) || this;
        _this.game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.body.setSize(width, height);
        _this.active = false;
        return _this;
    }
    return Room;
}(Phaser.Sprite));
//▀█████████▄   ▄██████▄     ▄████████    ▄████████ 
//  ███    ███ ███    ███   ███    ███   ███    ███ 
//  ███    ███ ███    ███   ███    █▀    ███    █▀  
// ▄███▄▄▄██▀  ███    ███   ███          ███        
//▀▀███▀▀▀██▄  ███    ███ ▀███████████ ▀███████████ 
//  ███    ██▄ ███    ███          ███          ███ 
//  ███    ███ ███    ███    ▄█    ███    ▄█    ███ 
//▄█████████▀   ▀██████▀   ▄████████▀   ▄████████▀  
var Boss = (function (_super) {
    __extends(Boss, _super);
    function Boss(xPos, yPos, player, game) {
        var _this = _super.call(this, game, xPos, yPos, "boss") || this;
        _this.bossStageEnum = {
            STAGE_0: 0,
            STAGE_1: 1,
            STAGE_2: 2,
            STAGE_3: 3,
            STAGE_4: 4
        };
        _this.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(_this);
        _this.body.immovable = true;
        _this.body.height = _this.body.height * 0.9;
        _this.scale.setTo(2, 2);
        _this.bossStage = _this.bossStageEnum.STAGE_0;
        _this.maxHealth = 100;
        _this.health = 100;
        _this.canDamage = false;
        _this.player = player;
        game.add.existing(_this);
        _this.headsetL = game.add.weapon(100, 'bulletBlue');
        _this.headsetR = game.add.weapon(100, 'bulletBlue');
        _this.speakerL = game.add.weapon(100, 'bulletRed');
        _this.speakerML = game.add.weapon(100, 'bulletGreen');
        _this.speakerMR = game.add.weapon(100, 'bulletGreen');
        _this.speakerR = game.add.weapon(100, 'bulletRed');
        _this.headsetL.bullets.forEach(function (b) { b.scale.setTo(1.5, 1.5); }, _this);
        _this.headsetR.bullets.forEach(function (b) { b.scale.setTo(1.5, 1.5); }, _this);
        _this.speakerL.bullets.forEach(function (b) { b.scale.setTo(2, 2); }, _this);
        _this.speakerML.bullets.forEach(function (b) { b.scale.setTo(2, 2); }, _this);
        _this.speakerMR.bullets.forEach(function (b) { b.scale.setTo(2, 2); }, _this);
        _this.speakerR.bullets.forEach(function (b) { b.scale.setTo(2, 2); }, _this);
        _this.headsetL.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.headsetL.bulletSpeed = 300;
        _this.headsetL.fireRate = 0;
        _this.headsetL.bulletAngleOffset = 90;
        _this.headsetL.bulletAngleVariance = 3;
        _this.headsetL.x = 940;
        _this.headsetL.y = 120;
        _this.fireTimerHL = 0;
        _this.aimHL = false;
        _this.headsetR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.headsetR.bulletSpeed = 300;
        _this.headsetR.fireRate = 0;
        _this.headsetR.bulletAngleOffset = 90;
        _this.headsetR.bulletAngleVariance = 3;
        _this.headsetR.x = 980;
        _this.headsetR.y = 120;
        _this.fireTimerHR = 0;
        _this.aimHR = false;
        _this.speakerL.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.speakerL.bulletSpeed = 300;
        _this.speakerL.fireRate = 0;
        _this.speakerL.bulletAngleOffset = 90;
        _this.speakerL.x = 740;
        _this.speakerL.y = 240;
        _this.fireTimerSL = 0;
        _this.aimSL = false;
        _this.speakerML.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.speakerML.bulletSpeed = 300;
        _this.speakerML.fireRate = 0;
        _this.speakerML.bulletAngleOffset = 90;
        _this.speakerML.x = 830;
        _this.speakerML.y = 224;
        _this.fireTimerSML = 0;
        _this.aimSML = false;
        _this.speakerMR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.speakerMR.bulletSpeed = 300;
        _this.speakerMR.fireRate = 0;
        _this.speakerMR.bulletAngleOffset = 90;
        _this.speakerMR.x = 1090;
        _this.speakerMR.y = 224;
        _this.fireTimerSMR = 0;
        _this.aimSMR = false;
        _this.speakerR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.speakerR.bulletSpeed = 300;
        _this.speakerR.fireRate = 0;
        _this.speakerR.bulletAngleOffset = 90;
        _this.speakerR.x = 1180;
        _this.speakerR.y = 240;
        _this.fireTimerSR = 0;
        _this.aimSR = false;
        _this.isCrosshatch = false;
        _this.crosshatchFired = false;
        _this.alternateCHL = false;
        _this.alternateCHR = false;
        _this.fireTimerCH = 0;
        _this.prediction = new Phaser.Rectangle(0, 0, player.body.width, player.body.height);
        return _this;
    }
    Boss.prototype.update = function () {
        if (this.bossStage == this.bossStageEnum.STAGE_2) {
            if (this.game.time.now > this.fireTimerHL) {
                this.fireTimerHL = this.game.time.now + this.game.rnd.integerInRange(300, 750);
                this.aimHL = true;
            }
            if (this.game.time.now > this.fireTimerHR) {
                this.fireTimerHR = this.game.time.now + this.game.rnd.integerInRange(250, 1000);
                this.aimHR = true;
            }
            if (this.game.time.now > this.fireTimerSL) {
                this.fireTimerSL = this.game.time.now + this.game.rnd.integerInRange(1500, 3500);
                this.aimSL = true;
            }
            if (this.game.time.now > this.fireTimerSR) {
                this.fireTimerSR = this.game.time.now + this.game.rnd.integerInRange(1450, 3350);
                this.aimSR = true;
            }
            if (this.game.time.now > this.fireTimerCH && !this.isCrosshatch) {
                this.isCrosshatch = true;
            }
            if (!this.isCrosshatch) {
                if (this.aimHL) {
                    this.prediction.x = this.player.body.position.x + (this.player.body.velocity.x * 0.5);
                    this.prediction.y = this.player.body.position.y + (this.player.body.velocity.y * 0.5);
                    this.headsetL.fireAngle = this.game.physics.arcade.angleBetween(this.headsetL.fireFrom, this.prediction) * 57.2958;
                    this.headsetL.fire();
                    this.aimHL = false;
                }
                if (this.aimHR) {
                    this.prediction.x = this.player.body.position.x + (this.player.body.velocity.x * 0.5);
                    this.prediction.y = this.player.body.position.y + (this.player.body.velocity.y * 0.5);
                    this.headsetR.fireAngle = this.game.physics.arcade.angleBetween(this.headsetR.fireFrom, this.prediction) * 57.2958;
                    this.headsetR.fire();
                    this.aimHR = false;
                }
                if (this.aimSL) {
                    this.speakerL.fireAngle = 165;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                    this.speakerL.fire();
                    this.game.time.events.add(750, this.bSecondShotL, this);
                    this.aimSL = false;
                }
                if (this.aimSR) {
                    this.speakerR.fireAngle = 165;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                    this.speakerR.fire();
                    this.game.time.events.add(750, this.bSecondShotR, this);
                    this.aimSR = false;
                }
            }
            else {
                this.aimHL = false;
                this.aimHR = false;
                this.aimSL = false;
                this.aimSR = false;
                if (!this.crosshatchFired) {
                    this.game.time.events.add(2000, this.bSecondShotL, this);
                    this.game.time.events.add(2000, this.bSecondShotR, this);
                    this.game.time.events.add(2500, this.bSecondShotL, this);
                    this.game.time.events.add(2500, this.bSecondShotR, this);
                    this.game.time.events.add(3000, this.bSecondShotL, this);
                    this.game.time.events.add(3000, this.bSecondShotR, this);
                    this.game.time.events.add(3500, this.bSecondShotL, this);
                    this.game.time.events.add(3500, this.bSecondShotR, this);
                    this.game.time.events.add(4000, this.bSecondShotL, this);
                    this.game.time.events.add(4000, this.bSecondShotR, this);
                    this.game.time.events.add(4500, this.bSecondShotL, this);
                    this.game.time.events.add(4500, this.bSecondShotR, this);
                    this.game.time.events.add(5000, this.bSecondShotL, this);
                    this.game.time.events.add(5000, this.bSecondShotR, this);
                    this.game.time.events.add(5500, this.bSecondShotL, this);
                    this.game.time.events.add(5500, this.bSecondShotR, this);
                    this.game.time.events.add(6000, this.bSecondShotL, this);
                    this.game.time.events.add(6000, this.bSecondShotR, this);
                    this.game.time.events.add(6500, this.bSecondShotL, this);
                    this.game.time.events.add(6500, this.bSecondShotR, this);
                    this.game.time.events.add(7000, this.bSecondShotL, this);
                    this.game.time.events.add(7000, this.bSecondShotR, this);
                    this.game.time.events.add(7500, this.bSecondShotL, this);
                    this.game.time.events.add(7500, this.bSecondShotR, this);
                    this.game.time.events.add(8000, this.bSecondShotL, this);
                    this.game.time.events.add(8000, this.bSecondShotR, this);
                    this.game.time.events.add(8500, this.bSecondShotL, this);
                    this.game.time.events.add(8500, this.bSecondShotR, this);
                    this.game.time.events.add(11000, this.bEndCrosshatch, this);
                    this.crosshatchFired = true;
                }
            }
        }
    };
    Boss.prototype.bSecondShotL = function () {
        if (this.bossStage != this.bossStageEnum.STAGE_3) {
            if (this.aimSL) {
                this.speakerL.fireAngle = 172;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
            }
            else {
                if (!this.alternateCHL) {
                    this.speakerL.fireAngle = 165;
                    this.alternateCHL = true;
                }
                else {
                    this.speakerL.fireAngle = 172;
                    this.alternateCHL = false;
                    this.speakerL.fire();
                    this.speakerL.fireAngle -= 15;
                }
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
                this.speakerL.fireAngle -= 15;
                this.speakerL.fire();
            }
        }
    };
    Boss.prototype.bSecondShotR = function () {
        if (this.bossStage != this.bossStageEnum.STAGE_3) {
            if (this.aimSR) {
                this.speakerR.fireAngle = 172;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
            }
            else {
                if (!this.alternateCHR) {
                    this.speakerR.fireAngle = 165;
                    this.alternateCHR = true;
                }
                else {
                    this.speakerR.fireAngle = 172;
                    this.alternateCHR = false;
                    this.speakerR.fire();
                    this.speakerR.fireAngle -= 15;
                }
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
                this.speakerR.fireAngle -= 15;
                this.speakerR.fire();
            }
        }
    };
    Boss.prototype.bEndCrosshatch = function () {
        this.isCrosshatch = false;
        this.crosshatchFired = false;
        this.fireTimerCH = this.game.time.now + this.game.rnd.integerInRange(10000, 15000);
    };
    return Boss;
}(Phaser.Sprite));
//   ▄███████▄  ▄█          ▄████████ ▄██   ▄      ▄████████    ▄████████ 
//  ███    ███ ███         ███    ███ ███   ██▄   ███    ███   ███    ███ 
//  ███    ███ ███         ███    ███ ███▄▄▄███   ███    █▀    ███    ███ 
//  ███    ███ ███         ███    ███ ▀▀▀▀▀▀███  ▄███▄▄▄      ▄███▄▄▄▄██▀ 
//▀█████████▀  ███       ▀███████████ ▄██   ███ ▀▀███▀▀▀     ▀▀███▀▀▀▀▀   
//  ███        ███         ███    ███ ███   ███   ███    █▄  ▀███████████ 
//  ███        ███▌    ▄   ███    ███ ███   ███   ███    ███   ███    ███ 
// ▄████▀      █████▄▄██   ███    █▀   ▀█████▀    ██████████   ███    ███ 
//             ▀                                               ███    ███ 
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(xPos, yPos, game) {
        var _this = _super.call(this, game, xPos, yPos, 'pSprite') || this;
        _this.pDirEnum = {
            RIGHT: 0,
            LEFT: 1,
            UPRIGHT: 2,
            UPLEFT: 3,
            DOWN: 4,
            UP: 5,
            DOWNRIGHT: 6,
            DOWNLEFT: 7
        };
        _this.rAttack = _this.animations.add('rAttack', [6, 7, 8, 9, 10, 11], 25);
        _this.lAttack = _this.animations.add('lAttack', [12, 13, 14, 15, 16, 17], 25);
        _this.uAttack = _this.animations.add('uAttack', [18, 19, 20, 21, 22, 23], 25);
        _this.dAttack = _this.animations.add('dAttack', [24, 25, 26, 27, 28, 29], 25);
        _this.urAttack = _this.animations.add('urAttack', [30, 31, 32, 33, 34, 35], 25);
        _this.ulAttack = _this.animations.add('ulAttack', [36, 37, 38, 39, 40, 41], 25);
        _this.drAttack = _this.animations.add('drAttack', [42, 43, 44, 45, 46, 47], 25);
        _this.dlAttack = _this.animations.add('dlAttack', [48, 49, 50, 51, 52, 53], 25);
        _this.attacked = false;
        _this.frame = _this.pDirEnum.RIGHT;
        _this.newPFrame = _this.frame;
        _this.smoothed = false;
        _this.exists = true;
        _this.anchor.setTo(0.5, 0.5);
        _this.scale.setTo(2.25, 2.25);
        _this.game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.body.setSize(18, 28, 51, 57);
        _this.body.collideWorldBounds = true;
        _this.maxHealth = 5;
        _this.health = _this.maxHealth;
        _this.canDamage = true;
        _this.aim = false;
        _this.pVelocityX = 0;
        _this.pVelocityY = 0;
        _this.pSpeed = 250;
        _this.weapon = game.add.weapon();
        _this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.weapon.bulletSpeed = 350;
        _this.weapon.autofire = false;
        _this.weapon.bulletAngleOffset = 90;
        _this.lives = 1;
        _this.createSaberHitBoxes();
        _this.slash = _this.game.add.audio('slash');
        _this.slash.allowMultiple = true;
        return _this;
    }
    Player.prototype.createSaberHitBoxes = function () {
        this.saberHitBoxes = this.game.add.physicsGroup();
        this.addChild(this.saberHitBoxes);
        this.rightSaber = this.game.add.sprite(10, 0);
        this.rightSaber.anchor.setTo(0.5, 0.5);
        this.rightSaber.scale.setTo(1.1, 1.8);
        this.game.physics.enable(this.rightSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.rightSaber);
        this.rightSaber.name = "rightSaber";
        this.disableHitbox("rightSaber");
        this.leftSaber = this.game.add.sprite(-45, 0);
        this.leftSaber.anchor.setTo(0.5, 0.5);
        this.leftSaber.scale.setTo(1.1, 1.8);
        this.game.physics.enable(this.leftSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.leftSaber);
        this.leftSaber.name = "leftSaber";
        this.disableHitbox("leftSaber");
        this.topSaber = this.game.add.sprite(-18, -23);
        this.topSaber.anchor.setTo(0.5, 0.5);
        this.topSaber.scale.setTo(2, 0.9);
        this.game.physics.enable(this.topSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.topSaber);
        this.topSaber.name = "topSaber";
        this.disableHitbox("topSaber");
        this.topRightSaber = this.game.add.sprite(3, -12);
        this.topRightSaber.anchor.setTo(0.5, 0.5);
        this.topRightSaber.scale.setTo(2.2, 0.9);
        this.topRightSaber.rotation += 0.6;
        this.game.physics.enable(this.topRightSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.topRightSaber);
        this.topRightSaber.name = "topRightSaber";
        this.disableHitbox("topRightSaber");
        this.topLeftSaber = this.game.add.sprite(-38, -12);
        this.topLeftSaber.anchor.setTo(0.5, 0.5);
        this.topLeftSaber.scale.setTo(2.2, 0.9);
        this.topLeftSaber.rotation -= 0.6;
        this.game.physics.enable(this.topLeftSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.topLeftSaber);
        this.topLeftSaber.name = "topLeftSaber";
        this.disableHitbox("topLeftSaber");
        this.bottomSaber = this.game.add.sprite(-18, 40);
        this.bottomSaber.anchor.setTo(0.5, 0.5);
        this.bottomSaber.scale.setTo(2, 0.9);
        this.game.physics.enable(this.bottomSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.bottomSaber);
        this.bottomSaber.name = "bottomSaber";
        this.disableHitbox("bottomSaber");
        this.bottomRightSaber = this.game.add.sprite(3, 23);
        this.bottomRightSaber.anchor.setTo(0.5, 0.5);
        this.bottomRightSaber.scale.setTo(2.2, 0.9);
        this.bottomRightSaber.rotation -= 0.6;
        this.game.physics.enable(this.bottomRightSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.bottomRightSaber);
        this.bottomRightSaber.name = "bottomRightSaber";
        this.disableHitbox("bottomRightSaber");
        this.bottomLeftSaber = this.game.add.sprite(-38, 23);
        this.bottomLeftSaber.anchor.setTo(0.5, 0.5);
        this.bottomLeftSaber.scale.setTo(2.2, 0.9);
        this.bottomLeftSaber.rotation += 0.6;
        this.game.physics.enable(this.bottomLeftSaber, Phaser.Physics.ARCADE);
        this.saberHitBoxes.addChild(this.bottomLeftSaber);
        this.bottomLeftSaber.name = "bottomLeftSaber";
        this.disableHitbox("bottomLeftSaber");
        this.saberHitBoxes.enableBody = true;
    };
    Player.prototype.disableHitbox = function (name) {
        if (name == "rightSaber") {
            this.rightSaber.kill();
        }
        else if (name == "leftSaber") {
            this.leftSaber.kill();
        }
        else if (name == "topSaber") {
            this.topSaber.kill();
        }
        else if (name == "topRightSaber") {
            this.topRightSaber.kill();
        }
        else if (name == "topLeftSaber") {
            this.topLeftSaber.kill();
        }
        else if (name == "bottomSaber") {
            this.bottomSaber.kill();
        }
        else if (name == "bottomRightSaber") {
            this.bottomRightSaber.kill();
        }
        else if (name == "bottomLeftSaber") {
            this.bottomLeftSaber.kill();
        }
    };
    Player.prototype.enableHitbox = function (name) {
        if (name == "rightSaber") {
            this.rightSaber.reset(10, 0);
        }
        else if (name == "leftSaber") {
            this.leftSaber.reset(-45, 0);
        }
        else if (name == "topSaber") {
            this.topSaber.reset(-18, -23);
        }
        else if (name == "topRightSaber") {
            this.topRightSaber.reset(3, -12);
        }
        else if (name == "topLeftSaber") {
            this.topLeftSaber.reset(-38, -12);
        }
        else if (name == "bottomSaber") {
            this.bottomSaber.reset(-18, 40);
        }
        else if (name == "bottomRightSaber") {
            this.bottomRightSaber.reset(3, 23);
        }
        else if (name == "bottomLeftSaber") {
            this.bottomLeftSaber.reset(-38, 23);
        }
    };
    Player.prototype.pUpdate = function (time, keyState) {
        if (this.alive) {
            if (keyState.isDown(Phaser.KeyCode.SPACEBAR) && !(this.rAttack.isPlaying || this.lAttack.isPlaying || this.uAttack.isPlaying || this.dAttack.isPlaying || this.urAttack.isPlaying || this.ulAttack.isPlaying || this.drAttack.isPlaying || this.dlAttack.isPlaying)) {
                this.aim = true;
            }
            this.weapon.trackSprite(this, 0, 0);
            if ((keyState.isDown(Phaser.KeyCode.W) || keyState.isDown(Phaser.KeyCode.S)) && (keyState.isDown(Phaser.KeyCode.D) || keyState.isDown(Phaser.KeyCode.A)) && !((keyState.isDown(Phaser.KeyCode.W) && keyState.isDown(Phaser.KeyCode.S)) || (keyState.isDown(Phaser.KeyCode.A) && keyState.isDown(Phaser.KeyCode.D)))) {
                if (keyState.isDown(Phaser.KeyCode.W)) {
                    this.pVelocityY -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
                    this.weapon.fireAngle = 270;
                }
                else {
                    this.pVelocityY += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
                    this.weapon.fireAngle = 90;
                }
                if (keyState.isDown(Phaser.KeyCode.A)) {
                    this.pVelocityX -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
                    if (this.weapon.fireAngle > 180) {
                        this.weapon.fireAngle -= 45;
                    }
                    else {
                        this.weapon.fireAngle += 45;
                    }
                }
                else {
                    this.pVelocityX += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
                    if (this.weapon.fireAngle > 180) {
                        this.weapon.fireAngle += 45;
                    }
                    else {
                        this.weapon.fireAngle -= 45;
                    }
                }
            }
            else {
                if (keyState.isDown(Phaser.KeyCode.W)) {
                    this.pVelocityY -= this.pSpeed;
                    this.weapon.fireAngle = 270;
                }
                if (keyState.isDown(Phaser.KeyCode.S)) {
                    this.pVelocityY += this.pSpeed;
                    if (this.weapon.fireAngle == 270) {
                        this.weapon.fireAngle = 0;
                    }
                    else {
                        this.weapon.fireAngle = 90;
                    }
                }
                if (keyState.isDown(Phaser.KeyCode.A)) {
                    this.pVelocityX -= this.pSpeed;
                    this.weapon.fireAngle = 180;
                }
                if (keyState.isDown(Phaser.KeyCode.D)) {
                    this.pVelocityX += this.pSpeed;
                    this.weapon.fireAngle = 0;
                }
            }
            // ----------------------------------------------------- Determining new direction
            if (this.pVelocityX > 0) {
                if (this.pVelocityY > 0) {
                    this.newPFrame = this.pDirEnum.DOWNRIGHT;
                }
                else if (this.pVelocityY < 0) {
                    this.newPFrame = this.pDirEnum.UPRIGHT;
                }
                else {
                    this.newPFrame = this.pDirEnum.RIGHT;
                }
            }
            else if (this.pVelocityX < 0) {
                if (this.pVelocityY > 0) {
                    this.newPFrame = this.pDirEnum.DOWNLEFT;
                }
                else if (this.pVelocityY < 0) {
                    this.newPFrame = this.pDirEnum.UPLEFT;
                }
                else {
                    this.newPFrame = this.pDirEnum.LEFT;
                }
            }
            else {
                if (this.pVelocityY > 0) {
                    this.newPFrame = this.pDirEnum.DOWN;
                }
                else if (this.pVelocityY < 0) {
                    this.newPFrame = this.pDirEnum.UP;
                }
            }
            if (this.aim) {
                if (this.weapon.fireAngle == 90) {
                    this.newPFrame = this.pDirEnum.DOWN;
                    if (!this.attacked) {
                        this.animations.play('dAttack');
                        this.attacked = true;
                        this.enableHitbox("bottomSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 45) {
                    this.newPFrame = this.pDirEnum.DOWNRIGHT;
                    if (!this.attacked) {
                        this.animations.play('drAttack');
                        this.attacked = true;
                        this.enableHitbox("bottomRightSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 135) {
                    this.newPFrame = this.pDirEnum.DOWNLEFT;
                    if (!this.attacked) {
                        this.animations.play('dlAttack');
                        this.attacked = true;
                        this.enableHitbox("bottomLeftSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 0) {
                    this.newPFrame = this.pDirEnum.RIGHT;
                    if (!this.attacked) {
                        this.animations.play('rAttack');
                        this.attacked = true;
                        this.enableHitbox("rightSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 180) {
                    this.newPFrame = this.pDirEnum.LEFT;
                    if (!this.attacked) {
                        this.animations.play('lAttack');
                        this.attacked = true;
                        this.enableHitbox("leftSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 270) {
                    this.newPFrame = this.pDirEnum.UP;
                    if (!this.attacked) {
                        this.animations.play('uAttack');
                        this.attacked = true;
                        this.enableHitbox("topSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 225) {
                    this.newPFrame = this.pDirEnum.UPLEFT;
                    if (!this.attacked) {
                        this.animations.play('ulAttack');
                        this.attacked = true;
                        this.enableHitbox("topLeftSaber");
                        this.slash.play();
                    }
                }
                else if (this.weapon.fireAngle == 315) {
                    this.newPFrame = this.pDirEnum.UPRIGHT;
                    if (!this.attacked) {
                        this.animations.play('urAttack');
                        this.attacked = true;
                        this.enableHitbox("topRightSaber");
                        this.slash.play();
                    }
                }
            }
            if (this.newPFrame == this.pDirEnum.DOWNLEFT || this.newPFrame == this.pDirEnum.DOWNRIGHT) {
                this.newPFrame = this.pDirEnum.DOWN;
            }
            if (!(this.rAttack.isPlaying || this.lAttack.isPlaying || this.uAttack.isPlaying || this.dAttack.isPlaying || this.urAttack.isPlaying || this.ulAttack.isPlaying || this.drAttack.isPlaying || this.dlAttack.isPlaying)) {
                if (this.newPFrame != this.frame) {
                    this.frame = this.newPFrame;
                }
                else if (!keyState.isDown(Phaser.KeyCode.SPACEBAR)) {
                    this.attacked = false;
                }
            }
            if (this.animations.currentAnim.isFinished) {
                this.disableHitbox("rightSaber");
                this.disableHitbox("leftSaber");
                this.disableHitbox("topSaber");
                this.disableHitbox("topRightSaber");
                this.disableHitbox("topLeftSaber");
                this.disableHitbox("bottomSaber");
                this.disableHitbox("bottomRightSaber");
                this.disableHitbox("bottomLeftSaber");
            }
            // -----------------------------------------------------
            this.body.velocity.y = this.pVelocityY * time;
            this.body.velocity.x = this.pVelocityX * time;
            this.pVelocityX = 0;
            this.pVelocityY = 0;
            this.aim = false;
        }
    };
    return Player;
}(Phaser.Sprite));
//   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄   
//  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄ 
//  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███ 
// ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███ 
//▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███ 
//  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███ 
//  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███ 
//  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀ 
var Enemy = (function (_super) {
    __extends(Enemy, _super); // -----------------------------------------------------Enemy code
    function Enemy(xPos, yPos, enemyType, player, room, game) {
        var _this = _super.call(this, game, xPos, yPos, 'eSprite') || this;
        _this.enemyTypeEnum = {
            BASE: 0,
            RAPID: 1,
            SHOTGUN: 2,
            LASER: 3
        };
        _this.eType = enemyType;
        if (_this.eType == _this.enemyTypeEnum.RAPID) {
            _this.frame = 1;
        }
        else if (_this.eType == _this.enemyTypeEnum.LASER) {
            _this.frame = 3;
        }
        else if (_this.eType == _this.enemyTypeEnum.SHOTGUN) {
            _this.frame = 2;
        }
        _this.smoothed = false;
        _this.exists = true;
        _this.anchor.setTo(0.5, 0.5);
        _this.scale.setTo(2.2, 2.2);
        _this.game.physics.enable(_this, Phaser.Physics.ARCADE);
        _this.body.collideWorldBounds = true;
        _this.body.setSize(28, 49, 2, 2);
        _this.maxHealth = 1;
        _this.eAim = false;
        _this.aim = false;
        _this.fireBreak = false;
        _this.eVelocityX = 0;
        _this.eVelocityY = 0;
        _this.fireTimer = _this.game.time.now + game.rnd.integerInRange(1000, 6000);
        if (_this.eType == _this.enemyTypeEnum.LASER) {
            _this.weapon = game.add.weapon(200, 'laser');
        }
        else if (_this.eType == _this.enemyTypeEnum.BASE) {
            _this.weapon = game.add.weapon(100, 'bulletBlue');
        }
        else if (_this.eType == _this.enemyTypeEnum.SHOTGUN) {
            _this.weapon = game.add.weapon(100, 'bulletRed');
        }
        else {
            _this.weapon = game.add.weapon(100, 'bulletGreen');
        }
        _this.weapon.bullets.forEach(function (b) {
            if (_this.eType == _this.enemyTypeEnum.LASER) {
                b.scale.setTo(2, 2);
            }
            else if (_this.eType == _this.enemyTypeEnum.BASE) {
                b.scale.setTo(1.5, 1.5);
            }
            else if (_this.eType == _this.enemyTypeEnum.SHOTGUN) {
                b.scale.setTo(2, 2);
            }
            else {
                b.scale.setTo(1.5, 1.5);
            }
        }, _this);
        _this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        _this.weapon.bulletSpeed = 300;
        _this.weapon.fireRate = 500;
        _this.weapon.bulletAngleOffset = 90;
        _this.secondShot = 0;
        if (_this.eType == _this.enemyTypeEnum.BASE) {
            _this.weapon.fireRate = 2000;
            _this.weapon.bulletAngleVariance = 10;
            _this.eSpeed = 125;
        }
        else if (_this.eType == _this.enemyTypeEnum.RAPID) {
            _this.weapon.fireRate = 400;
            _this.weapon.bulletAngleVariance = 10;
            _this.eSpeed = 200;
        }
        else if (_this.eType == _this.enemyTypeEnum.LASER) {
            _this.weapon.bulletSpeed = 500;
            _this.weapon.fireRate = 10;
            _this.eSpeed = 75;
        }
        else {
            _this.weapon.fireRate = 0;
            _this.eSpeed = 100;
        }
        _this.room = room;
        _this.player = player;
        game.add.existing(_this);
        return _this;
    }
    //   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄           ▄████████  ▄█  
    //  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄        ███    ███ ███  
    //  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███        ███    ███ ███▌ 
    // ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███        ███    ███ ███▌ 
    //▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ▀███████████ ███▌ 
    //  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███        ███    ███ ███  
    //  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███        ███    ███ ███  
    //  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀         ███    █▀  █▀   
    Enemy.prototype.ePathfinding = function (time) {
        this.eMoveUp = false;
        this.eMoveRight = false;
        this.eMoveLeft = false;
        this.eMoveDown = false;
        if (this.alive) {
            if (this.eType == this.enemyTypeEnum.BASE) {
                if (time < 1000) {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.body.position.x - 300) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.body.position.x - 250) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.body.position.x + 300) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.body.position.x + 250) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.body.position.y) {
                        if (this.body.position.y < this.player.body.position.y - 300) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.body.position.y - 250) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.body.position.y + 300) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.body.position.y + 250) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
                else {
                    if (this.body.position.x <= this.player.body.position.x) {
                        if (this.body.position.x < this.player.body.position.x - 450) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 350) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 400) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 350) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 400) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 350) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 400) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 350) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
            }
            else if (this.eType == this.enemyTypeEnum.RAPID) {
                if (time < 250) {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.position.x - 250) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 200) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 250) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 200) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 250) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 200) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 250) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 200) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
                else {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.position.x - 300) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 250) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 300) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 250) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 300) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 250) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 300) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 250) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
            }
            else if (this.eType == this.enemyTypeEnum.LASER) {
                if (!this.fireBreak) {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.position.x - 450) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 350) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 450) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 350) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 450) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 350) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 450) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 350) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                }
            }
            else {
                if (time < 1500) {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.position.x - 250) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 200) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 250) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 200) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 250) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 200) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 250) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 200) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
                else {
                    if (this.body.position.x <= this.player.position.x) {
                        if (this.body.position.x < this.player.position.x - 300) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else if (this.body.position.x > this.player.position.x - 250) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                    }
                    else {
                        if (this.body.position.x > this.player.position.x + 300) {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                        else if (this.body.position.x < this.player.position.x + 250) {
                            this.eMoveLeft = false;
                            this.eMoveRight = true;
                        }
                        else {
                            this.eMoveLeft = true;
                            this.eMoveRight = false;
                        }
                    }
                    if (this.body.position.y <= this.player.position.y) {
                        if (this.body.position.y < this.player.position.y - 300) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else if (this.body.position.y > this.player.position.y - 250) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                    }
                    else {
                        if (this.body.position.y > this.player.position.y + 300) {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                        else if (this.body.position.y < this.player.position.y + 250) {
                            this.eMoveUp = false;
                            this.eMoveDown = true;
                        }
                        else {
                            this.eMoveUp = true;
                            this.eMoveDown = false;
                        }
                    }
                }
            }
        }
    };
    //   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄        ███    █▄     ▄███████▄ ████████▄     ▄████████     ███        ▄████████ 
    //  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄      ███    ███   ███    ███ ███   ▀███   ███    ███ ▀█████████▄   ███    ███ 
    //  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███      ███    ███   ███    ███ ███    ███   ███    ███    ▀███▀▀██   ███    █▀  
    // ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███      ███    ███   ███    ███ ███    ███   ███    ███     ███   ▀  ▄███▄▄▄     
    //▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ███    ███ ▀█████████▀  ███    ███ ▀███████████     ███     ▀▀███▀▀▀     
    //  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███      ███    ███   ███        ███    ███   ███    ███     ███       ███    █▄  
    //  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███      ███    ███   ███        ███   ▄███   ███    ███     ███       ███    ███ 
    //  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀       ████████▀   ▄████▀      ████████▀    ███    █▀     ▄████▀     ██████████ 
    Enemy.prototype.eUpdate = function (time) {
        if (this.alive) {
            if (this.room.active) {
                this.eVelocityX = 0;
                this.eVelocityY = 0;
                if (this.game.time.now > this.fireTimer) {
                    if (this.eType == this.enemyTypeEnum.BASE) {
                        this.fireTimer = this.game.time.now + 2000;
                    }
                    else if (this.eType == this.enemyTypeEnum.RAPID) {
                        this.fireTimer = this.game.time.now + 400;
                    }
                    else if (this.eType == this.enemyTypeEnum.LASER) {
                        this.fireTimer = this.game.time.now + 10;
                    }
                    else {
                        this.fireTimer = this.game.time.now + 4000;
                    }
                    this.eAim = true;
                }
                if (this.eAim) {
                    this.aim = true;
                }
                this.weapon.trackSprite(this, 0, 0);
                this.ePathfinding(this.fireTimer - this.game.time.now);
                if ((this.eMoveUp || this.eMoveDown) && (this.eMoveLeft || this.eMoveRight) && !((this.eMoveUp && this.eMoveDown) || (this.eMoveLeft && this.eMoveRight))) {
                    if (this.eMoveUp) {
                        this.eVelocityY -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
                    }
                    else {
                        this.eVelocityY += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
                    }
                    if (this.eMoveLeft) {
                        this.eVelocityX -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
                    }
                    else {
                        this.eVelocityX += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
                    }
                }
                else {
                    if (this.eMoveUp) {
                        this.eVelocityY -= this.eSpeed;
                    }
                    if (this.eMoveDown) {
                        this.eVelocityY += this.eSpeed;
                    }
                    if (this.eMoveLeft) {
                        this.eVelocityX -= this.eSpeed;
                    }
                    if (this.eMoveRight) {
                        this.eVelocityX += this.eSpeed;
                    }
                }
                if (this.aim) {
                    if (this.eType == this.enemyTypeEnum.LASER && !this.fireBreak) {
                        var prediction = new Phaser.Rectangle(this.player.body.position.x, this.player.body.position.y, this.player.body.width, this.player.body.height);
                        prediction.x = prediction.x + (this.player.body.velocity.x * 1.2);
                        prediction.y = prediction.y + (this.player.body.velocity.y * 1.2);
                        this.weapon.fireAngle = this.game.physics.arcade.angleBetween(this.body, prediction) * 57.2958;
                    }
                    else if (this.eType != this.enemyTypeEnum.LASER) {
                        this.weapon.fireAngle = this.game.physics.arcade.angleBetween(this.body, this.player.body) * 57.2958;
                    }
                    if (this.eType == this.enemyTypeEnum.SHOTGUN) {
                        this.weapon.fire();
                        this.weapon.fireAngle -= 30;
                        this.weapon.fire();
                        this.weapon.fireAngle += 15;
                        this.weapon.fire();
                        this.weapon.fireAngle += 30;
                        this.weapon.fire();
                        this.weapon.fireAngle += 15;
                        this.weapon.fire();
                        this.secondShot = this.weapon.fireAngle;
                        this.game.time.events.add(500, this.eSecondShot, this);
                    }
                    else if (this.eType == this.enemyTypeEnum.LASER) {
                        this.weapon.fire();
                        if (!this.fireBreak) {
                            this.fireBreak = true;
                            this.game.time.events.add(4000, this.eFireDelay, this);
                        }
                    }
                    else if (this.eType == this.enemyTypeEnum.RAPID) {
                        this.weapon.fire();
                        if (!this.fireBreak) {
                            this.fireBreak = true;
                            this.game.time.events.add(6000, this.eFireDelay, this);
                        }
                    }
                    else {
                        this.weapon.fire();
                    }
                    this.eAim = false;
                }
                this.body.velocity.y = this.eVelocityY * time;
                this.body.velocity.x = this.eVelocityX * time;
                this.aim = false;
            }
        }
    };
    Enemy.prototype.eSecondShot = function () {
        this.weapon.fireAngle = this.secondShot;
        this.weapon.fire();
        this.weapon.fireAngle -= 15;
        this.weapon.fire();
        this.weapon.fireAngle -= 15;
        this.weapon.fire();
        this.weapon.fireAngle -= 15;
        this.weapon.fire();
        this.weapon.fireAngle -= 15;
        this.weapon.fire();
    };
    Enemy.prototype.eFireDelay = function () {
        if (this.eType == this.enemyTypeEnum.LASER) {
            this.fireTimer = this.game.time.now + 1500;
        }
        else {
            this.fireTimer = this.game.time.now + 2000;
        }
        this.fireBreak = false;
    };
    return Enemy;
}(Phaser.Sprite // -----------------------------------------------------Enemy code
));
//# sourceMappingURL=app.js.map