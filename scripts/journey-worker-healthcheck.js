const fs = require('fs');

const path = '/tmp/journey-worker-heartbeat';
try {
  const stat = fs.statSync(path);
  const ageMs = Date.now() - stat.mtimeMs;
  if (ageMs > 20000) process.exit(1);
  process.exit(0);
} catch {
  process.exit(1);
}
