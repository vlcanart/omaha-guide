const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'images', 'content');
const stats = {};

function count(dir, group) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) {
      const imgs = fs.readdirSync(fp).filter(x => x.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
      if (!stats[group]) stats[group] = { total: 0, populated: 0, empty: 0, emptyFolders: [], populatedFolders: [] };
      stats[group].total++;
      if (imgs.length > 0) { stats[group].populated++; stats[group].populatedFolders.push(f + ' (' + imgs.length + ')'); }
      else { stats[group].empty++; stats[group].emptyFolders.push(f); }
    }
  }
}

['artists','venues','teams','neighborhoods','landmarks','categories'].forEach(g => count(path.join(BASE, g), g));

console.log('IMAGE FOLDER AUDIT');
console.log('==================\n');
for (const [group, s] of Object.entries(stats)) {
  console.log(group.toUpperCase() + ': ' + s.populated + '/' + s.total + ' populated');
  if (s.populatedFolders.length) console.log('  Populated: ' + s.populatedFolders.join(', '));
  if (s.emptyFolders.length) console.log('  Empty: ' + s.emptyFolders.join(', '));
  console.log();
}

let totalImgs = 0;
function countAll(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isDirectory()) countAll(fp);
    else if (f.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) totalImgs++;
  }
}
countAll(BASE);
console.log('TOTAL IMAGES: ' + totalImgs);
