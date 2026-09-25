'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import confetti from 'canvas-confetti';
import {
    LITTER_SIZE,
    MAX_REEF_LEVEL,
    REEF_TRASH,
    REEF_WILDLIFE,
    clampPlayfieldX,
    entityUnderPoint,
    memberCanPlayReefLevel,
    reefConfig,
    reefWave,
    reefZone,
    scoreReefHit,
    type ReefHitKind,
} from '@/lib/games/reef-rescue-rules';

interface GameProps {
    onComplete?: (score: number) => void;
    /** Highest level this sitting can open. Omit for the full member curve. */
    levelLimit?: number;
}

function levelCeiling(levelLimit?: number) {
    if (levelLimit == null) return MAX_REEF_LEVEL;
    const safe = Math.floor(Number(levelLimit));
    return memberCanPlayReefLevel(safe) ? safe : 1;
}

type Phase = 'start' | 'countdown' | 'play' | 'won' | 'lost';

type Litter = {
    id: number;
    kind: ReefHitKind;
    icon: string;
    label: string;
    points: number;
    hits: number;
    x: number;
    y: number;
    speed: number;
};

type FloatNote = { id: number; text: string; x: number; y: number };

const COUNTDOWN = ['3', '2', '1', 'GO!'];

export default function ReefRescue({ onComplete, levelLimit }: GameProps) {
    const [phase, setPhase] = useState<Phase>('start');
    const [level, setLevel] = useState(1);
    const [showLevels, setShowLevels] = useState(false);
    const [count, setCount] = useState('3');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(() => reefConfig(1).lives);
    const [timeLeft, setTimeLeft] = useState(() => reefConfig(1).duration);
    const [combo, setCombo] = useState(0);
    const [litter, setLitter] = useState<Litter[]>([]);
    const [notes, setNotes] = useState<FloatNote[]>([]);
    const [message, setMessage] = useState('Tap the rubbish. Let the sea creatures swim by!');

    const arenaRef = useRef<HTMLDivElement>(null);
    const litterRef = useRef<Litter[]>([]);
    const scoreRef = useRef(0);
    const livesRef = useRef(reefConfig(1).lives);
    const maxLivesRef = useRef(reefConfig(1).lives);
    const missBankRef = useRef(0);
    const timeRef = useRef(reefConfig(1).duration);
    const comboRef = useRef(0);
    const levelRef = useRef(1);
    const runningRef = useRef(false);
    const endedRef = useRef(false);
    const idRef = useRef(1);
    const spawnClockRef = useRef(0);
    const awardedRef = useRef(false);
    const pieceNodes = useRef(new Map<number, HTMLDivElement>());
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;
    const ceilingRef = useRef(levelCeiling(levelLimit));
    ceilingRef.current = levelCeiling(levelLimit);
    const ceiling = ceilingRef.current;

    const zone = reefZone(level);
    const config = reefConfig(level);
    const reefHealth = Math.max(0, Math.min(100, (lives / Math.max(1, config.lives)) * 100));
    const wave = reefWave(score, config.target, config.waves);

    function sync(nextLitter = litterRef.current) {
        litterRef.current = nextLitter;
        setLitter(nextLitter);
        setScore(scoreRef.current);
        setLives(livesRef.current);
        setTimeLeft(timeRef.current);
        setCombo(comboRef.current);
    }

    function floatAt(item: Litter, text: string) {
        const id = idRef.current++;
        setNotes((current) => [...current, { id, text, x: item.x, y: item.y }]);
        window.setTimeout(() => {
            setNotes((current) => current.filter((note) => note.id !== id));
        }, 700);
    }

    function finish(won: boolean) {
        if (endedRef.current) return;
        endedRef.current = true;
        runningRef.current = false;
        setPhase(won ? 'won' : 'lost');
        if (won) {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
            if (!awardedRef.current) {
                awardedRef.current = true;
                onCompleteRef.current?.(scoreRef.current);
            }
        }
    }

    function placePiece(item: Litter) {
        const node = pieceNodes.current.get(item.id);
        if (!node) return;
        node.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    }

    function spawnOne() {
        const width = arenaRef.current?.clientWidth ?? 320;
        const roll = Math.random();
        const cfg = reefConfig(levelRef.current);
        let kind: ReefHitKind = 'trash';
        let icon = '🥤';
        let label = 'rubbish';
        let points = 50;
        let hits = 1;
        if (roll < cfg.bonusChance) {
            kind = 'bonus';
            icon = '⭐';
            label = 'reef boost';
            points = 140;
        } else if (roll < cfg.bonusChance + cfg.wildlifeChance) {
            kind = 'wildlife';
            icon = REEF_WILDLIFE[Math.floor(Math.random() * REEF_WILDLIFE.length)];
            label = 'sea friend';
            points = 0;
        } else {
            const trash = REEF_TRASH[Math.floor(Math.random() * Math.min(REEF_TRASH.length, 4 + Math.ceil(levelRef.current / 25)))];
            icon = trash.icon;
            label = trash.label;
            points = trash.points;
            hits = trash.hits;
        }
        const item: Litter = {
            id: idRef.current++,
            kind,
            icon,
            label,
            points,
            hits,
            x: clampPlayfieldX(Math.random() * Math.max(0, width - LITTER_SIZE), width, LITTER_SIZE),
            y: -LITTER_SIZE,
            speed: cfg.speed * (0.85 + Math.random() * 0.35),
        };
        litterRef.current = [...litterRef.current, item];
    }

    function clearLitter(id: number) {
        if (!runningRef.current || endedRef.current) return;
        const item = litterRef.current.find((entry) => entry.id === id);
        if (!item) return;

        if (item.kind !== 'wildlife' && item.hits > 1) {
            item.hits -= 1;
            floatAt(item, 'Tap again!');
            sync();
            return;
        }

        const result = scoreReefHit(item.kind, item.points, comboRef.current);
        scoreRef.current = Math.max(0, scoreRef.current + result.scoreDelta);
        comboRef.current = result.nextCombo;
        livesRef.current = Math.max(0, Math.min(maxLivesRef.current, livesRef.current + result.lifeDelta));
        timeRef.current += result.timeDelta;
        litterRef.current = litterRef.current.filter((entry) => entry.id !== id);
        if (item.kind === 'wildlife') {
            setMessage(`${item.icon} is a friend. Let wildlife swim safely!`);
            floatAt(item, 'Friend!');
        } else {
            setMessage(item.kind === 'bonus' ? 'Reef boost! Extra time.' : 'Rubbish cleared. The reef is brighter!');
            floatAt(item, `+${result.scoreDelta}`);
        }
        sync();
        if (livesRef.current <= 0) finish(false);
        else if (scoreRef.current >= reefConfig(levelRef.current).target) finish(true);
    }

    function begin(nextLevel = level) {
        const allowed = ceilingRef.current;
        if (!memberCanPlayReefLevel(nextLevel) || nextLevel > allowed) return;
        const cfg = reefConfig(nextLevel);
        awardedRef.current = false;
        endedRef.current = false;
        runningRef.current = false;
        levelRef.current = nextLevel;
        scoreRef.current = 0;
        maxLivesRef.current = cfg.lives;
        livesRef.current = cfg.lives;
        missBankRef.current = 0;
        timeRef.current = cfg.duration;
        comboRef.current = 0;
        spawnClockRef.current = cfg.spawnMs * 0.35;
        litterRef.current = [];
        setLevel(nextLevel);
        setShowLevels(false);
        setScore(0);
        setLives(cfg.lives);
        setTimeLeft(cfg.duration);
        setCombo(0);
        setLitter([]);
        setNotes([]);
        setMessage('Get ready to tap the rubbish!');
        setCount('3');
        setPhase('countdown');
    }

    useEffect(() => {
        if (phase !== 'countdown') return;
        let step = 0;
        setCount(COUNTDOWN[0]);
        const timer = window.setInterval(() => {
            step += 1;
            if (step >= COUNTDOWN.length) {
                window.clearInterval(timer);
                runningRef.current = true;
                setPhase('play');
                setMessage('Tap bottles, bags, and cans. Leave the animals alone!');
                return;
            }
            setCount(COUNTDOWN[step]);
        }, 550);
        return () => window.clearInterval(timer);
    }, [phase]);

    useEffect(() => {
        if (phase !== 'play') return;
        let frame = 0;
        let last = performance.now();
        const tick = (now: number) => {
            if (!runningRef.current) return;
            const delta = Math.min(0.04, (now - last) / 1000 || 0);
            last = now;
            timeRef.current -= delta;
            spawnClockRef.current += delta * 1000;
            const cfg = reefConfig(levelRef.current);
            while (spawnClockRef.current >= cfg.spawnMs) {
                spawnClockRef.current -= cfg.spawnMs;
                spawnOne();
            }
            const width = arenaRef.current?.clientWidth ?? 320;
            const height = arenaRef.current?.clientHeight ?? 420;
            const limit = height - 8;
            let livesNow = livesRef.current;
            const kept: Litter[] = [];
            litterRef.current.forEach((item) => {
                item.x = clampPlayfieldX(item.x, width, LITTER_SIZE);
                const y = item.y + item.speed * delta;
                if (y >= limit) {
                    if (item.kind === 'trash') {
                        missBankRef.current += 1;
                        comboRef.current = 0;
                        if (missBankRef.current >= cfg.missesPerLife) {
                            missBankRef.current = 0;
                            livesNow -= 1;
                            setMessage('Rubbish reached the coral. Keep tapping!');
                        }
                    }
                    return;
                }
                item.y = y;
                placePiece(item);
                kept.push(item);
            });
            livesRef.current = Math.max(0, livesNow);
            litterRef.current = kept;
            setLitter(kept);
            setTimeLeft(timeRef.current);
            setLives(livesRef.current);
            setCombo(comboRef.current);
            if (livesRef.current <= 0) {
                finish(false);
                return;
            }
            if (timeRef.current <= 0) {
                finish(scoreRef.current >= cfg.target);
                return;
            }
            if (scoreRef.current >= cfg.target) {
                finish(true);
                return;
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [phase]);

    useLayoutEffect(() => {
        litterRef.current.forEach(placePiece);
    });

    function onPlayfieldPointer(event: ReactPointerEvent<HTMLDivElement>) {
        if (!runningRef.current || endedRef.current || !arenaRef.current) return;
        const rect = arenaRef.current.getBoundingClientRect();
        const hit = entityUnderPoint(
            litterRef.current,
            event.clientX - rect.left,
            event.clientY - rect.top,
            LITTER_SIZE,
        );
        if (!hit) return;
        event.preventDefault();
        clearLitter(hit.id);
    }

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-cyan-300 via-sky-600 to-blue-950 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-200">{zone.flag} {zone.name}</p>
                    <p className="text-lg font-black">Level {level} / {ceiling}</p>
                    <p className="text-xs font-black text-cyan-100">Wave {wave} / {config.waves}</p>
                </div>
                <div className="flex gap-2 text-center text-sm font-black">
                    <Stat label="Score" value={score} />
                    <Stat label="Target" value={config.target} />
                    <Stat label="Combo" value={`×${Math.max(1, combo)}`} />
                    <Stat label="Time" value={Math.max(0, Math.ceil(timeLeft))} />
                </div>
            </div>

            <div className="mx-4 mb-3 h-3 overflow-hidden rounded-full bg-black/30" aria-label="Reef health">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 transition-all"
                    style={{ width: `${phase === 'start' ? 35 : Math.min(100, (score / config.target) * 100)}%` }}
                />
            </div>
            <p className="px-4 pb-2 text-sm font-bold text-cyan-50">{zone.emoji} {message}</p>

            <div
                ref={arenaRef}
                data-reef-arena
                className="relative mx-3 mb-3 h-[min(58dvh,520px)] min-h-[390px] cursor-pointer touch-manipulation overflow-hidden rounded-[1.6rem] border border-white/30 bg-gradient-to-b from-cyan-300 via-sky-500 to-blue-900"
                style={{ touchAction: 'manipulation' }}
                aria-label="Tap rubbish to protect the reef"
                onPointerDown={onPlayfieldPointer}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0,rgba(255,255,220,0.35),transparent_40%)]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-700/80 to-transparent" />
                <div
                    className="pointer-events-none absolute inset-x-4 bottom-3 h-16 rounded-full blur-md transition-all"
                    style={{ background: `linear-gradient(90deg,#f9a8d4,#34d399,#22d3ee,#fbbf24)`, opacity: 0.35 + (1 - lives / Math.max(1, config.lives)) * 0.15 + Math.min(score / config.target, 1) * 0.4 }}
                />

                {litter.map((item) => (
                    <div
                        key={item.id}
                        data-litter-id={item.id}
                        data-litter-kind={item.kind}
                        ref={(node) => {
                            if (node) pieceNodes.current.set(item.id, node);
                            else pieceNodes.current.delete(item.id);
                        }}
                        className="pointer-events-none absolute left-0 top-0 z-20 grid h-[72px] w-[72px] place-items-center rounded-full bg-white/15 text-5xl shadow-lg"
                        style={{ transform: `translate3d(${item.x}px, ${item.y}px, 0)` }}
                        aria-hidden
                    >
                        {item.icon}
                    </div>
                ))}

                <div className="pointer-events-none absolute inset-0 z-30">
                    {notes.map((note) => (
                        <span key={note.id} className="absolute text-lg font-black text-amber-200 drop-shadow" style={{ left: note.x, top: note.y }}>
                            {note.text}
                        </span>
                    ))}
                </div>

                <div className="pointer-events-none absolute bottom-3 left-3 z-30 rounded-2xl bg-black/45 px-3 py-2 text-xs font-bold">
                    Reef health {Math.round(reefHealth)}% · ♥ {Math.max(0, lives)}
                </div>

                {phase === 'countdown' && (
                    <div className="absolute inset-0 z-40 grid place-items-center bg-sky-950/35 text-7xl font-black">
                        {count}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-3 px-4 pb-4 text-xs font-black text-cyan-50">
                <span>♻ Tap rubbish</span>
                <span>🐢 Let wildlife swim</span>
                <span>⭐ Catch bonuses</span>
            </div>

            {phase === 'start' && (
                <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/75 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-sky-800 to-slate-950 p-6 text-center shadow-2xl">
                        <p className="text-5xl">🐠</p>
                        <h2 className="mt-2 text-3xl font-black">The Caribbean reef needs you!</h2>
                        <p className="mt-2 text-sm font-semibold text-cyan-100">
                            Clear ocean litter, protect sea life and restore colorful Caribbean reefs.
                        </p>
                        <p className="mt-3 text-sm font-black text-amber-200">Level {level} · {zone.name} · {config.waves} waves</p>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-300 to-amber-300 text-lg font-black text-slate-900 touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                begin(level);
                            }}
                        >
                            Start rescue
                        </button>
                        <button
                            type="button"
                            className="mt-2 min-h-[48px] w-full cursor-pointer rounded-2xl text-sm font-black text-cyan-100 touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                setShowLevels(true);
                            }}
                        >
                            Choose a level
                        </button>
                    </div>
                </div>
            )}

            {showLevels && phase === 'start' && (
                <div className="absolute inset-0 z-[60] grid place-items-center bg-slate-950/80 p-4">
                    <div className="max-h-[80%] w-full max-w-lg overflow-auto rounded-3xl bg-sky-950 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-xl font-black">{ceiling === MAX_REEF_LEVEL ? 'Every level is open' : 'Choose a level'}</h3>
                            <button
                                type="button"
                                className="h-12 w-12 cursor-pointer rounded-xl bg-white/10 text-2xl touch-manipulation"
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    setShowLevels(false);
                                }}
                                aria-label="Close levels"
                            >
                                ×
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                            {Array.from({ length: ceiling }, (_, index) => index + 1).map((number) => (
                                <button
                                    key={number}
                                    type="button"
                                    className={`aspect-square cursor-pointer rounded-xl text-sm font-black touch-manipulation ${number === level ? 'bg-amber-300 text-slate-900' : 'bg-white/10'}`}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        setLevel(number);
                                        setShowLevels(false);
                                    }}
                                >
                                    {number}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {(phase === 'won' || phase === 'lost') && (
                <div className="absolute inset-0 z-50 grid place-items-center bg-slate-950/75 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-sky-800 to-slate-950 p-6 text-center">
                        <p className="text-5xl">{phase === 'won' ? '🏅' : '🛟'}</p>
                        <h2 className="mt-2 text-3xl font-black">{phase === 'won' ? 'Reef rescued!' : 'The reef needs you!'}</h2>
                        <p className="mt-2 text-sm text-cyan-100">
                            {phase === 'won'
                                ? `You protected ${zone.name} and the coral is colorful again.`
                                : 'Tap the litter faster next time, and let the sea animals swim past.'}
                        </p>
                        <p className="mt-3 text-4xl font-black text-emerald-300">{score}</p>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-gradient-to-r from-emerald-300 to-amber-300 text-lg font-black text-slate-900 touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                const atTop = phase === 'won' && level >= ceiling;
                                if (atTop && ceiling < MAX_REEF_LEVEL) begin(1);
                                else begin(phase === 'won' ? Math.min(ceiling, level + 1) : level);
                            }}
                        >
                            {phase === 'won' && level < ceiling ? 'Next mission' : 'Play again'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="min-w-[64px] rounded-2xl bg-white/10 px-2 py-1">
            <div className="text-[10px] uppercase tracking-wide text-cyan-100">{label}</div>
            <div>{value}</div>
        </div>
    );
}
