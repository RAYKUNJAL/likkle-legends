export const BOARD_SIZE = 8;

export type BlockCell = { emoji: string; color: string } | null;
export type ShapeCell = { x: number; y: number };
export type BlockShape = { name: string; cells: ShapeCell[]; weight: number };

export const BLOCK_SHAPES: BlockShape[] = [
    { name: 'Single', cells: [{ x: 0, y: 0 }], weight: 7 },
    { name: 'Domino', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }], weight: 9 },
    { name: 'Tall domino', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }], weight: 9 },
    { name: 'Three bar', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], weight: 8 },
    { name: 'Tall three', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }], weight: 8 },
    { name: 'Square', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], weight: 8 },
    { name: 'Small L', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], weight: 7 },
    { name: 'L', cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }], weight: 5 },
    { name: 'T', cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }], weight: 5 },
];

export function emptyBoard(): BlockCell[][] {
    return Array.from({ length: BOARD_SIZE }, () => Array<BlockCell>(BOARD_SIZE).fill(null));
}

export function rotateCells(cells: ShapeCell[]): ShapeCell[] {
    const rotated = cells.map(({ x, y }) => ({ x: y, y: -x }));
    const minX = Math.min(...rotated.map((cell) => cell.x));
    const minY = Math.min(...rotated.map((cell) => cell.y));
    return rotated.map((cell) => ({ x: cell.x - minX, y: cell.y - minY }));
}

export function canPlace(board: BlockCell[][], cells: ShapeCell[], originX: number, originY: number): boolean {
    return cells.every(({ x, y }) => {
        const tx = originX + x;
        const ty = originY + y;
        return tx >= 0 && tx < BOARD_SIZE && ty >= 0 && ty < BOARD_SIZE && !board[ty][tx];
    });
}

export function stampPiece(
    board: BlockCell[][],
    cells: ShapeCell[],
    originX: number,
    originY: number,
    cell: BlockCell,
): BlockCell[][] {
    const next = board.map((row) => row.slice());
    cells.forEach(({ x, y }) => {
        next[originY + y][originX + x] = cell;
    });
    return next;
}

export function findCompletedLines(board: BlockCell[][]) {
    const rows: number[] = [];
    const cols: number[] = [];
    for (let y = 0; y < BOARD_SIZE; y += 1) {
        if (board[y].every(Boolean)) rows.push(y);
    }
    for (let x = 0; x < BOARD_SIZE; x += 1) {
        if (board.every((row) => row[x])) cols.push(x);
    }
    return { rows, cols };
}

export function clearCompleted(board: BlockCell[][], rows: number[], cols: number[]): BlockCell[][] {
    const next = board.map((row) => row.slice());
    rows.forEach((y) => {
        for (let x = 0; x < BOARD_SIZE; x += 1) next[y][x] = null;
    });
    cols.forEach((x) => {
        for (let y = 0; y < BOARD_SIZE; y += 1) next[y][x] = null;
    });
    return next;
}

export function pieceFitsAnywhere(board: BlockCell[][], cells: ShapeCell[]): boolean {
    let current = cells;
    for (let turn = 0; turn < 4; turn += 1) {
        for (let y = 0; y < BOARD_SIZE; y += 1) {
            for (let x = 0; x < BOARD_SIZE; x += 1) {
                if (canPlace(board, current, x, y)) return true;
            }
        }
        current = rotateCells(current);
    }
    return false;
}

export function lineClearScore(lineCount: number, combo: number): number {
    return Math.round((100 + Math.max(0, lineCount - 1) * 75) * (1 + Math.min(Math.max(0, combo - 1), 10) * 0.1));
}
