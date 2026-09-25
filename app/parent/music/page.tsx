import ParentMusicStore from './ParentMusicStore';
import { getPlayableCatalogSongs, playbackUrl } from '@/lib/song-catalog';

export default function ParentMusicPage() {
    const songs = getPlayableCatalogSongs();
    return (
        <>
            {songs.map((song) => (
                <link key={song.id} rel="preload" as="audio" href={playbackUrl(song)} fetchPriority="low" />
            ))}
            <ParentMusicStore />
        </>
    );
}
