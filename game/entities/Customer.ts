import * as Phaser from 'phaser';
import DoublesOrder from './DoublesOrder';

export default class Customer extends Phaser.GameObjects.Container {
  readonly order: DoublesOrder;
  public patience = 5; // Hearts
  private maxPatience = 5;
  private hearts: Phaser.GameObjects.Text[] = [];
  private patienceEvent?: Phaser.Time.TimerEvent;
  private orderText: Phaser.GameObjects.Text;
  private sprite: Phaser.GameObjects.Image;
  private bubble: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    this.sprite = scene.add.image(0, 0, 'customer').setScale(0.28);
    this.sprite.setBlendMode(Phaser.BlendModes.MULTIPLY);
    
    const shadow = scene.add.ellipse(0, 70, 80, 20, 0x000000, 0.2);
    
    // Order Speech (Web Speech API)
    this.order = new DoublesOrder();
    this.playOrderVoice();

    // Speech Bubble (Visual)
    this.bubble = scene.add.container(0, -100);
    const bubbleBg = scene.add.rectangle(0, 0, 140, 70, 0xffffff, 0.95).setStrokeStyle(3, 0x4e342e);
    this.orderText = scene.add.text(0, 0, this.order.getDescription(), {
        fontFamily: 'Inter, sans-serif',
        fontSize: '15px',
        color: '#3e2723',
        align: 'center',
        wordWrap: { width: 130 },
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.bubble.add([bubbleBg, this.orderText]);
    
    // Hearts
    const heartsCont = scene.add.container(0, -150);
    for (let i = 0; i < this.maxPatience; i++) {
        const h = scene.add.text(-40 + i * 20, 0, '❤️', { fontSize: '18px' }).setOrigin(0.5);
        this.hearts.push(h);
        heartsCont.add(h);
    }

    this.add([shadow, this.sprite, this.bubble, heartsCont]);
    this.setSize(80, 140);

    this.patienceEvent = scene.time.addEvent({
      delay: Math.max(3000, 6000 - (scene as any).level * 400),
      loop: true,
      callback: () => {
        this.patience -= 1;
        if (this.patience < this.hearts.length && this.patience >= 0) {
            this.hearts[this.patience].setText('🖤');
        }
        if (this.patience <= 0) this.leave();
      },
    });
  }

  private playOrderVoice() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Don't overlap
        const msg = new SpeechSynthesisUtterance(`I would like ${this.order.getDescription()}`);
        msg.pitch = 1.3;
        msg.rate = 0.85;
        window.speechSynthesis.speak(msg);
    }
  }

  fulfill() {
    this.patienceEvent?.remove();
    this.emit('served');
    this.destroy();
  }

  private leave() {
    this.patienceEvent?.remove();
    this.emit('left');
    this.destroy();
  }
}
