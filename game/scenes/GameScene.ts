import * as Phaser from 'phaser';
import Player from '../entities/Player';
import Customer from '../entities/Customer';
import { PEPPER_OPTIONS } from '../entities/DoublesOrder';
import { doublesDashSeconds } from '../../lib/games/long-play';

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private customers: Customer[] = [];
  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private level = 1;
  private levelText!: Phaser.GameObjects.Text;
  private timeRemaining = 60;
  private timerText!: Phaser.GameObjects.Text;
  
  // Clean board layout — stations sit on the prep counter, well spaced.
  private stations = {
    fryer: { x: 110, y: 300 },
    pot: { x: 290, y: 300 },
    sauce: { x: 470, y: 300 },
    serving: { x: 690, y: 300 }
  };

  private customerSlots = [
    { x: 160, y: 180, busy: false },
    { x: 400, y: 180, busy: false },
    { x: 640, y: 180, busy: false }
  ];

  constructor() {
    super('GameScene');
  }

  init(data: { level?: number; score?: number }) {
    this.level = data.level ?? 1;
    this.score = data.score ?? 0;
    this.timeRemaining = doublesDashSeconds(this.level);
  }

  create() {
    const { width, height } = this.scale;

    // Clean, purpose-built game board (replaces the busy illustrated scene
    // that was fighting the sprites). Drawn with vector graphics so every
    // station and character reads clearly.
    this.drawBoard(width, height);

    // Header bar
    const header = this.add.graphics();
    header.fillStyle(0x0b2a3a, 0.92);
    header.fillRect(0, 0, width, 56);
    this.scoreText = this.add.text(20, 14, `💰 $${this.score}`, {
        fontSize: '26px', color: '#ffd23f', fontStyle: 'bold'
    });
    this.levelText = this.add.text(width / 2, 16, `SHIFT ${this.level}`, {
        fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.timerText = this.add.text(width - 20, 14, `⏱ ${this.timeRemaining}s`, {
        fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Zone labels
    this.add.text(width / 2, 74, 'CUSTOMERS', {
        fontSize: '12px', color: '#0b2a3a', fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0.5);

    // Interaction Stations
    this.setupStations();

    // Player (Vendor) — works in the lane in front of the counter
    this.player = new Player(this, width / 2, height - 42);
    this.player.setDepth(20);

    // Initial Spawn
    this.spawnCustomer();
    
    // Spawner Event
    this.time.addEvent({
        delay: Math.max(4500, 9000 - (this.level * 450)),
        loop: true,
        callback: () => this.spawnCustomer()
    });

    // Game Clock
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        this.timeRemaining--;
        this.timerText.setText(`⏱ ${this.timeRemaining}s`);
        if (this.timeRemaining <= 0) {
            this.scene.start('GameOverScene', { score: this.score, level: this.level });
        }
      },
    });
  }

  // ── Clean vector game board ──────────────────────────────────────────────
  private drawBoard(width: number, height: number) {
    const g = this.add.graphics();

    // Customer area (top) — warm outdoor stall backdrop
    g.fillGradientStyle(0x3ec8bb, 0x3ec8bb, 0xbdeee8, 0xbdeee8, 1);
    g.fillRect(0, 52, width, 175);

    // Awning stripes along the top of the stall
    const stripeW = width / 10;
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i % 2 === 0 ? 0xff6b35 : 0xffd23f, 1);
      g.fillRect(i * stripeW, 52, stripeW, 14);
    }

    // Kitchen floor
    g.fillGradientStyle(0xf6d9a8, 0xf6d9a8, 0xe7c088, 0xe7c088, 1);
    g.fillRect(0, 227, width, height - 227);

    // Prep counter (holds the station panels + condiments)
    g.fillStyle(0x7a4a24, 1);
    g.fillRoundedRect(16, 235, width - 32, 290, 22);
    g.fillStyle(0xa9743e, 1);
    g.fillRoundedRect(16, 235, width - 32, 276, 22);
  }

  private drawPanel(x: number, y: number, w: number, h: number, accent: number) {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.12); g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, 14);
    g.fillStyle(0xffffff, 0.92); g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 14);
    g.lineStyle(3, accent, 1); g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 14);
    return g;
  }

  private setupStations() {
    // Main counter stations — evenly spaced, each on its own panel
    this.createStation('fryer', this.stations.fryer, 'bara', 0xff6b35, () => this.fryBara());
    this.createStation('pot', this.stations.pot, 'bara', 0xf59e0b, () => this.addChanna());
    this.createStation('pepper', this.stations.sauce, 'pepper', 0xef4444, () => this.cyclePepper());
    this.createStation('serve', this.stations.serving, 'vendor', 0x22c55e, () => this.serveOrder());

    // Condiments row label
    this.add.text(400, 398, 'CONDIMENTS', {
      fontSize: '11px', color: '#5b3a1c', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Condiment items — each on its own mini panel, no overlap
    const extras = [
      { name: 'Tamarind', texture: 'tamarind', x: 250 },
      { name: 'Chadon beni', texture: 'chadonbeni', x: 400 },
      { name: 'Cucumber', texture: 'cucumber', x: 550 }
    ];
    extras.forEach(cfg => {
      const y = 445;
      this.drawPanel(cfg.x, y, 95, 95, 0x8b5cf6);
      const btn = this.add.image(cfg.x, y - 7, cfg.texture).setScale(0.1)
        .setInteractive({ useHandCursor: true });
      this.add.text(cfg.x, y + 33, cfg.name, {
        fontSize: '10px', color: '#3e2723', fontStyle: 'bold'
      }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        this.tweens.add({ targets: btn, scale: 0.12, duration: 100, yoyo: true });
        this.handleAction(() => this.addExtra(cfg.name), cfg.x, y);
      });
    });
  }

  private createStation(id: string, pos: { x: number, y: number }, texture: string, accent: number, action: () => void) {
    this.drawPanel(pos.x, pos.y, 150, 140, accent);
    const icon = this.add.image(pos.x, pos.y - 10, texture).setScale(0.16)
      .setInteractive({ useHandCursor: true });
    this.add.text(pos.x, pos.y + 54, id.toUpperCase(), {
      fontSize: '13px', color: '#3e2723', fontStyle: 'bold'
    }).setOrigin(0.5);

    icon.on('pointerdown', () => {
      this.tweens.add({ targets: icon, scale: 0.19, duration: 100, yoyo: true });
      this.handleAction(action, pos.x, pos.y);
    });
  }

  private handleAction(action: () => void, targetX: number, _targetY: number) {
    // Player slides along the walking lane in front of the counter and reaches
    // up to the station — keeps the character clear of the station panels.
    const laneY = this.scale.height - 42;
    this.player.walkTo(targetX, laneY, action);
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
        this.scoreText.setText(`💰 $${this.score}`);
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
