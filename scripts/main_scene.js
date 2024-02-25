class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.playerLife = 3;
        this.playerLifeText;
        this.restartText;
        this.canCollide = true;
        this.playerCanMove = true;
        this.enemyCount = 0;
        this.enemyCountText;
        this.gameOver = false;
        this.enemy2Timer;
        this.gameStarted = false;
        this.enemyBullet;
    }

    preload() {
        this.load.image('background', 'assets/背景.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy_1.png');
        this.load.image('enemy2', 'assets/enemy_2.png');
        this.load.image('enemy_bullet', 'assets/teki_tama.png');
        this.load.image('bullet', 'assets/player_tama.png');
    }

    create() {
        const D_WIDTH = this.game.config.width;
        const D_HEIGHT = this.game.config.height;

        this.physics.world.setBounds(0, 0, D_WIDTH, D_HEIGHT);

        const background = this.add.image(D_WIDTH / 2, D_HEIGHT / 2, 'background');
        background.setDisplaySize(D_WIDTH, D_HEIGHT);

        const player = this.physics.add.sprite(D_WIDTH / 2, 700, 'player');
        this.player = player;

        const enemyX = Phaser.Math.Between(0, D_WIDTH);
        const enemyY = Phaser.Math.Between(0, D_HEIGHT);
        const enemy = this.physics.add.sprite(enemyX, enemyY, 'enemy');
        enemy.angle = 180;
        this.enemy = enemy;
        this.enemyInitialRotation = this.enemy.angle;

        player.setCollideWorldBounds(true);

        const enemy2 = this.physics.add.sprite(D_WIDTH / 2, 100, 'enemy2');
        this.enemy2 = enemy2;
        enemy2.angle = 180;

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.spaceText = this.add.text(D_WIDTH / 2, D_HEIGHT / 2, 'Press SPACE to start', { fontSize: '32px', fill: '#fff' });
        this.spaceText.setOrigin(0.5);
        this.input.keyboard.on('keydown-SPACE', () => {
            this.startGame();
        });

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 3,
            runChildUpdate: true
        });

        this.bullets.children.iterate(child => {
            child.setActive(false).setVisible(false);
        });

        this.playerLifeText = this.add.text(20, 20, 'Life: 3', { fontSize: '24px', fill: '#fff' });

        this.enemyCountText = this.add.text(20, 50, 'Enemies: 0', { fontSize: '24px', fill: '#fff' });

        this.restartText = this.add.text(D_WIDTH / 2, D_HEIGHT / 2, 'Press R to restart', { fontSize: '32px', fill: '#fff' });
        this.restartText.setOrigin(0.5);
        this.restartText.setVisible(false);

        this.enemyBullet = this.physics.add.group();
        this.enemy2Timer = this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.fireEnemyBullet,
            callbackScope: this
        });
    }

    startGame() {
        this.spaceText.setVisible(false);
        this.gameStarted = true;
    }
    

    arrow_move(cursors, object) {
        if (this.playerCanMove) {
            if (cursors.up.isDown) {
                object.setVelocityY(-400);
            } else if (cursors.down.isDown) {
                object.setVelocityY(400);
            } else if (cursors.left.isDown) {
                object.setVelocityX(-400);
            } else if (cursors.right.isDown) {
                object.setVelocityX(400);
            } else {
                object.setVelocity(0, 0);
            }
        } else {
            object.setVelocity(0, 0);
        }
    }

    update(time, delta) {
        if (!this.gameStarted) return;

        this.physics.overlap(this.bullets, this.enemy, this.bulletEnemyCollision, null, this);
        let cursors = this.input.keyboard.createCursorKeys();
        this.arrow_move(cursors, this.player);

        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            const bullet = this.bullets.get(this.player.x, this.player.y);

            if (bullet) {
                bullet.setActive(true).setVisible(true);
                bullet.setVelocityY(-800);
            }
        }

        this.bullets.children.iterate(bullet => {
            if (bullet.active) {
                if (bullet.y < 0 || bullet.y > this.game.config.height || bullet.x < 0 || bullet.x > this.game.config.width) {
                    bullet.setActive(false).setVisible(false);
                }
            }
        });

        if (this.canCollide) {
            this.physics.overlap(this.player, this.enemy, this.enemyCollision, null, this);
        }

        let direction = new Phaser.Math.Vector2(this.player.x - this.enemy.x, this.player.y - this.enemy.y);
        direction.normalize();
        this.enemy.setVelocity(direction.x * 200, direction.y * 200);

        this.physics.overlap(this.bullets, this.enemy, this.bulletEnemyCollision, null, this);

        this.physics.overlap(this.player, this.enemyBullet, this.playerEnemyBulletCollision, null, this);
    }

    bulletEnemyCollision(bullet, enemy) {
        bullet.setActive(false).setVisible(false);
        enemy.setActive(false).setVisible(false);

        bullet.x = -100;
        bullet.y = -100;
        bullet.enableBody(true, bullet.x, bullet.y, true, true);

        this.enemyCount++;
        this.enemyCountText.setText('Enemies: ' + this.enemyCount);

        if (this.enemyCount >= 10) {
            this.showGameClearText();
        } else {
            const enemyX = Phaser.Math.Between(0, this.game.config.width);
            const enemyY = Phaser.Math.Between(0, this.game.config.height);
            this.enemy.setPosition(enemyX, enemyY);
            this.enemy.setActive(true).setVisible(true);
        }
    }

    enemyCollision(player, enemy) {
        console.log("Enemy collided with player!");
        this.canCollide = false;

        this.playerLife--;
        this.playerLife = Math.max(0, this.playerLife);
        this.playerLifeText.setText('Life: ' + this.playerLife);

        if (this.playerLife === 0) {
            this.showRestartText();
        }

        this.time.delayedCall(1000, () => {
            this.canCollide = true;
        });
    }

    showRestartText() {
        this.restartText.setText('Game Over! Press R to restart');
        this.restartText.setVisible(true);
        this.playerCanMove = false;
        this.gameOver = true;
        this.enemy.setVelocity(0, 0);
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.restartGame();
            }
        });
    }

    showGameClearText() {
        this.restartText.setText('Game Clear! Press R to restart');
        this.restartText.setVisible(true);
        this.playerCanMove = false;
        this.gameOver = true;
        this.enemy.setVelocity(0, 0);
        this.enemyBullet.children.each(function (bullet) {
            bullet.disableBody(true, true);
        });
        this.physics.pause();
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver) {
                this.restartGame();
            }
        });
    }

    restartGame() {
        this.restartText.setVisible(false);
        this.playerLife = 3;
        this.playerLifeText.setText('Life: ' + this.playerLife);
        this.enemyCount = 0;
        this.enemyCountText.setText('Enemies: 0');
        this.gameOver = false;
        this.player.setPosition(this.game.config.width / 2, 700);
        this.enemy.setPosition(this.game.config.width / 2, 100);
        this.canCollide = true;
        this.playerCanMove = true;
        this.enemy.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
        this.enemyBullet.clear(true, true);
        this.physics.resume();
        this.enemy2Timer.paused = false;
    }


    fireEnemyBullet() {
        if (!this.gameStarted) return;
    
        const D_WIDTH = this.game.config.width;
        const D_HEIGHT = this.game.config.height;
    
        if (this.playerLife > 0 && this.enemyCount < 10) {
            const bullet1 = this.enemyBullet.create(this.enemy2.x, this.enemy2.y, 'enemy_bullet');
            bullet1.setVelocityY(200);
    
            const bullet2 = this.enemyBullet.create(this.enemy2.x - 50, this.enemy2.y, 'enemy_bullet');
            bullet2.setVelocityY(200);
    
            const bullet3 = this.enemyBullet.create(this.enemy2.x + 50, this.enemy2.y, 'enemy_bullet');
            bullet3.setVelocityY(200);
        }
    }

    playerEnemyBulletCollision(player, enemyBullet) {
        enemyBullet.disableBody(true, true);
        this.playerLife--;
        this.playerLifeText.setText('Life: ' + this.playerLife);

        if (this.playerLife === 0) {
            this.showRestartText();
        }
    }
}
