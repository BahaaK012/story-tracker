/**
 * Unit tests for auth controller input validation logic.
 * Tests are pure logic — no DB calls.
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

console.log('\n🔐 Auth Validation — Unit Tests\n');

// Replicate the validation logic from authController
function validateRegisterInput(username, password) {
    const errors = [];
    if (!username || !username.trim()) errors.push('Username is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
    return errors;
}

function validateLoginInput(username, password) {
    const errors = [];
    if (!username || !password) errors.push('Username and password are required');
    return errors;
}

console.log('Register validation:');
test('rejects empty username', () => {
    const errs = validateRegisterInput('', 'password123');
    assert(errs.includes('Username is required'));
});
test('rejects null username', () => {
    const errs = validateRegisterInput(null, 'password123');
    assert(errs.includes('Username is required'));
});
test('rejects short password', () => {
    const errs = validateRegisterInput('alice', '123');
    assert(errs.includes('Password must be at least 6 characters'));
});
test('rejects exactly 5-char password', () => {
    const errs = validateRegisterInput('alice', '12345');
    assert(errs.includes('Password must be at least 6 characters'));
});
test('accepts valid input', () => {
    const errs = validateRegisterInput('alice', 'securepass');
    assertEqual(errs.length, 0);
});
test('accepts 6-char password (minimum)', () => {
    const errs = validateRegisterInput('bob', '123456');
    assertEqual(errs.length, 0);
});

console.log('\nLogin validation:');
test('rejects missing password', () => {
    const errs = validateLoginInput('alice', '');
    assert(errs.length > 0);
});
test('rejects missing username', () => {
    const errs = validateLoginInput('', 'pass');
    assert(errs.length > 0);
});
test('accepts valid login', () => {
    const errs = validateLoginInput('alice', 'pass123');
    assertEqual(errs.length, 0);
});

console.log('\n');
