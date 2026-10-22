import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

/** Serialize cooperating local writers and replace complete JSON atomically. */
export function updateRegistry(file: string, update: (value: Record<string, any>) => void): void {
  const lock = file + '.lock';
  const handle = fs.openSync(lock, 'wx', 0o600);
  const temporary = file + '.' + randomUUID() + '.tmp';
  try {
    let value: Record<string, any> = {};
    try { value = JSON.parse(fs.readFileSync(file, 'utf8')); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Registry must be an object');
    update(value);
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    fs.renameSync(temporary, file);
  } finally {
    try {
      try { fs.unlinkSync(temporary); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    } finally {
      try { fs.closeSync(handle); } finally { fs.unlinkSync(lock); }
    }
  }
}
