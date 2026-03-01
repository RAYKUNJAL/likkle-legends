const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/RAY/.gemini/antigravity/conversations';
const files = fs.readdirSync(dir);

const allBlogs = [];

const possibleKeys = ['title', 'slug', 'excerpt', 'content', 'meta_description'];

for (const file of files) {
    if (!file.endsWith('.pb')) continue;
    try {
        const data = fs.readFileSync(path.join(dir, file), 'utf8');

        // Attempt to extract objects that match blog structure
        // We look for {"title":"...", "content":"..."...}
        const regex = /\{.*?\"title\"[^\"]*?:[^\"]*?\"(.*?)\".*?\"content\"[^\"]*?:[^\"]*?\"(.*?)\".*?\}/gs;
        let match;
        while ((match = regex.exec(data)) !== null) {
            const fullString = match[0];
            try {
                // Because PB might have escape sequences, try parsing or cleaning:
                const cleanStr = fullString.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

                // Extract title and content roughly
                const titleMatch = fullString.match(/"title"\s*:\s*\\?"(.*?)\\?"\s*[,}]/);
                const contentMatch = fullString.match(/"content"\s*:\s*\\?"(.*?)\\?"\s*[,}]/);

                if (titleMatch && contentMatch && contentMatch[1].includes('<')) {
                    allBlogs.push({
                        title: titleMatch[1],
                        content: contentMatch[1].substring(0, 100) + '...' // Print start
                    });
                }
            } catch (e) { }
        }
    } catch (e) { }
}

const uniqueBlogs = [];
const seenTitles = new Set();
for (const b of allBlogs) {
    if (!seenTitles.has(b.title)) {
        seenTitles.add(b.title);
        uniqueBlogs.push(b);
    }
}

console.log(JSON.stringify(uniqueBlogs, null, 2));
