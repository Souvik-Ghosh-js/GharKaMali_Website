import fs from 'fs';

const content = fs.readFileSync('src/app/page.tsx', 'utf8');

const regex = /<(\/?[a-zA-Z0-9.-]+)(\s+[^>]*)?\/?>/g;
const stack = [];
let match;

while ((match = regex.exec(content)) !== null) {
    const tagName = match[1];
    const fullTag = match[0];
    const line = content.substring(0, match.index).split('\n').length;

    if (fullTag.endsWith('/>')) {
        // Self-closing
        continue;
    }

    if (tagName.startsWith('/')) {
        const closingTag = tagName.substring(1);
        if (stack.length === 0) {
            console.log(`Stray closing tag </${closingTag}> at line ${line}`);
        } else {
            const lastTag = stack.pop();
            if (lastTag.name !== closingTag) {
                console.log(`Mismatched closing tag </${closingTag}> at line ${line}, expected </${lastTag.name}> (opened at line ${lastTag.line})`);
            }
        }
    } else {
        stack.push({ name: tagName, line: line });
    }
}

if (stack.length > 0) {
    console.log("Unclosed tags:");
    stack.forEach(tag => console.log(`<${tag.name}> opened at line ${tag.line}`));
} else {
    console.log("All tags balanced!");
}
