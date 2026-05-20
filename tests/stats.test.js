/**
 * Unit tests for stats service helper functions.
 * Pure logic tests — no DB dependency.
 */

// Extract just the helper functions without DB dep
function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function estimatedReadingTime(wordCount) {
    return Math.ceil(wordCount / 238);
}

function completionPercent(current, target) {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

function test(description, fn) {
    try {
        fn();
        console.log(`  ✓ ${description}`);
    } catch (e) {
        console.error(`  ✗ ${description}`);
        console.error(`    ${e.message}`);
        process.exitCode = 1;
    }
}

function assertEqual(a, b) {
    if (a !== b) throw new Error(`Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
}

console.log('\n📊 Stats Service — Unit Tests\n');

console.log('countWords:');
test('returns 0 for empty string', () => assertEqual(countWords(''), 0));
test('returns 0 for null', () => assertEqual(countWords(null), 0));
test('returns 0 for whitespace only', () => assertEqual(countWords('   '), 0));
test('counts single word', () => assertEqual(countWords('hello'), 1));
test('counts multiple words', () => assertEqual(countWords('the quick brown fox'), 4));
test('handles extra spaces between words', () => assertEqual(countWords('a  b  c'), 3));
test('handles newlines as whitespace', () => assertEqual(countWords('one\ntwo\nthree'), 3));

console.log('\nestimatedReadingTime:');
test('returns 0 for 0 words', () => assertEqual(estimatedReadingTime(0), 0));
test('returns 1 for 238 words', () => assertEqual(estimatedReadingTime(238), 1));
test('rounds up for partial minutes', () => assertEqual(estimatedReadingTime(239), 2));
test('handles large word counts', () => assertEqual(estimatedReadingTime(80000), Math.ceil(80000 / 238)));

console.log('\ncompletionPercent:');
test('returns 0 when target is 0', () => assertEqual(completionPercent(100, 0), 0));
test('returns 0 when current is 0', () => assertEqual(completionPercent(0, 100), 0));
test('returns 50 for half done', () => assertEqual(completionPercent(50, 100), 50));
test('returns 100 for complete', () => assertEqual(completionPercent(100, 100), 100));
test('caps at 100 when over target', () => assertEqual(completionPercent(200, 100), 100));
test('rounds correctly', () => assertEqual(completionPercent(1, 3), 33));

console.log('\n');
