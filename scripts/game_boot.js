let config;
let game;

// ゲーム画面サイズ
const D_WIDTH = 800;
const D_HEIGHT = 600;

// ページ読み込み完了時に実行
window.onload = function() {
    // ゲームの設定値
    config = {
        type: Phaser.AUTO,
        width: D_WIDTH, // 画面横幅
        height: D_HEIGHT, // 画面縦幅
        physics: { // 物理演算設定(使用する場合)
            default: 'arcade', // 使用する物理エンジン
            arcade: {
                gravity: {
                    y: 0
                }, // 重力
                debug: true // デバックモード
            }
        },
        scene: MainScene // デフォルトシーン
    };
    // ゲーム開始
    game = new Phaser.Game(config);
}; 