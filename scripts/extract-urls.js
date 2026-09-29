const fs = require('fs');
const path = 'C:/Users/snehi/.gemini/antigravity/brain/6edf1f56-454c-41b5-a81a-f3db89dcba86/.system_generated/steps/521/content.md';
const content = fs.readFileSync(path, 'utf8');

const matches = content.match(/https?:\/\/[^\s"'<>]+/g) || [];
const filtered = [...new Set(matches)].filter(url => 
  url.includes('shopify') || 
  url.includes('cashfree') || 
  url.includes('apps')
);
console.log('Found URLs:');
filtered.forEach(u => console.log(u));
