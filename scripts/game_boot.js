// ゲーム画面サイズ (16:9)
const D_WIDTH = 1900; // 例えば1600ピクセル
const D_HEIGHT = 900; // 例えば900ピクセル

// ページ読み込み完了時に実行
window.onload = function() {
    // ゲームの設定値
    config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT, // 画面に合わせてスケーリング
            parent: 'phaser-example',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: D_WIDTH,
            height: D_HEIGHT
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {
                    y: 0
                },
                debug: true
            }
        },
        scene: MainScene
    };
    // ゲーム開始
    game = new Phaser.Game(config);
}; 
