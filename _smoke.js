// koch-forge smoke test — extracts the inline Koch engine and verifies math invariants.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// extract engine script (between <script id="engine"> and its closing </script>)
const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) { console.error('FAIL: engine script not found'); process.exit(1); }
const code = m[1];

// top-level `const Koch` does not attach to sandbox; append `Koch;` to surface it
const ctx = {};
vm.createContext(ctx);
const Koch = vm.runInContext(code + '\nKoch;', ctx);

let pass = 0, fail = 0;
const T = (name, cond) => {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name); }
};

console.log('KochForge smoke test');

// 1) vertex count = 3 * 4^n
let vok = true;
for (let n = 0; n <= 5; n++){
  const cnt = Koch.kochSnowflake(n, 200).length;
  if (cnt !== 3 * Math.pow(4, n)) { vok = false; console.log('    n=' + n + ' got ' + cnt + ' exp ' + (3 * Math.pow(4, n))); }
}
T('vertex count = 3·4ⁿ (n=0..5)', vok);

// 2) perimeter scales as (4/3)^n  => 3·√3·R·(4/3)^n, R=200
const R = 200, side0 = R * Math.sqrt(3);
let pok = true;
for (let n = 0; n <= 5; n++){
  const per = Koch.perimeter(Koch.kochSnowflake(n, R));
  const exp = 3 * side0 * Math.pow(4 / 3, n);
  if (Math.abs(per - exp) / exp > 1e-9) { pok = false; console.log('    n=' + n + ' got ' + per.toFixed(4) + ' exp ' + exp.toFixed(4)); }
}
T('perimeter = 3·√3·R·(4/3)ⁿ (n=0..5)', pok);

// 3) hausdorff dimension exact
T('hausdorffDim() = log(4)/log(3) ≈ 1.2619', Math.abs(Koch.hausdorffDim() - Math.log(4) / Math.log(3)) < 1e-12);

// 4) equilateral bump: one segment subdivided once -> peak peak equidistant from p and q
{
  const a = { x: 0, y: 0 }, b = { x: 300, y: 0 };
  const seg = Koch.kochSegment(a, b, 1, null);
  // seg = [a, p, peak, q]  (b excluded)
  const p = seg[1], peak = seg[2], q = seg[3];
  const lp = Math.hypot(peak.x - p.x, peak.y - p.y);
  const lq = Math.hypot(q.x - peak.x, q.y - peak.y);
  T('equilateral bump |peak-p| = |peak-q|', Math.abs(lp - lq) < 1e-9 && Math.abs(lp - 100) < 1e-9);
}

// 5) outward peak (negative y when segment along +x)
{
  const a = { x: 0, y: 0 }, b = { x: 300, y: 0 };
  const seg = Koch.kochSegment(a, b, 1, null);
  T('standard bump points outward (peak.y < 0)', seg[2].y < 0);
}

// 6) determinism: standard and seed variant
{
  const s1 = Koch.kochSnowflake(3, 200), s2 = Koch.kochSnowflake(3, 200);
  T('standard snowflake deterministic', JSON.stringify(s1) === JSON.stringify(s2));
  const v1 = Koch.kochSnowflake(3, 200, '晨星'), v2 = Koch.kochSnowflake(3, 200, '晨星');
  T('seed variant deterministic', JSON.stringify(v1) === JSON.stringify(v2));
  const v3 = Koch.kochSnowflake(3, 200, '别的种子');
  T('different seed -> different shape', JSON.stringify(v1) !== JSON.stringify(v3));
}

// 7) numerical stability & closed loop (closed via %length: no zero-length edges, all finite)
{
  const v = Koch.kochSnowflake(5, 200, 'stress');
  let finite = true, closed = true;
  for (let i = 0; i < v.length; i++){
    const p = v[i], q = v[(i + 1) % v.length];
    if (!isFinite(p.x) || !isFinite(p.y)) finite = false;
    const seg = Math.hypot(p.x - q.x, p.y - q.y);
    if (seg <= 0 || !isFinite(seg)) closed = false; // no degenerate/duplicate junction
  }
  T('seed variant all-finite (n=5)', finite);
  T('snowflake forms closed loop (no zero-length edges)', closed);
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
