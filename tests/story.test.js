/**
 * Unit tests for story creation validation and word count logic.
 */

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

function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

// Replicate word count logic from frontend and storyService
function calculateWordCount(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

// Replicate story creation validation
function validateStoryInput(title, genre) {
    const errors = [];
    if (!title || !title.trim()) errors.push('Title is required');
    return errors;
}

console.log('\n📖 Story Logic — Unit Tests\n');

console.log('Story creation validation:');
test('rejects empty title', () => {
    const errs = validateStoryInput('', 'Fantasy');
    assert(errs.includes('Title is required'));
});
test('rejects null title', () => {
    const errs = validateStoryInput(null, 'Fantasy');
    assert(errs.includes('Title is required'));
});
test('rejects whitespace-only title', () => {
    const errs = validateStoryInput('   ', 'Fantasy');
    assert(errs.includes('Title is required'));
});
test('accepts valid title with no genre', () => {
    const errs = validateStoryInput('My Novel', '');
    assertEqual(errs.length, 0);
});
test('accepts valid title and genre', () => {
    const errs = validateStoryInput('The Great Story', 'Fantasy');
    assertEqual(errs.length, 0);
});

console.log('\nWord count logic:');
test('returns 0 for empty content', () => assertEqual(calculateWordCount(''), 0));
test('returns 0 for null', () => assertEqual(calculateWordCount(null), 0));
test('counts a single word', () => assertEqual(calculateWordCount('Hello'), 1));
test('counts a paragraph', () => {
    assertEqual(calculateWordCount('Once upon a time there was a dragon'), 8);
});
test('handles leading/trailing spaces', () => {
    assertEqual(calculateWordCount('  hello world  '), 2);
});
test('handles multiple whitespace', () => {
    assertEqual(calculateWordCount('one   two   three'), 3);
});
test('handles newlines in manuscript', () => {
    assertEqual(calculateWordCount("Chapter One\nThe hero awoke."), 5);
});
test('handles large word count', () => {
    const text = 'word '.repeat(1000).trim();
    assertEqual(calculateWordCount(text), 1000);
});

console.log('\n');
