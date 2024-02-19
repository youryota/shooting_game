class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.playerLife = 3;
        this.playerLifeText;
        this.restartText;
        this.canCollide = true; // 衝突検出の制御用フラグ
        this.playerCanMove = true; // プレイヤーの移動を制御するフラグ
        this.enemyCount = 0; // 破壊したエネミーの数
        this.enemyCountText; // エネミーの数を表示するテキスト
        this.gameOver = false; // ゲームオーバーかどうかのフラグ
        this.enemy2Timer; // enemy2の弾を発射するタイマー
        this.gameStarted = false; // ゲームが開始したかどうかのフラグ
        this.enemyBullet; // 敵の弾
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
        this.physics.start(); // 物理エンジンを有効化する
    
        const background = this.add.image(D_WIDTH / 2, D_HEIGHT / 2, 'background');
        background.setDisplaySize(D_WIDTH, D_HEIGHT);
    
        const player = this.physics.add.sprite(D_WIDTH / 2, 700, 'player');
        this.player = player;
    
        // エネミーの初期位置をランダムに設定
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

        // ライフのテキスト表示
        this.playerLifeText = this.add.text(20, 20, 'Life: 3', { fontSize: '24px', fill: '#fff' });

        // 破壊したエネミーの数を表示するテキストを追加
        this.enemyCountText = this.add.text(20, 50, 'Enemies: 0', { fontSize: '24px', fill: '#fff' });

        // リスタートのテキスト表示
        this.restartText = this.add.text(D_WIDTH / 2, D_HEIGHT / 2, 'Press R to restart', { fontSize: '32px', fill: '#fff' });
        this.restartText.setOrigin(0.5);
        this.restartText.setVisible(false); // 最初は非表示にしておく

        // 敵の弾のグループを作成
        this.enemyBullet = this.physics.add.group();
    }

    startGame() {
        this.spaceText.setVisible(false);
        this.gameStarted = true;

        // ゲームが始まったらenemy2の弾を発射するタイマーを設定する
        this.enemy2Timer = this.time.addEvent({
            delay: 3000,
            loop: true,
            callback: this.fireEnemyBullet,
            callbackScope: this
        });
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
            object.setVelocity(0, 0); // 移動を停止する
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

        // プレイヤーと敵の衝突判定
        if (this.canCollide) { // 衝突が有効な場合にのみ衝突検出を行う
            this.physics.overlap(this.player, this.enemy, this.enemyCollision, null, this);
        }

        // 敵の動き
        let direction = new Phaser.Math.Vector2(this.player.x - this.enemy.x, this.player.y - this.enemy.y);
        direction.normalize();
        this.enemy.setVelocity(direction.x * 200, direction.y * 200);

        // 敵とプレイヤーの弾の衝突判定
        this.physics.overlap(this.bullets, this.enemy, this.bulletEnemyCollision, null, this);

        // プレイヤーと敵の弾の衝突判定
        this.physics.overlap(this.player, this.enemyBullet, this.playerEnemyBulletCollision, null, this);
    }

    bulletEnemyCollision(bullet, enemy) {
        bullet.setActive(false).setVisible(false); // バレットを非アクティブにする
        enemy.setActive(false).setVisible(false); // 敵を非アクティブにする
    
        bullet.x = -100; // 画面外に配置して位置をリセット
        bullet.y = -100;
        bullet.enableBody(true, bullet.x, bullet.y, true, true); // バレットの物理的なボディを有効にする
    
        // 破壊したエネミーの数を増やす
        this.enemyCount++;
        this.enemyCountText.setText('Enemies: ' + this.enemyCount);
    
        // ゲームクリアの条件をチェック
        if (this.enemyCount >= 10) {
            this.showGameClearText();
        } else {
            // 新しいエネミーをランダムな位置に生成
            const enemyX = Phaser.Math.Between(0, this.game.config.width);
            const enemyY = Phaser.Math.Between(0, this.game.config.height);
            this.enemy.setPosition(enemyX, enemyY);
            this.enemy.setActive(true).setVisible(true);
        }
    }
    
    enemyCollision(player, enemy) {
        console.log("Enemy collided with player!"); 
        // 衝突検出が行われた後、衝突検出を無効化する
        this.canCollide = false;

        // プレイヤーと敵が衝突したときの処理
        this.playerLife--; // ライフを減らす
        this.playerLife = Math.max(0, this.playerLife); // ライフが 0 未満にならないようにする
        this.playerLifeText.setText('Life: ' + this.playerLife); // ライフの表示を更新

        if (this.playerLife === 0) {
            // ライフがなくなったらリスタートテキストを表示する
            this.restartText.setVisible(true);
            // プレイヤーの移動を無効化する
            this.playerCanMove = false;
            // キーボードイベントを追加する
            this.input.keyboard.on('keydown-R', () => {
                // Rキーが押されたときの処理
                this.restartGame();
            });
        }

        // 衝突検出の無効化を解除するために、一定時間後に有効にする
        this.time.delayedCall(1000, () => {
            this.canCollide = true;
        });
    }


    showGameClearText() {
        this.restartText.setText('Game Clear! Press R to restart');
        this.restartText.setVisible(true);
        this.playerCanMove = false; // プレイヤーの移動を無効化する
        this.gameOver = true; // ゲームオーバーフラグを設定
        this.enemy.setVelocity(0, 0); // エネミーの移動を停止する
        this.input.keyboard.on('keydown-R', () => {
            // Rキーが押されたときの処理
            if (this.gameOver) {
                this.restartGame();
            }
        });
    }
    
    restartGame() {
        // ゲームをリスタートする処理
        this.restartText.setVisible(false); // リスタートテキストを非表示にする
        this.playerLife = 3;
        this.playerLifeText.setText('Life: ' + this.playerLife);
        this.enemyCount = 0; // 破壊したエネミーの数をリセット
        this.enemyCountText.setText('Enemies: 0');
        this.gameOver = false; // ゲームオーバーフラグをリセット
        this.player.setPosition(this.game.config.width / 2, 700); // プレイヤーの初期位置に戻す
        this.enemy.setPosition(this.game.config.width / 2, 100); // 敵の初期位置に戻す
        this.canCollide = true; // 衝突検出を有効にする
        this.playerCanMove = true; // プレイヤーの移動を有効にする
        this.enemy.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200)); // エネミーのランダムな移動を再開する
    }

    fireEnemyBullet() {
        if (!this.gameStarted) return; // ゲームが開始されていない場合は弾を発射しない
    
        const D_WIDTH = this.game.config.width;
        const D_HEIGHT = this.game.config.height;
    
        if (this.playerLife > 0) { // ライフが0以上の場合のみ弾を発射する
            const bullet1 = this.enemyBullet.create(this.enemy2.x, this.enemy2.y, 'enemy_bullet');
            bullet1.setVelocityY(200); // バレットを下方向に移動させる
    
            const bullet2 = this.enemyBullet.create(this.enemy2.x - 50, this.enemy2.y, 'enemy_bullet');
            bullet2.setVelocityY(200);
    
            const bullet3 = this.enemyBullet.create(this.enemy2.x + 50, this.enemy2.y, 'enemy_bullet');
            bullet3.setVelocityY(200);
        }
    
        // タイマーイベントを再設定し、次の弾の発射を予約する
        this.enemy2Timer.reset({
            delay: 3000, // 3秒間隔で発射
            callback: this.fireEnemyBullet,
            callbackScope: this,
            loop: false // 一度だけ実行する
        });
    }
    

    playerEnemyBulletCollision(player, enemyBullet) {
        enemyBullet.disableBody(true, true); // 敵の弾を非アクティブにする
        this.playerLife--; // プレイヤーのライフを減らす
        this.playerLife = Math.max(0, this.playerLife); // ライフが 0 未満にならないようにする
        this.playerLifeText.setText('Life: ' + this.playerLife); // ライフの表示を更新
    
        if (this.playerLife === 0) {
            this.restartText.setVisible(true); // リスタートテキストを表示する
            this.playerCanMove = false; // プレイヤーの移動を無効化する
            this.input.keyboard.on('keydown-R', () => {
                this.restartGame(); // Rキーが押されたらゲームをリスタートする
            });
        }
    }
    
}
