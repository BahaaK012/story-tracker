/**
 * Test runner — runs all test files and reports results.
 * Usage: node tests/run-all.js
 */
const { execSync } = require('child_process');
const path = require('path');

const tests = [
    'tests/stats.test.js',
    'tests/auth.test.js',
    'tests/search.test.js',
    'tests/story.test.js'
];

console.log('═══════════════════════════════════════');
console.log('       Story Tracker Test Suite        ');
console.log('═══════════════════════════════════════');

let allPassed = true;

for (const testFile of tests) {
    try {
        execSync(`node ${testFile}`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (e) {
        allPassed = false;
    }
}

console.log('═══════════════════════════════════════');
if (allPassed) {
    console.log('  ✅ All tests passed');
} else {
    console.log('  ❌ Some tests failed');
    process.exit(1);
}
console.log('═══════════════════════════════════════\n');
