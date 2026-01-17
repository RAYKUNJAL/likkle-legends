
export interface StoryParams {
    child_name: string;
    island: string;
    character: string;
    challenge: string;
}

export interface StoryPage {
    text: string;
    imageUrl: string | null;
    audioBuffer: AudioBuffer | null;
}

export interface AdminCharacter extends Character {
    isMystery?: boolean;
}

export interface Character {
    name: string;
    role: string;
    tagline: string;
    description: string;
    color: string;
    image: string;
    traits: string[];
}

export interface StudioContent {
    id: string;
    title: string;
    type: 'letter' | 'story' | 'lesson';
    category: string;
    ageGroup: string;
    readingLevel: 'beginner' | 'intermediate' | 'advanced';
    text: string;
    pages: { id: string; text: string; audioUrl?: string; imageUrl?: string }[];
    status: 'draft' | 'processing' | 'published' | 'archived';
    backgroundMusic?: string;
    voiceSpeed: number;
    voiceEmotion: 'wise' | 'joyful' | 'cautionary' | 'excited';
    lastModified: string;
}

export interface SavedStory extends StoryParams {
    id: string;
    pages: StoryPage[];
    date: string;
}

export interface ReadingSession {
    points: number;
    isPlaying: boolean;
    currentPageIndex: number;
}

export interface ChildProfile {
    id: string;
    name: string;
    age: string;
    avatar: string;
    interests: string[];
    rank: 'Mango Seed' | 'Little Sapling' | 'Village Legend' | 'Island Guardian';
    stats: {
        storiesRead: number;
        missionsDone: number;
        gamesPlayed: number;
        trailProgress: number;
    };
    memory: {
        keyFacts: string[];
        lastEmotion: string;
        recentSummary?: string;
    };
    readingProgress: Record<string, number>;
}

export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    channel?: string;
    isCustom?: boolean;
}

export interface RadioChannel {
    id: string;
    label: string;
    icon: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    rewardPoints: number;
    icon: string;
    category: string;
    steps: string[];
}
