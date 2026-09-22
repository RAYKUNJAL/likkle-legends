'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Headphones, Loader2, Music2, Pause, Play, Radio, RotateCcw, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { RADIO_TRACKS as DEFAULT_RADIO_TRACKS, UNAVAILABLE_RADIO_TRACKS } from '@/lib/constants';
import { buildRadioCatalog, getRadioStationSummary, resolveRadioStationTrack } from '@/lib/radio-catalog';

const STATIONS = [
  { id: 'roti', name: 'R.O.T.I. Learning Lab', shortName: 'R.O.T.I.', image: '/images/roti-new.jpg', note: 'Healthy habits & little discoveries' },
  { id: 'tanty_spice', name: 'Tanty Spice Show', shortName: 'Tanty Spice', image: '/images/tanty_spice_avatar.jpg', note: 'Everyday learning & sing-along favorites' },
  { id: 'dilly_doubles', name: 'Dilly Vibes', shortName: 'Dilly Doubles', image: '/images/dilly-doubles.jpg', note: 'Playful songs for curious little minds' },
  { id: 'steelpan_sam', name: 'Steelpan Sam Stage', shortName: 'Steelpan Sam', image: '/images/steelpan_sam.png', note: 'Island animals & joyful rhythms' },
] as const;

type StationId = typeof STATIONS[number]['id'];
export type RadioShowcaseTrack = { id: string; title: string; artist?: string; url: string; channel?: string; duration?: number };
type Track = RadioShowcaseTrack;
type RadioShowcaseProps = { variant?: 'landing' | 'station' | 'member'; tracks?: Track[] };
const focusRing = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0a8b8d]/40 focus-visible:ring-offset-2';

function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

export default function RadioShowcase({ variant = 'landing', tracks: suppliedTracks }: RadioShowcaseProps = {}) {
  const id = useId();
  const library = useMemo<Track[]>(() => {
    const valid = suppliedTracks?.filter(track => track.id && track.title && track.url && STATIONS.some(station => station.id === track.channel));
    const source = valid?.length ? valid : DEFAULT_RADIO_TRACKS;
    return Array.from(new Map(source.map(track => [String(track.id), { ...track, id: String(track.id) }])).values());
  }, [suppliedTracks]);
  const initialTrackRef = useRef(library.find(track => track.channel === 'roti') ?? library[0]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const playAttemptRef = useRef(0);
  const wantsPlaybackRef = useRef(false);
  const activeTrackRef = useRef<Track | undefined>(initialTrackRef.current);
  const [stationId, setStationId] = useState<StationId>((initialTrackRef.current?.channel as StationId) ?? 'roti');
  const [trackId, setTrackId] = useState<string | undefined>(initialTrackRef.current?.id);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const station = STATIONS.find(item => item.id === stationId)!;
  const catalog = useMemo<Track[]>(() => buildRadioCatalog(library, UNAVAILABLE_RADIO_TRACKS), [library]);
  const unavailableTracks = catalog.filter(track => !library.some(item => item.id === track.id));
  const tracks = library.filter(track => track.channel === stationId);
  const catalogTracks = catalog.filter(track => track.channel === stationId);
  const stationSummary = getRadioStationSummary(stationId, library, catalog);
  const currentTrack = library.find(track => track.id === trackId);
  const displayDuration = duration || currentTrack?.duration || 0;

  useEffect(() => {
    const audio = audioRef.current;
    // Restore after an effect cleanup without reloading an existing buffer.
    if (audio && initialTrackRef.current && !audio.getAttribute('src')) audio.src = initialTrackRef.current.url;
    // Metadata may arrive before hydration attaches event handlers.
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
    return () => {
      playAttemptRef.current += 1;
      wantsPlaybackRef.current = false;
      audio?.pause();
      if (audio) {
        audio.removeAttribute('src');
        audio.load();
      }
    };
  }, []);

  const startTrack = useCallback(async (track: Track, shouldPlay = true) => {
    const audio = audioRef.current;
    if (!audio) return;
    const attempt = ++playAttemptRef.current;
    wantsPlaybackRef.current = shouldPlay;
    setError(null);
    if (activeTrackRef.current?.id !== track.id || activeTrackRef.current?.url !== track.url || !audio.src || audio.error) {
      audio.pause();
      audio.src = track.url;
      audio.load();
      setPosition(0);
      setDuration(0);
      setPlaying(false);
    }
    activeTrackRef.current = track;
    setTrackId(track.id);
    // Resuming a buffered song should be immediate, without flashing a spinner.
    setLoading(shouldPlay && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
    if (!shouldPlay) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      if (attempt !== playAttemptRef.current) return;
      setPlaying(true);
      setLoading(false);
    } catch (cause) {
      // Switching stations can reject an older play promise; it must not
      // overwrite the status of the newly selected track.
      if (attempt !== playAttemptRef.current) return;
      wantsPlaybackRef.current = false;
      setPlaying(false);
      setLoading(false);
      setError(cause instanceof Error && cause.name === 'NotAllowedError'
        ? 'Your browser paused playback. Tap retry to listen.'
        : 'This song could not load. Retry, or choose another song.');
    }
  }, []);

  const clearTrack = useCallback(() => {
    playAttemptRef.current += 1;
    wantsPlaybackRef.current = false;
    activeTrackRef.current = undefined;
    const audio = audioRef.current;
    audio?.pause();
    if (audio?.getAttribute('src')) {
      audio.removeAttribute('src');
      audio.load();
    }
    setTrackId(undefined);
    setPosition(0);
    setDuration(0);
    setPlaying(false);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Catalog refreshes must preserve the chosen host, including a library-only
    // station, rather than restoring the previous station's buffered song.
    const replacement = resolveRadioStationTrack(library, activeTrackRef.current, stationId);
    if (!replacement) {
      clearTrack();
      return;
    }
    if (replacement.id === activeTrackRef.current?.id && replacement.url === activeTrackRef.current?.url) {
      activeTrackRef.current = replacement;
      setTrackId(replacement.id);
      return;
    }
    void startTrack(replacement, false);
  }, [library, stationId, startTrack, clearTrack]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (wantsPlaybackRef.current || !audio.paused) {
      ++playAttemptRef.current;
      wantsPlaybackRef.current = false;
      audio.pause();
      setPlaying(false);
      setLoading(false);
    } else {
      void startTrack(currentTrack);
    }
  }

  function changeStation(nextStation: StationId) {
    if (nextStation === stationId) return;
    const first = library.find(track => track.channel === nextStation);
    setStationId(nextStation);
    if (!first) {
      clearTrack();
      return;
    }
    void startTrack(first, wantsPlaybackRef.current);
  }

  function moveTrack(direction: number) {
    if (!tracks.length) return;
    const index = tracks.findIndex(track => track.id === activeTrackRef.current?.id);
    const next = tracks[(Math.max(0, index) + direction + tracks.length) % tracks.length];
    void startTrack(next, true);
  }

  const status = error ? 'Playback unavailable'
    : !tracks.length && catalogTracks.length ? `${station.shortName}'s songs are saved in our collection, but their audio is not available yet. Choose a host marked playable to listen.`
    : !tracks.length ? 'No audio is available for this station yet. Choose another host to listen.'
    : loading ? (playing ? 'Buffering your song...' : 'Loading your song...')
    : playing ? `Now playing: ${currentTrack?.title}`
    : 'Choose a song and press play';

  return (
    <section id="radio" aria-label={variant === 'member' ? 'Island Radio' : undefined} aria-labelledby={variant === 'member' ? undefined : `${id}-heading`} className={`scroll-mt-[100px] overflow-hidden text-[#102543] ${variant === 'member' ? 'py-4' : 'bg-[#fffaf0] px-5 py-16 sm:px-8 sm:py-20'}`}>
      <div className={variant === 'member' ? 'mx-auto max-w-4xl' : 'mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14'}>
        {variant !== 'member' && <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#0a8b8d]/20 bg-[#e8f5ef] px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#087c7c]">
            <Radio size={16} aria-hidden="true" /> Likkle Legends Island Radio
          </p>
          <h2 id={`${id}-heading`} className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl">
            Little voices.<br /><span className="text-[#07898c]">Big island rhythms.</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[#51617b]">
            Caribbean nursery rhymes, learning songs and sing-along adventures. Bring a little island joy to playtime, the school run and everyday learning.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-sm font-semibold">
            {['Healthy habits', 'Money skills', 'Island rhythms'].map(label => (
              <span key={label} className="rounded-full border border-[#eadfcb] bg-white/70 px-3 py-2">{label}</span>
            ))}
          </div>
          <Link href={variant === 'station' ? '/portal/music' : '/radio'} className={`mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#ff4d63] px-6 py-3 font-bold text-white shadow-[0_6px_18px_#ff4d6325] transition-colors hover:bg-[#e83c54] ${focusRing}`}>
            {variant === 'station' ? 'Open my music hub' : 'Explore Island Radio'} <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <p className="mt-3 flex items-center gap-2 text-sm text-[#51617b]"><Headphones size={15} aria-hidden="true" /> Listen to a song right here. No sign-up needed.</p>
        </div>}

        <div className="min-w-0 rounded-[2rem] border border-[#e6e9e4] bg-white p-4 shadow-[0_20px_60px_#1025430d] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-extrabold"><Music2 size={18} className="text-[#07898c]" aria-hidden="true" /> Pick your station</p>
            <span className="text-xs font-semibold text-[#64748b]">Meet your hosts</span>
          </div>
          <div role="tablist" aria-label="Island Radio stations" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {STATIONS.map((item, index) => {
              const summary = getRadioStationSummary(item.id, library, catalog);
              return (
              <button
                key={item.id}
                ref={node => { tabsRef.current[index] = node; }}
                type="button"
                role="tab"
                id={`${id}-tab-${item.id}`}
                aria-selected={stationId === item.id}
                aria-controls={`${id}-panel`}
                aria-label={`${item.shortName}: ${summary.description}`}
                disabled={!catalog.some(track => track.channel === item.id)}
                tabIndex={stationId === item.id ? 0 : -1}
                onClick={() => changeStation(item.id)}
                onKeyDown={event => {
                  const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                  if (!offset && event.key !== 'Home' && event.key !== 'End') return;
                  event.preventDefault();
                  const availableIndexes = STATIONS.flatMap((entry, entryIndex) => catalog.some(track => track.channel === entry.id) ? [entryIndex] : []);
                  const currentIndex = availableIndexes.indexOf(index);
                  const nextIndex = event.key === 'Home' ? availableIndexes[0] : event.key === 'End' ? availableIndexes[availableIndexes.length - 1] : availableIndexes[(currentIndex + offset + availableIndexes.length) % availableIndexes.length];
                  if (nextIndex === undefined) return;
                  changeStation(STATIONS[nextIndex].id);
                  tabsRef.current[nextIndex]?.focus();
                }}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-center text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${stationId === item.id ? 'border-[#07898c] bg-[#e8f5ef] text-[#066f71]' : 'border-[#e6e9e4] bg-[#fcfcf9] text-[#51617b] hover:border-[#07898c]/40 hover:bg-[#f3f8f5]'}`}
              >
                <span className="relative block h-16 w-16 overflow-hidden rounded-2xl bg-white"><Image src={item.image} alt="" fill sizes="64px" className="object-contain" /></span>
                {item.shortName}
                <span className="text-[10px] font-medium">{summary.label}</span>
              </button>
              );
            })}
          </div>

          <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${stationId}`} className="mt-5">
            <p className="mb-3 text-xs font-semibold text-[#51617b]">{stationSummary.description}</p>
            <div className="relative overflow-hidden rounded-2xl bg-[#102543] p-5 text-white sm:p-6">
              <div className="relative flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase leading-relaxed tracking-[0.12em] text-[#80d9ce]">{station.name}</p>
                  <h3 className="mt-2 text-xl font-extrabold leading-snug sm:text-2xl">{currentTrack?.title ?? catalogTracks[0]?.title ?? 'Island Radio'}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#c2cddd]">{station.note}</p>
                </div>
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] border-4 border-white/20 bg-[#fffaf0] shadow-lg sm:h-40 sm:w-40">
                  <Image src={station.image} alt={`${station.shortName}, your station host`} fill sizes="(max-width: 640px) 112px, 160px" className="object-contain p-1" />
                </div>
              </div>
              <div className="relative mt-6">
                <label htmlFor={`${id}-seek`} className="sr-only">Playback position</label>
                <input
                  id={`${id}-seek`}
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={Math.min(position, duration || 1)}
                  disabled={!duration}
                  aria-valuetext={`${formatTime(position)} of ${formatTime(displayDuration)}`}
                  onChange={event => {
                    const next = Number(event.target.value);
                    if (audioRef.current && duration) {
                      audioRef.current.currentTime = next;
                      setPosition(next);
                    }
                  }}
                  className="h-6 w-full cursor-pointer accent-[#70d3c4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#70d3c4] disabled:cursor-default disabled:opacity-50"
                />
                <div aria-hidden="true" className="flex justify-between text-xs tabular-nums text-[#c2cddd]"><span>{formatTime(position)}</span><span>{formatTime(displayDuration)}</span></div>
              </div>
              <div className="relative mt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button type="button" onClick={() => moveTrack(-1)} disabled={!tracks.length} aria-label="Previous song" className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 ${focusRing}`}><SkipBack size={21} aria-hidden="true" /></button>
                  <button type="button" onClick={togglePlayback} disabled={!currentTrack} aria-label={playing || loading ? 'Pause song' : 'Play song'} className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#ffcf5b] text-[#102543] shadow-lg transition-colors hover:bg-[#ffde87] disabled:opacity-50 ${focusRing}`}>
                    {loading ? <Loader2 size={25} className="motion-safe:animate-spin" aria-hidden="true" /> : playing ? <Pause size={25} fill="currentColor" aria-hidden="true" /> : <Play size={25} fill="currentColor" className="ml-1" aria-hidden="true" />}
                  </button>
                  <button type="button" onClick={() => moveTrack(1)} disabled={!tracks.length} aria-label="Next song" className={`flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 ${focusRing}`}><SkipForward size={21} aria-hidden="true" /></button>
                </div>
                <button type="button" onClick={() => {
                  if (audioRef.current) audioRef.current.muted = !muted;
                  setMuted(!muted);
                }} aria-label={muted ? 'Unmute song' : 'Mute song'} aria-pressed={muted} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 ${focusRing}`}>
                  {muted ? <VolumeX size={21} aria-hidden="true" /> : <Volume2 size={21} aria-hidden="true" />}
                </button>
              </div>
              <p role="status" aria-live="polite" className="relative mt-3 min-h-4 text-xs text-[#c2cddd]">{status}</p>
            </div>

            {error && <div role="alert" className="mt-3 rounded-xl border border-[#ffd4d8] bg-[#fff1f2] p-3 text-sm text-[#9c2440]">
              <p>{error}</p>
              <button type="button" onClick={() => currentTrack && void startTrack(currentTrack)} className={`mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-bold underline underline-offset-4 ${focusRing}`}><RotateCcw size={15} aria-hidden="true" /> Retry song</button>
            </div>}

            <ol aria-label={`${station.name} songs`} className="mt-3 space-y-1">
              {(tracks.length ? tracks : catalogTracks).map((track, index) => {
                const selected = track.id === trackId;
                const playable = tracks.some(item => item.id === track.id);
                return <li key={track.id}>
                  <button type="button" disabled={!playable} onClick={() => playable && (selected ? togglePlayback() : void startTrack(track))} aria-label={`${playable ? selected && (playing || loading) ? 'Pause' : 'Play' : 'Library song'} ${track.title}`} aria-pressed={selected && playing} className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${focusRing} ${selected ? 'bg-[#e8f5ef] text-[#066f71]' : playable ? 'text-[#51617b] hover:bg-[#f6f8f6]' : 'text-[#51617b] opacity-80'}`}>
                    <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold">{selected && playing ? <Pause size={13} fill="currentColor" /> : String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1 text-sm font-bold leading-snug">{track.title}</span>
                    {playable ? selected && loading ? <Loader2 size={16} className="shrink-0 motion-safe:animate-spin" aria-hidden="true" /> : <Music2 size={16} className="shrink-0 opacity-60" aria-hidden="true" /> : <span className="shrink-0 rounded-full bg-[#fffaf0] px-2 py-1 text-[10px] font-bold text-[#8a5b14]">Library</span>}
                  </button>
                </li>;
              })}
            </ol>
          </div>
          {unavailableTracks.length > 0 && <details className="mt-5 rounded-xl border border-[#eadfcb] bg-[#fffaf0] p-4">
            <summary className={`cursor-pointer text-sm font-bold text-[#51617b] ${focusRing}`}>Our song collection: {unavailableTracks.length} awaiting audio</summary>
            <p className="mt-2 text-xs leading-relaxed text-[#64748b]">These titles are preserved in our collection. Their audio is not available to play yet.</p>
            <ul className="mt-3 space-y-2" aria-label="Songs temporarily unavailable">
              {unavailableTracks.map(track => <li key={track.id}>
                <button type="button" disabled aria-label={`${track.title} — temporarily unavailable`} className="flex min-h-11 w-full cursor-not-allowed items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-left text-xs text-[#64748b]">
                  <span><strong className="block text-[#51617b]">{track.title}</strong>{track.artist}</span>
                  <span className="shrink-0 rounded-full bg-[#f4efe3] px-2 py-1 text-[10px] font-semibold">Audio unavailable</span>
                </button>
              </li>)}
            </ul>
          </details>}
          <audio
            ref={audioRef}
            // Start metadata and the opening buffer before React hydrates.
            // Only this song is prefetched; playback still requires pressing play.
            src={initialTrackRef.current?.url}
            preload="metadata"
            onLoadedMetadata={event => {
              if (!activeTrackRef.current) return;
              const value = event.currentTarget.duration;
              setDuration(Number.isFinite(value) ? value : 0);
            }}
            onDurationChange={event => {
              if (!activeTrackRef.current) return;
              const value = event.currentTarget.duration;
              setDuration(Number.isFinite(value) ? value : 0);
            }}
            onTimeUpdate={event => setPosition(event.currentTarget.currentTime)}
            onPlaying={event => {
              if (!event.currentTarget.paused && wantsPlaybackRef.current) {
                setPlaying(true);
                setLoading(false);
                setError(null);
              }
            }}
            onPause={event => { if (event.currentTarget.paused) setPlaying(false); }}
            onWaiting={() => { if (wantsPlaybackRef.current) setLoading(true); }}
            onEnded={event => { if (event.currentTarget.ended && wantsPlaybackRef.current) moveTrack(1); }}
            onError={event => {
              const audio = event.currentTarget;
              if (!audio.error || !audio.getAttribute('src')) return;
              ++playAttemptRef.current;
              wantsPlaybackRef.current = false;
              setPlaying(false);
              setLoading(false);
              setError('This song could not load. Retry, or choose another song.');
            }}
          />
        </div>
      </div>
    </section>
  );
}
