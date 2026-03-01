const fs = require('fs');
const dir = 'C:/Users/RAY/.gemini/antigravity/conversations';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.pb'));
let blogs = [];
let idx = 1;

for (const file of files) {
    try {
        const raw = fs.readFileSync(dir + '/' + file, 'utf8');
        // Basic heuristics to find AI-generated JSON blog structure ignoring whitespace/newlines
        // The agent might have output: "title": "...", "content": "..."
        // We'll search for "meta_description" explicitly since the prompt strictly mandated it.

        // We can just dump everything that looks like a JSON block containing "meta_description"
        let match;
        const regex = /\{[^{]*?\"meta_description\"[^{]*?\}/g;
        while ((match = regex.exec(raw)) !== null) {
            let block = match[0];
            // Do a dirty cleanup of protobuf garbage
            block = block.replace(/[\x00-\x1F\x7F]/g, '');
            blogs.push({ source: file, content: block });
        }

        // Also try something simpler if that fails
        const titleRegex = /\"title\"\s*:\s*\"(.*?)\".*?\"content\"\s*:\s*\"(.*?)\"/gs;
        while ((match = titleRegex.exec(raw)) !== null) {
            if (match[2].includes('<h')) {
                blogs.push({ source: file, title: match[1], snippet: match[2].substring(0, 100) });
            }
        }
    } catch (e) { }
}

const out = 'c:/Users/RAY/OneDrive/Documents/GitHub/likkle-legends/found_blogs.json';
fs.writeFileSync(out, JSON.stringify(blogs, null, 2));
console.log('Saved ' + blogs.length + ' blogs to ' + out);
