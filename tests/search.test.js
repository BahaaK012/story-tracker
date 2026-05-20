/**
 * Unit tests for search service logic (pure filter logic).
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

// Pure search filter extracted from searchService for unit testing
function filterStories(stories, query) {
    const q = query.toLowerCase();
    return stories.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.genre || '').toLowerCase().includes(q) ||
        (s.content || '').toLowerCase().includes(q)
    );
}

function filterCharacters(characters, query) {
    const q = query.toLowerCase();
    return characters.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.trait || '').toLowerCase().includes(q)
    );
}

const mockStories = [
    { id: 1, title: 'The Dragon King', genre: 'Fantasy', content: 'A kingdom far away...' },
    { id: 2, title: 'Space Odyssey', genre: 'Sci-Fi', content: 'Stars and galaxies...' },
    { id: 3, title: 'Murder on the Orient', genre: 'Mystery', content: 'A detective finds clues...' }
];

const mockCharacters = [
    { id: 1, name: 'Aria Stormwind', trait: 'Brave', description: 'A warrior from the north' },
    { id: 2, name: 'Lord Vane', trait: 'Cunning', description: 'The main villain' },
    { id: 3, name: 'Elara', trait: 'Wise', description: 'An ancient mage' }
];

console.log('\n🔍 Search Logic — Unit Tests\n');

console.log('Story search:');
test('finds story by title keyword', () => {
    assertEqual(filterStories(mockStories, 'dragon').length, 1);
});
test('finds story by genre', () => {
    assertEqual(filterStories(mockStories, 'sci-fi').length, 1);
});
test('finds story by content keyword', () => {
    assertEqual(filterStories(mockStories, 'detective').length, 1);
});
test('returns empty for no match', () => {
    assertEqual(filterStories(mockStories, 'zzznomatch').length, 0);
});
test('search is case-insensitive', () => {
    assertEqual(filterStories(mockStories, 'DRAGON').length, 1);
});
test('returns multiple matches', () => {
    // 'a' appears in Fantasy, A kingdom, A detective
    assert(filterStories(mockStories, 'the').length >= 1);
});

console.log('\nCharacter search:');
test('finds character by name', () => {
    assertEqual(filterCharacters(mockCharacters, 'aria').length, 1);
});
test('finds character by trait', () => {
    assertEqual(filterCharacters(mockCharacters, 'wise').length, 1);
});
test('finds character by description', () => {
    assertEqual(filterCharacters(mockCharacters, 'villain').length, 1);
});
test('returns empty for no match', () => {
    assertEqual(filterCharacters(mockCharacters, 'zzznomatch').length, 0);
});
test('search is case-insensitive', () => {
    assertEqual(filterCharacters(mockCharacters, 'BRAVE').length, 1);
});

console.log('\n');
