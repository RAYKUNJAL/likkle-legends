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
import { QUIZ_QUEST_QUESTIONS, QUIZ_ROUNDS, questionFor, QUIZ_LEVELS } from '../lib/games/island-quiz-data';
import { clampPlayfieldX, entityUnderPoint, memberCanPlayReefLevel, reefConfig, reefWave, scoreReefHit } from '../lib/games/reef-rescue-rules';
import {
    FLAG_LEVELS,
    MATH_PROBLEM_COUNTS,
    MEMORY_PLAN,
    PATOIS_LEVELS,
    blockCarnivalLines,
    doublesDashSeconds,
    extendMathProblems,
    triviaSession,
} from '../lib/games/long-play';

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
    const easy = reefConfig(1);
    const late = reefConfig(100);
    assert.ok(easy.duration >= 150, `early reef clock ${easy.duration}`);
    assert.ok(late.duration > easy.duration);
    assert.ok(late.target > easy.target);
    assert.ok(easy.waves >= 3 && late.waves > easy.waves);
    assert.ok(easy.lives * easy.missesPerLife >= 24);
    assert.equal(reefWave(0, easy.target, easy.waves), 1);
    assert.equal(reefWave(easy.target, easy.target, easy.waves), easy.waves);

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

function testLongPlayCurvesStayBeatable() {
    assert.equal(QUIZ_ROUNDS.length, 3);
    assert.equal(QUIZ_QUEST_QUESTIONS, 30);
    assert.deepEqual(blockCarnivalLines(0), 6);
    assert.ok(blockCarnivalLines(5) > blockCarnivalLines(0));
    assert.equal(MEMORY_PLAN.easy.boards, 2);
    assert.equal(MEMORY_PLAN.hard.pairs, 10);
    assert.ok(FLAG_LEVELS[0].rounds >= 12);
    assert.ok(FLAG_LEVELS[4].timeMs >= 12000);
    assert.equal(PATOIS_LEVELS[0].boards, 2);
    assert.ok(PATOIS_LEVELS[4].boards * PATOIS_LEVELS[4].pairs >= 24);
    assert.deepEqual(MATH_PROBLEM_COUNTS[0], 8);
    const problems = extendMathProblems('addition', [{ question: '1+1', answer: 2 }], 8);
    assert.equal(problems.length, 8);
    assert.equal(problems[0].answer, 2);
    const trivia = triviaSession({
        id: 1,
        timeMs: 0,
        questions: [{ q: 'Capital?', options: ['A', 'B', 'C'], a: 0, fact: 'A' }],
    });
    assert.equal(trivia.questions.length, 2);
    assert.equal(trivia.timeMs, 0);
    const legend = triviaSession({
        id: 3,
        timeMs: 10000,
        questions: [{ q: 'Year?', options: ['1962', '1970', '1980'], a: 0, fact: '1962' }],
    });
    assert.equal(legend.questions.length, 3);
    assert.equal(legend.timeMs, 18000);
    assert.ok(legend.questions.every((question) => question.options[question.a]));
    assert.ok(doublesDashSeconds(1) >= 120);
    assert.ok(doublesDashSeconds(10) > doublesDashSeconds(1));
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
testLongPlayCurvesStayBeatable();
testBlockPlacementClearsAFullRow();
console.log('portal lead games checks passed');
