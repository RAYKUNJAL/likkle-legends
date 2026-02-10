
import fs from 'fs';
import path from 'path';

const BASE_DIR = path.join(process.cwd(), 'app');

const navItems = [
    { href: '/admin', name: 'Overview' },
    { href: '/admin/leads', name: 'Leads' },
    { href: '/admin/customers', name: 'Customers' },
    { href: '/admin/orders', name: 'Orders' },
    { href: '/admin/custom-requests', name: 'Custom Requests request' },
    { href: '/admin/store-analytics', name: 'Store Analytics' },
    { href: '/admin/content', name: 'Content Library' },
    { href: '/admin/approval', name: 'Standard Approval' },
    { href: '/admin/ai-review', name: 'AI Verification' },
    { href: '/admin/auto-content', name: 'Fresh Content Agent' },
    { href: '/admin/studio', name: 'Legend AI Studio' },
    { href: '/admin/characters', name: 'Characters' },
    { href: '/admin/personality', name: 'AI Brain' },
    { href: '/admin/media', name: 'Media Library' },
    { href: '/admin/games', name: 'Game Builder' },
    { href: '/voice-demo', name: 'Voice Demo' },
    { href: '/admin/blog', name: 'Blog Manager' },
    { href: '/admin/messages', name: 'Messages' },
    { href: '/admin/cms', name: 'Site CMS' },
    { href: '/admin/pixels', name: 'Pixels' },
    { href: '/admin/email-engine', name: 'Growth Agent' },
    { href: '/admin/announcements', name: 'Announcements' },
    { href: '/admin/analytics', name: 'Analytics' },
    { href: '/admin/verify', name: 'Launch Verify' },
    { href: '/admin/debug-ai', name: 'AI Debug' },
    { href: '/admin/settings', name: 'Settings' },
    // Check Content sub-routes too
    { href: '/admin/content/printables', name: 'Content -> Printables' },
];

console.log("🔍 Admin Route Audit...\n");

let missing = 0;
let found = 0;

navItems.forEach(item => {
    // Remove leading slash
    const relativePath = item.href.substring(1);
    const pagePath = path.join(BASE_DIR, relativePath, 'page.tsx');

    if (fs.existsSync(pagePath)) {
        console.log(`✅ [${item.name}] Found: ${item.href}`);
        found++;
    } else {
        console.log(`❌ [${item.name}] MISSING: ${item.href}`);
        console.log(`   Expectation: ${pagePath} does not exist.`);
        missing++;
    }
});

console.log(`\nResults: ${found} Found, ${missing} Missing.`);
