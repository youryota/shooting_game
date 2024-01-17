class MainScene extends Phaser.Scene {

	constructor()
	{
		super('hello-world')
	}

	preload()
    {
    }

    create()
    {
        this.cameras.main.setBackgroundColor("#333388");
        this.add.text(D_WIDTH/2, D_HEIGHT/2, 'Hello World', { fontSize: '28px', fill: '#FFF' ,fontFamily: "Arial"}); 

    }
}