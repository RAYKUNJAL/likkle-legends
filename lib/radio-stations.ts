import { Track } from '@/lib/types';
import { RADIO_TRACKS } from '@/lib/constants';

export type RadioSegmentId = 'tanty_spice' | 'roti' | 'dilly_doubles' | 'steelpan_sam';

export const RADIO_SEGMENTS: Array<{
    id: RadioSegmentId;
    label: string;
    icon: string;
    host: string;
}> = [
    { id: 'tanty_spice', label: 'Tanty Spice Show', icon: '🌶️', host: 'Tanty Spice' },
    { id: 'roti', label: 'R.O.T.I Learning Lab', icon: '🤖', host: 'R.O.T.I' },
    { id: 'dilly_doubles', label: 'Dilly Vibes', icon: '🎵', host: 'Dilly Doubles' },
    { id: 'steelpan_sam', label: 'Steelpan Sam Stage', icon: '🥁', host: 'Steelpan Sam' },
];

export function mapLegacyRadioCategory(input?: string): RadioSegmentId {
    const channel = (input || '').toLowerCase();

    if (channel === 'story' || channel === 'lullaby' || channel === 'calm' || channel === 'culture' || channel === 'tanty') return 'tanty_spice';
    if (channel === 'educational' || channel === 'lesson' || channel === 'learning') return 'roti';
    if (channel === 'dilly' || channel === 'food') return 'dilly_doubles';
    if (channel === 'music' || channel === 'soca' || channel === 'steelpan' || channel === 'vip') return 'steelpan_sam';

    return 'tanty_spice';
}

export function buildFreeFallbackTracks(): Track[] {
    const base = RADIO_TRACKS.slice(0, 10);
    if (base.length >= 10) return base;

    const padded = [...base];
    const first = base[0];
    if (first) {
        padded.push({
            ...first,
            id: `${first.id}-reprise`,
            title: `${first.title} (Reprise)`,
        });
    }

    return padded.slice(0, 10);
}

