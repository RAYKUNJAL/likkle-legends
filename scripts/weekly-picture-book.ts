/**
 * Weekly original Caribbean picture book.
 *
 *   npx tsx scripts/weekly-picture-book.ts --draft
 *   npx tsx scripts/weekly-picture-book.ts --publish content/weekly-drafts/week-YYYY-MM-DD.json
 *
 * Publish writes the live catalog only when cover + every page PNG already exist.
 */
import fs from 'fs';
import path from 'path';
import {
    originalMarketManuscript,
    publishIllustratedBook,
    safeDraftPath,
    validateManuscript,
    weekDraftName,
    type WeeklyManuscript,
} from '../lib/weekly-picture-book';

const root = process.cwd();

function writeDraft(manuscript: WeeklyManuscript, fileName: string) {
    const relative = safeDraftPath(fileName);
    if (!relative) throw new Error('Draft path must stay inside content/weekly-drafts');
    const full = path.join(root, relative);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (!fs.existsSync(full)) {
        fs.writeFileSync(full, JSON.stringify(manuscript, null, 2) + '\n');
    }
    return relative;
}

async function main() {
    const draft = process.argv.includes('--draft');
    const publishFlag = process.argv.indexOf('--publish');

    if (draft) {
        const relative = writeDraft(originalMarketManuscript(), weekDraftName());
        const errors = validateManuscript(JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8')));
        if (errors.length) {
            console.error(errors.join('\n'));
            process.exit(1);
        }
        console.log(`Draft ready (not published): ${relative}`);
        console.log('Review it, add cover and page art, then run --publish.');
        return;
    }

    if (publishFlag === -1) {
        console.error('Use --draft or --publish <content/weekly-drafts/file.json>');
        process.exit(1);
    }

    const requested = process.argv[publishFlag + 1];
    const relative = requested ? safeDraftPath(requested) : null;
    if (!relative) {
        console.error('Publish path must be a JSON file inside content/weekly-drafts/.');
        process.exit(1);
    }

    const full = path.join(root, relative);
    if (!fs.existsSync(full)) {
        console.error(`Manuscript not found: ${relative}`);
        process.exit(1);
    }

    const manuscript = JSON.parse(fs.readFileSync(full, 'utf8')) as WeeklyManuscript;
    const result = publishIllustratedBook(manuscript, root);
    if (!result.ok) {
        console.error('Not published.');
        result.errors.forEach((error) => console.error(`- ${error}`));
        process.exit(1);
    }
    console.log(`Published ${result.slug}. Run npx tsx scripts/verify-kids-library.ts`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
