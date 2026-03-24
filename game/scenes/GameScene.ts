import * as Phaser from 'phaser';
import Player from '../entities/Player';
import Customer from '../entities/Customer';
import { PEPPER_OPTIONS } from '../entities/DoublesOrder';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private customers: Customer[] = [];
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private level = 1;
  private levelText!: Phaser.GameObjects.Text;
  private timeRemaining = 60;
  private timerText!: Phaser.GameObjects.Text;
  
  // Station positions (mapped to isometric background)
  private stations = {
    fryer: { x: 670, y: 440 },
    pot: { x: 420, y: 440 },
    sauce: { x: 180, y: 480 },
    serving: { x: 400, y: 560 }
  };

  private customerSlots = [
    { x: 200, y: 240, busy: false },
    { x: 400, y: 240, busy: false },
    { x: 600, y: 240, busy: false }
  ];

  constructor() {
    super('GameScene');
  }

  init(data: { level?: number; score?: number }) {
    this.level = data.level ?? 1;
    this.score = data.score ?? 0;
    this.timeRemaining = 60;
  }

  create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    // Header UI
    this.add.rectangle(0, 0, width, 60, 0x000000, 0.4).setOrigin(0);
    this.scoreText = this.add.text(25, 15, `Earnings: $${this.score}`, { 
        fontSize: '24px', color: '#ffb300', fontStyle: 'bold' 
    });
    this.timerText = this.add.text(width - 160, 15, `Timer: ${this.timeRemaining}s`, { 
        fontSize: '24px', color: '#ffffff' 
    });
    this.levelText = this.add.text(width/2, 15, `SHIFT ${this.level}`, { 
        fontSize: '20px', color: '#ffffff', fontStyle: 'bold' 
    }).setOrigin(0.5, 0);

    // Interaction Stations
    this.setupStations();

    // Player (Vendor)
    this.player = new Player(this, width / 2, height - 120);
    this.player.setDepth(20);

    // Initial Spawn
    this.spawnCustomer();
    
    // Spawner Event
    this.time.addEvent({
        delay: Math.max(3000, 8000 - (this.level * 600)),
        loop: true,
        callback: () => this.spawnCustomer()
    });

    // Game Clock
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText(`Timer: ${this.timeRemaining}s`);
        if (this.timeRemaining <= 0) {
            this.scene.start('GameOverScene', { score: this.score, level: this.level });
        }
      },
    });
  }

  private setupStations() {
    // Fryer
    this.createStation('fryer', this.stations.fryer, 'bara', () => this.fryBara());
    // Pot
    this.createStation('pot', this.stations.pot, 'bara', () => this.addChanna());
    
    // Pepper
    this.createStation('pepper', this.stations.sauce, 'pepper', () => this.cyclePepper());

    // Condiments Tray
    const extras = [
        { name: 'Tamarind', texture: 'tamarind', x: 80, y: 500 },
        { name: 'Chadon beni', texture: 'chadonbeni', x: 190, y: 520 },
        { name: 'Cucumber', texture: 'cucumber', x: 300, y: 540 }
    ];

    extras.forEach(cfg => {
        const btn = this.add.image(cfg.x, cfg.y, cfg.texture).setScale(0.12).setInteractive({ useHandCursor: true });
        this.add.text(cfg.x, cfg.y + 35, cfg.name, { fontSize: '10px', color: '#fff', backgroundColor: '#00000088' }).setOrigin(0.5);
        btn.on('pointerdown', () => this.handleAction(() => this.addExtra(cfg.name), cfg.x, cfg.y));
    });

    // Serving
    this.createStation('serve', this.stations.serving, 'vendor', () => this.serveOrder());
  }

  private createStation(id: string, pos: { x: number, y: number }, texture: string, action: () => void) {
    const icon = this.add.image(pos.x, pos.y, texture).setScale(0.15).setInteractive({ useHandCursor: true });
    this.add.text(pos.x, pos.y + 45, id.toUpperCase(), { fontSize: '11px', color: '#ffb300', fontStyle: 'bold' }).setOrigin(0.5);
    
    icon.on('pointerdown', () => {
        // Visual Pulse
        this.tweens.add({ targets: icon, scale: 0.18, duration: 100, yoyo: true });
        this.handleAction(action, pos.x, pos.y);
    });
  }

  private handleAction(action: () => void, targetX: number, targetY: number) {
    // Correct Dash: Player walks to where they can reach the station
    this.player.walkTo(targetX, targetY + 60, action);
  }

  private fryBara() {
    if (this.player.tray.hasBara) return;
    this.speak('Frying the bara!');
    
    const progress = this.add.rectangle(this.player.x, this.player.y - 120, 0, 8, 0xffb300);
    this.tweens.add({
        targets: progress,
        width: 80,
        duration: 1200,
        onComplete: () => {
            progress.destroy();
            this.player.tray.hasBara = true;
            this.player.updateTrayDisplay();
            this.speak('Golden brown!');
        }
    });
  }

  private addChanna() {
    if (!this.player.tray.hasBara || this.player.tray.hasChanna) return;
    this.player.tray.hasChanna = true;
    this.player.updateTrayDisplay();
    this.speak('Scoop! Plenty channa!');
  }

  private addExtra(name: string) {
    if (!this.player.tray.hasChanna) return;
    if (!this.player.tray.extras.includes(name)) {
        this.player.tray.extras.push(name);
        this.player.updateTrayDisplay();
        this.speak(`${name} added!`);
    }
  }

  private cyclePepper() {
    if (!this.player.tray.hasChanna) return;
    const current = this.player.tray.pepper;
    const idx = PEPPER_OPTIONS.indexOf(current as any);
    const nextIdx = (idx + 1) % PEPPER_OPTIONS.length;
    this.player.tray.pepper = PEPPER_OPTIONS[nextIdx];
    this.player.updateTrayDisplay();
    
    const label = this.player.tray.pepper === 'double slight' ? 'slight, slight pepper' : this.player.tray.pepper;
    this.speak(label + '!');
    if (this.player.tray.pepper === 'full pepper') {
        this.speak('Hooo! That hot!');
    }
  }

  private spawnCustomer() {
    const slot = this.customerSlots.find(s => !s.busy);
    if (!slot) return;

    slot.busy = true;
    const customer = new Customer(this, slot.x, slot.y);
    this.customers.push(customer);
    
    customer.on('served', () => {
        slot.busy = false;
        this.score += 5 + (customer.patience * 3);
        this.scoreText.setText(`Earnings: $${this.score}`);
        this.customers = this.customers.filter(c => c !== customer);
    });

    customer.on('left', () => {
        slot.busy = false;
        this.customers = this.customers.filter(c => c !== customer);
    });
  }

  private serveOrder() {
    const matched = this.customers.find(c => c.order.matches(this.player.tray));
    if (matched) {
        matched.fulfill();
        this.player.clearTray();
        this.speak('Coming right up! Enjoy!');
    } else {
        this.cameras.main.shake(200, 0.005);
        this.speak('Wait, that not right!');
    }
  }

  private speak(text: string) {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        // We don't necessarily cancel if it's a short "Scoop!" 
        // but let's prevent long queueing
        const msg = new SpeechSynthesisUtterance(text);
        msg.pitch = 1.1;
        msg.rate = 1.0;
        window.speechSynthesis.speak(msg);
    }
  }
}
