import * as Phaser from 'phaser';
import StartScene from './scenes/StartScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

let gameInstance: Phaser.Game | null = null;

export interface GameContext {
  userId?: string;
  userName?: string;
}

export function initDoublesDashGame(parentId = 'doubles-dash-game', context: GameContext = {}) {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingParent = document.getElementById(parentId);
  if (!existingParent) {
    return null;
  }

  if (gameInstance) {
    return gameInstance;
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentId,
    backgroundColor: '#f8e2b6',
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scene: [StartScene, GameScene, GameOverScene],
  };

  gameInstance = new Phaser.Game(config);
  
  // Store context in registry for scenes to access
  gameInstance.registry.set('userId', context.userId);
  gameInstance.registry.set('userName', context.userName);
  
  return gameInstance;
}

export function destroyDoublesDashGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
  }
}
