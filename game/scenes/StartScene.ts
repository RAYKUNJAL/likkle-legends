import * as Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  preload() {
    // Background and base images
    this.load.image('background', '/assets/game/bg/background.png');
    this.load.image('vendor', '/assets/game/sprites/vendor.png');
    this.load.image('customer', '/assets/game/sprites/customer.png');
    
    // Stations/Items
    this.load.image('bara', '/assets/game/sprites/bara.png');
    this.load.image('pepper', '/assets/game/sprites/pepper.png');
    this.load.image('tamarind', '/assets/game/sprites/tamarind.png');
    this.load.image('chadonbeni', '/assets/game/sprites/chadonbeni.png');
    this.load.image('cucumber', '/assets/game/sprites/cucumber.png');
    
    // Audio
    const audioPath = '/assets/game/audio/';
    this.load.audio('pepper_no', audioPath + 'pepper_no.mp3');
    this.load.audio('pepper_slight', audioPath + 'pepper_slight.mp3');
    this.load.audio('pepper_full', audioPath + 'pepper_full.mp3');
    this.load.audio('pepper_double', audioPath + 'pepper_double.mp3');
    this.load.audio('order_complete', audioPath + 'order_complete.mp3');
    this.load.audio('order_failed', audioPath + 'order_failed.mp3');

    // Loading indicator
    const { width, height } = this.scale;
    const progress = this.add.graphics();
    
    // Remove the old loadingText
    // const loadingText = this.add.text(width / 2, height / 2, 'Loading Magic...', { fontSize: '24px' }).setOrigin(0.5);
    
    this.load.on('progress', (value: number) => {
        // loadingText.setText(`Loading ${Math.floor(value * 100)}%`); // Old text update
        progress.clear();
        progress.fillStyle(0xffb300, 1);
        progress.fillRect(width / 2 - 150, height / 2 + 100, 300 * value, 20);
    });
    
    this.load.on('complete', () => {
        // loadingText.destroy(); // Old text destroy
        progress.destroy(); // Destroy the graphics bar on complete
    });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0);

    this.add.image(width / 2, height / 2.5, 'vendor').setScale(0.8);

    this.add
      .text(width / 2, height / 4, 'Doubles Dash', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '72px',
        color: '#4e342e',
        stroke: '#ffffff',
        strokeThickness: 8
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2.5 + 100, 'Serve perfect doubles before the patience meter empties!', { // Adjusted Y position
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        color: '#3e2723',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    const startBtn = this.add.container(width / 2, height * 0.75);
    const startBox = this.add
      .rectangle(0, 0, 300, 80, 0xffb300)
      .setStrokeStyle(4, 0xffffff);

    const startText = this.add
      .text(0, 0, 'Start the Shift', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    startBtn.add([startBox, startText]);
    startBox.setInteractive({ useHandCursor: true });
    
    startBox.on('pointerover', () => startBox.setFillStyle(0xffca28));
    startBox.on('pointerout', () => startBox.setFillStyle(0xffb300));
    
    startBox.on('pointerdown', () => {
      this.scene.start('GameScene', { level: 1 });
    });
  }
}
