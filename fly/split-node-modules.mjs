// Moves the entries of a node_modules directory into N similarly sized bucket
// directories, so Dockerfile.fly can copy them back as N smaller image layers.
// Fly's registry fails to accept a single multi-GB layer.
//
// Usage: node split-node-modules.mjs <node_modules dir> <bucket root> <bucket count>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const [source, bucketRoot, countArg] = process.argv.slice(2);
const count = Number(countArg);

const sizeOf = (path) =>
  Number(execFileSync('du', ['-sk', path]).toString().split('\t')[0]);

const entries = readdirSync(source)
  .map((name) => ({ name, size: sizeOf(join(source, name)) }))
  .sort((a, b) => b.size - a.size);

const buckets = Array.from({ length: count }, (_, index) => {
  const dir = join(bucketRoot, String(index), 'node_modules');
  mkdirSync(dir, { recursive: true });
  return { dir, size: 0 };
});

// Largest first, each into the currently smallest bucket.
for (const entry of entries) {
  const bucket = buckets.reduce((min, b) => (b.size < min.size ? b : min));
  // mv, not rename: entries from an earlier image layer can't be renamed (EXDEV).
  execFileSync('mv', [join(source, entry.name), join(bucket.dir, entry.name)]);
  bucket.size += entry.size;
}

for (const bucket of buckets) {
  console.log(`${bucket.dir}: ${Math.round(bucket.size / 1024)} MB`);
}
