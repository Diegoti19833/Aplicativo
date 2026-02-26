// Temporary script to replace blue brand colors with green #129151
// Preserves CONFETTI_COLORS and AVATAR_COLORS arrays (decorative multicolor)
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'App.js');
let lines = fs.readFileSync(file, 'utf8').split('\n');
let count = 0;

// Lines to skip (1-indexed): CONFETTI_COLORS and AVATAR_COLORS arrays
const skipLines = new Set([959, 960, 961, 1417, 1418]);

for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    if (skipLines.has(lineNum)) continue;

    const original = lines[i];
    let line = lines[i];

    // Primary blue → brand green
    line = line.replace(/#2563EB/g, '#129151');
    // Light blue → light green  
    line = line.replace(/#60A5FA/g, '#34D399');
    // Medium blue → brand green
    line = line.replace(/#3B82F6/g, '#129151');
    // Blue tint backgrounds → green tint
    line = line.replace(/#DBEAFE/g, '#DCFCE7');
    line = line.replace(/#EBF5FF/g, '#ECFDF5');
    line = line.replace(/#EEF2FF/g, '#ECFDF5');
    line = line.replace(/#E8F0FE/g, '#D1FAE5');

    if (line !== original) {
        lines[i] = line;
        count++;
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
console.log(`Done! Replaced colors in ${count} lines.`);
