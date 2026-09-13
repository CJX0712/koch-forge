// koch-forge probe — ASCII render of low-iteration snowflakes to confirm geometry is sane.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
const ctx = {};
vm.createContext(ctx);
const Koch = vm.runInContext(m[1] + '\nKoch;', ctx);

function ascii(pts, cols, rows){
  // bbox
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of pts){ minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  const sx = (cols - 1) / (maxX - minX), sy = (rows - 1) / (maxY - minY);
  for (let i = 0; i < pts.length; i++){
    const a = pts[i], b = pts[(i + 1) % pts.length];
    // sample along segment
    const steps = Math.max(2, Math.ceil(Math.hypot(a.x - b.x, a.y - b.y) / 4));
    for (let s = 0; s <= steps; s++){
      const t = s / steps;
      const x = a.x + (b.x - a.x) * t, y = a.y + (b.y - a.y) * t;
      const gx = Math.round((x - minX) * sx), gy = Math.round((y - minY) * sy);
      if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) grid[gy][gx] = '#';
    }
  }
  return grid.map(r => r.join('')).join('\n');
}

console.log('=== probe: standard snowflake n=0 (triangle) ===');
console.log(ascii(Koch.kochSnowflake(0, 200), 40, 22));
console.log('\n=== probe: standard snowflake n=2 ===');
console.log(ascii(Koch.kochSnowflake(2, 200), 60, 40));
console.log('\n=== probe: vertex stats ===');
for (let n = 0; n <= 4; n++){
  const pts = Koch.kochSnowflake(n, 200);
  console.log('n=' + n + ' vertices=' + pts.length + ' perimeter=' + Koch.perimeter(pts).toFixed(2) + ' dim=' + Koch.hausdorffDim().toFixed(4));
}
console.log('\nPROBE OK');
