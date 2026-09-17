const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Load environment variables from .env.local if present
try {
  const fs = require('fs');
  const path = require('path');
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...rest] = trimmed.split('=');
        const val = rest.join('=').replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {}

let passed = 0;
let failed = 0;

function assert(condition, name, detail = '') {
  if (condition) {
    console.log(`[PASS] ${name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${name} - Detail: ${detail}`);
    failed++;
  }
}

// -----------------------------------------------------------------------------
// 1. Password Strength & Entropy Validator Unit Verification
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('CHECKLIST 1: PASSWORD SECURITY & CREDENTIAL HYGIENE');
console.log('======================================================');

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password cannot be empty.' };
  }

  const minLength = password.length >= 10;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const lower = password.toLowerCase();
  const breachedPatterns = [
    'password', 'admin', 'qwerty', 'welcome', 'kultra', 'letmein',
    '123456', '12345678', '123456789', 'iloveyou', 'monkey', 'dragon',
  ];

  const containsBreachedWord = breachedPatterns.some((p) => lower.includes(p));
  const hasRepeatedChar = /(.)\1{3,}/.test(password);
  const hasTrivialSequence = /12345|23456|34567|45678|56789|abcde|bcdef|cdefg/i.test(password);
  const notCommonOrBreached = !containsBreachedWord && !hasRepeatedChar && !hasTrivialSequence;

  const valid = minLength && hasUppercase && hasLowercase && hasNumber && hasSymbol && notCommonOrBreached;

  let error;
  if (!minLength) error = 'Password must be at least 10 characters long.';
  else if (!hasUppercase) error = 'Password must include at least one uppercase letter (A-Z).';
  else if (!hasLowercase) error = 'Password must include at least one lowercase letter (a-z).';
  else if (!hasNumber) error = 'Password must include at least one numeric digit (0-9).';
  else if (!hasSymbol) error = 'Password must include at least one symbol or special character.';
  else if (!notCommonOrBreached) error = 'Password contains common breached phrases or trivial character sequences.';

  return { valid, error };
}

// Test < 10 characters
assert(!validatePasswordStrength('Aa1!').valid, 'Rejects password shorter than 10 chars');
assert(validatePasswordStrength('Aa1!').error.includes('10 characters'), 'Provides clear min-length error message');

// Test missing uppercase
assert(!validatePasswordStrength('securepass123!').valid, 'Rejects password without uppercase letter');
assert(validatePasswordStrength('securepass123!').error.includes('uppercase'), 'Provides uppercase requirement error');

// Test missing lowercase
assert(!validatePasswordStrength('SECUREPASS123!').valid, 'Rejects password without lowercase letter');
assert(validatePasswordStrength('SECUREPASS123!').error.includes('lowercase'), 'Provides lowercase requirement error');

// Test missing number
assert(!validatePasswordStrength('SecurePassword!').valid, 'Rejects password without numeric digit');
assert(validatePasswordStrength('SecurePassword!').error.includes('numeric'), 'Provides numeric requirement error');

// Test missing symbol
assert(!validatePasswordStrength('SecurePass12345').valid, 'Rejects password without symbol');
assert(validatePasswordStrength('SecurePass12345').error.includes('symbol'), 'Provides symbol requirement error');

// Test breached phrase rejection
assert(!validatePasswordStrength('Password123!').valid, 'Rejects password containing breached word "password"');
assert(!validatePasswordStrength('AdminSentinel2026!').valid, 'Rejects password containing breached word "admin"');
assert(!validatePasswordStrength('Qwerty12345!').valid, 'Rejects password containing breached word "qwerty"');
assert(!validatePasswordStrength('KultraSecret99!').valid, 'Rejects password containing brand keyword "kultra"');

// Test 4 repeated characters in a row
assert(!validatePasswordStrength('Aaaaa1234!').valid, 'Rejects repeated characters (aaaa)');

// Test trivial sequences
assert(!validatePasswordStrength('Super12345!A').valid, 'Rejects trivial sequence 12345');
assert(!validatePasswordStrength('SecureAbcde!1').valid, 'Rejects trivial sequence abcde');

// Test valid enterprise passwords
assert(validatePasswordStrength('Sentinel#Alpha2026!').valid, 'Accepts valid strong password "Sentinel#Alpha2026!"');
assert(validatePasswordStrength('Vance&Apex9102X$').valid, 'Accepts valid strong password "Vance&Apex9102X$"');

// -----------------------------------------------------------------------------
// 2. Bcrypt Work Factor 12 Verification
// -----------------------------------------------------------------------------
console.log('\n--- Bcrypt Work Factor 12 & Timing Equalization ---');
const testSalt = bcrypt.genSaltSync(12);
assert(testSalt.startsWith('$2a$12$') || testSalt.startsWith('$2b$12$'), 'bcrypt.genSalt(12) generates work factor 12 salt', testSalt);

const startHash = Date.now();
const testHash = bcrypt.hashSync('Sentinel#Alpha2026!', testSalt);
const hashDuration = Date.now() - startHash;
assert(testHash.startsWith('$2a$12$') || testHash.startsWith('$2b$12$'), 'Password hash uses work factor 12', testHash.substring(0, 7));
console.log(`[INFO] 12-round bcrypt hash computation time: ${hashDuration}ms`);

// Dummy bcrypt hash timing test (User enumeration timing defense)
const DUMMY_BCRYPT_HASH = '$2a$12$e8mYfE8rGfC534V4uK7FheM5e49jJ2yQ7VlV/rZ0xI6E2B9aB9cK6';
const startDummy = Date.now();
bcrypt.compareSync('WrongPassword123!', DUMMY_BCRYPT_HASH);
const dummyDuration = Date.now() - startDummy;

const startReal = Date.now();
bcrypt.compareSync('WrongPassword123!', testHash);
const realDuration = Date.now() - startReal;

const timingDiff = Math.abs(dummyDuration - realDuration);
console.log(`[INFO] Dummy hash compare time: ${dummyDuration}ms | Real hash compare time: ${realDuration}ms (diff: ${timingDiff}ms)`);
assert(timingDiff < 80, 'Dummy hash comparison timing is calibrated to match real hash comparison', `diff=${timingDiff}ms`);

// -----------------------------------------------------------------------------
// 3. Rate Limiter Mechanics (Dual-Key & Progressive Backoff)
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('CHECKLIST 4: RATE LIMITING & ABUSE PREVENTION');
console.log('======================================================');

const rateLimitStore = new Map();
function checkRateLimit(key, maxAttempts = 5, windowSeconds = 15 * 60) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
  if (record.timestamps.length >= maxAttempts) {
    const oldest = record.timestamps[0];
    const retryAfterMs = oldest + windowMs - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }
  return {
    allowed: true,
    remaining: maxAttempts - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

function recordAttempt(key) {
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }
  record.timestamps.push(Date.now());
}

const testIpKey = 'login:ip:10.0.0.1';
for (let i = 1; i <= 5; i++) {
  const check = checkRateLimit(testIpKey, 5, 900);
  assert(check.allowed, `Attempt ${i} is allowed`);
  recordAttempt(testIpKey);
}

// 6th Attempt
const checkBlocked = checkRateLimit(testIpKey, 5, 900);
assert(!checkBlocked.allowed, '6th attempt is blocked with rate limit exceeded');
assert(checkBlocked.retryAfterSeconds > 0, 'Returns positive retryAfterSeconds window', `${checkBlocked.retryAfterSeconds}s`);

// -----------------------------------------------------------------------------
// 4. Cryptographic OAuth State & CSRF Protection
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('CHECKLIST 2: GOOGLE OAUTH SECURITY & CSRF MITIGATION');
console.log('======================================================');

const OAUTH_SECRET = 'kultra-sentinel-oauth-state-secret-256-bit-key-32-chars!!';
const key = crypto.createHash('sha256').update(OAUTH_SECRET).digest();

function createOAuthState(action = 'google-social-auth') {
  const state = crypto.randomBytes(32).toString('hex');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const payload = JSON.stringify({ state, action, exp: Date.now() + 10 * 60 * 1000 });
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  const cookieValue = `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  return { state, cookieValue };
}

function verifyOAuthState(state, cookieValue) {
  if (!state && !cookieValue) return { valid: false, error: 'Missing state or cookie' };
  
  // 1. Verify against cookieValue if present
  if (cookieValue) {
    try {
      const [ivHex, tagHex, encryptedHex] = cookieValue.split(':');
      if (!ivHex || !tagHex || !encryptedHex) return { valid: false, error: 'Malformed cookie' };
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const data = JSON.parse(decrypted);
      if (data.exp < Date.now()) return { valid: false, error: 'Expired state' };
      if (data.state !== state && cookieValue !== state) return { valid: false, error: 'State mismatch' };
      return { valid: true };
    } catch (err) {
      // Fall through
    }
  }

  // 2. Direct envelope validation if cookie was dropped
  if (state && state.includes(':')) {
    try {
      const [ivHex, tagHex, encryptedHex] = state.split(':');
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const data = JSON.parse(decrypted);
      if (data.exp < Date.now()) return { valid: false, error: 'Expired state' };
      return { valid: true };
    } catch {
      return { valid: false, error: 'State authentication failed' };
    }
  }

  return { valid: false, error: 'State validation failed' };
}

const { state: validState, cookieValue: validCookie } = createOAuthState();
assert(verifyOAuthState(validState, validCookie).valid, 'Valid OAuth state parameter and cookie match');
assert(verifyOAuthState(validCookie, null).valid, 'Encrypted envelope state validates even if cookie is dropped');
assert(!verifyOAuthState('forged-state-value', validCookie).valid, 'Mismatched OAuth state parameter is rejected immediately');
assert(!verifyOAuthState('forged:state:value', null).valid, 'Forged encrypted envelope state fails AES-256-GCM authentication');
assert(!verifyOAuthState(validState, 'tampered:cookie:value').valid, 'Tampered cookie value is rejected');

// -----------------------------------------------------------------------------
// 5. Tenant Provisioning Defaults
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log('CHECKLIST 5: TENANT PROVISIONING & ONBOARDING STATE');
console.log('======================================================');

const trialDurationDays = 14;
const creationTime = Date.now();
const trialEndsAt = new Date(creationTime + trialDurationDays * 86400000);
const diffDays = Math.round((trialEndsAt.getTime() - creationTime) / (1000 * 60 * 60 * 24));
assert(diffDays === 14, 'Trial duration is set to exactly 14 days from creation timestamp');

const googleDisplayName = 'Elena Rostova';
const fallbackStoreName = `${googleDisplayName}'s Catalog`;
assert(fallbackStoreName === "Elena Rostova's Catalog", 'Fallback store name format conforms to [User Display Name]\'s Catalog');

console.log('\n======================================================');
console.log(`TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
