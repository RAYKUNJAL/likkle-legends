/**
 * Pure checks for the content library allowlist, age filter, and member gate.
 * Run: npm run verify:content-library
 */
import { LIMITS, SECTION_KEYS } from '../lib/content-library/constants';
import { assetVisibleForChild, isPaidMemberProfile } from '../lib/content-library/visibility';
import {
    parseAssignments,
    parseTags,
    validateContentUpload,
    validateCoverUpload,
} from '../lib/content-library/validate';

function assert(cond: unknown, message: string) {
    if (!cond) throw new Error(message);
}

function bytes(head: number[], length = head.length): Uint8Array {
    const out = new Uint8Array(length);
    head.forEach((b, i) => { out[i] = b; });
    return out;
}

const pdf = bytes([0x25, 0x50, 0x44, 0x46, 0x2d]);
const png = bytes([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
const jpeg = bytes([0xff, 0xd8, 0xff, 0xe0]);
const gif = bytes([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
const zip = bytes([0x50, 0x4b, 0x03, 0x04]);
const webp = bytes([
    0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
]);

const pdfOk = validateContentUpload('island.pdf', 'application/pdf', pdf);
assert(pdfOk.ok && pdfOk.file.mime === 'application/pdf', 'pdf allowed');

const octet = validateContentUpload('page.png', 'application/octet-stream', png);
assert(octet.ok && octet.file.mime === 'image/png', 'sniffed png wins over octet-stream');

const lied = validateContentUpload('page.pdf', 'image/png', pdf);
assert(!lied.ok, 'declared image must not pass a pdf');

const renamed = validateContentUpload('malware.pdf', 'application/pdf', zip);
assert(!renamed.ok, 'zip bytes with a pdf name are rejected');

const html = validateContentUpload('page.html', 'text/html', bytes([0x3c, 0x68, 0x74, 0x6d, 0x6c]));
assert(!html.ok, 'html is rejected');

assert(validateContentUpload('pack.zip', 'application/x-zip-compressed', zip).ok, 'zip pack allowed');
assert(validateContentUpload('photo.jpg', 'image/jpeg', jpeg).ok, 'jpeg allowed');
assert(validateContentUpload('anim.gif', 'image/gif', gif).ok, 'gif allowed');
assert(validateContentUpload('cover.webp', 'image/webp', webp).ok, 'webp allowed');
assert(!validateCoverUpload('book.pdf', 'application/pdf', pdf).ok, 'pdf is not a cover');
assert(validateCoverUpload('cover.png', 'image/png', png).ok, 'png cover allowed');

const huge = bytes([0x25, 0x50, 0x44, 0x46], LIMITS.pdfBytes + 1);
assert(!validateContentUpload('big.pdf', 'application/pdf', huge).ok, 'oversized pdf rejected');

assert(!isPaidMemberProfile(null), 'missing profile fails closed');
assert(!isPaidMemberProfile({ subscription_tier: 'free', subscription_status: 'active' }), 'free active fails closed');
assert(!isPaidMemberProfile({ subscription_tier: 'legends_plus', subscription_status: 'canceled' }), 'canceled paid fails closed');
assert(!isPaidMemberProfile({ subscription_tier: 'starter_mailer', subscription_status: 'inactive' }), 'inactive starter fails closed');
assert(isPaidMemberProfile({ subscription_tier: 'starter_mailer', subscription_status: 'active' }), 'active starter allowed');
assert(isPaidMemberProfile({ subscription_tier: 'family_legacy', subscription_status: 'trialing' }), 'trialing family allowed');
assert(isPaidMemberProfile({ role: 'teacher', subscription_tier: 'free', subscription_status: 'inactive' }), 'teacher allowed');
assert(isPaidMemberProfile({ is_admin: true, subscription_tier: 'free' }), 'admin flag allowed');
assert(isPaidMemberProfile({ role: 'admin' }), 'admin role allowed');

assert(assetVisibleForChild({ age_min: null, age_max: null, age_band: 'all' }, { age: 4, age_track: 'mini' }), 'all ages visible');
assert(assetVisibleForChild({ age_min: 4, age_max: 6, age_band: 'mini' }, { age: 5, age_track: 'mini' }), 'age in range');
assert(!assetVisibleForChild({ age_min: 4, age_max: 6, age_band: 'mini' }, { age: 9, age_track: 'big' }), 'age outside range hidden');
assert(!assetVisibleForChild({ age_min: null, age_max: null, age_band: 'mini' }, { age_track: 'big' }), 'band mismatch hidden');
assert(assetVisibleForChild({ age_min: 3, age_max: 8, age_band: 'big' }, { age: 5, age_track: 'mini' }), 'numeric range wins');
assert(assetVisibleForChild({ age_min: 7, age_max: 9, age_band: 'big' }, null), 'no child context shows the asset');

assert(parseTags('Carnival, carnival, Island Food!').join(',') === 'carnival,island-food', 'tags normalized');
const sections = parseAssignments([
    { section_key: 'coloring_books', sort_order: 2, featured: true },
    { section_key: 'downloads', sort_order: 0, featured: false },
]);
assert(sections.ok && sections.assignments.length === 2, 'assignments parsed');
assert(!parseAssignments([{ section_key: 'secret' }]).ok, 'unknown shelf rejected');
assert(SECTION_KEYS.includes('journey_stories') && SECTION_KEYS.includes('featured_home'), 'section keys present');

console.log('content library checks passed');
