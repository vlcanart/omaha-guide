const fs = require('fs');
let content = fs.readFileSync('app/data/hoods.js', 'utf8');

const replacements = {
  'old-market': ['old-market-1.jpg','old-market-2.jpg','old-market-3.jpg'],
  'benson': ['benson-1.jpg','benson-2.jpg','benson-3.jpg'],
  'dundee': ['dundee-1.jpg','dundee-2.jpg','dundee-3.jpg'],
  'blackstone': ['blackstone-1.jpg','blackstone-2.jpg','blackstone-3.jpg'],
  'north-downtown': ['north-downtown-1.jpg','north-downtown-2.jpg','north-downtown-3.jpg'],
  'little-italy': ['little-italy-1.jpg','little-italy-2.jpg','little-italy-3.jpg'],
  'aksarben': ['aksarben-1.jpg','aksarben-2.jpg','aksarben-3.jpg'],
  'west-omaha': ['west-omaha-1.jpg','west-omaha-2.jpg','west-omaha-3.jpg'],
  'south-omaha': ['south-omaha-1.jpg','south-omaha-2.jpg','south-omaha-3.jpg'],
  'midtown': ['midtown-1.jpg','midtown-2.jpg','midtown-3.jpg'],
};

// Find and replace each imgs:[] array
let count = 0;
for (const [hood, files] of Object.entries(replacements)) {
  const newImgs = files.map(f => `h("${f}")`).join(',');
  // Find the imgs:[ line after this hood's id
  const idIdx = content.indexOf(`id:"${hood}"`);
  if (idIdx === -1) continue;
  const imgsIdx = content.indexOf('imgs:[', idIdx);
  if (imgsIdx === -1) continue;
  const closeIdx = content.indexOf(']', imgsIdx);
  if (closeIdx === -1) continue;
  const before = content.slice(0, imgsIdx + 5); // up to "imgs:["
  const after = content.slice(closeIdx); // from "]" onwards
  content = before + newImgs + after;
  count++;
}

fs.writeFileSync('app/data/hoods.js', content);
console.log(`Updated ${count} hoods with local cached images`);
