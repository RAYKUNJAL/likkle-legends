import * as Phaser from 'phaser';

export default class Player extends Phaser.GameObjects.Container {
  public tray: {
    hasBara: boolean;
    hasChanna: boolean;
    pepper: string | null;
    extras: string[];
  };
  
  private sprite: Phaser.GameObjects.Image;
  private trayContainer: Phaser.GameObjects.Container;
  private trayText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.sprite = scene.add.image(0, 0, 'vendor').setScale(0.3);
    this.sprite.setBlendMode(Phaser.BlendModes.MULTIPLY); 
    
    // Shadow
    const shadow = scene.add.ellipse(0, 65, 80, 20, 0x000000, 0.2);

    this.tray = {
      hasBara: false,
      hasChanna: false,
      pepper: 'no pepper',
      extras: []
    };

    // UI to show what's on tray
    this.trayContainer = scene.add.container(0, -120);
    const trayBg = scene.add.rectangle(0, 0, 100, 60, 0xffffff, 0.9).setStrokeStyle(2, 0xffb300);
    this.trayText = scene.add.text(0, 0, 'Empty', { 
        fontSize: '12px', 
        color: '#3e2723',
        align: 'center',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.trayContainer.add([trayBg, this.trayText]);
    this.trayContainer.setVisible(false);

    this.add([shadow, this.sprite, this.trayContainer]);
    this.setSize(100, 150);
  }

  updateTrayDisplay() {
    if (!this.tray.hasBara && !this.tray.hasChanna) {
        this.trayContainer.setVisible(false);
        return;
    }
    this.trayContainer.setVisible(true);
    let desc = this.tray.hasBara ? 'Bara' : '';
    if (this.tray.hasChanna) desc += ' + Channa';
    if (this.tray.pepper !== 'no pepper') desc += `\n${this.tray.pepper}`;
    if (this.tray.extras.length > 0) desc += `\n+${this.tray.extras.length} extras`;
    this.trayText.setText(desc);
  }

  clearTray() {
    this.tray = {
      hasBara: false,
      hasChanna: false,
      pepper: 'no pepper',
      extras: []
    };
    this.updateTrayDisplay();
  }
  
  walkTo(x: number, y: number, callback?: () => void) {
    this.scene.tweens.add({
        targets: this,
        x, y,
        duration: 250,
        ease: 'Power2',
        onComplete: callback
    });
  }
}
