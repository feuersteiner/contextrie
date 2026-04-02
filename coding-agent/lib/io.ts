import { access, mkdir, writeFile } from "node:fs/promises";

export interface WriteResult {
  existed: boolean;
}

/**
 * Returns whether a filesystem path is currently accessible.
 */
export const checkPathExists = async (targetPath: string): Promise<boolean> => {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Creates a directory only when it does not already exist.
 * Returns whether the directory already existed.
 */
export const createDirIfNotExists = async (
  targetPath: string,
): Promise<WriteResult> => {
  if (await checkPathExists(targetPath)) {
    return { existed: true };
  }

  await mkdir(targetPath, { recursive: true });

  return { existed: false };
};

/**
 * Creates a file only when it does not already exist.
 * When `overwrite` is enabled, the file is rewritten but still reported as existing.
 */
export const createFileIfNotExists = async (
  targetPath: string,
  content: string,
  options?: { overwrite?: boolean },
): Promise<WriteResult> => {
  if (await checkPathExists(targetPath)) {
    if (options?.overwrite) {
      await writeFile(targetPath, content, "utf8");
    }

    return { existed: true };
  }

  await writeFile(targetPath, content, "utf8");

  return { existed: false };
};
