import assert from 'node:assert/strict';
import {
    canPlace,
    clearCompleted,
    emptyBoard,
    findCompletedLines,
    lineClearScore,
    pieceFitsAnywhere,
    rotateCells,
    stampPiece,
    BOARD_SIZE,
} from '../lib/games/block-placement';
import { questionFor, QUIZ_LEVELS } from '../lib/games/island-quiz-data';
import { clampPlayfieldX, entityUnderPoint, memberCanPlayReefLevel, reefConfig, scoreReefHit } from '../lib/games/reef-rescue-rules';

function testReefMembersAreNeverGated() {
    assert.equal(memberCanPlayReefLevel(1), true);
    assert.equal(memberCanPlayReefLevel(4), true);
    assert.equal(memberCanPlayReefLevel(100), true);
    assert.equal(memberCanPlayReefLevel(0), false);
    const hit = scoreReefHit('trash', 50, 0);
    assert.equal(hit.scoreDelta, 50);
    assert.equal(hit.remove, true);
    const friend = scoreReefHit('wildlife', 0, 3);
    assert.equal(friend.lifeDelta, -1);
    assert.equal(friend.nextCombo, 0);
    assert.ok(reefConfig(1).target > 0);

    const pieces = [{ id: 'bag', x: 120, y: 180 }, { id: 'bottle', x: 130, y: 190 }];
    assert.equal(entityUnderPoint(pieces, 140, 200)?.id, 'bottle');
    assert.equal(entityUnderPoint(pieces, 0, 0), null);
    assert.equal(clampPlayfieldX(-40, 320, 72), 0);
    assert.equal(clampPlayfieldX(400, 320, 72), 248);
}

function testQuizAlwaysHasATappableAnswer() {
    for (let level = 1; level <= QUIZ_LEVELS; level += 1) {
        const question = questionFor(level);
        assert.equal(question.options.length, 4);
        assert.ok(question.options.includes(question.correct));
        assert.ok(question.question.length > 8);
    }
}

function testBlockPlacementClearsAFullRow() {
    let board = emptyBoard();
    const cells = [{ x: 0, y: 0 }];
    for (let x = 0; x < BOARD_SIZE; x += 1) {
        assert.equal(canPlace(board, cells, x, BOARD_SIZE - 1), true);
        board = stampPiece(board, cells, x, BOARD_SIZE - 1, { emoji: '🥁', color: '#fbbf24' });
    }
    const lines = findCompletedLines(board);
    assert.deepEqual(lines.rows, [BOARD_SIZE - 1]);
    board = clearCompleted(board, lines.rows, lines.cols);
    assert.equal(board[BOARD_SIZE - 1].every((cell) => cell === null), true);
    assert.equal(lineClearScore(1, 1), 100);
    assert.equal(pieceFitsAnywhere(board, [{ x: 0, y: 0 }, { x: 1, y: 0 }]), true);
    const turned = rotateCells([{ x: 1, y: 0 }]);
    assert.deepEqual(turned, [{ x: 0, y: 0 }]);
}

testReefMembersAreNeverGated();
testQuizAlwaysHasATappableAnswer();
testBlockPlacementClearsAFullRow();
console.log('portal lead games checks passed');
