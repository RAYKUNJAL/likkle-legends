'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Pause, Play } from 'lucide-react';
import { getPlayableCatalogSongs } from '@/lib/song-catalog';
import styles from './landing.module.css';

const songs = getPlayableCatalogSongs();

export default function OriginalSongs() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const playingId = useRef<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);

  const toggle = async (id: string, url: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playingId.current === id && !audio.paused) {
      audio.pause();
      playingId.current = null;
      setPlaying(null);
      return;
    }
    playingId.current = id;
    if (audio.src !== new URL(url, window.location.origin).href) {
      audio.src = url;
    }
    try {
      await audio.play();
      setPlaying(id);
      setHeard(true);
    } catch {
      playingId.current = null;
      setPlaying(null);
    }
  };

  return (
    <section id="songs" className={styles.songs} aria-labelledby="original-songs-heading">
      <div className={styles.container}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Original songs</p>
          <h2 id="original-songs-heading">Kids Caribbean songs, made for Likkle</h2>
          <p>
            {songs.length} original {songs.length === 1 ? 'song is' : 'songs are'} ready to hear. The library is growing. Listening is free.
          </p>
        </div>
        <div className={styles.songGrid}>
          {songs.map((song) => (
            <article key={song.id} className={styles.songCard}>
              <h3>{song.title}</h3>
              <p>{song.artist}</p>
              <button type="button" className={styles.secondaryButton} onClick={() => toggle(song.id, song.url)}>
                {playing === song.id ? <Pause size={18} /> : <Play size={18} />}
                {playing === song.id ? 'Pause' : 'Play'}
              </button>
            </article>
          ))}
        </div>
        <audio
          ref={audioRef}
          className={styles.songAudio}
          onPlaying={() => setHeard(true)}
          onEnded={() => {
            playingId.current = null;
            setPlaying(null);
          }}
        />
        {heard && (
          <p className={styles.songNote}>
            <Link href="/login?redirect=/parent/music">Download for $1</Link>
            {' '}keeps a copy on the parent account. Streaming stays free.
          </p>
        )}
        <div className={styles.customTeaser}>
          <h3>Birthday / event song for your likkle one</h3>
          <p>A parent can request a custom Caribbean kids song after signing in.</p>
          <Link className={styles.textLink} href="/login?redirect=/parent/music/custom">Request a custom song</Link>
        </div>
      </div>
    </section>
  );
}
