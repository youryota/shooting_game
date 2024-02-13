class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.playerLife = 3;
    }

    preload() {
        this.load.image('background', 'assets/背景.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy_1.png');
        this.load.image('enemy2', 'assets/enemy_2.png');
        this.load.image('bullet', 'assets/player_tama.png');
    }

    create() {
        const background = this.add.image(D_WIDTH / 2, D_HEIGHT / 2, 'background');
        background.setDisplaySize(D_WIDTH, D_HEIGHT);

        const player = this.physics.add.sprite(D_WIDTH / 2, 700, 'player');
        this.player = player;

        const enemy = this.physics.add.sprite(D_WIDTH / 2, 100, 'enemy');
        enemy.angle = 180;
        this.enemy = enemy;

        this.physics.world.setBounds(0, 0, D_WIDTH, D_HEIGHT);
        player.setCollideWorldBounds(true);

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.bullets = this.physics.add.group({
            defaultKey: 'bullet',
            maxSize: 3,
            runChildUpdate: true
        });

        this.bullets.children.iterate(child => {
            child.setActive(false).setVisible(false);
        });

         const enemyInitialRotation = this.enemy.angle;
    }

    arrow_move(cursors, object) {
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
    }
    

    update(time, delta) {

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
                if (bullet.y < 0 || bullet.y > D_HEIGHT || bullet.x < 0 || bullet.x > D_WIDTH) {
                    bullet.setActive(false).setVisible(false);
                }
            }
        });

        this.physics.overlap(this.player, this.enemy, this.enemyCollision, null, this);

        // 敵の動き
        let direction = new Phaser.Math.Vector2(this.player.x - this.enemy.x, this.player.y - this.enemy.y);
        direction.normalize();
        this.enemy.setVelocity(direction.x * 200, direction.y * 200);

        

    }
}