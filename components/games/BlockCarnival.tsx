'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
    BLOCK_SHAPES,
    BOARD_SIZE,
    canPlace,
    clearCompleted,
    emptyBoard,
    findCompletedLines,
    lineClearScore,
    pieceFitsAnywhere,
    rotateCells,
    stampPiece,
    type BlockCell,
    type ShapeCell,
} from '@/lib/games/block-placement';
import { blockCarnivalLines, blockCarnivalSwaps } from '@/lib/games/long-play';

interface GameProps {
    onComplete?: (score: number) => void;
    /** How many islands this sitting can open. Omit for the full carnival. */
    islandLimit?: number;
}

function islandCeiling(islandLimit: number | undefined, total: number) {
    if (islandLimit == null) return total;
    const safe = Math.floor(Number(islandLimit));
    if (!Number.isFinite(safe) || safe < 1) return 1;
    return Math.min(total, safe);
}

type Piece = {
    id: string;
    name: string;
    cells: ShapeCell[];
    emoji: string;
    color: string;
    used: boolean;
};

const ISLANDS = [
    { id: 'trinidad', label: 'Trinidad & Tobago', flag: '🇹🇹', treasure: 'Doubles', emoji: '🫓' },
    { id: 'jamaica', label: 'Jamaica', flag: '🇯🇲', treasure: 'Ackee', emoji: '🥭' },
    { id: 'barbados', label: 'Barbados', flag: '🇧🇧', treasure: 'Flying fish', emoji: '🐟' },
    { id: 'guyana', label: 'Guyana', flag: '🇬🇾', treasure: 'Pepperpot', emoji: '🍲' },
    { id: 'grenada', label: 'Grenada', flag: '🇬🇩', treasure: 'Nutmeg', emoji: '🌰' },
    { id: 'saint-lucia', label: 'Saint Lucia', flag: '🇱🇨', treasure: 'Green fig', emoji: '🍌' },
];

const COLORS = ['#fbbf24', '#34d399', '#c4b5fd', '#fb7185', '#67e8f9'];

function randomShape() {
    const total = BLOCK_SHAPES.reduce((sum, shape) => sum + shape.weight, 0);
    let pick = Math.random() * total;
    for (const shape of BLOCK_SHAPES) {
        pick -= shape.weight;
        if (pick <= 0) return shape;
    }
    return BLOCK_SHAPES[0];
}

function makePiece(index: number, islandEmoji: string): Piece {
    const shape = randomShape();
    return {
        id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        name: shape.name,
        cells: shape.cells.map((cell) => ({ ...cell })),
        emoji: index === 0 ? islandEmoji : ['🥁', '🌺', '🥥', '🦜'][index % 4],
        color: COLORS[index % COLORS.length],
        used: false,
    };
}

export default function BlockCarnival({ onComplete, islandLimit }: GameProps) {
    const [islandIndex, setIslandIndex] = useState(0);
    const [started, setStarted] = useState(false);
    const [board, setBoard] = useState<BlockCell[][]>(() => emptyBoard());
    const [pieces, setPieces] = useState<Piece[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [lines, setLines] = useState(0);
    const [combo, setCombo] = useState(0);
    const [fever, setFever] = useState(0);
    const [swaps, setSwaps] = useState(3);
    const [status, setStatus] = useState('Choose a piece, then tap the board.');
    const [finished, setFinished] = useState<'win' | 'lose' | null>(null);
    const [awarded, setAwarded] = useState(false);

    const ceiling = islandCeiling(islandLimit, ISLANDS.length);
    const island = ISLANDS[Math.min(islandIndex, ceiling - 1)];
    const linesToWin = blockCarnivalLines(islandIndex);
    const selected = pieces.find((piece) => piece.id === selectedId && !piece.used) ?? null;

    function freshTray(emoji: string, current = board) {
        let next = [0, 1, 2].map((index) => makePiece(index, emoji));
        let tries = 0;
        while (!next.some((piece) => pieceFitsAnywhere(current, piece.cells)) && tries < 8) {
            next = [0, 1, 2].map((index) => makePiece(index, emoji));
            tries += 1;
        }
        setPieces(next);
        setSelectedId(next.find((piece) => pieceFitsAnywhere(current, piece.cells))?.id ?? next[0].id);
    }

    function start(index = islandIndex) {
        const nextIsland = ISLANDS[index];
        const blank = emptyBoard();
        setIslandIndex(index);
        setBoard(blank);
        setScore(0);
        setLines(0);
        setCombo(0);
        setFever(0);
        setSwaps(blockCarnivalSwaps(index));
        setFinished(null);
        setAwarded(false);
        setStarted(true);
        setStatus(`Welcome to ${nextIsland.label}. Tap a piece, then tap a square.`);
        freshTray(nextIsland.emoji, blank);
    }

    function rotateSelected() {
        if (!selected || finished) return;
        setPieces((current) => current.map((piece) => (
            piece.id === selected.id ? { ...piece, cells: rotateCells(piece.cells) } : piece
        )));
        setStatus('Piece rotated. Tap a square to place it.');
    }

    function swapSelected() {
        if (!selected || swaps <= 0 || finished) return;
        const replacement = makePiece(1, island.emoji);
        setPieces((current) => current.map((piece) => (piece.id === selected.id ? { ...replacement, id: piece.id } : piece)));
        setSwaps((count) => count - 1);
        setStatus('New piece ready. Tap the board.');
    }

    function placeAt(x: number, y: number) {
        if (!started || finished || !selected) {
            setStatus('Choose a piece first.');
            return;
        }
        if (!canPlace(board, selected.cells, x, y)) {
            setStatus('That spot is too tight. Try another square or rotate.');
            return;
        }
        let next = stampPiece(board, selected.cells, x, y, { emoji: selected.emoji, color: selected.color });
        const usedPieces = pieces.map((piece) => (piece.id === selected.id ? { ...piece, used: true } : piece));
        let nextScore = score + selected.cells.length;
        let nextCombo = 0;
        let nextLines = lines;
        let nextFever = fever;
        const completed = findCompletedLines(next);
        const cleared = completed.rows.length + completed.cols.length;
        if (cleared > 0) {
            nextCombo = combo + 1;
            nextLines += cleared;
            nextScore += lineClearScore(cleared, nextCombo);
            nextFever = Math.min(100, fever + 28 * cleared);
            next = clearCompleted(next, completed.rows, completed.cols);
            confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
            setStatus(cleared > 1 ? 'Carnival clear!' : 'Line cleared. The fete is heating up!');
        } else {
            setStatus('Nice place. Fill a whole row or column.');
        }
        setBoard(next);
        setScore(nextScore);
        setCombo(nextCombo);
        setLines(nextLines);
        setFever(nextFever);
        setPieces(usedPieces);

        const linesToWin = blockCarnivalLines(islandIndex);
        if (nextLines >= linesToWin) {
            setFinished('win');
            if (!awarded) {
                setAwarded(true);
                onComplete?.(nextScore);
            }
            return;
        }

        const remaining = usedPieces.filter((piece) => !piece.used);
        if (remaining.length === 0) {
            freshTray(island.emoji, next);
            return;
        }
        const playable = remaining.find((piece) => pieceFitsAnywhere(next, piece.cells));
        setSelectedId(playable?.id ?? remaining[0].id);
        if (!playable && swaps === 0) {
            setFinished('lose');
            setStatus('The board is full. Try a new carnival run!');
        } else if (!playable) {
            setStatus('No shape fits. Use a swap for a new piece.');
        }
    }

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-rose-500 via-orange-500 to-amber-300 p-3 text-slate-900 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-white">
                <div>
                    <p className="text-xs font-black uppercase tracking-widest">{island.flag} Carnival puzzle</p>
                    <h2 className="text-2xl font-black">{island.label}</h2>
                </div>
                <div className="flex gap-2 text-center text-sm font-black">
                    <Pill label="Score" value={score} />
                    <Pill label="Lines" value={`${lines}/${linesToWin}`} />
                    <Pill label="Fever" value={`${fever}%`} />
                </div>
            </div>
            <div className="mb-3 h-3 overflow-hidden rounded-full bg-black/20">
                <div className="h-full bg-amber-200" style={{ width: `${fever}%` }} />
            </div>
            <p className="mb-3 text-sm font-black text-white">{status}</p>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div
                    className="grid aspect-square w-full max-w-[520px] grid-cols-8 gap-1 rounded-3xl bg-slate-950/40 p-2"
                    style={{ touchAction: 'manipulation' }}
                    role="grid"
                    aria-label="8 by 8 carnival board"
                >
                    {board.map((row, y) => row.map((cell, x) => (

                            <button
                                key={`${x}-${y}`}
                                type="button"
                                aria-label={`Place on row ${y + 1}, column ${x + 1}`}
                                className="aspect-square min-h-0 cursor-pointer rounded-lg border border-white/10 touch-manipulation active:scale-95"
                                style={{
                                    background: cell ? cell.color : 'rgba(255,255,255,0.14)',
                                    touchAction: 'manipulation',
                                }}
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    placeAt(x, y);
                                }}
                            >
                                <span className="pointer-events-none text-lg sm:text-2xl">{cell?.emoji}</span>
                            </button>
                    )))}
                </div>

                <div className="rounded-3xl bg-white/90 p-3">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500">Your 3 pieces</p>
                    <div className="mt-2 grid gap-2">
                        {pieces.map((piece) => (
                            <button
                                key={piece.id}
                                type="button"
                                disabled={piece.used}
                                aria-label={`Choose ${piece.name}`}
                                className={`min-h-[72px] cursor-pointer rounded-2xl border-4 px-3 text-left font-black touch-manipulation disabled:cursor-default disabled:opacity-30 ${selectedId === piece.id && !piece.used ? 'border-orange-500 bg-orange-50' : 'border-transparent bg-slate-100'}`}
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    if (!piece.used) {
                                        setSelectedId(piece.id);
                                        setStatus('Piece chosen. Tap a square on the board.');
                                    }
                                }}
                            >
                                <span className="text-2xl">{piece.emoji}</span> {piece.name}
                                <span className="mt-1 block text-xs text-slate-500">{piece.cells.length} blocks</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" className="min-h-[52px] cursor-pointer rounded-2xl bg-slate-900 font-black text-white touch-manipulation" onPointerDown={(event) => { event.preventDefault(); rotateSelected(); }}>
                            ↻ Rotate
                        </button>
                        <button type="button" className="min-h-[52px] cursor-pointer rounded-2xl bg-amber-300 font-black touch-manipulation disabled:opacity-40" disabled={swaps <= 0} onPointerDown={(event) => { event.preventDefault(); swapSelected(); }}>
                            ⇄ Swap {swaps}
                        </button>
                    </div>
                </div>
            </div>

            {!started && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center">
                        <p className="text-5xl">🎉</p>
                        <h2 className="mt-2 text-3xl font-black">Caribbean Block Carnival</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            Place colorful blocks, clear full rows, and fill the Carnival Fever meter.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {ISLANDS.slice(0, ceiling).map((item, index) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className={`min-h-[52px] cursor-pointer rounded-2xl px-2 text-sm font-black touch-manipulation ${index === islandIndex ? 'bg-orange-500 text-white' : 'bg-slate-100'}`}
                                    onPointerDown={(event) => {
                                        event.preventDefault();
                                        setIslandIndex(index);
                                    }}
                                >
                                    {item.flag} {item.label}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 text-lg font-black text-white touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                start(islandIndex);
                            }}
                        >
                            Start carnival
                        </button>
                    </div>
                </div>
            )}

            {finished && (
                <div className="absolute inset-0 z-40 grid place-items-center bg-slate-950/70 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center">
                        <p className="text-5xl">{finished === 'win' ? '🏅' : '🥁'}</p>
                        <h2 className="mt-2 text-3xl font-black">{finished === 'win' ? 'Level complete!' : 'Board full'}</h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                            {finished === 'win'
                                ? `You cleared ${linesToWin} lines in ${island.label} and raised Carnival Fever.`
                                : 'Rotate or swap sooner next time. Every island is open to try again.'}
                        </p>
                        <p className="mt-3 text-4xl font-black text-orange-500">{score}</p>
                        <button
                            type="button"
                            className="mt-4 min-h-[64px] w-full cursor-pointer rounded-2xl bg-slate-900 text-lg font-black text-white touch-manipulation"
                            onPointerDown={(event) => {
                                event.preventDefault();
                                if (finished !== 'win') {
                                    start(Math.min(islandIndex, ceiling - 1));
                                    return;
                                }
                                if (ceiling === ISLANDS.length) {
                                    start((islandIndex + 1) % ISLANDS.length);
                                    return;
                                }
                                start(islandIndex + 1 < ceiling ? islandIndex + 1 : 0);
                            }}
                        >
                            {finished === 'win' && (ceiling === ISLANDS.length || islandIndex + 1 < ceiling) ? 'Next island' : 'Play again'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function Pill({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="min-w-[68px] rounded-2xl bg-black/20 px-2 py-1">
            <div className="text-[10px] uppercase">{label}</div>
            <div>{value}</div>
        </div>
    );
}
