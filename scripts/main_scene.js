//#5

class MainScene extends Phaser.Scene {

	constructor()
	{
		super('MainScene');
	}

	preload()
    {
        this.load.image('background', 'assets/背景.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy', 'assets/enemy_1.png');
        this.load.image('enemy2', 'assets/enemy_2.png');
    }

    create()
    {
        const background = this.add.image(D_WIDTH / 2, D_HEIGHT / 2, 'background');
        background.setDisplaySize(D_WIDTH, D_HEIGHT);
        const player = this.physics.add.sprite(D_WIDTH / 2,700, 'player');
        this.player = player;
        this.physics.world.setBounds(0, 0, D_WIDTH, D_HEIGHT);
        player.setCollideWorldBounds(true);
    }

    arrow_move(cursors, object){
    
        if(cursors.up.isDown){
            console.log("Up!!");
            object.setVelocityY(-400);// 上方向の速度を設定
            
        }else if(cursors.down.isDown){
            console.log("down!!");
            object.setVelocityY(400);// 下方向の速度を設定
    
        }else if(cursors.left.isDown){
            console.log("Left");
            object.setVelocityX(-400);// 左方向の速度を設定
    
        }else if(cursors.right.isDown){
            console.log("Right!!");
            object.setVelocityX(400);// 右方向の速度を設定
    
        }else{
            object.setVelocity(0,0);// 横方向の速度を0
        }
    }

    update(time, delta) {
        let cursors = this.input.keyboard.createCursorKeys();
        this.arrow_move(cursors, this.player);
    }
}