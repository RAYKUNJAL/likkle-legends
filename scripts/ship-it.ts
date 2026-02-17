
import { execSync } from 'child_process';
import path from 'path';

function run(command: string, desc: string) {
    console.log(`\n🚀 [DEPLOY] ${desc}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ [DEPLOY] ${desc} COMPLETED.`);
    } catch (error) {
        console.error(`❌ [DEPLOY] ${desc} FAILED.`);
        process.exit(1);
    }
}

async function main() {
    console.log(`
    ================================================
       🚢 LIKKLE LEGENDS DEPLOYMENT PIPELINE 🚢
       Target: Production (Vercel)
    ================================================
    `);

    // 1. Verify Environment & Voices (Safety Check)
    run('npx tsx scripts/verify-quick.ts', 'Verifying Environment & AI Voices');

    // 2. Type Check (Strict)
    run('npx tsc --noEmit', 'Running Type Check');

    // 3. Linting (Quality)
    run('npm run lint', 'Running Linter');

    // 4. Build (Catch errors locally before shipping)
    run('npm run build', 'Building Application (Local Test)');

    // 5. Deploy
    console.log(`\n🚀 [DEPLOY] Ready to ship!`);
    console.log(`   To deploy to Vercel, run:\n`);
    console.log(`   npx vercel --prod\n`);

    // Note: We don't auto-run 'npx vercel --prod' because it requires login/interactive flow often.
    // If the user has it set up, they can run it.
}

main();
