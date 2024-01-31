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
    }
}