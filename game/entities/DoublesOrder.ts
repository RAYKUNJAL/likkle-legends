export type PepperOption = 'no pepper' | 'slight pepper' | 'full pepper' | 'double slight';

export const PEPPER_OPTIONS: PepperOption[] = ['no pepper', 'slight pepper', 'full pepper', 'double slight'];
export const EXTRA_OPTIONS = ['Tamarind', 'Chadon beni', 'Cucumber'];

export default class DoublesOrder {
  readonly pepper: PepperOption;
  readonly extras: string[];

  constructor() {
    // Randomize pepper level
    this.pepper = PEPPER_OPTIONS[Math.floor(Math.random() * PEPPER_OPTIONS.length)];
    
    // Randomize extras (0 to 3)
    const count = Math.floor(Math.random() * (EXTRA_OPTIONS.length + 1));
    const shuffle = [...EXTRA_OPTIONS].sort(() => Math.random() - 0.5);
    this.extras = shuffle.slice(0, count);
  }

  getDescription() {
    const pepperLabel = this.pepper === 'double slight' ? 'slight, slight pepper' : this.pepper;
    const extrasLabel = this.extras.length ? this.extras.join(', ') : 'sweet';
    return `${pepperLabel}; ${extrasLabel}`;
  }
  
  matches(tray: { hasBara: boolean; hasChanna: boolean; pepper: string | null; extras: string[] }): boolean {
    if (!tray.hasBara || !tray.hasChanna) return false;
    if (tray.pepper !== this.pepper) return false;
    
    // Check if extras match (order doesn't matter)
    if (tray.extras.length !== this.extras.length) return false;
    return this.extras.every(e => tray.extras.includes(e));
  }
}
