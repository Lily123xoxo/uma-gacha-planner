import path from 'node:path';
import fs from 'node:fs/promises';

/** Resolve a DB-relative image path to a public URL under /images, falling back to a default. */
export async function resolveImagePath(relativePath?: string | null): Promise<string> {
  if (!relativePath) return '/images/default.png';

  const fullPath = path.join(process.cwd(), 'public', 'images', relativePath);
  try {
    await fs.access(fullPath); // file exists under /public/images
    return `/images/${relativePath}`;
  } catch {
    return '/images/default.png';
  }
}
