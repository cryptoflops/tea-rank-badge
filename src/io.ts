import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { log } from './log.js';

export async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function writeIfChanged(
  path: string,
  content: string,
  dryRun: boolean
): Promise<boolean> {
  const existing = await readFileSafe(path);
  
  // Check if content is identical
  if (existing === content) {
    log.debug(`No changes to ${path}`);
    return false;
  }
  
  if (dryRun) {
    log.info(`[DRY RUN] Would write ${path}`);
    if (existing === null) {
      log.info('  File does not exist, would create');
    } else {
      log.info(`  File would change (${existing.length} bytes → ${content.length} bytes)`);
    }
    return true;
  }
  
  // Ensure directory exists
  const dir = dirname(path);
  await mkdir(dir, { recursive: true });
  
  // Write file
  await writeFile(path, content, 'utf-8');
  
  if (existing === null) {
    log.success(`Created ${path}`);
  } else {
    log.success(`Updated ${path}`);
  }
  
  return true;
}

export function compareContent(a: string | null, b: string): boolean {
  return a !== b;
}