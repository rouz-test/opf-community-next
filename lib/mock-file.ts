import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Read a JSON file from the project root and parse it as the requested type.
 */
export async function readJsonFile<T>(relativePath: string): Promise<T> {
  const filePath = path.join(process.cwd(), relativePath);
  const file = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(file) as T;
}

/**
 * Write data to a JSON file at the project root.
 */
export async function writeJsonFile<T>(relativePath: string, data: T): Promise<void> {
  const filePath = path.join(process.cwd(), relativePath);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}
