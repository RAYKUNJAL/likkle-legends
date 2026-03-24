import * as Phaser from 'phaser';
import { supabase } from '../../lib/supabase-client';

export default class GameOverScene extends Phaser.Scene {
  private score = 0;
  private level = 1;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score?: number; level?: number }) {
    this.score = data.score ?? 0;
    this.level = data.level ?? 1;
  }

  async create() {
    const { width, height } = this.scale;

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height).setAlpha(0.4);
    this.add.rectangle(0, 0, width, height, 0xfde4c7, 0.7).setOrigin(0);

    this.add
      .text(width / 2, height / 4, 'Shift Complete!', {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '56px',
        color: '#3e2723',
        stroke: '#ffffff',
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2.5, `Final Score: ${this.score}`, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '32px',
        color: '#1b1b1b',
        fontStyle: 'bold'
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2.1, `Survived Level ${this.level}`, {
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '22px',
        color: '#4e342e',
      })
      .setOrigin(0.5);

    // Save Score logic
    const userId = this.registry.get('userId');
    const userName = this.registry.get('userName') || 'Anonymous Legend';
    
    const savingText = this.add.text(width/2, height * 0.6, 'Saving score...', { fontSize: '16px', color: '#6d4c41' }).setOrigin(0.5);
    
    try {
        const { error } = await supabase.from('game_scores').insert({
            user_id: userId || null,
            user_name: userName,
            game_id: 'doubles-dash',
            score: this.score,
            level: this.level
        });
        
        if (error) throw error;
        savingText.setText('Score Saved! 🏆').setColor('#4caf50').setFontStyle('bold');
    } catch (err) {
        console.error('Failed to save score:', err);
        savingText.setText('Score not saved (Offline)').setColor('#f44336');
    }

    const nextBtn = this.add.container(width / 2, height * 0.8);
    const btnBg = this.add.rectangle(0, 0, 280, 70, 0xffb300).setStrokeStyle(4, 0xffffff);
    const btnText = this.add.text(0, 0, 'Next Shift', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    
    nextBtn.add([btnBg, btnText]);
    btnBg.setInteractive({ useHandCursor: true });
    
    btnBg.on('pointerdown', () => {
      this.scene.start('GameScene', { level: this.level + 1, score: this.score });
    });
  }
}
