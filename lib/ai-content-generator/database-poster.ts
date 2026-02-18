// Enhanced Database Poster with Offline Support
// Commercial-grade with fallbacks, retry logic, and local caching

import { supabase, supabaseAdmin, supabaseManager } from '@/lib/supabase-client';
import { GeneratedStory } from './generators/story-generator';
import { GeneratedSong } from './generators/song-generator';
import { contentGenerator } from './core';
import { CaribbeanKidsStorybook, GeneratedImage } from './agents/schemas';
// import { writeFile, mkdir } from 'fs/promises';
// import { join } from 'path';

export class EnhancedDatabasePoster {
    private offline = false;
    private offlineCache: any[] = [];

    /**
     * Save the new AGENT-generated storybook to database
     */
    async postCaribbeanStory(
        story: CaribbeanKidsStorybook,
        images: GeneratedImage[],
        userId?: string
    ): Promise<{ success: boolean; id?: string; error?: string }> {
        try {
            console.log(`📝 Posting Agent Story: "${story.metadata.title}"...`);

            const isOnline = await this.testConnection();
            if (!isOnline) return { success: false, error: 'Database offline' };

            // Map strict schema to DB columns
            // We store the FULL rich object in content_json for future-proofing

            // Get cover image from the images array (usually page 0 or the first one)
            const coverImage = images.find(img => img.page_number === 1)?.image_url
                || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800';

            const result = await supabaseManager.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('storybooks')
                    .insert({
                        title: story.metadata.title,
                        summary: story.island_context.setting_description.substring(0, 200) + '...',
                        content_json: story, // Store the WHOLE new schema here!
                        cover_image_url: coverImage,
                        age_track: story.metadata.age_range.includes('3') ? 'mini' : 'big', // heuristic
                        tier_required: 'free', // Default to free for now
                        island_theme: story.island_context.island_name,
                        reading_time_minutes: 5, // Estimate
                        word_count: story.pages.reduce((acc, p) => acc + p.story_text.split(' ').length, 0),
                        difficulty_level: 1,
                        is_active: false,
                        user_id: userId
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }, true);

            console.log(`✅ Agent Story posted! ID: ${result.id}`);
            return { success: true, id: result.id };

        } catch (error: any) {
            console.error('❌ Failed to post Agent Story:', error.message);
            return { success: false, error: error.message };
        }
    }


    /**
     * Save generated story to database with retry logic
     */
    async postStory(story: GeneratedStory, userId?: string): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean; updatedStory?: GeneratedStory }> {
        try {
            console.log(`📝 Posting story: "${story.title}"...`);

            // Test connection first
            const isOnline = await this.testConnection();

            if (!isOnline) {
                console.warn('⚠️  Database offline - local saving skipped for build compatibility');
                return { success: false, offline: true, error: 'Database offline' };
                // return this.saveStoryLocally(story);
            }

            // Generate Cover Image
            let coverImageUrl = `https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800`; // Storytime default
            try {
                const { generateImage } = await import('@/lib/ai-image-generator/image-client');
                const genUrl = await generateImage(story.summary + " children's book cover illustration, bright caribbean colors", `cover-${story.title.replace(/\s+/g, '-')}`);
                if (genUrl) coverImageUrl = genUrl;
            } catch (ignored) { }

            // Process Pages (Generate images for ALL pages with new 5min API timeout)
            const pagesWithImages = await Promise.all(story.pages.map(async (page, index) => {
                let pageImg = `https://images.unsplash.com/photo-1512820660846-51897326bb2d?auto=format&fit=crop&q=80&w=800`;
                try {
                    const { generateImage } = await import('@/lib/ai-image-generator/image-client');
                    const genUrl = await generateImage(page.imagePrompt + " children's book illustration style", `page-${index}-${story.title.replace(/\s+/g, '-')}`);
                    if (genUrl) pageImg = genUrl;
                } catch (ignored) { }
                return { ...page, imageUrl: pageImg };
            }));

            const updatedStory: GeneratedStory = {
                ...story,
                pages: pagesWithImages
            };

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
                        is_active: false, // Pending approval
                        display_order: 0,
                        user_id: userId, // Link to user if available
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }, true); // Use service role

            console.log(`✅ Story posted successfully! ID: ${result.id}`);
            return { success: true, id: result.id, updatedStory };
        } catch (error: any) {
            console.error('❌ Failed to post story:', error.message);

            // Fallback to local save (Disabled for build fix)
            console.warn('💾 Local save disabled for build compatibility');
            return { success: false, error: error.message };
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
                console.warn('⚠️  Database offline - local saving skipped for build compatibility');
                return { success: false, offline: true, error: 'Database offline' };
                // return this.saveSongLocally(song);
            }

            // Generate thumbnail (DALL-E priority)
            let thumbnailUrl = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800`; // Music default
            try {
                const { generateImage } = await import('@/lib/ai-image-generator/image-client');
                const genUrl = await generateImage(`${song.title} album art, caribbean style children's music`, `song-${song.title.replace(/\s+/g, '-')}`);
                if (genUrl) thumbnailUrl = genUrl;
            } catch (ignored) { }

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
                        is_active: false, // Pending approval
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
     * Save generated game to database with retry logic
     */
    async postGame(game: any): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`🎮 Posting game: "${game.title}"...`);

            // Test connection first
            const isOnline = await this.testConnection();

            if (!isOnline) {
                console.warn('⚠️  Database offline - local saving skipped for build compatibility');
                return { success: false, offline: true, error: 'Database offline' };
                // return this.saveGameLocally(game);
            }

            // Insert into games table with retry (mapping to schema)
            const result = await supabaseManager.executeWithRetry(async (client) => {
                const { data, error } = await client
                    .from('games')
                    .insert({
                        title: game.title,
                        description: game.description,
                        game_type: game.type,
                        // Schema Adaptation:
                        estimated_time: `${game.estimatedMinutes} min`,
                        game_config: {
                            data: game.data,
                            difficulty: game.difficulty,
                            island_theme: game.island,
                            xp_reward: game.xpReward
                        },
                        is_active: false, // Pending approval
                        display_order: 0,
                    })
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }, true); // Use service role

            console.log(`✅ Game posted successfully! ID: ${result.id}`);
            return { success: true, id: result.id };
        } catch (error: any) {
            console.error('❌ Failed to post game:', error.message);

            // Fallback to local save (Disabled for build fix)
            console.warn('💾 Local save disabled for build compatibility');
            return { success: false, error: error.message };
        }
    }

    /**
     * Save generated printable to database
     */
    async postPrintable(printable: any): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`🖨️ Posting printable: "${printable.title}"...`);

            const isOnline = await this.testConnection();
            if (!isOnline) return { success: false, offline: true, error: 'Database offline' };

            const { data, error } = await supabaseAdmin
                .from('printables')
                .insert({
                    title: printable.title,
                    description: printable.description,
                    category: printable.type || 'worksheet',
                    tier_required: 'starter_mailer',
                    pdf_url: '#', // Requires PDF generation service
                    preview_url: `https://images.unsplash.com/photo-1503676260728-1c00da07bb5e?auto=format&fit=crop&q=80&w=800`, // Better educational default
                    is_active: false
                })
                .select()
                .single();

            if (error) throw error;
            const result = data;

            return { success: true, id: result.id };
        } catch (error: any) {
            // Fallback to local save (Disabled for build fix)
            console.warn('💾 Local save disabled for build compatibility');
            return { success: false, error: error.message };
        }
    }

    /**
     * Save generated video script to database
     */
    async postVideo(video: any, metadata: any): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`🎬 Posting video: "${video.title}"...`);

            const isOnline = await this.testConnection();
            if (!isOnline) return { success: false, offline: true };

            const { createAdminClient } = await import('@/lib/admin');
            const admin = createAdminClient();

            const { data, error } = await admin
                .from('videos')
                .insert({
                    title: video.title,
                    description: video.description,
                    category: 'lesson',
                    island_theme: metadata.island,
                    age_track: metadata.ageGroup,
                    duration_seconds: video.totalDurationSeconds || 0,
                    tier_required: 'legends_plus',
                    video_url: '#', // Requires video generation/upload
                    thumbnail_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800', // Better video default
                    is_active: false
                })
                .select()
                .single();

            if (error) throw error;
            const result = data;

            return { success: true, id: result.id };
        } catch (error: any) {
            console.error('❌ Failed to post video:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save generated blog post to database
     */
    async postBlogPost(post: any): Promise<{ success: boolean; id?: string; error?: string; offline?: boolean }> {
        try {
            console.log(`📝 Posting blog: "${post.metadata.title}"...`);

            const isOnline = await this.testConnection();
            if (!isOnline) {
                console.warn('⚠️  Database offline - local saving skipped for build compatibility');
                return { success: false, offline: true, error: 'Database offline' };
            }

            // Generate thumbnail if none provided
            let featuredImage = `https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800`;
            try {
                const { generateImage } = await import('@/lib/ai-image-generator/image-client');
                const genUrl = await generateImage(
                    `${post.metadata.title} blog header image, caribbean culture style, warm`,
                    `blog-${post.metadata.slug}`
                );
                if (genUrl) featuredImage = genUrl;
            } catch (ignored) { }

            // Find or create category
            let categoryId = null;
            const { data: catData } = await supabase
                .from('blog_categories')
                .select('id')
                .ilike('name', `%${post.metadata.category}%`)
                .single();

            if (catData) {
                categoryId = catData.id;
            } else {
                // Default to 'Culture & Heritage' or first available
                const { data: defaultCat } = await supabase
                    .from('blog_categories')
                    .select('id')
                    .limit(1)
                    .single();
                categoryId = defaultCat?.id;
            }

            const { data, error } = await supabaseAdmin
                .from('blog_posts')
                .insert({
                    title: post.metadata.title,
                    slug: post.metadata.slug + '-' + Date.now().toString().slice(-4), // Ensure uniqueness
                    excerpt: post.metadata.excerpt,
                    content: post.content,
                    featured_image_url: featuredImage,
                    category: categoryId,
                    author_name: post.metadata.author || 'Likkle Legends Team',
                    status: 'published',
                    published_at: new Date().toISOString(),
                    read_time_minutes: post.metadata.readTime || 5,
                    meta_title: post.metadata.seo.title,
                    meta_description: post.metadata.seo.description,
                    keywords: post.metadata.seo.keywords,
                    ai_generated: true,
                    ai_prompt: 'SEO Blog Generator',
                    view_count: 0
                })
                .select()
                .single();

            if (error) throw error;
            const result = data;

            console.log(`✅ Blog post published! ID: ${result.id}`);
            return { success: true, id: result.id };
        } catch (error: any) {
            console.error('❌ Failed to post blog:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Save printable to local JSON file
     */
    private async savePrintableLocally(printable: any): Promise<{ success: boolean; offline: true; error?: string }> {
        /* Node bits commented out for build compatibility
        try {
            const outputDir = join(process.cwd(), 'generated-content', 'printables');
            await mkdir(outputDir, { recursive: true });

            const filename = `${Date.now()}-${printable.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
            const filepath = join(outputDir, filename);

            await writeFile(filepath, JSON.stringify(printable, null, 2), 'utf-8');

            console.log(`💾 Printable saved locally: ${filename}`);
            return { success: true, offline: true };
        } catch (error: any) {
            return { success: false, offline: true, error: error.message };
        }
        */
        console.warn('💾 Local save disabled for build compatibility');
        return { success: false, offline: true, error: 'Local save disabled' };
    }

    /**
     * Save game to local JSON file
     */
    private async saveGameLocally(game: any): Promise<{ success: boolean; offline: true; error?: string }> {
        /* Node bits commented out for build compatibility
        try {
            const outputDir = join(process.cwd(), 'generated-content', 'games');
            await mkdir(outputDir, { recursive: true });

            const filename = `${Date.now()}-${game.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
            const filepath = join(outputDir, filename);

            await writeFile(filepath, JSON.stringify(game, null, 2), 'utf-8');

            console.log(`💾 Game saved locally: ${filename}`);
            return { success: true, offline: true };
        } catch (error: any) {
            return { success: false, offline: true, error: error.message };
        }
        */
        console.warn('💾 Local save disabled for build compatibility');
        return { success: false, offline: true, error: 'Local save disabled' };
    }

    /**
     * Test database connection
     */
    private async testConnection(): Promise<boolean> {
        try {
            const result = await supabaseManager.testConnection(true);
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
        /* Node bits commented out for build compatibility
        try {
            const { writeFile, mkdir } = await import('fs/promises');
            const { join } = await import('path');
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
        */
        console.warn('💾 Local save disabled for build compatibility');
        return { success: false, offline: true, error: 'Local save disabled' };
    }

    /**
     * Save song to local JSON file
     */
    private async saveSongLocally(song: GeneratedSong): Promise<{ success: boolean; offline: true; error?: string }> {
        /* Node bits commented out for build compatibility
        try {
            const { writeFile, mkdir } = await import('fs/promises');
            const { join } = await import('path');
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
        */
        console.warn('💾 Local save disabled for build compatibility');
        return { success: false, offline: true, error: 'Local save disabled' };
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
