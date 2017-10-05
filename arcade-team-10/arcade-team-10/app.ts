﻿//   ▄██████▄     ▄████████   ▄▄▄▄███▄▄▄▄      ▄████████ 
//  ███    ███   ███    ███ ▄██▀▀▀███▀▀▀██▄   ███    ███ 
//  ███    █▀    ███    ███ ███   ███   ███   ███    █▀  
// ▄███          ███    ███ ███   ███   ███  ▄███▄▄▄     
//▀▀███ ████▄  ▀███████████ ███   ███   ███ ▀▀███▀▀▀     
//  ███    ███   ███    ███ ███   ███   ███   ███    █▄  
//  ███    ███   ███    ███ ███   ███   ███   ███    ███ 
//  ████████▀    ███    █▀   ▀█   ███   █▀    ██████████ 

window.onload = function ()
{
	//  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
	//  Although it will work fine with this tutorial, it's almost certainly not the most current version.
	//  Be sure to replace it with an updated version before you start experimenting with adding your own code.
	var game = new Phaser.Game(1920, 1080, Phaser.AUTO, '', { preload: preload, create: create, update: update });

	let keyState: Phaser.Keyboard;
	let player: Player;
	var enemies;

	//let walls: Phaser.Group;
	let bossRoom: Room;
	let background: Phaser.Sprite;

	let lives: Phaser.Group;
	var healthDrops;
	var hud;
	var bossHud;
	let pClearCircle: Phaser.Sprite;

	var map;
	var layer;
	var bossRoomLCorner: Phaser.Sprite;
	var bossRoomRCorner: Phaser.Sprite;

	var laserGate1: Barrier;
	var laserGate2: Barrier;
	var laserGate3: Barrier;
	var laserGate4: Barrier;

	var boss: Boss;
	var healthBar;
	var healthBarCrop;
	var bossHealthText;

	let enemyKillCount: number;

    var loop;
    var drop;

    var healthPickup;
    var playerHit;

	function preload()
	{
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

		game.load.audio('loop', 'assets/audio/Loop.wav');
		game.load.audio('drop', 'assets/audio/Drop.wav');

		game.load.audio('slash', 'assets/audio/Slash.wav');
		game.load.audio('laserOn', 'assets/audio/LaserOn.wav');
		game.load.audio('laserOff', 'assets/audio/LaserOff.wav');
		game.load.audio('enemyDeath', 'assets/audio/EnemyDeath.wav');
		game.load.audio('playerDeath', 'assets/audio/PlayerDeath.mp3');
		game.load.audio('playerHit', 'assets/audio/PlayerHit.mp3');

		game.load.audio('healthPickup', 'assets/audio/HealthPickup.wav');

		game.load.audio('laser', 'assets/audio/Laser.wav');
		game.load.audio('bulletBasic', 'assets/audio/BulletBasic.mp3');
		game.load.audio('bulletRapid', 'assets/audio/BulletRapid.mp3');
		game.load.audio('bulletShotgun', 'assets/audio/BulletShotgun.mp3');

		game.load.audio('taunt1', 'assets/audio/Taunt1.wav');
	}

	function create()
	{
        loop = game.add.audio('loop', 1, true);
        loop.play();

        drop = game.add.audio('drop', 1, true);

        healthPickup  = game.add.audio('healthPickup');
        playerHit = game.add.audio('playerHit', 3);
        playerHit.allowMultiple = true;

		fullScreen();
		game.physics.startSystem(Phaser.Physics.ARCADE);
		background = game.add.sprite(0, 0, 'background');
		map = game.add.tilemap('map', 64, 64);
		layer = map.createLayer(0);
		layer.alpha = 0;
		layer.resizeWorld();
		map.setCollision(0, true, layer);
		//layer.debug = true;
		bossRoomLCorner = new Phaser.Sprite(game, 192, 64);
		bossRoomRCorner = new Phaser.Sprite(game, 1280, 64);
		bossRoomLCorner.anchor.setTo(0, 0);
		bossRoomRCorner.anchor.setTo(0, 0);
		game.physics.enable(bossRoomLCorner, Phaser.Physics.ARCADE);
		game.physics.enable(bossRoomRCorner, Phaser.Physics.ARCADE);
		bossRoomLCorner.body.setSize(448, 256);
		bossRoomRCorner.body.setSize(448, 256);
		bossRoomLCorner.body.immovable = true;
		bossRoomRCorner.body.immovable = true;

		bossRoom = new Room(0, 0, 1920, 1480, game);

		player = new Player(1000, 2000, game);
		game.add.existing(player);

		game.world.setBounds(0, 0, 1920, 2432);
		game.camera.follow(player);
		game.renderer.renderSession.roundPixels = true;

		healthDrops = game.add.group();
		healthDrops.enableBody = true;
		healthDrops.physicsBodyType = Phaser.Physics.ARCADE;
		for (var i = 0; i < 3; i++)
		{
			healthDrops.add(new Phaser.Sprite(game, -1, -1, 'heart'));
			healthDrops.children[i].scale.setTo(1.5, 1.5);
			healthDrops.children[i].kill();
		}

		enemies = game.add.group();
		enemies.enableBody = true;
		enemies.physicsBodyType = Phaser.Physics.ARCADE;

		createEnemies();

		boss = new Boss(960, 200, player, game);

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

		for (var i = 0; i < player.maxHealth; i++)
		{
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

	function update()
	{
		let deltaTime: number = game.time.elapsed / 10;

		keyState = game.input.keyboard;

		player.pUpdate(deltaTime, keyState);
		enemies.forEach(function (enemy)
		{
			enemy.eUpdate(deltaTime);
		}, this);

		game.physics.arcade.collide(player, layer);
		game.physics.arcade.collide(player, bossRoomLCorner);
		game.physics.arcade.collide(player, bossRoomRCorner);
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
		for (var i = 0; i < enemies.children.length; i++)
		{
			if (player.canDamage)
			{
				game.physics.arcade.overlap(enemies.children[i].weapon.bullets, player, bulletHitPlayer, null, this);
			}
			game.physics.arcade.collide(enemies.children[i].weapon.bullets, layer, killBullet);
			game.physics.arcade.overlap(enemies.children[i].weapon.bullets, pClearCircle, clearBullet);

			if (laserGate1.isActivated)
			{
				game.physics.arcade.collide(enemies.children[i].weapon.bullets, laserGate1, killBulletGate);
			}
			if (laserGate4.isActivated)
			{
				game.physics.arcade.collide(enemies.children[i].weapon.bullets, laserGate4, killBulletGate);
			}

			if (player.alive)
			{
				for (var j = 0; j < player.saberHitBoxes.children.length; j++)
				{
					if (enemies.children[i].eType != 3)
					{
						game.physics.arcade.overlap(player.saberHitBoxes.children[j], enemies.children[i].weapon.bullets, bulletHitSaber, null, this);
					}
					game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss, saberHitBoss, null, this);

					if (boss.bossStage == boss.bossStageEnum.STAGE_2)
					{
						game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.headsetL.bullets, bulletHitSaber);
						game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.headsetR.bullets, bulletHitSaber);
						game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.speakerL.bullets, bulletHitSaber);
						game.physics.arcade.overlap(player.saberHitBoxes.children[j], boss.speakerR.bullets, bulletHitSaber);
					}
				}
			}
		}

		for (var j = 0; j < player.saberHitBoxes.children.length; j++)
		{
			game.physics.arcade.overlap(player.saberHitBoxes.children[j], enemies, saberHitEnemy, null, this);
		}

		if (laserGate1.isActivated)
		{
			game.physics.arcade.collide(player, laserGate1);
		}
		else
		{
			game.physics.arcade.overlap(player, laserGate1, activateGate, null, this);
		}

		if (laserGate2.isActivated)
		{
			game.physics.arcade.collide(player, laserGate2);
		}
		else
		{
			game.physics.arcade.overlap(player, laserGate2, activateGate, null, this);
		}

		if (laserGate3.isActivated)
		{
			game.physics.arcade.collide(player, laserGate3);
		}
		else
		{
			game.physics.arcade.overlap(player, laserGate3, activateGate, null, this);
		}

		if (laserGate4.isActivated)
		{
			game.physics.arcade.collide(player, laserGate4);
		}

		laserGate1.update();
		laserGate2.update();
		laserGate3.update();
		laserGate4.update();

		if (boss.bossStage == boss.bossStageEnum.STAGE_1)
		{
			if (enemyKillCount >= 8)
			{
				boss.bossStage = boss.bossStageEnum.STAGE_2;
				boss.canDamage = true;
				boss.fireTimerSL = game.time.now + game.rnd.integerInRange(2000, 4000);
				boss.fireTimerSR = game.time.now + game.rnd.integerInRange(2500, 4500);
				boss.fireTimerCH = game.time.now + game.rnd.integerInRange(10000, 15000);
				laserGate4.deactivate();
                boss.taunt();
			}
		}
		else if (boss.bossStage == boss.bossStageEnum.STAGE_2)
		{
			if (boss.health <= 70)
			{
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

	function render()
	{
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

	function fullScreen()
	{
		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		game.scale.setGameSize(1920, 1080);
	}

	// -------------------------------------------------------------------------------------------- Enemy Gets Hit

	function saberHitEnemy(saber, enemy: Enemy)
    {
        if (enemy.alive)
        {
            enemy.eDeath();
        }
		enemy.kill();
		enemyKillCount++;
		dropHealth(enemy.position.x, enemy.position.y);
	}

	function bulletHitEnemy(enemy: Enemy, bullet)
	{
        bullet.eDeath();
		bullet.kill();
		enemy.kill();
		enemyKillCount++;
		dropHealth(enemy.position.x, enemy.position.y);
	}

	// -------------------------------------------------------------------------------------------- Stuff Hits Player

	function bulletHitPlayer(player: Player, bullet: Phaser.Bullet)
	{
		bullet.kill();
		damagePlayer(player, 1);
	}

	function bossHitPlayer(player: Player, boss: Boss)
	{
		damagePlayer(player, 1);
	}

	function enemyHitPlayer(player: Player, enemy: Enemy)
	{
		damagePlayer(player, 1);
	}

	function bulletHitSaber(saber, bullet: Phaser.Bullet)
	{
		bullet.body.velocity.x = -bullet.body.velocity.x;
		bullet.body.velocity.y = -bullet.body.velocity.y;
		player.weapon.bullets.add(bullet);
		bullet.rotation += Math.PI;
	}

	// -------------------------------------------------------------------------------------------- Gate

	function activateGate(player: Player, laserGate: Barrier)
	{
		if (player.body.position.y < laserGate.position.y)
		{
			laserGate.activate();
		}
	}

	// -------------------------------------------------------------------------------------------- Player Damage

	function damagePlayer(player: Player, dNum: number)
	{
		if (player.canDamage)
		{
			player.damage(dNum);
			hud.children[player.health].visible = false;
			if (player.health != 0)
			{
				playerInvuln();
				playerVisible();
				game.time.events.repeat(200, 3, playerVisible, this);
				game.time.events.add(1000, playerInvuln, this);
                playerHit.play();
			}

            if (player.health < 1)
            {
                player.pDeath();
            }
            else
            {
			    playerClear();
            }
		}
	}

	function playerVisible()
	{
		player.alpha = (player.alpha + 1) % 2;
	}

	function playerInvuln()
	{
		player.canDamage = !player.canDamage;
	}

	// -------------------------------------------------------------------------------------------- Boss Stuff

	function activateBossRoom(player, room: Room)
	{
		if (!bossRoom.active)
		{
			bossRoom.active = true;
			bossHud.children[0].alpha = 1;
			bossHud.children[1].alpha = 1;
			bossHealthText.alpha = 1;
			boss.bossStage = boss.bossStageEnum.STAGE_1;
		}
	}

	function bulletHitBoss(boss: Boss, bullet: Phaser.Bullet)
	{
		bullet.kill();
		boss.damage(1);
		bossHud.children[1].scale.setTo(6.5 * (boss.health / boss.maxHealth), 2);
		console.log(boss.health);

		if (boss.health != 0)
		{
			bossInvuln();
			game.time.events.add(100, bossInvuln, this);
		}
	}

	function saberHitBoss(saber, temp: Boss)
	{
		if (boss.canDamage)
		{
			boss.damage(1);
			bossHud.children[1].scale.setTo(6.5 * (boss.health / boss.maxHealth), 2);
			console.log(boss.health);

			if (boss.health != 0)
			{
				bossInvuln();
				game.time.events.add(300, bossInvuln, this);
			}
		}
	}

	function bossInvuln()
	{
		boss.canDamage = !boss.canDamage;
	}

	// -------------------------------------------------------------------------------------------- Player Clear When Hit

	function playerClear()
	{
		pClearCircle.revive();
		pClearCircle.position.x = player.body.position.x - (player.body.width * 4);
		pClearCircle.position.y = player.body.position.y - (player.body.width * 4);
		game.time.events.add(2000, endClear, this);
	}

	function endClear()
	{
		pClearCircle.kill();
	}

	// -------------------------------------------------------------------------------------------- Bullet Stuff

	function killBullet(bullet: Phaser.Bullet, other)
	{
		bullet.kill();
	}

	function clearBullet(bullet: Phaser.Bullet, clear: Phaser.Sprite)
	{
		clear.kill();
	}

	function killBulletGate(bullet: Phaser.Bullet, layer)
	{
		layer.kill();
	}

	// -------------------------------------------------------------------------------------------- Player Health Stuff

	function dropHealth(x: number, y: number)
	{
		let rand = game.rnd.integerInRange(1, 100);
		if (rand > 97)
		{
			for (var i = 0; i < 3; i++)
			{
				if (healthDrops.children[i].alive == false)
				{
					healthDrops.children[i].revive();
					healthDrops.children[i].position.x = x;
					healthDrops.children[i].position.y = y;
					break;
				}
			}
		}
	}

	function healPlayer(player: Player, hNum: number)
	{
		hud.children[player.health].visible = true;
		player.heal(hNum);
	}

	function pickupHealth(player: Player, healthDrop: Phaser.Sprite)
	{
		if (player.health != player.maxHealth)
		{
			healPlayer(player, 1);
            healthDrop.kill();
            healthPickup.play();
		}
	}

	function increaseHealth(player: Player)
	{
		player.maxHealth += 1;
		player.heal(1);
		hud.add(new Phaser.Sprite(game, (hud.children[0].width * (player.maxHealth - 1)) + (hud.children[0].width / 2), hud.children[0].height / 2, 'heart'));
	}

	//   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄           ▄████████    ▄███████▄    ▄████████  ▄█     █▄  ███▄▄▄▄        
	//  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄        ███    ███   ███    ███   ███    ███ ███     ███ ███▀▀▀██▄      
	//  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███        ███    █▀    ███    ███   ███    ███ ███     ███ ███   ███      
	// ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███        ███          ███    ███   ███    ███ ███     ███ ███   ███      
	//▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ▀███████████ ▀█████████▀  ▀███████████ ███     ███ ███   ███      
	//  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███               ███   ███          ███    ███ ███     ███ ███   ███      
	//  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███         ▄█    ███   ███          ███    ███ ███ ▄█▄ ███ ███   ███      
	//  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀        ▄████████▀   ▄████▀        ███    █▀   ▀███▀███▀   ▀█   █▀                                                                                                                                   

	function createEnemies()
	{
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

class Barrier extends Phaser.Sprite 
{
	isActivated: boolean;
	off: Phaser.Animation;
	switch: Phaser.Animation;
	on: Phaser.Animation;

    laserOn: Phaser.Sound;
    laserOff: Phaser.Sound;
	constructor(xPos: number, yPos: number, width: number, height: number, key: string, game: Phaser.Game)
	{
		super(game, xPos, yPos, key);
		game.physics.arcade.enable(this);
		this.body.immovable = true;
		this.scale.setTo(width, height);
		game.add.existing(this);

		this.isActivated = false;
		this.frame = 1;
		this.off = this.animations.add('off', [5], 15, true);
		this.switch = this.animations.add('switch', [1, 2, 3, 4], 15, false);
		this.on = this.animations.add('on', [1, 2], 15, true);

        this.play("off");

        this.laserOn = this.game.add.audio('laserOn');
        this.laserOff = this.game.add.audio('laserOff');
	}

    activate()
    {
        this.isActivated = true;
        this.play("switch");
        this.laserOn.play();
    }

    deactivate()
    {
        this.isActivated = false;
        this.play("switch");
        this.laserOff.play();
    }

    update()
    {
        if (this.isActivated)
        {
            if (this.animations.currentAnim.isFinished)
            {
                this.play("on");
            }
        }
        else if (!this.isActivated)
        {
            if (this.animations.currentAnim.isFinished)
            {
                this.play("off");
            }
        }

    }
}

//   ▄████████  ▄██████▄   ▄██████▄    ▄▄▄▄███▄▄▄▄   
//  ███    ███ ███    ███ ███    ███ ▄██▀▀▀███▀▀▀██▄ 
//  ███    ███ ███    ███ ███    ███ ███   ███   ███ 
// ▄███▄▄▄▄██▀ ███    ███ ███    ███ ███   ███   ███ 
//▀▀███▀▀▀▀▀   ███    ███ ███    ███ ███   ███   ███ 
//▀███████████ ███    ███ ███    ███ ███   ███   ███ 
//  ███    ███ ███    ███ ███    ███ ███   ███   ███ 
//  ███    ███  ▀██████▀   ▀██████▀   ▀█   ███   █▀  
//  ███    ███                                       

class Room extends Phaser.Sprite
{
	active: boolean;

	constructor(x: number, y: number, width: number, height: number, game: Phaser.Game)
	{
		super(game, x, y);
		this.game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.setSize(width, height);
		this.active = false;
	}
}

//▀█████████▄   ▄██████▄     ▄████████    ▄████████ 
//  ███    ███ ███    ███   ███    ███   ███    ███ 
//  ███    ███ ███    ███   ███    █▀    ███    █▀  
// ▄███▄▄▄██▀  ███    ███   ███          ███        
//▀▀███▀▀▀██▄  ███    ███ ▀███████████ ▀███████████ 
//  ███    ██▄ ███    ███          ███          ███ 
//  ███    ███ ███    ███    ▄█    ███    ▄█    ███ 
//▄█████████▀   ▀██████▀   ▄████████▀   ▄████████▀  

class Boss extends Phaser.Sprite 
{
    bossStageEnum =
    {
        STAGE_0: 0,
        STAGE_1: 1,
        STAGE_2: 2,
        STAGE_3: 3,
        STAGE_4: 4
    };

    bossStage: number | string;
    canDamage: boolean;
    player: Player;

    headsetL: Phaser.Weapon;
    headsetR: Phaser.Weapon;
    speakerL: Phaser.Weapon;
    speakerML: Phaser.Weapon;
    speakerMR: Phaser.Weapon;
    speakerR: Phaser.Weapon;

    fireTimerHL: number;
    fireTimerHR: number;
    fireTimerSL: number;
    fireTimerSML: number;
    fireTimerSMR: number;
    fireTimerSR: number;

    aimHL: boolean;
    aimHR: boolean;
    aimSL: boolean;
    aimSML: boolean;
    aimSMR: boolean;
    aimSR: boolean;

    isCrosshatch: boolean;
    crosshatchFired: boolean;
    fireTimerCH: number;
    alternateCHL: boolean;
    alternateCHR: boolean;

    prediction: Phaser.Rectangle;

    taunt1: Phaser.Sound;
    constructor(xPos: number, yPos: number, player: Player, game: Phaser.Game)
    {
        super(game, xPos, yPos, "boss");

        this.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(this);
        this.body.immovable = true;
        this.scale.setTo(2.2, 2.2);
        this.body.setSize(this.body.width * 1.2, this.body.height, -(this.body.width * 0.1), -2);

        this.bossStage = this.bossStageEnum.STAGE_0;
        this.maxHealth = 100;
        this.health = 100;
        this.canDamage = false;
        this.player = player;
        game.add.existing(this);

        this.headsetL = game.add.weapon(100, 'bulletBlue');
        this.headsetR = game.add.weapon(100, 'bulletBlue');
        this.speakerL = game.add.weapon(100, 'bulletRed');
        this.speakerML = game.add.weapon(100, 'bulletGreen');
        this.speakerMR = game.add.weapon(100, 'bulletGreen');
        this.speakerR = game.add.weapon(100, 'bulletRed');

        this.headsetL.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(1.5, 1.5); }, this);
        this.headsetR.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(1.5, 1.5); }, this);
        this.speakerL.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(2, 2); }, this);
        this.speakerML.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(2, 2); }, this);
        this.speakerMR.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(2, 2); }, this);
        this.speakerR.bullets.forEach((b: Phaser.Bullet) => { b.scale.setTo(2, 2); }, this);

        this.headsetL.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.headsetL.bulletSpeed = 300
        this.headsetL.fireRate = 0;
        this.headsetL.bulletAngleOffset = 90;
        this.headsetL.bulletAngleVariance = 3;
        this.headsetL.x = 940;
        this.headsetL.y = 120;
        this.fireTimerHL = 0;
        this.aimHL = false;

        this.headsetR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.headsetR.bulletSpeed = 300
        this.headsetR.fireRate = 0;
        this.headsetR.bulletAngleOffset = 90;
        this.headsetR.bulletAngleVariance = 3;
        this.headsetR.x = 980;
        this.headsetR.y = 120;
        this.fireTimerHR = 0;
        this.aimHR = false;

        this.speakerL.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.speakerL.bulletSpeed = 300
        this.speakerL.fireRate = 0;
        this.speakerL.bulletAngleOffset = 90;
        this.speakerL.x = 740;
        this.speakerL.y = 240;
        this.fireTimerSL = 0;
        this.aimSL = false;

        this.speakerML.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.speakerML.bulletSpeed = 300
        this.speakerML.fireRate = 0;
        this.speakerML.bulletAngleOffset = 90;
        this.speakerML.x = 830;
        this.speakerML.y = 224;
        this.fireTimerSML = 0;
        this.aimSML = false;

        this.speakerMR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.speakerMR.bulletSpeed = 300
        this.speakerMR.fireRate = 0;
        this.speakerMR.bulletAngleOffset = 90;
        this.speakerMR.x = 1090;
        this.speakerMR.y = 224;
        this.fireTimerSMR = 0;
        this.aimSMR = false;

        this.speakerR.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
        this.speakerR.bulletSpeed = 300
        this.speakerR.fireRate = 0;
        this.speakerR.bulletAngleOffset = 90;
        this.speakerR.x = 1180;
        this.speakerR.y = 240;
        this.fireTimerSR = 0;
        this.aimSR = false;

        this.isCrosshatch = false;
        this.crosshatchFired = false;
        this.alternateCHL = false;
        this.alternateCHR = false;
        this.fireTimerCH = 0;
        this.prediction = new Phaser.Rectangle(0, 0, player.body.width, player.body.height);

        this.taunt1 = game.add.audio("taunt1", 3);
    }

    taunt()
    {
        if (this.bossStage == this.bossStageEnum.STAGE_2)
        {
            this.taunt1.play();
        }
    }

	update()
	{
		if (this.bossStage == this.bossStageEnum.STAGE_2)
		{
			if (this.game.time.now > this.fireTimerHL)
			{
				this.fireTimerHL = this.game.time.now + this.game.rnd.integerInRange(300, 750);
				this.aimHL = true;
			}
			if (this.game.time.now > this.fireTimerHR)
			{
				this.fireTimerHR = this.game.time.now + this.game.rnd.integerInRange(250, 1000);
				this.aimHR = true;
			}
			if (this.game.time.now > this.fireTimerSL)
			{
				this.fireTimerSL = this.game.time.now + this.game.rnd.integerInRange(1500, 3500);
				this.aimSL = true;
			}
			if (this.game.time.now > this.fireTimerSR)
			{
				this.fireTimerSR = this.game.time.now + this.game.rnd.integerInRange(1450, 3350);
				this.aimSR = true;
			}
			if (this.game.time.now > this.fireTimerCH && !this.isCrosshatch)
			{
				this.isCrosshatch = true;
			}

			if (!this.isCrosshatch)
			{
				if (this.aimHL)
				{
					this.prediction.x = this.player.body.position.x + (this.player.body.velocity.x * 0.5);
					this.prediction.y = this.player.body.position.y + (this.player.body.velocity.y * 0.5);
					this.headsetL.fireAngle = this.game.physics.arcade.angleBetween(this.headsetL.fireFrom, this.prediction) * 57.2958;
					this.headsetL.fire();
					this.aimHL = false;
				}
				if (this.aimHR)
				{
					this.prediction.x = this.player.body.position.x + (this.player.body.velocity.x * 0.5);
					this.prediction.y = this.player.body.position.y + (this.player.body.velocity.y * 0.5);
					this.headsetR.fireAngle = this.game.physics.arcade.angleBetween(this.headsetR.fireFrom, this.prediction) * 57.2958;
					this.headsetR.fire();
					this.aimHR = false;
				}
				if (this.aimSL)
				{
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
				if (this.aimSR)
				{
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
			else
			{
				this.aimHL = false;
				this.aimHR = false;
				this.aimSL = false;
				this.aimSR = false;

				if (!this.crosshatchFired)
				{
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
	}

	bSecondShotL()
	{
		if (this.bossStage != this.bossStageEnum.STAGE_3)
		{
			if (this.aimSL)
			{
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
			else
			{
				if (!this.alternateCHL)
				{
					this.speakerL.fireAngle = 165;
					this.alternateCHL = true;
				}
				else
				{
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
	}

	bSecondShotR()
	{
		if (this.bossStage != this.bossStageEnum.STAGE_3)
		{
			if (this.aimSR)
			{
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
			else
			{
				if (!this.alternateCHR)
				{
					this.speakerR.fireAngle = 165;
					this.alternateCHR = true;
				}
				else
				{
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
	}

	bEndCrosshatch()
	{
		this.isCrosshatch = false;
		this.crosshatchFired = false;
		this.fireTimerCH = this.game.time.now + this.game.rnd.integerInRange(10000, 15000);
	}
}

//   ▄███████▄  ▄█          ▄████████ ▄██   ▄      ▄████████    ▄████████ 
//  ███    ███ ███         ███    ███ ███   ██▄   ███    ███   ███    ███ 
//  ███    ███ ███         ███    ███ ███▄▄▄███   ███    █▀    ███    ███ 
//  ███    ███ ███         ███    ███ ▀▀▀▀▀▀███  ▄███▄▄▄      ▄███▄▄▄▄██▀ 
//▀█████████▀  ███       ▀███████████ ▄██   ███ ▀▀███▀▀▀     ▀▀███▀▀▀▀▀   
//  ███        ███         ███    ███ ███   ███   ███    █▄  ▀███████████ 
//  ███        ███▌    ▄   ███    ███ ███   ███   ███    ███   ███    ███ 
// ▄████▀      █████▄▄██   ███    █▀   ▀█████▀    ██████████   ███    ███ 
//             ▀                                               ███    ███ 

class Player extends Phaser.Sprite
{
	aim: boolean;
	canDamage: boolean;

	pVelocityX: number;
	pVelocityY: number;
	pSpeed: number;
	lives: number;

	weapon: Phaser.Weapon;

	newPFrame: number | string;
	attacked: boolean;
	attackTimer: number;
	rAttack: Phaser.Animation;
	lAttack: Phaser.Animation;
	uAttack: Phaser.Animation;
	dAttack: Phaser.Animation;
	urAttack: Phaser.Animation;
	ulAttack: Phaser.Animation;
	drAttack: Phaser.Animation;
	dlAttack: Phaser.Animation;

	saberHitBoxes: Phaser.Group;
	rightSaber: Phaser.Sprite;
	leftSaber: Phaser.Sprite;
	topSaber: Phaser.Sprite;
	topRightSaber: Phaser.Sprite;
	topLeftSaber: Phaser.Sprite;
	bottomSaber: Phaser.Sprite;
	bottomRightSaber: Phaser.Sprite;
	bottomLeftSaber: Phaser.Sprite;

	pDirEnum =
	{
		RIGHT: 0,
		LEFT: 1,
		UPRIGHT: 2,
		UPLEFT: 3,
		DOWN: 4,
		UP: 5,
		DOWNRIGHT: 6,
		DOWNLEFT: 7
	};

    slash: Phaser.Sound;
    death: Phaser.Sound;

	constructor(xPos: number, yPos: number, game: Phaser.Game)
	{
		super(game, xPos, yPos, 'pSprite');

		this.rAttack = this.animations.add('rAttack', [6, 7, 8, 9, 10, 11], 25);
		this.lAttack = this.animations.add('lAttack', [12, 13, 14, 15, 16, 17], 25);
		this.uAttack = this.animations.add('uAttack', [18, 19, 20, 21, 22, 23], 25);
		this.dAttack = this.animations.add('dAttack', [24, 25, 26, 27, 28, 29], 25);
		this.urAttack = this.animations.add('urAttack', [30, 31, 32, 33, 34, 35], 25);
		this.ulAttack = this.animations.add('ulAttack', [36, 37, 38, 39, 40, 41], 25);
		this.drAttack = this.animations.add('drAttack', [42, 43, 44, 45, 46, 47], 25);
		this.dlAttack = this.animations.add('dlAttack', [48, 49, 50, 51, 52, 53], 25);
		this.attacked = false;

		this.frame = this.pDirEnum.RIGHT;
		this.newPFrame = this.frame;

		this.smoothed = false;
		this.exists = true;
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(2.25, 2.25);

		this.game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.setSize(18, 28, 51, 57);
		this.body.collideWorldBounds = true;
		this.maxHealth = 5;
		this.health = this.maxHealth;
		this.canDamage = true;

		this.aim = false;
		this.pVelocityX = 0;
		this.pVelocityY = 0;
		this.pSpeed = 250;

		this.weapon = game.add.weapon();

		this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		this.weapon.bulletSpeed = 350;
		this.weapon.autofire = false;
		this.weapon.bulletAngleOffset = 90;

		this.lives = 1;

		this.createSaberHitBoxes();

        this.slash = this.game.add.audio('slash');
        this.slash.allowMultiple = true;

        this.death = this.game.add.audio('playerDeath');
	}

    pDeath()
    {
        this.death.play();
    }

	createSaberHitBoxes()
	{
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
	}

	disableHitbox(name: string)
	{
		if (name == "rightSaber")
		{
			this.rightSaber.kill();
		}
		else if (name == "leftSaber")
		{
			this.leftSaber.kill();
		}
		else if (name == "topSaber")
		{
			this.topSaber.kill();
		}
		else if (name == "topRightSaber")
		{
			this.topRightSaber.kill();
		}
		else if (name == "topLeftSaber")
		{
			this.topLeftSaber.kill();
		}
		else if (name == "bottomSaber")
		{
			this.bottomSaber.kill();
		}
		else if (name == "bottomRightSaber")
		{
			this.bottomRightSaber.kill();
		}
		else if (name == "bottomLeftSaber")
		{
			this.bottomLeftSaber.kill();
		}
	}

	enableHitbox(name: string)
	{
		if (name == "rightSaber")
		{
			this.rightSaber.reset(10, 0);
		}
		else if (name == "leftSaber")
		{
			this.leftSaber.reset(-45, 0);
		}
		else if (name == "topSaber")
		{
			this.topSaber.reset(-18, -23);
		}
		else if (name == "topRightSaber")
		{
			this.topRightSaber.reset(3, -12);
		}
		else if (name == "topLeftSaber")
		{
			this.topLeftSaber.reset(-38, -12);
		}
		else if (name == "bottomSaber")
		{
			this.bottomSaber.reset(-18, 40);
		}
		else if (name == "bottomRightSaber")
		{
			this.bottomRightSaber.reset(3, 23);
		}
		else if (name == "bottomLeftSaber")
		{
			this.bottomLeftSaber.reset(-38, 23);
		}
	}

	pUpdate(time: number, keyState: Phaser.Keyboard)
	{
		if (this.alive)
		{
			if (keyState.isDown(Phaser.KeyCode.SPACEBAR) && !(this.rAttack.isPlaying || this.lAttack.isPlaying || this.uAttack.isPlaying || this.dAttack.isPlaying || this.urAttack.isPlaying || this.ulAttack.isPlaying || this.drAttack.isPlaying || this.dlAttack.isPlaying))
			{
				this.aim = true;
			}

			this.weapon.trackSprite(this, 0, 0);

			if ((keyState.isDown(Phaser.KeyCode.W) || keyState.isDown(Phaser.KeyCode.S)) && (keyState.isDown(Phaser.KeyCode.D) || keyState.isDown(Phaser.KeyCode.A)) && !((keyState.isDown(Phaser.KeyCode.W) && keyState.isDown(Phaser.KeyCode.S)) || (keyState.isDown(Phaser.KeyCode.A) && keyState.isDown(Phaser.KeyCode.D))))
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					this.pVelocityY -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
					this.weapon.fireAngle = 270;
				}
				else
				{
					this.pVelocityY += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
					this.weapon.fireAngle = 90;
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					this.pVelocityX -= Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
					if (this.weapon.fireAngle > 180)
					{
						this.weapon.fireAngle -= 45;
					}
					else
					{
						this.weapon.fireAngle += 45;
					}
				}
				else
				{
					this.pVelocityX += Math.sqrt(Math.pow(this.pSpeed, 2) / 2);
					if (this.weapon.fireAngle > 180)
					{
						this.weapon.fireAngle += 45;
					}
					else
					{
						this.weapon.fireAngle -= 45;
					}
				}
			}
			else
			{
				if (keyState.isDown(Phaser.KeyCode.W))
				{
					this.pVelocityY -= this.pSpeed;
					this.weapon.fireAngle = 270;
				}
				if (keyState.isDown(Phaser.KeyCode.S))
				{
					this.pVelocityY += this.pSpeed;
					if (this.weapon.fireAngle == 270)
					{
						this.weapon.fireAngle = 0;
					}
					else
					{
						this.weapon.fireAngle = 90;
					}
				}

				if (keyState.isDown(Phaser.KeyCode.A))
				{
					this.pVelocityX -= this.pSpeed;
					this.weapon.fireAngle = 180;
				}
				if (keyState.isDown(Phaser.KeyCode.D))
				{
					this.pVelocityX += this.pSpeed;
					this.weapon.fireAngle = 0;
				}
			}

			// ----------------------------------------------------- Determining new direction

			if (this.pVelocityX > 0)
			{
				if (this.pVelocityY > 0)
				{
					this.newPFrame = this.pDirEnum.DOWNRIGHT;
				}
				else if (this.pVelocityY < 0)
				{
					this.newPFrame = this.pDirEnum.UPRIGHT;
				}
				else
				{
					this.newPFrame = this.pDirEnum.RIGHT;
				}
			}
			else if (this.pVelocityX < 0)
			{
				if (this.pVelocityY > 0)
				{
					this.newPFrame = this.pDirEnum.DOWNLEFT;
				}
				else if (this.pVelocityY < 0)
				{
					this.newPFrame = this.pDirEnum.UPLEFT;
				}
				else
				{
					this.newPFrame = this.pDirEnum.LEFT;
				}
			}
			else
			{
				if (this.pVelocityY > 0)
				{
					this.newPFrame = this.pDirEnum.DOWN;
				}
				else if (this.pVelocityY < 0)
				{
					this.newPFrame = this.pDirEnum.UP;
				}
			}

			if (this.aim)
			{
				if (this.weapon.fireAngle == 90)
				{
					this.newPFrame = this.pDirEnum.DOWN;
					if (!this.attacked)
					{
						this.animations.play('dAttack');
						this.attacked = true;
						this.enableHitbox("bottomSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 45)
				{
					this.newPFrame = this.pDirEnum.DOWNRIGHT;
					if (!this.attacked)
					{
						this.animations.play('drAttack');
						this.attacked = true;
						this.enableHitbox("bottomRightSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 135)
				{
					this.newPFrame = this.pDirEnum.DOWNLEFT;
					if (!this.attacked)
					{
						this.animations.play('dlAttack');
						this.attacked = true;
						this.enableHitbox("bottomLeftSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 0)
				{
					this.newPFrame = this.pDirEnum.RIGHT;
					if (!this.attacked)
					{
						this.animations.play('rAttack');
						this.attacked = true;
						this.enableHitbox("rightSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 180)
				{
					this.newPFrame = this.pDirEnum.LEFT;
					if (!this.attacked)
					{
						this.animations.play('lAttack');
						this.attacked = true;
						this.enableHitbox("leftSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 270)
				{
					this.newPFrame = this.pDirEnum.UP;
					if (!this.attacked)
					{
						this.animations.play('uAttack');
						this.attacked = true;
						this.enableHitbox("topSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 225)
				{
					this.newPFrame = this.pDirEnum.UPLEFT;
					if (!this.attacked)
					{
						this.animations.play('ulAttack');
						this.attacked = true;
						this.enableHitbox("topLeftSaber");
                       this.slash.play();
					}
				}
				else if (this.weapon.fireAngle == 315)
				{
					this.newPFrame = this.pDirEnum.UPRIGHT;
					if (!this.attacked)
					{
						this.animations.play('urAttack');
						this.attacked = true;
						this.enableHitbox("topRightSaber");
                       this.slash.play();
					}
				}
			}


			if (this.newPFrame == this.pDirEnum.DOWNLEFT || this.newPFrame == this.pDirEnum.DOWNRIGHT) // Extra check just in case, as there is no down right or down left sprite
			{
				this.newPFrame = this.pDirEnum.DOWN;
			}

			if (!(this.rAttack.isPlaying || this.lAttack.isPlaying || this.uAttack.isPlaying || this.dAttack.isPlaying || this.urAttack.isPlaying || this.ulAttack.isPlaying || this.drAttack.isPlaying || this.dlAttack.isPlaying))
			{
				if (this.newPFrame != this.frame) 
				{
					this.frame = this.newPFrame;
				}
				else if (!keyState.isDown(Phaser.KeyCode.SPACEBAR))
				{
					this.attacked = false;
				}
			}


			if (this.animations.currentAnim.isFinished)
			{
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
	}
}

//   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄   
//  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄ 
//  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███ 
// ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███ 
//▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███ 
//  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███ 
//  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███ 
//  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀ 

class Enemy extends Phaser.Sprite // -----------------------------------------------------Enemy code
{
	eType: number;
	eVelocityX: number;
	eVelocityY: number;
	eSpeed: number;
	weapon: Phaser.Weapon;
	player: Player;
	room: Room;

	eMoveUp: boolean;
	eMoveDown: boolean;
	eMoveLeft: boolean;
	eMoveRight: boolean;
	eAim: boolean;
	aim: boolean;
	fireBreak: boolean;
	secondShot: number;

	fireTimer: number;
	dead: boolean;

	enemyTypeEnum =
	{
		BASE: 0,
		RAPID: 1,
		SHOTGUN: 2,
		LASER: 3
	};

    enemyDeath: Phaser.Sound;
    laser: Phaser.Sound;
    bulletBasic: Phaser.Sound;
    bulletRapid: Phaser.Sound;
    bulletShotgun: Phaser.Sound;

	constructor(xPos: number, yPos: number, enemyType: number, player: Player, room: Room, game: Phaser.Game)
	{
		super(game, xPos, yPos, 'eSprite');

		this.eType = enemyType;
		if (this.eType == this.enemyTypeEnum.RAPID)
		{
			this.frame = 1;
		}
		else if (this.eType == this.enemyTypeEnum.LASER)
		{
			this.frame = 3;
		}
		else if (this.eType == this.enemyTypeEnum.SHOTGUN)
		{
			this.frame = 2;
		}

		this.smoothed = false;
		this.exists = true;
		this.anchor.setTo(0.5, 0.5);
		this.scale.setTo(2.2, 2.2);

		this.game.physics.enable(this, Phaser.Physics.ARCADE);
		this.body.collideWorldBounds = true;
		this.body.setSize(28, 49, 2, 2);
		this.maxHealth = 1;

		this.eAim = false;
		this.aim = false;
		this.fireBreak = false;

		this.eVelocityX = 0;
		this.eVelocityY = 0;

		this.fireTimer = this.game.time.now + game.rnd.integerInRange(1000, 6000);

		if (this.eType == this.enemyTypeEnum.LASER)
		{
			this.weapon = game.add.weapon(200, 'laser');
		}
		else if (this.eType == this.enemyTypeEnum.BASE)
		{
			this.weapon = game.add.weapon(100, 'bulletBlue');
		}
		else if (this.eType == this.enemyTypeEnum.SHOTGUN)
		{
			this.weapon = game.add.weapon(100, 'bulletRed');
		}
		else 
		{
			this.weapon = game.add.weapon(100, 'bulletGreen');
		}

		this.weapon.bullets.forEach((b: Phaser.Bullet) =>
		{

			if (this.eType == this.enemyTypeEnum.LASER)
			{
				b.scale.setTo(2, 2);
			}
			else if (this.eType == this.enemyTypeEnum.BASE)
			{
				b.scale.setTo(1.5, 1.5);
			}
			else if (this.eType == this.enemyTypeEnum.SHOTGUN)
			{
				b.scale.setTo(2, 2);
			}
			else 
			{
				b.scale.setTo(1.5, 1.5);
			}
		}, this);
		this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
		this.weapon.bulletSpeed = 300
		this.weapon.fireRate = 500;
		this.weapon.bulletAngleOffset = 90;
		this.secondShot = 0;

		if (this.eType == this.enemyTypeEnum.BASE)
		{
			this.weapon.fireRate = 2000;
			this.weapon.bulletAngleVariance = 10;
			this.eSpeed = 125;
		}
		else if (this.eType == this.enemyTypeEnum.RAPID)
		{
			this.weapon.fireRate = 400;
			this.weapon.bulletAngleVariance = 10;
			this.eSpeed = 200;
		}
		else if (this.eType == this.enemyTypeEnum.LASER)
		{
			this.weapon.bulletSpeed = 500;
			this.weapon.fireRate = 10;
			this.eSpeed = 75;
		}
		else
		{
			this.weapon.fireRate = 0;
			this.eSpeed = 100;
		}

		this.room = room;
		this.player = player;
        game.add.existing(this);

        this.enemyDeath = this.game.add.audio('enemyDeath');
        this.laser = this.game.add.audio('laser');
        this.bulletBasic = this.game.add.audio('bulletBasic', 1.5);
        this.bulletRapid= this.game.add.audio('bulletRapid', 0.15);
        this.bulletRapid.allowMultiple = true;
        this.bulletShotgun = this.game.add.audio('bulletShotgun');
        this.bulletShotgun.allowMultiple = true;
	}

	//   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄           ▄████████  ▄█  
	//  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄        ███    ███ ███  
	//  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███        ███    ███ ███▌ 
	// ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███        ███    ███ ███▌ 
	//▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ▀███████████ ███▌ 
	//  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███        ███    ███ ███  
	//  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███        ███    ███ ███  
	//  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀         ███    █▀  █▀   

	ePathfinding(time: number)
	{
		this.eMoveUp = false;
		this.eMoveRight = false;
		this.eMoveLeft = false;
		this.eMoveDown = false;

		if (this.alive)
		{
			if (this.eType == this.enemyTypeEnum.BASE)
			{
				if (time < 1000)
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.body.position.x - 300)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.body.position.x - 250)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.body.position.x + 300)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.body.position.x + 250)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.body.position.y)
					{
						if (this.body.position.y < this.player.body.position.y - 300)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.body.position.y - 250)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.body.position.y + 300)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.body.position.y + 250)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
				else
				{
					if (this.body.position.x <= this.player.body.position.x)
					{
						if (this.body.position.x < this.player.body.position.x - 450)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 350)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 400)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 350)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 400)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 350)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 400)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 350)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
			}
			else if (this.eType == this.enemyTypeEnum.RAPID)
			{
				if (time < 250)
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.position.x - 250)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 200)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 250)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 200)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 250)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 200)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 250)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 200)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
				else
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.position.x - 300)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 250)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 300)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 250)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 300)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 250)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 300)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 250)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
			}
			else if (this.eType == this.enemyTypeEnum.LASER)
			{
				if (!this.fireBreak)
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.position.x - 450)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 350)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 450)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 350)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 450)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 350)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 450)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 350)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
				}
			}
			else
			{
				if (time < 1500)
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.position.x - 250)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 200)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 250)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 200)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 250)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 200)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 250)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 200)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
				else
				{
					if (this.body.position.x <= this.player.position.x)
					{
						if (this.body.position.x < this.player.position.x - 300)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else if (this.body.position.x > this.player.position.x - 250)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
					}
					else
					{
						if (this.body.position.x > this.player.position.x + 300)
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
						else if (this.body.position.x < this.player.position.x + 250)
						{
							this.eMoveLeft = false;
							this.eMoveRight = true;
						}
						else
						{
							this.eMoveLeft = true;
							this.eMoveRight = false;
						}
					}

					if (this.body.position.y <= this.player.position.y)
					{
						if (this.body.position.y < this.player.position.y - 300)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else if (this.body.position.y > this.player.position.y - 250)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
					}
					else
					{
						if (this.body.position.y > this.player.position.y + 300)
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
						else if (this.body.position.y < this.player.position.y + 250)
						{
							this.eMoveUp = false;
							this.eMoveDown = true;
						}
						else
						{
							this.eMoveUp = true;
							this.eMoveDown = false;
						}
					}
				}
			}
		}
	}

	//   ▄████████ ███▄▄▄▄      ▄████████   ▄▄▄▄███▄▄▄▄   ▄██   ▄        ███    █▄     ▄███████▄ ████████▄     ▄████████     ███        ▄████████ 
	//  ███    ███ ███▀▀▀██▄   ███    ███ ▄██▀▀▀███▀▀▀██▄ ███   ██▄      ███    ███   ███    ███ ███   ▀███   ███    ███ ▀█████████▄   ███    ███ 
	//  ███    █▀  ███   ███   ███    █▀  ███   ███   ███ ███▄▄▄███      ███    ███   ███    ███ ███    ███   ███    ███    ▀███▀▀██   ███    █▀  
	// ▄███▄▄▄     ███   ███  ▄███▄▄▄     ███   ███   ███ ▀▀▀▀▀▀███      ███    ███   ███    ███ ███    ███   ███    ███     ███   ▀  ▄███▄▄▄     
	//▀▀███▀▀▀     ███   ███ ▀▀███▀▀▀     ███   ███   ███ ▄██   ███      ███    ███ ▀█████████▀  ███    ███ ▀███████████     ███     ▀▀███▀▀▀     
	//  ███    █▄  ███   ███   ███    █▄  ███   ███   ███ ███   ███      ███    ███   ███        ███    ███   ███    ███     ███       ███    █▄  
	//  ███    ███ ███   ███   ███    ███ ███   ███   ███ ███   ███      ███    ███   ███        ███   ▄███   ███    ███     ███       ███    ███ 
	//  ██████████  ▀█   █▀    ██████████  ▀█   ███   █▀   ▀█████▀       ████████▀   ▄████▀      ████████▀    ███    █▀     ▄████▀     ██████████ 

	eUpdate(time: number)
	{
		if (this.alive)
		{
			if (this.room.active)
			{
				this.eVelocityX = 0;
				this.eVelocityY = 0;

				if (this.game.time.now > this.fireTimer)
				{
					if (this.eType == this.enemyTypeEnum.BASE)
					{
						this.fireTimer = this.game.time.now + 2000;
					}
					else if (this.eType == this.enemyTypeEnum.RAPID)
					{
						this.fireTimer = this.game.time.now + 400;
					}
					else if (this.eType == this.enemyTypeEnum.LASER)
					{
						this.fireTimer = this.game.time.now + 10;
					}
					else
					{
						this.fireTimer = this.game.time.now + 4000;
					}
					this.eAim = true;
				}

				if (this.eAim)
				{
					this.aim = true;
				}

				this.weapon.trackSprite(this, 0, 0);

				this.ePathfinding(this.fireTimer - this.game.time.now);

				if ((this.eMoveUp || this.eMoveDown) && (this.eMoveLeft || this.eMoveRight) && !((this.eMoveUp && this.eMoveDown) || (this.eMoveLeft && this.eMoveRight)))
				{
					if (this.eMoveUp)
					{
						this.eVelocityY -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
					else
					{
						this.eVelocityY += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}

					if (this.eMoveLeft)
					{
						this.eVelocityX -= Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
					else
					{
						this.eVelocityX += Math.sqrt(Math.pow(this.eSpeed, 2) / 2);
					}
				}
				else
				{
					if (this.eMoveUp)
					{
						this.eVelocityY -= this.eSpeed;
					}
					if (this.eMoveDown)
					{
						this.eVelocityY += this.eSpeed;
					}

					if (this.eMoveLeft)
					{
						this.eVelocityX -= this.eSpeed;
					}
					if (this.eMoveRight)
					{
						this.eVelocityX += this.eSpeed;
					}
				}

				if (this.aim)
				{
					if (this.eType == this.enemyTypeEnum.LASER && !this.fireBreak)
					{
						var prediction = new Phaser.Rectangle(this.player.body.position.x, this.player.body.position.y, this.player.body.width, this.player.body.height);
						prediction.x = prediction.x + (this.player.body.velocity.x * 1.2);
						prediction.y = prediction.y + (this.player.body.velocity.y * 1.2);
						this.weapon.fireAngle = this.game.physics.arcade.angleBetween(this.body, prediction) * 57.2958;
                        this.laser.play();
					}
					else if (this.eType != this.enemyTypeEnum.LASER)
					{
						this.weapon.fireAngle = this.game.physics.arcade.angleBetween(this.body, this.player.body) * 57.2958;
					}

					if (this.eType == this.enemyTypeEnum.SHOTGUN)
					{
                        this.bulletShotgun.play();
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
					else if (this.eType == this.enemyTypeEnum.LASER)
					{
						this.weapon.fire();
						if (!this.fireBreak)
						{
							this.fireBreak = true;
							this.game.time.events.add(4000, this.eFireDelay, this);
						}
					}
					else if (this.eType == this.enemyTypeEnum.RAPID)
					{
						this.weapon.fire();
                        this.bulletRapid.play();
						if (!this.fireBreak)
						{
							this.fireBreak = true;
							this.game.time.events.add(6000, this.eFireDelay, this);
						}
					}
					else
                    {
                        this.bulletBasic.play();
						this.weapon.fire();
					}

					this.eAim = false;
				}

				this.body.velocity.y = this.eVelocityY * time;
				this.body.velocity.x = this.eVelocityX * time;

				this.aim = false;
			}
		}
	}

	eSecondShot()
	{
        this.bulletShotgun.play();
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
	}

	eFireDelay()
	{
		if (this.eType == this.enemyTypeEnum.LASER)
		{
			this.fireTimer = this.game.time.now + 1500;
		}
		else
		{
			this.fireTimer = this.game.time.now + 2000;
		}
		this.fireBreak = false;
	}

    eDeath()
    {
        this.enemyDeath.play();
    }
}
