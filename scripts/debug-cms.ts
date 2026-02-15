
import { getMergedSiteContent } from '../lib/services/cms';

async function main() {
    try {
        console.log("Starting debug...");
        const content = await getMergedSiteContent(true);
        console.log("Successfully fetched content:", Object.keys(content));
        if (content.hero) {
            console.log("Hero headline:", content.hero.headline);
        } else {
            console.log("Hero missing!");
        }
        if (content.testimonials) {
            console.log("Testimonials found:", content.testimonials.items?.length);
        } else {
            console.log("Testimonials missing!");
        }
    } catch (error) {
        console.error("Caught error in main:", error);
    }
}

main();
