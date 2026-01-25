// Enhanced Database Poster with Offline Support
// Commercial-grade with fallbacks, retry logic, and local caching

import { supabase, supabaseAdmin, supabaseManager } from '@/lib/supabase-client';
import { GeneratedStory } from './generators/story-generator';
import { GeneratedSong } from './generators/song-generator';
import { contentGenerator } from './core';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class EnhancedDatabasePoster {
    private offline = false;
    private offlineCache: any[] = [];

    /**
     * Save generated story to database with retry logic
     */
    async postStory(story: GeneratedStory): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`📝 Posting story: "${story.title}"...`);

            // Test connection first
            const isOnline = await this.testConnection();

            if (!isOnline) {
                console.warn('⚠️  Database offline - saving locally');
                return this.saveStoryLocally(story);
            }

            // Generate and upload cover image (placeholder for now)
            const coverImageUrl = `https://via.placeholder.com/600x800/4ECDC4/FFFFFF?text=${encodeURIComponent(story.title)}`;

            // Generate page images (placeholders)
            const pagesWithImages = story.pages.map((page, index) => ({
                ...page,
                imageUrl: `https://via.placeholder.com/600x800/FF6B6B/FFFFFF?text=Page+${index + 1}`,
            }));

            // Insert into storybooks table with retry
            const result = await supabaseManager.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('storybooks')
                    .insert({
                        title: story.title,
                        summary: story.summary,
                        content_json: {
                            pages: pagesWithImages,
                            patoisWords: story.metadata.patoisWords,
                            culturalElements: story.metadata.culturalElements,
                        },
                        cover_image_url: coverImageUrl,
                        age_track: story.metadata.ageTrack,
                        tier_required: story.metadata.tierRequired,
                        island_theme: story.metadata.islandTheme,
                        reading_time_minutes: story.metadata.readingTimeMinutes,
                        word_count: this.calculateWordCount(story),
                        difficulty_level: story.metadata.difficultyLevel,
                        is_active: true,
                        display_order: 0,
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }, true); // Use service role

            console.log(`✅ Story posted successfully! ID: ${result.id}`);
            return { success: true, id: result.id };
        } catch (error: any) {
            console.error('❌ Failed to post story:', error.message);

            // Fallback to local save
            console.warn('💾 Saving story locally as fallback...');
            return this.saveStoryLocally(story);
        }
    }

    /**
     * Save generated song to database with retry logic
     */
    async postSong(song: GeneratedSong): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`🎵 Posting song: "${song.title}"...`);

            // Test connection first
            const isOnline = await this.testConnection();

            if (!isOnline) {
                console.warn('⚠️  Database offline - saving locally');
                return this.saveSongLocally(song);
            }

            // Generate thumbnail (placeholder)
            const thumbnailUrl = `https://via.placeholder.com/400x400/9B59B6/FFFFFF?text=${encodeURIComponent(song.title)}`;

            // Insert into songs table with retry
            const result = await supabaseManager.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('songs')
                    .insert({
                        title: song.title,
                        artist: song.artist,
                        description: song.description,
                        lyrics: song.lyrics,
                        thumbnail_url: thumbnailUrl,
                        duration_seconds: song.durationSeconds,
                        age_track: song.ageTrack,
                        tier_required: song.tierRequired,
                        category: song.category,
                        island_origin: song.islandOrigin,
                        is_active: true,
                        display_order: 0,
                        // audio_url would be generated separately
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }, true); // Use service role

            console.log(`✅ Song posted successfully! ID: ${result.id}`);
            return { success: true, id: result.id };
        } catch (error: any) {
            console.error('❌ Failed to post song:', error.message);

            // Fallback to local save
            console.warn('💾 Saving song locally as fallback...');
            return this.saveSongLocally(song);
        }
    }

    /**
     * Test database connection
     */
    private async testConnection(): Promise<boolean> {
        try {
            const result = await supabaseManager.testConnection();
            if (!result.success) {
                console.error('❌ Database connection check failed:', result.error);
            }
            return result.success;
        } catch (error: any) {
            console.error('❌ Database connection check exception:', error.message);
            return false;
        }
    }

    /**
     * Save story to local JSON file
     */
    private async saveStoryLocally(story: GeneratedStory): Promise<{ success: boolean; offline: true; error?: string }> {
        try {
            const outputDir = join(process.cwd(), 'generated-content', 'stories');
            await mkdir(outputDir, { recursive: true });

            const filename = `${Date.now()}-${story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
            const filepath = join(outputDir, filename);

            await writeFile(filepath, JSON.stringify(story, null, 2), 'utf-8');

            console.log(`💾 Story saved locally: ${filename}`);
            return { success: true, offline: true };
        } catch (error: any) {
            return { success: false, offline: true, error: error.message };
        }
    }

    /**
     * Save song to local JSON file
     */
    private async saveSongLocally(song: GeneratedSong): Promise<{ success: boolean; offline: true; error?: string }> {
        try {
            const outputDir = join(process.cwd(), 'generated-content', 'songs');
            await mkdir(outputDir, { recursive: true });

            const filename = `${Date.now()}-${song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
            const filepath = join(outputDir, filename);

            await writeFile(filepath, JSON.stringify(song, null, 2), 'utf-8');

            console.log(`💾 Song saved locally: ${filename}`);
            return { success: true, offline: true };
        } catch (error: any) {
            return { success: false, offline: true, error: error.message };
        }
    }

    /**
     * Calculate total word count from story
     */
    private calculateWordCount(story: GeneratedStory): number {
        return story.pages.reduce((total, page) => {
            return total + page.text.split(/\s+/).length;
        }, 0);
    }

    /**
     * Save multiple stories in batch
     */
    async postStoriesBatch(stories: GeneratedStory[]): Promise<{
        successful: number;
        failed: number;
        offline: number;
        ids: string[];
    }> {
        let successful = 0;
        let failed = 0;
        let offline = 0;
        const ids: string[] = [];

        for (const story of stories) {
            const result = await this.postStory(story);

            if (result.success) {
                if (result.offline) {
                    offline++;
                } else {
                    successful++;
                    if (result.id) ids.push(result.id);
                }
            } else {
                failed++;
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return { successful, failed, offline, ids };
    }

    /**
     * Save multiple songs in batch
     */
    async postSongsBatch(songs: GeneratedSong[]): Promise<{
        successful: number;
        failed: number;
        offline: number;
        ids: string[];
    }> {
        let successful = 0;
        let failed = 0;
        let offline = 0;
        const ids: string[] = [];

        for (const song of songs) {
            const result = await this.postSong(song);

            if (result.success) {
                if (result.offline) {
                    offline++;
                } else {
                    successful++;
                    if (result.id) ids.push(result.id);
                }
            } else {
                failed++;
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return { successful, failed, offline, ids };
    }

    /**
     * Get statistics from database
     */
    async getContentStats(): Promise<{
        stories: number;
        songs: number;
        videos: number;
        games: number;
        offline: boolean;
    }> {
        try {
            const isOnline = await this.testConnection();

            if (!isOnline) {
                return {
                    stories: 0,
                    songs: 0,
                    videos: 0,
                    games: 0,
                    offline: true,
                };
            }

            const [storiesCount, songsCount, videosCount, gamesCount] = await Promise.all([
                supabase.from('storybooks').select('id', { count: 'exact', head: true }),
                supabase.from('songs').select('id', { count: 'exact', head: true }),
                supabase.from('videos').select('id', { count: 'exact', head: true }),
                supabase.from('games').select('id', { count: 'exact', head: true }),
            ]);

            return {
                stories: storiesCount.count || 0,
                songs: songsCount.count || 0,
                videos: videosCount.count || 0,
                games: gamesCount.count || 0,
                offline: false,
            };
        } catch (error) {
            return {
                stories: 0,
                songs: 0,
                videos: 0,
                games: 0,
                offline: true,
            };
        }
    }
}

export const databasePoster = new EnhancedDatabasePoster();
